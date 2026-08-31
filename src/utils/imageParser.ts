import type { SyntheticEvent } from 'react';
import type { ArticleContentBlock, Article, ShopProduct } from '../types';

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80';

/**
 * Safely parses article content blocks from any database row format.
 * Handles arrays, JSON strings, nested objects, raw text, and diverse column name conventions
 * (blocks, content, body, article_blocks, sections, etc.).
 */
export function parseBlocksFromRow(row: any): ArticleContentBlock[] {
  if (!row) return [];

  let rawBlocks = row.blocks ?? row.content ?? row.body ?? row.article_blocks ?? row.block_data ?? row.sections;

  let parsed: any = rawBlocks;

  if (typeof rawBlocks === 'string') {
    const trimmed = rawBlocks.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        parsed = null;
      }
    }
  }

  // If parsed is an object with a blocks/content property
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    if (Array.isArray(parsed.blocks)) parsed = parsed.blocks;
    else if (Array.isArray(parsed.content)) parsed = parsed.content;
    else if (Array.isArray(parsed.sections)) parsed = parsed.sections;
  }

  const result: ArticleContentBlock[] = [];

  const addBlock = (item: any) => {
    if (!item) return;
    if (typeof item === 'string') {
      const text = item.trim();
      if (text) {
        result.push({ type: 'paragraph', text });
      }
      return;
    }

    if (typeof item === 'object') {
      const type = String(item.type || item.block_type || item.kind || 'paragraph').toLowerCase();
      const text = item.text || item.content || item.body || item.title || item.heading || item.value || '';
      const authorQuote = item.authorQuote || item.author_quote || item.author || item.cite || '';
      const productName = item.productName || item.product_name || item.name || item.title || '';
      const productBrand = item.productBrand || item.product_brand || item.brand || '';
      const productDesc = item.productDesc || item.product_desc || item.description || item.desc || '';
      const imageUrl = item.imageUrl || item.image_url || item.url || item.src || item.image || '';
      const caption = item.caption || item.alt || '';

      if (type.includes('heading') || type.includes('title') || type === 'h1' || type === 'h2' || type === 'h3') {
        result.push({ type: 'heading', text });
      } else if (type.includes('quote') || type === 'blockquote') {
        result.push({ type: 'quote', text, authorQuote });
      } else if (type.includes('image') || type === 'photo' || type === 'img' || type === 'figure') {
        result.push({ type: 'image', imageUrl, caption });
      } else if (type.includes('product') || type.includes('highlight') || type === 'shop') {
        result.push({ type: 'product-highlight', productName, productBrand, productDesc, imageUrl, text });
      } else {
        // Fallback paragraph or text block
        result.push({ type: 'paragraph', text: text || (typeof item.text === 'string' ? item.text : JSON.stringify(item)) });
      }
    }
  };

  if (Array.isArray(parsed)) {
    parsed.forEach(addBlock);
  } else if (typeof rawBlocks === 'string' && rawBlocks.trim()) {
    const paragraphs = rawBlocks.trim().split(/\n\s*\n/);
    paragraphs.forEach(p => {
      const trimmedP = p.trim();
      if (trimmedP) {
        if (trimmedP.startsWith('# ') || trimmedP.startsWith('## ') || trimmedP.startsWith('### ')) {
          result.push({ type: 'heading', text: trimmedP.replace(/^#+\s*/, '') });
        } else if (trimmedP.startsWith('> ')) {
          result.push({ type: 'quote', text: trimmedP.replace(/^>\s*/, '') });
        } else {
          result.push({ type: 'paragraph', text: trimmedP });
        }
      }
    });
  }

  if (result.length === 0) {
    const fallbackText = row.excerpt || row.title || row.description || 'No article content available.';
    result.push({ type: 'paragraph', text: fallbackText });
  }

  return result;
}

/**
 * Safely parses image URLs from any database row format.
 * Handles arrays, JSON strings, PostgreSQL array literals, single URL strings,
 * and diverse column name conventions (images, image_url, image_1, cover_image, etc.).
 */
export function parseImagesFromRow(row: any): string[] {
  if (!row) return [DEFAULT_FALLBACK_IMAGE];

  const candidateUrls: string[] = [];

  const processValue = (val: any) => {
    if (!val) return;

    // Handle JS arrays
    if (Array.isArray(val)) {
      val.forEach(item => {
        if (typeof item === 'string') {
          processValue(item);
        } else if (item && typeof item === 'object') {
          processValue(item.url || item.src || item.link || item.path || item.image_url);
        }
      });
      return;
    }

    // Handle string values
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return;

      // Try JSON parsing if formatted as JSON array or object
      if (
        (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
        (trimmed.startsWith('{') && trimmed.endsWith('}'))
      ) {
        try {
          const parsed = JSON.parse(trimmed);
          processValue(parsed);
          return;
        } catch {
          // If Postgres array literal '{url1,url2}'
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            const items = trimmed.slice(1, -1).split(',');
            items.forEach(i => processValue(i.trim().replace(/^"|"$/g, '')));
            return;
          }
        }
      }

      // Check for valid URL prefix
      if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('/')
      ) {
        candidateUrls.push(trimmed);
      }
    }
  };

  // Inspect all standard and common database column variations
  processValue(row.images);
  processValue(row.image_urls);
  processValue(row.imageUrls);
  processValue(row.image_1);
  processValue(row.image1);
  processValue(row.image_2);
  processValue(row.image2);
  processValue(row.image_3);
  processValue(row.image3);
  processValue(row.image_url);
  processValue(row.imageUrl);
  processValue(row.image);
  processValue(row.cover_image);
  processValue(row.cover_url);
  processValue(row.featured_image);
  processValue(row.picture);
  processValue(row.photo_url);
  processValue(row.url);
  processValue(row.src);

  // Deduplicate and filter out empty strings
  const clean = Array.from(new Set(candidateUrls)).filter(Boolean);

  return clean.length > 0 ? clean : [DEFAULT_FALLBACK_IMAGE];
}

