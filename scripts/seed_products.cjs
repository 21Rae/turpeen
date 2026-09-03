// Direct seed script to upsert all 551 products into Supabase
const { createClient } = require('@supabase/supabase-js');
const { parsedProducts } = require('./generate_sql.cjs');

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function runSeed() {
  console.log(`Starting upsert of ${parsedProducts.length} products into Supabase...`);
  const chunkSize = 50;
  let successCount = 0;

  for (let i = 0; i < parsedProducts.length; i += chunkSize) {
    const chunk = parsedProducts.slice(i, i + chunkSize);
    const { data, error } = await supabase.from('products').upsert(chunk);
    if (error) {
      console.error(`Error in chunk ${i} - ${i + chunk.length}:`, error.message);
      process.exit(1);
    }
    successCount += chunk.length;
    console.log(`Upserted ${successCount} / ${parsedProducts.length} products...`);
  }

  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`Finished! Total products in Supabase: ${count}`);
}

runSeed();
