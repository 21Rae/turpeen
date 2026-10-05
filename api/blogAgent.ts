import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;
export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// Fallback Gemini client
let geminiClient: GoogleGenAI | null = null;
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// Resilient Gemini Generation with model cascade & retry logic
const GEMINI_MODELS_CASCADE = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
];

async function generateGeminiContentWithFallback(
  gemini: GoogleGenAI,
  params: {
    contents: any;
    systemInstruction?: string;
    temperature?: number;
    responseMimeType?: string;
  }
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  for (const model of GEMINI_MODELS_CASCADE) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: any = {};
        if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
        if (typeof params.temperature === "number") config.temperature = params.temperature;
        if (params.responseMimeType) config.responseMimeType = params.responseMimeType;

        const response = await gemini.models.generateContent({
          model,
          contents: params.contents,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        return {
          text: response.text || "",
          modelUsed: model,
        };
      } catch (err: any) {
        lastError = err;
        const errMessage = err?.message || String(err);
        const isTransient =
          err?.status === 503 ||
          err?.status === 429 ||
          errMessage.includes("503") ||
          errMessage.includes("high demand") ||
          errMessage.includes("UNAVAILABLE") ||
          errMessage.includes("RESOURCE_EXHAUSTED");

        if (isTransient && attempt === 0) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }

        console.warn(`Gemini model ${model} attempt ${attempt + 1} unavailable (${errMessage}). Trying fallback...`);
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini model cascades failed.");
}

// Initialize Supabase client
let supabaseClient: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

// Rich beauty SEO topics catalogue
export const BEAUTY_SEO_TOPICS = [
  {
    topic: "The Ultimate Guide to Glass Skin in Tropical Climates: The 4-Step Routine That Withstands Lagos Heat",
    category: "Skincare",
    badge: "THE TOP SHELF",
    targetKeywords: ["glass skin routine", "tropical climate skincare", "hydrating toner", "sunscreen dark skin"]
  },
  {
    topic: "Skin Barrier 101: 5 Warning Signs Your Moisture Barrier Is Damaged (And How Ceramides Heal It)",
    category: "Skincare",
    badge: "GUIDE",
    targetKeywords: ["damaged skin barrier repair", "ceramide moisturizer", "soothing centella", "gentle cleanser"]
  },
  {
    topic: "Niacinamide vs. Vitamin C: How to Layer the Two Most Powerful Brightening Actives for Radiant Skin",
    category: "Skincare",
    badge: "THE REVIEW",
    targetKeywords: ["niacinamide layering", "vitamin c serum benefits", "hyperpigmentation dark spots", "brightening routine"]
  },
  {
    topic: "The Melanin-Safe Guide to Exfoliating Acids: How to Treat Dark Spots Without Post-Inflammatory Hyperpigmentation",
    category: "Skincare",
    badge: "GUIDE",
    targetKeywords: ["exfoliating acids dark skin", "salicylic acid black skin", "mandelic acid hyperpigmentation", "chemical exfoliation"]
  },
  {
    topic: "The Art of Arabian Fragrance Layering: Making Afnan & Lattafa Perfumes Last 12+ Hours in Humid Weather",
    category: "Interviews",
    badge: "THE TOP SHELF",
    targetKeywords: ["arabian perfume layering", "Afnan 9pm longevity", "Lattafa fragrance tips", "long lasting perfume"]
  },
  {
    topic: "Double Cleansing Demystified: Why Micellar Water Isn't Enough for Sunscreen and Pollution",
    category: "Skincare",
    badge: "GUIDE",
    targetKeywords: ["double cleansing method", "oil cleansing blackheads", "cleansing balm benefits", "clogged pores"]
  },
  {
    topic: "The 5-Minute No-Makeup Makeup Routine: Feathery Brows and Glass Dew for Effortless Mornings",
    category: "Makeup",
    badge: "THE FACE",
    targetKeywords: ["no makeup makeup", "feather brows styling", "dewy skin finish", "tinted lip salve"]
  },
  {
    topic: "Korean vs French Skincare: Which Philosophy Delivers Better Long-Term Radiance for Melanin-Rich Skin?",
    category: "Skincare",
    badge: "THE REVIEW",
    targetKeywords: ["korean vs french skincare", "k-beauty barrier routine", "french pharmacy creams", "snail mucin"]
  },
  {
    topic: "Acne Purging vs Breakouts: How to Tell if Your New Active Ingredient Is Working or Damaging Your Barrier",
    category: "Skincare",
    badge: "GUIDE",
    targetKeywords: ["acne purging vs breakout", "retinol purging signs", "how to treat skin purge", "clearing acne"]
  },
  {
    topic: "The Non-Negotiable Guide to Sunscreen for Dark Skin: Zero White Cast, Maximum Broad-Spectrum Protection",
    category: "Skincare",
    badge: "THE TOP SHELF",
    targetKeywords: ["sunscreen for dark skin no white cast", "spf 50 tropical sun", "chemical vs mineral sunscreen", "hyperpigmentation sun protection"]
  },
  {
    topic: "Peptides vs Retinol: What Your Skin Actually Needs in Your Late 20s and Beyond",
    category: "Skincare",
    badge: "THE REVIEW",
    targetKeywords: ["peptides vs retinol", "collagen boosting skincare", "anti aging dark skin", "skin firmness"]
  },
  {
    topic: "Scalp Health Is Hair Health: The Rosemary & Batana Oil Ritual for Maximum Hair Density",
    category: "Hair",
    badge: "GUIDE",
    targetKeywords: ["rosemary oil hair growth", "scalp care routine", "hair density natural hair", "scalp barrier"]
  },
  {
    topic: "Lip Care Secrets: How to Heal Chronically Chapped Lips and Get Plump Hydration Overnight",
    category: "Makeup",
    badge: "THE EXTRAS",
    targetKeywords: ["chapped lips treatment", "lip peptide treatment", "exfoliating lip care", "glossy balms"]
  },
  {
    topic: "Snail Mucin vs Hyaluronic Acid: Which Deep Hydrator Gives the Truest Dewy Finish?",
    category: "Skincare",
    badge: "THE TOP SHELF",
    targetKeywords: ["snail mucin vs hyaluronic acid", "cosrx snail essence", "deep hydration skincare", "glass skin glow"]
  }
];

// Curated high-res beauty photography fallback library
const CURATED_BEAUTY_IMAGES = [
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512290900672-1f5be634354c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=80",
];

/**
 * Searches the web for high-resolution authentic beauty photography matching the topic
 */
export async function findTopicImages(queries: string[]): Promise<string[]> {
  const foundImages: string[] = [];

  for (const q of queries.slice(0, 3)) {
    try {
      const cleanQ = q.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
      const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(cleanQ + ' beauty skincare cosmetic photography')}&form=HDRSC2&first=1`;
      
      const res = await fetch(searchUrl, {
        signal: AbortSignal.timeout(3500),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        }
      });

      if (res.ok) {
        const html = await res.text();
        const matches = html.matchAll(/&quot;murl&quot;:&quot;([^&]+)&quot;/g);
        for (const match of matches) {
          const imgUrl = match[1];
          if (
            imgUrl &&
            (imgUrl.startsWith('https://') || imgUrl.startsWith('http://')) &&
            !imgUrl.includes('vector') &&
            !imgUrl.includes('clipart') &&
            !imgUrl.includes('logo') &&
            !foundImages.includes(imgUrl)
          ) {
            foundImages.push(imgUrl);
            break; // Grab top best for this query
          }
        }
      }
    } catch (err) {
      console.warn(`Image search for query "${q}" failed:`, err);
    }
  }

  // Backfill with curated images if search didn't return 3 images
  let fallbackIndex = 0;
  while (foundImages.length < 3 && fallbackIndex < CURATED_BEAUTY_IMAGES.length) {
    const candidate = CURATED_BEAUTY_IMAGES[fallbackIndex++];
    if (!foundImages.includes(candidate)) {
      foundImages.push(candidate);
    }
  }

  return foundImages.slice(0, 3);
}

export interface GeneratedBlogDraft {
  title: string;
  subtitle: string;
  slug: string;
  category: 'Skincare' | 'Makeup' | 'Hair' | 'Interviews';
  badge: 'THE TOP SHELF' | 'THE REVIEW' | 'GUIDE' | 'THE FACE' | 'POSTCARD' | 'THE EXTRAS';
  author: string;
  author_title: string;
  date: string;
  read_time: string;
  excerpt: string;
  blocks: any[];
  image_search_queries: string[];
}

/**
 * Generates an SEO-optimized beauty article draft using OpenAI (with Gemini 3.8 Flash cascade fallback)
 */
export async function generateBlogWithAI(options?: {
  topic?: string;
  category?: string;
  existingTitles?: string[];
}): Promise<{ draft: GeneratedBlogDraft; provider: string }> {
  const openai = getOpenAIClient();
  const gemini = getGeminiClient();

  const chosenTopic = options?.topic || BEAUTY_SEO_TOPICS[Math.floor(Math.random() * BEAUTY_SEO_TOPICS.length)].topic;
  const chosenCategory = options?.category || "Skincare";
  const existingTitles = options?.existingTitles || [];

  const systemPrompt = `You are the Lead SEO Editorial Beauty Writer and Dermatological Content Strategist for Turpeen Cosmetics (often referred to as turpeen.), a luxury and results-driven cosmetics retailer.
Your mission is to write high-ranking, deeply authoritative, captivating beauty blog articles that drive organic search traffic, answer real user intent, and educate beauty enthusiasts.

Guidelines:
1. Editorial Tone: Sophisticated, chic, scientifically grounded (like Into The Gloss, Allure, Vogue Beauty, or Paula's Choice).
2. Content Quality: Provide practical dermatological guidance, explain active ingredients (e.g. ceramides, niacinamide, retinoids, sunscreen, centella), layer routines, and debunk skincare myths.
3. Local/Climate Relevance: Acknowledge high-humidity, tropical, and sun-drenched environments (like Lagos and global warm climates) as well as melanin-rich skin safety.
4. Structure: Must follow the exact JSON format specified below.
5. Content Blocks:
   - 'paragraph': rich, well-written text (3-5 comprehensive sentences each)
   - 'heading': catchy H2 title for each major section
   - 'quote': insightful quote with attribution from an aesthetician or Turpeen beauty editor
   - 'list': actionable step-by-step routine or product checklist
6. Strictly return JSON matching this schema:
{
  "title": "A compelling, high-converting SEO title (under 75 characters)",
  "subtitle": "An alluring 1-sentence subtitle expanding on the core hook",
  "slug": "url-friendly-slug-with-hyphens",
  "category": "Skincare" | "Makeup" | "Hair" | "Interviews",
  "badge": "THE TOP SHELF" | "THE REVIEW" | "GUIDE" | "THE FACE" | "POSTCARD" | "THE EXTRAS",
  "author": "Amara Chukwu" or "Dr. Folake Adeyemi" or "Kemi Balogun" or "Turpeen Editorial Team",
  "author_title": "Contributing Beauty Editor" or "Consultant Aesthetician & Skincare Specialist",
  "read_time": "5 min read",
  "excerpt": "A high-ranking 2-3 sentence meta description summarizing the key takeaways and hook for Google search snippets.",
  "blocks": [
    { "type": "paragraph", "content": "..." },
    { "type": "heading", "content": "..." },
    { "type": "paragraph", "content": "..." },
    { "type": "quote", "content": "...", "attribution": "..." },
    { "type": "heading", "content": "..." },
    { "type": "list", "title": "...", "items": ["...", "..."] },
    { "type": "paragraph", "content": "..." }
  ],
  "image_search_queries": [
    "precise query 1 for hero photography (e.g. ceramide moisturizer bottle packaging)",
    "precise query 2 for routine visual (e.g. glowing skin morning routine african woman)",
    "precise query 3 for ingredient texture (e.g. serum dropper hydrating texture)"
  ]
}`;

  const userPrompt = `Generate a fresh, authoritative blog post.
Topic / Focus: ${chosenTopic}
Category: ${chosenCategory}
Avoid repeating or copying these already published titles:
${existingTitles.slice(0, 10).map(t => `- ${t}`).join('\n') || 'None'}

Return ONLY valid JSON.`;

  // 1. Primary: Try OpenAI API
  if (openai) {
    try {
      const modelToUse = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const completion = await openai.chat.completions.create({
        model: modelToUse,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      const draft = JSON.parse(raw);
      if (draft.title && draft.blocks) {
        return { draft: normalizeDraft(draft, chosenTopic, chosenCategory), provider: `OpenAI (${modelToUse})` };
      }
    } catch (openAiErr: any) {
      console.warn("OpenAI blog generation failed (e.g. quota/credits/network), falling back to Gemini:", openAiErr?.message || openAiErr);
    }
  }

  // 2. Secondary: Fallback to Gemini with cascade via @google/genai
  if (gemini) {
    try {
      const genResult = await generateGeminiContentWithFallback(gemini, {
        contents: `${systemPrompt}\n\n${userPrompt}`,
        temperature: 0.7,
        responseMimeType: "application/json",
      });

      const raw = genResult.text || "{}";
      const draft = JSON.parse(raw);
      if (draft.title && draft.blocks) {
        return { draft: normalizeDraft(draft, chosenTopic, chosenCategory), provider: `Gemini (${genResult.modelUsed})` };
      }
    } catch (geminiErr: any) {
      console.warn("Gemini blog generation also failed:", geminiErr?.message || geminiErr);
    }
  }

  // 3. Fallback Curated Draft
  const fallbackDraft = createCuratedFallbackDraft(chosenTopic, chosenCategory);
  return { draft: fallbackDraft, provider: "Curated Beauty Editorial Engine" };
}

function normalizeDraft(draft: any, defaultTopic: string, defaultCategory: string): GeneratedBlogDraft {
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const rawSlug = draft.slug || draft.title || `blog-${Date.now()}`;
  const cleanSlug = rawSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return {
    title: draft.title || defaultTopic,
    subtitle: draft.subtitle || "Expert dermatological guidance and curated beauty essentials from Turpeen Cosmetics.",
    slug: cleanSlug || `post-${Date.now()}`,
    category: (draft.category || defaultCategory || "Skincare") as any,
    badge: (draft.badge || "THE TOP SHELF") as any,
    author: draft.author || "Amara Chukwu",
    author_title: draft.author_title || "Contributing Beauty Editor",
    date: todayStr,
    read_time: draft.read_time || "5 min read",
    excerpt: draft.excerpt || "Discover how to optimize your beauty ritual with dermatologist-approved techniques and intentional hydration.",
    blocks: Array.isArray(draft.blocks) && draft.blocks.length > 0 ? draft.blocks : [
      { type: "paragraph", content: "Great skin is built on consistency, barrier protection, and gentle active formulas tailored to your unique skin environment." }
    ],
    image_search_queries: Array.isArray(draft.image_search_queries) && draft.image_search_queries.length > 0
      ? draft.image_search_queries
      : [defaultTopic, "skincare bottle aesthetic packaging", "glowing skin beauty ritual"]
  };
}

function createCuratedFallbackDraft(topic: string, category: string): GeneratedBlogDraft {
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return {
    title: topic,
    subtitle: "Why intentional barrier care and smarter ingredient layering are defining modern beauty rituals.",
    slug,
    category: (category as any) || "Skincare",
    badge: "THE TOP SHELF",
    author: "Amara Chukwu",
    author_title: "Contributing Beauty Editor",
    date: todayStr,
    read_time: "5 min read",
    excerpt: `Discover the dermatological secrets behind ${topic}. Learn how our curated Turpeen Cosmetics formulas deliver effortless radiance while respecting your natural skin barrier.`,
    blocks: [
      {
        type: "paragraph",
        content: `In the ever-evolving world of skincare and beauty rituals, achieving healthy radiance requires understanding how active ingredients interact with your skin barrier. At Turpeen Cosmetics, our Lagos-based team focuses on curating formulas that respect skin physiology while delivering tangible, long-term results.`
      },
      {
        type: "heading",
        content: "The Science of Barrier Protection & Radiance"
      },
      {
        type: "paragraph",
        content: `Whether you are managing tropical humidity or environmental stressors, hydration and barrier defense are paramount. When your skin barrier is healthy, moisture remains sealed in and irritation stays out. Pairing ceramides with gentle humectants creates a glass-skin finish without clogging pores.`
      },
      {
        type: "quote",
        content: "True radiance comes from respecting your skin barrier rather than overwhelming it with harsh actives. Consistency and hydration will always outperform aggression.",
        attribution: "Turpeen Cosmetics Skincare Team"
      },
      {
        type: "heading",
        content: "The Curated Routine Breakdown"
      },
      {
        type: "list",
        title: "Daily Steps for Radiant, Protected Skin",
        items: [
          "Step 1: Cleanse with a pH-balanced, gentle hydrating wash that leaves the barrier intact.",
          "Step 2: Press a soothing antioxidant or brightening serum into damp skin to boost cellular defense.",
          "Step 3: Seal with a lightweight ceramide moisturizer that adapts effortlessly to climate and heat.",
          "Step 4: Never skip broad-spectrum SPF 50 to prevent dark spots and shield against photoaging."
        ]
      },
      {
        type: "heading",
        content: "The Turpeen Philosophy"
      },
      {
        type: "paragraph",
        content: `Visit our collection at Turpeen Cosmetics to discover curated essentials formulated for radiant, resilient skin. Our team is always here to guide you toward the right routine for your skin goals.`
      }
    ],
    image_search_queries: [
      topic,
      "luxury skincare bottle packaging aesthetic",
      "african woman glowing skin morning routine"
    ]
  };
}

/**
 * Full Agent Execution:
 * 1. Generates SEO blog draft
 * 2. Fetches authentic images
 * 3. Posts directly to Supabase articles table
 * 4. Demotes older hero articles so new blog is hero
 */
export async function executeBlogAgent(options?: {
  topic?: string;
  category?: string;
}): Promise<{ success: boolean; article?: any; error?: string; provider?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Supabase client is not configured. Check VITE_SUPABASE_URL and keys." };
  }

  try {
    // 1. Fetch existing article titles to avoid duplication
    const { data: existingRows } = await supabase
      .from('articles')
      .select('title, slug')
      .order('created_at', { ascending: false })
      .limit(20);

    const existingTitles = (existingRows || []).map((r: any) => r.title);

    // Pick topic: if not passed, pick an unused one from BEAUTY_SEO_TOPICS
    let topicToUse = options?.topic;
    let categoryToUse = options?.category;
    if (!topicToUse) {
      const unusedTopic = BEAUTY_SEO_TOPICS.find(t => !existingTitles.some(et => et.toLowerCase().includes(t.topic.toLowerCase().slice(0, 20))));
      if (unusedTopic) {
        topicToUse = unusedTopic.topic;
        categoryToUse = categoryToUse || unusedTopic.category;
      } else {
        const randomTopic = BEAUTY_SEO_TOPICS[Math.floor(Math.random() * BEAUTY_SEO_TOPICS.length)];
        topicToUse = randomTopic.topic;
        categoryToUse = categoryToUse || randomTopic.category;
      }
    }

    // 2. Generate blog draft using AI (OpenAI with Gemini fallback)
    const { draft, provider } = await generateBlogWithAI({
      topic: topicToUse,
      category: categoryToUse,
      existingTitles,
    });

    // 3. Find authentic high-res images
    const images = await findTopicImages(draft.image_search_queries);
    const image_1 = images[0] || CURATED_BEAUTY_IMAGES[0];
    const image_2 = images[1] || CURATED_BEAUTY_IMAGES[1];
    const image_3 = images[2] || CURATED_BEAUTY_IMAGES[2];

    // Ensure slug is unique
    let finalSlug = draft.slug;
    if (existingRows?.some((r: any) => r.slug === finalSlug)) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    // 4. Demote previous hero articles in Supabase
    await supabase
      .from('articles')
      .update({ is_hero: false, is_secondary_hero: true })
      .eq('is_hero', true);

    // 5. Insert new blog post into Supabase articles table
    const newArticleRecord = {
      title: draft.title,
      subtitle: draft.subtitle,
      slug: finalSlug,
      category: draft.category,
      badge: draft.badge,
      author: draft.author,
      author_title: draft.author_title,
      date: draft.date,
      read_time: draft.read_time,
      excerpt: draft.excerpt,
      image_1,
      image_2,
      image_3,
      images: [image_1, image_2, image_3],
      blocks: draft.blocks,
      is_hero: true,
      is_secondary_hero: false,
      is_latest: true,
      is_sidebar: false,
      sidebar_badge: null,
    };

    const { data: inserted, error: insertError } = await supabase
      .from('articles')
      .insert([newArticleRecord])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert article error:", insertError);
      return { success: false, error: insertError.message };
    }

    // Log run to status store
    recordAgentRun({
      id: inserted?.id || `art-${Date.now()}`,
      title: draft.title,
      category: draft.category,
      author: draft.author,
      slug: finalSlug,
      timestamp: new Date().toISOString(),
      provider,
      image_1,
    });

    return {
      success: true,
      article: inserted || newArticleRecord,
      provider,
    };
  } catch (err: any) {
    console.error("Error in executeBlogAgent:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

// In-Memory & File-based Status State
interface AgentLog {
  id: string;
  title: string;
  category: string;
  author: string;
  slug: string;
  timestamp: string;
  provider: string;
  image_1: string;
}

interface AgentState {
  enabled: boolean;
  schedule: string;
  intervalHours: number;
  lastRun: string | null;
  nextRun: string | null;
  logs: AgentLog[];
}

const STATUS_FILE = path.join(process.cwd(), 'agent_status.json');

function loadAgentState(): AgentState {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const data = fs.readFileSync(STATUS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Failed to load agent_status.json:", e);
  }
  return {
    enabled: true,
    schedule: "2 blogs every 24 hours (every 12 hours)",
    intervalHours: 12,
    lastRun: null,
    nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    logs: []
  };
}

function saveAgentState(state: AgentState) {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.warn("Failed to save agent_status.json:", e);
  }
}

let agentState: AgentState = loadAgentState();

export function getAgentState(): AgentState {
  return agentState;
}

export function recordAgentRun(log: AgentLog) {
  agentState.lastRun = log.timestamp;
  agentState.nextRun = new Date(Date.now() + agentState.intervalHours * 60 * 60 * 1000).toISOString();
  agentState.logs = [log, ...agentState.logs.slice(0, 19)];
  saveAgentState(agentState);
}

export function toggleAgentEnabled(enabled: boolean): AgentState {
  agentState.enabled = enabled;
  saveAgentState(agentState);
  return agentState;
}

let scheduledTimer: NodeJS.Timeout | null = null;

/**
 * Initializes the automated 2-blogs-a-day schedule (every 12 hours)
 */
export async function startBlogAgentScheduler() {
  if (scheduledTimer) {
    clearInterval(scheduledTimer);
    scheduledTimer = null;
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.warn("Blog Agent: Supabase not configured, scheduler paused.");
    return;
  }

  console.log("🤖 Blog Writing Agent initialized: Scheduled for 2 blogs a day (every 12 hours).");

  // Check when the latest article was created
  try {
    const { data: latestArticles } = await supabase
      .from('articles')
      .select('created_at, title')
      .order('created_at', { ascending: false })
      .limit(1);

    const latest = latestArticles?.[0];
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    const now = Date.now();

    if (latest && latest.created_at) {
      const lastArticleTime = new Date(latest.created_at).getTime();
      const elapsed = now - lastArticleTime;
      console.log(`Blog Agent: Elapsed time since last article (${latest.title}): ${(elapsed / (1000 * 60 * 60)).toFixed(1)} hours.`);

      if (elapsed >= twelveHoursMs) {
        console.log("Blog Agent: Over 12 hours since last post. Triggering scheduled blog post now...");
        executeBlogAgent().catch(err => console.error("Initial blog post failed:", err));
      } else {
        const remainingMs = twelveHoursMs - elapsed;
        console.log(`Blog Agent: Next blog post in ${(remainingMs / (1000 * 60 * 60)).toFixed(1)} hours.`);
        agentState.nextRun = new Date(now + remainingMs).toISOString();
        saveAgentState(agentState);
      }
    } else {
      // No articles in DB, run immediately to create initial post
      console.log("Blog Agent: No existing articles detected. Writing first automated blog now...");
      executeBlogAgent().catch(err => console.error("Initial blog post failed:", err));
    }
  } catch (err) {
    console.warn("Blog Agent startup check warning:", err);
  }

  // Set recurring 12-hour interval (2 blogs every 24 hours)
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  scheduledTimer = setInterval(async () => {
    if (!agentState.enabled) {
      console.log("Blog Agent: Scheduler triggered but agent is currently disabled.");
      return;
    }
    console.log("⏰ Blog Agent: 12-hour interval triggered. Generating and posting new blog...");
    try {
      const result = await executeBlogAgent();
      if (result.success) {
        console.log(`✨ Blog Agent: Successfully posted new blog: "${result.article?.title}" via ${result.provider}`);
      } else {
        console.error("❌ Blog Agent: Failed to post scheduled blog:", result.error);
      }
    } catch (err) {
      console.error("❌ Blog Agent: Error during scheduled execution:", err);
    }
  }, TWELVE_HOURS);
}