/**
 * Image onError helper to automatically swap broken URLs with fallback image
 */
export function handleImageError(e: SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (target.src !== DEFAULT_FALLBACK_IMAGE) {
    target.src = DEFAULT_FALLBACK_IMAGE;
  }
}

/**
 * Parses any Supabase database row into a standardized Article model.
 */
export function parseArticleFromRow(row: any): Article {
  const dateStr = row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Today');
  
  return {
    id: String(row.id || `art-${Date.now()}`),
    title: row.title || 'Untitled Post',
    subtitle: row.subtitle || undefined,
    slug: row.slug || `post-${Date.now()}`,
    category: row.category || 'Interviews',
    badge: row.badge || 'THE TOP SHELF',
    author: row.author || 'Turpeen Editorial',
    authorTitle: row.author_title || row.authorTitle || undefined,
    date: dateStr,
    readTime: row.read_time || row.readTime || '4 min read',
    excerpt: row.excerpt || row.title || '',
    images: parseImagesFromRow(row),
    blocks: parseBlocksFromRow(row),
    isHero: row.is_hero ?? row.isHero ?? false,
    isSecondaryHero: row.is_secondary_hero ?? row.isSecondaryHero ?? false,
    isLatest: row.is_latest ?? row.isLatest ?? true,
    isSidebar: row.is_sidebar ?? row.isSidebar ?? false,
    sidebarBadge: row.sidebar_badge || row.sidebarBadge || undefined,
  };
}

/**
 * Parses any Supabase database row into a standardized ShopProduct model.
 */
export function parseProductFromRow(row: any): ShopProduct {
  let swatches: { name: string; color: string }[] = [];
  if (Array.isArray(row.swatches)) {
    swatches = row.swatches;
  } else if (typeof row.swatches === 'string') {
    try {
      const parsed = JSON.parse(row.swatches);
      if (Array.isArray(parsed)) swatches = parsed;
    } catch {
      swatches = [];
    }
  }

  let formattedPrice = row.price ? String(row.price).trim() : '';
  if (!formattedPrice && row.price_numeric) {
    formattedPrice = `₦${Number(row.price_numeric).toLocaleString()}`;
  } else if (formattedPrice && !formattedPrice.includes('₦') && !formattedPrice.includes('$')) {
    if (!isNaN(Number(formattedPrice.replace(/,/g, '')))) {
      formattedPrice = `₦${Number(formattedPrice.replace(/,/g, '')).toLocaleString()}`;
    } else {
      formattedPrice = `₦${formattedPrice}`;
    }
  }

  let originalPrice = row.original_price || row.originalPrice;
  if (originalPrice) {
    originalPrice = String(originalPrice).trim();
    if (!originalPrice.includes('₦') && !originalPrice.includes('$') && !isNaN(Number(originalPrice.replace(/,/g, '')))) {
      originalPrice = `₦${Number(originalPrice.replace(/,/g, '')).toLocaleString()}`;
    }
  }

  const imagesList = parseImagesFromRow(row);
  const mainImage = row.image || imagesList[0] || DEFAULT_FALLBACK_IMAGE;

  return {
    id: String(row.id || `prod-${Date.now()}`),
    name: row.name || 'Turpeen Cosmetics Item',
    subtitle: row.subtitle || row.description || '',
    brand: row.brand || 'Turpeen Cosmetics',
    price: formattedPrice || '₦0',
    priceNumeric: row.price_numeric ? Number(row.price_numeric) : undefined,
    originalPrice: originalPrice || undefined,
    badge: row.badge || undefined,
    badgeType: (row.badge_type || row.badgeType || (row.badge ? 'best' : undefined)) as any,
    image: mainImage,
    images: imagesList,
    category: (row.category || 'makeup').toLowerCase().trim(),
    origin: row.origin || '🇰🇷 Korea',
    rating: row.rating ? Number(row.rating) : 4.8,
    inStock: row.in_stock !== false && row.inStock !== false,
    swatches: swatches.length > 0 ? swatches : undefined,
    description: row.description || undefined,
  };
}
