const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function findProductImage(name, brand, category) {
  const cleanName = name.replace(/(\d+ML|\d+G|\d+GM|\d+OZ)/gi, '').trim();
  const searchTerms = [cleanName];
  if (brand && !cleanName.toLowerCase().includes(brand.toLowerCase())) {
    searchTerms.unshift(brand);
  }
  searchTerms.push('bottle product cosmetics');
  const query = searchTerms.join(' ');

  try {
    const res = await fetch('https://www.bing.com/images/search?q=' + encodeURIComponent(query) + '&form=HDRSC2&first=1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();
    const matches = [...html.matchAll(/class="iusc"[^>]*m="([^"]+)"/g)];
    
    for (const match of matches) {
      try {
        const rawJson = match[1].replace(/&quot;/g, '"');
        const data = JSON.parse(rawJson);
        const murl = data.murl;
        let turl = data.turl?.replace(/&amp;/g, '&');
        if (turl && !turl.includes('&w=')) {
          turl += '&w=600&h=600&c=7&rs=1&p=0';
        }
        
        if (murl && (murl.startsWith('http://') || murl.startsWith('https://'))) {
          // Reject small icons or avatars
          if (murl.includes('avatar') || murl.includes('logo') || murl.includes('icon')) continue;
          return {
            title: data.t?.replace(/&#?[a-z0-9]+;/gi, '') || '',
            murl,
            turl: turl || murl,
            source: data.purl
          };
        }
      } catch (e) {}
    }
  } catch (err) {
    return null;
  }
  return null;
}

async function run() {
  const { data: prods, error } = await supabase.from('products').select('id, name, brand, category').range(10, 25);
  if (error) {
    console.error('Fetch error:', error);
    return;
  }
  console.log(`Testing with ${prods.length} products...`);
  for (const p of prods) {
    const start = Date.now();
    const res = await findProductImage(p.name, p.brand, p.category);
    const duration = Date.now() - start;
    console.log(`[${p.id}] ${p.name} (${duration}ms)`);
    if (res) {
      console.log(`  -> Title: ${res.title.slice(0, 60)}`);
      console.log(`  -> High-Res: ${res.murl}`);
      console.log(`  -> CDN/Thumb: ${res.turl}`);
    } else {
      console.log('  -> NOT FOUND');
    }
    await new Promise(r => setTimeout(r, 350));
  }
}

run();
