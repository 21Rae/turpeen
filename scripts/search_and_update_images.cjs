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

function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch (e) {
      console.warn('Could not parse cache file, starting fresh.');
    }
  }
  return {};
}

function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving cache:', e.message);
  }
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
];

const DISQUALIFIED_WORDS = [
  'wallpaper', 'anime', 'manga', 'cartoon', 'recipe', 'cooking', 'movie', 'actor',
  'trailer', 'game', 'soundtrack', 'vector', 'drawing', 'illustration', 'clipart'
];

async function searchBingImages(query) {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  try {
    const res = await fetch('https://www.bing.com/images/search?q=' + encodeURIComponent(query) + '&form=HDRSC2&first=1', {
      headers: {
        'User-Agent': userAgent,
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

        const title = (data.t || '').toLowerCase();
        // Disqualify inappropriate non-cosmetic results
        const isDisqualified = DISQUALIFIED_WORDS.some(w => title.includes(w));
        if (isDisqualified) continue;

        if (murl && (murl.startsWith('http://') || murl.startsWith('https://'))) {
          const lower = murl.toLowerCase();
          if (lower.includes('avatar') || lower.includes('logo') || lower.includes('icon') || lower.includes('badge')) {
            continue;
          }
          return {
            title: data.t?.replace(/&#?[a-z0-9]+;/gi, '') || '',
            murl,
            turl: turl || murl,
            source: data.purl
          };
        }
      } catch (err) {}
    }
  } catch (err) {}
  return null;
}

function buildSearchQueries(product) {
  const name = product.name || '';
  const brand = product.brand || '';
  const category = (product.category || '').toLowerCase();

  const cleanedName = name
    .replace(/(\d+ML|\d+G|\d+GM|\d+OZ|\d+FL\s*OZ)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const queries = [];

  const q1Parts = [];
  if (brand && !cleanedName.toLowerCase().includes(brand.toLowerCase()) && brand !== 'Turpeen Cosmetics') {
    q1Parts.push(brand);
  }
  q1Parts.push(cleanedName);

  if (category === 'fragrance' || cleanedName.toLowerCase().includes('perfume') || cleanedName.toLowerCase().includes('edp')) {
    q1Parts.push('perfume bottle');
  } else if (cleanedName.toLowerCase().includes('soap')) {
    q1Parts.push('beauty soap bar packaging');
  } else if (cleanedName.toLowerCase().includes('scrub')) {
    q1Parts.push('body scrub cosmetics');
  } else if (cleanedName.toLowerCase().includes('oil')) {
    q1Parts.push('skin body oil bottle');
  } else if (cleanedName.toLowerCase().includes('lotion')) {
    q1Parts.push('body lotion bottle cosmetics');
  } else if (cleanedName.toLowerCase().includes('serum')) {
    q1Parts.push('facial serum bottle');
  } else {
    q1Parts.push('cosmetics beauty product');
  }
  queries.push(q1Parts.join(' '));

  queries.push(`${brand && brand !== 'Turpeen Cosmetics' ? brand + ' ' : ''}${name} official skincare`);
  queries.push(`${cleanedName} cosmetics store`);

  return queries;
}

async function findImageForProduct(product) {
  const queries = buildSearchQueries(product);
  for (const q of queries) {
    const res = await searchBingImages(q);
    if (res) {
      return res;
    }
    await new Promise(r => setTimeout(r, 150));
  }
  return null;
}

async function main() {
  console.log('Fetching all products from Supabase...');
  const { data: allProducts, error } = await supabase
    .from('products')
    .select('id, name, brand, category, image, images')
    .order('name', { ascending: true })
    .limit(1000);

  if (error || !allProducts) {
    console.error('Failed to fetch products:', error?.message);
    process.exit(1);
  }

  console.log(`Loaded ${allProducts.length} products from database.`);

  const cache = loadCache();
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  // Filter out products that need search
  const pending = [];
  for (const prod of allProducts) {
    const cachedItem = cache[prod.id];
    const isUnsplash = !prod.image || prod.image.includes('unsplash.com') || prod.image.includes('placeholder');
    
    // Check if cached item has bad keyword
    const cachedTitle = (cachedItem?.title || '').toLowerCase();
    const isBadCache = DISQUALIFIED_WORDS.some(w => cachedTitle.includes(w));

    if (cachedItem && !isBadCache && cachedItem.image && !cachedItem.image.includes('unsplash.com')) {
      skippedCount++;
    } else {
      pending.push(prod);
    }
  }

  console.log(`Pending to search: ${pending.length}, Already cached: ${skippedCount}`);

  // Process pending with concurrency pool of 3
  const CONCURRENCY = 3;
  let activeIndex = 0;
  let completed = 0;

  async function worker() {
    while (activeIndex < pending.length) {
      const idx = activeIndex++;
      const prod = pending[idx];

      const searchRes = await findImageForProduct(prod);
      if (searchRes) {
        const itemResult = {
          id: prod.id,
          name: prod.name,
          title: searchRes.title,
          image: searchRes.turl,
          images: [searchRes.turl, searchRes.murl].filter(Boolean),
          source: searchRes.source,
          updated_at: new Date().toISOString()
        };
        cache[prod.id] = itemResult;
        saveCache(cache);

        // Update directly into Supabase
        await supabase
          .from('products')
          .update({
            image: itemResult.image,
            images: itemResult.images,
            updated_at: new Date().toISOString()
          })
          .eq('id', prod.id);

        updatedCount++;
        console.log(`[${idx + 1}/${pending.length}] ✦ UPDATED: ${prod.name} -> ${searchRes.title.slice(0, 50)}`);
      } else {
        console.warn(`[${idx + 1}/${pending.length}] ✗ NOT FOUND: ${prod.name}`);
        failedCount++;
      }
      completed++;
      await new Promise(r => setTimeout(r, 250));
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  // Sync any remaining cached items to Supabase that still have unsplash images in DB
  console.log('\nVerifying all products in Supabase are updated...');
  const { data: currentDbProducts } = await supabase.from('products').select('id, image');
  if (currentDbProducts) {
    const needsDbUpdate = currentDbProducts.filter(p => (!p.image || p.image.includes('unsplash.com')) && cache[p.id]);
    console.log(`Items in DB needing sync from cache: ${needsDbUpdate.length}`);
    for (const p of needsDbUpdate) {
      const c = cache[p.id];
      await supabase
        .from('products')
        .update({
          image: c.image,
          images: c.images,
          updated_at: new Date().toISOString()
        })
        .eq('id', p.id);
    }
  }

  console.log('\n=== Image Search and Update Complete ===');
  console.log(`Total database products: ${allProducts.length}`);
  console.log(`Freshly updated: ${updatedCount}`);
  console.log(`Previously cached & retained: ${skippedCount}`);
  console.log(`Failed / Missed: ${failedCount}`);
  console.log(`Total valid images in cache: ${Object.keys(cache).length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
