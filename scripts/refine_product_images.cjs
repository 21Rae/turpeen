const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const CACHE_FILE = path.join(__dirname, 'product_images_cache.json');
const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));

const BEAUTY_TERMS = [
  'cream', 'lotion', 'serum', 'oil', 'soap', 'scrub', 'perfume', 'edp', 'parfum',
  'fragrance', 'mist', 'cleanser', 'toner', 'gel', 'wash', 'butter', 'deodorant',
  'sunscreen', 'sunblock', 'spf', 'balm', 'shampoo', 'conditioner', 'skincare',
  'cosmetic', 'beauty', 'skin', 'facial', 'face', 'body', 'powder', 'wipes',
  'whitening', 'brightening', 'hydrating', 'moisturizer', 'moisturising', 'extract',
  'capsules', 'glow', 'acne', 'arbutin', 'niacinamide', 'retinol', 'salicylic',
  'glycolic', 'kojic', 'glutathione', 'snail', 'aloe', 'rosewater', 'collagen',
  'tretinoin', 'treatment', 'hyaluronic', 'vitamin', 'exfoliat', 'bath', 'shower'
];

const DISQUALIFIED_WORDS = [
  'clip art', 'clipart', 'gif', 'anime', 'sailor moon', 'movie', 'film', 'chicken',
  'burger', 'website', 'setup', 'anatomy', 'stmicroelectronics', 'bumblebee', 'latex',
  'actress', 'gillian anderson', 'mutianyu', 'great wall', 'cavernous sinus',
  'spongebob', 'vanilla chai tea', 'good luck, have fun', 'laboratory setup',
  'gardening', 'red brick', 'mos burger', 'what does the color', 'woodworking',
  'alphabet letters', 'action movie', 'templar free stock', 'my hero academia',
  'wallpaper', 'vector', 'drawing', 'illustration', 'roblox', 'fortnite', 'tier list',
  'design templates', 'types of trusses', 'after strike', 'male peacocks', 'beast within'
];

async function searchBetterImage(name, brand) {
  const cleanName = name.replace(/(\d+ML|\d+G|\d+GM|\d+OZ|\d+FL\s*OZ)/gi, '').trim();
  const searchQueries = [
    `${brand || ''} ${name} product bottle packaging`.trim(),
    `${cleanName} cosmetics skincare store`.trim(),
    `${name} official cosmetics`.trim()
  ];

  for (const q of searchQueries) {
    try {
      const res = await fetch('https://www.bing.com/images/search?q=' + encodeURIComponent(q) + '&form=HDRSC2&first=1', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      });
      if (!res.ok) continue;
      const html = await res.text();
      const matches = [...html.matchAll(/class="iusc"[^>]*m="([^"]+)"/g)];

      for (const match of matches) {
        try {
          const data = JSON.parse(match[1].replace(/&quot;/g, '"'));
          const title = (data.t || '').toLowerCase();
          const murl = data.murl;
          let turl = data.turl?.replace(/&amp;/g, '&');
          if (turl && !turl.includes('&w=')) {
            turl += '&w=600&h=600&c=7&rs=1&p=0';
          }

          const hasBadWord = DISQUALIFIED_WORDS.some(w => title.includes(w));
          if (hasBadWord) continue;

          const nameWords = cleanName.toLowerCase().split(/[^a-z0-9]+/i).filter(w => w.length >= 3);
          const hasNameMatch = nameWords.some(w => title.includes(w));
          const hasBeautyMatch = BEAUTY_TERMS.some(t => title.includes(t));

          if ((hasNameMatch || hasBeautyMatch) && murl && murl.startsWith('http')) {
            return {
              title: data.t,
              murl,
              turl: turl || murl,
              source: data.purl
            };
          }
        } catch (e) {}
      }
    } catch (err) {}
    await new Promise(r => setTimeout(r, 200));
  }
  return null;
}

async function refine() {
  console.log('Auditing 551 products for beauty relevance...');
  let fixedCount = 0;

  for (const [id, item] of Object.entries(cache)) {
    const title = (item.title || '').toLowerCase();
    const nameWords = item.name.toLowerCase().split(/[^a-z0-9]+/i).filter(w => w.length >= 3);
    const hasNameMatch = nameWords.some(w => title.includes(w));
    const hasBeautyMatch = BEAUTY_TERMS.some(t => title.includes(t));
    const hasBadWord = DISQUALIFIED_WORDS.some(w => title.includes(w));

    if (!hasNameMatch && !hasBeautyMatch || hasBadWord) {
      console.log(`Refining: [${id}] ${item.name} (was: ${item.title?.slice(0, 45)}...)`);
      const better = await searchBetterImage(item.name, item.brand);
      if (better) {
        console.log(`  ✓ FIXED: ${better.title.slice(0, 60)}`);
        cache[id] = {
          ...item,
          title: better.title,
          image: better.turl,
          images: [better.turl, better.murl].filter(Boolean),
          source: better.source,
          updated_at: new Date().toISOString()
        };

        // Update in Supabase
        await supabase
          .from('products')
          .update({
            image: better.turl,
            images: [better.turl, better.murl].filter(Boolean),
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        fixedCount++;
      } else {
        console.log(`  ✗ Still no better match found for ${item.name}`);
      }
      await new Promise(r => setTimeout(r, 350));
    }
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  console.log(`\nRefinement complete! Successfully refined ${fixedCount} items.`);
}

refine().catch(console.error);
