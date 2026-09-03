import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization of OpenAI client to prevent crashes if key is initially absent
let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openaiClient;
}

// Fallback Gemini client if OpenAI key is not provided
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
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
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }

        console.warn(`Gemini model ${model} attempt ${attempt + 1} unavailable (${errMessage}). Trying fallback...`);
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini model cascades failed.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route for the Chatbot Aijay using OpenAI
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const systemInstruction = `You are Aijay, a chic, helpful, and highly knowledgeable AI beauty and cosmetics consultant for Turpeen Cosmetics (often referred to as turpeen.).
Your tone is friendly, editorial, stylish, and sophisticated, like a beauty editor at a high-end magazine or a professional beauty consultant at a boutique counter.
Speak clearly, objectively, and with professional composure. You can use standard emojis like ✨, 🧴, 💄, or 🍒 when appropriate, but keep it elegant.

Provide genuine guidance about skincare, makeup, and products.
Here are the core Turpeen Cosmetics products available in the shop:
1. "Turpeen Balm Dotcom" - A universal skin salve and lip balm ($14). Available in Original, Cherry, and Mint.
2. "Turpeen Boy Brow" - A grooming pomade ($18) that thickens, fills, and shapes brows. Available in Clear, Brown, and Black.
3. "Turpeen Lash Slick" - A film-forming mascara ($20) that curls and lengthens.
4. "Turpeen Milky Jelly Cleanser" - A gentle face wash ($19) for all skin types.
5. "Turpeen You Perfume" - The ultimate personal fragrance ($68) that smells like you, but better. Warm, clean, with notes of pink pepper and iris.
6. "Turpeen Futuredew" - An oil-serum hybrid ($26) for an instant, long-lasting dewy glow.

Always stay in character as Aijay. If someone asks about unrelated topics, politely pivot back to beauty, skincare, makeup, or Turpeen Cosmetics. Keep your responses relatively concise (1-3 short paragraphs) to make them perfect for a chat interface.`;

      // 1. Primary: Use OpenAI API
      const openai = getOpenAIClient();
      if (openai) {
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: "system", content: systemInstruction },
        ];

        if (history && Array.isArray(history)) {
          history.forEach((msg: any) => {
            const role = (msg.role === "user" ? "user" : "assistant") as "user" | "assistant";
            const content = msg.text || msg.content || "";
            if (content) {
              messages.push({ role, content });
            }
          });
        }

        messages.push({ role: "user", content: message });

        const modelToUse = process.env.OPENAI_MODEL || "gpt-4o-mini";
        const completion = await openai.chat.completions.create({
          model: modelToUse,
          messages: messages,
          temperature: 0.7,
          max_tokens: 600,
        });

        const replyText =
          completion.choices[0]?.message?.content ||
          "I'm sorry, I couldn't generate a response. How else can I assist you with Turpeen Cosmetics today?";

        return res.json({ text: replyText, provider: "ai-concierge" });
      }

      // 2. Fallback: Use Gemini if OPENAI_API_KEY is not yet populated
      const gemini = getGeminiClient();
      if (gemini) {
        const formattedContents: any[] = [];
        if (history && Array.isArray(history)) {
          history.forEach((msg: any) => {
            formattedContents.push({
              role: msg.role === "user" ? "user" : "model",
              parts: [{ text: msg.text || msg.content || "" }],
            });
          });
        }
        formattedContents.push({
          role: "user",
          parts: [{ text: message }],
        });

        try {
          const genResult = await generateGeminiContentWithFallback(gemini, {
            contents: formattedContents,
            systemInstruction: systemInstruction,
            temperature: 0.7,
          });

          const replyText =
            genResult.text ||
            "I'm sorry, I couldn't generate a response. How else can I assist you with Turpeen Cosmetics today?";
          return res.json({ text: replyText, provider: "ai-concierge" });
        } catch (genErr: any) {
          console.warn("Gemini chat fallback engaged due to high demand:", genErr?.message || genErr);
          return res.json({
            text: "Hello! Our AI beauty assistant is currently experiencing high demand. In the meantime, feel free to explore our curated Top Shelf articles, view our skincare routines, or browse our boutique cosmetics collection! How else can I assist you?",
            provider: "editorial-standby",
          });
        }
      }

      return res.status(500).json({
        error:
          "AI service is not configured. Please ensure GEMINI_API_KEY is available.",
      });
    } catch (error: any) {
      console.error("Chat API Error:", error);
      res.status(500).json({
        error:
          error.message ||
          "An error occurred while communicating with the AI service.",
      });
    }
  });

  // Dedicated AI Review & Summary Endpoint powered by OpenAI
  const handleSummarize = async (req: express.Request, res: express.Response) => {
    try {
      const { type, article, product, websiteData } = req.body;

      const openai = getOpenAIClient();

      // CASE 1: Article Summary / Review
      if (type === "article" || (!type && article)) {
        const articleTitle = article?.title || "Untitled Article";
        const articleAuthor = article?.author || "Turpeen Editorial";
        const articleCategory = article?.category || "Beauty & Skincare";
        const articleSubtitle = article?.subtitle || "";
        const articleExcerpt = article?.excerpt || "";
        
        let textBody = "";
        if (Array.isArray(article?.blocks)) {
          textBody = article.blocks
            .map((b: any) => b.text || b.productDesc || b.authorQuote || "")
            .filter(Boolean)
            .join("\n\n");
        }
        if (!textBody) {
          textBody = articleExcerpt || articleSubtitle || articleTitle;
        }

        const fallbackSummary = {
          executiveSummary: articleExcerpt || `${articleTitle} explores the signature beauty philosophies and effortless morning rituals curated by ${articleAuthor}.`,
          keyTakeaways: [
            "Prioritize barrier hydration and gentle cleansing over harsh exfoliation.",
            "Choose lightweight, multi-use hero products that adapt to changing humidity.",
            "Tailor daily skincare rituals around consistency and radiant, natural texture."
          ],
          routineHighlights: [
            { step: "Daily Glow Prep", tip: "Condition with a pH-balanced gentle cleanser, mist with rosewater, and layer a lightweight antioxidant serum." },
            { step: "Effortless Finish", tip: "Warm a few drops of hybrid oil-serum into high points of the face followed by non-comedogenic SPF." }
          ],
          productInsights: [
            { product: "Futuredew & Balm Dotcom", benefit: "Seals in non-greasy glass-skin radiance and long-lasting lip nourishment." }
          ],
          readingTimeSavings: "3 min saved",
          skinTypeFocus: "Universal / Balanced Glow",
          editorsQuote: "Beauty is an intimate daily gesture of taking care of yourself."
        };

        if (openai) {
          try {
            const systemPrompt = `You are the AI Editorial Beauty Reviewer for Turpeen Cosmetics.
Analyze the following beauty article/profile and generate a structured executive AI Review with high-fashion editorial clarity. Do not mention or include any prices.
Return a valid JSON object matching this schema:
{
  "executiveSummary": "A punchy, informative 2-3 sentence overview capturing the spirit, person, and key beauty philosophy of the article.",
  "keyTakeaways": [
    "Takeaway 1: Essential skincare or beauty technique mentioned",
    "Takeaway 2: Actionable advice on product usage, habits, or mindset",
    "Takeaway 3: A signature routine or lifestyle rule"
  ],
  "routineHighlights": [
    { "step": "Morning/Evening Step", "tip": "Concise method or product recommendation" }
  ],
  "productInsights": [
    { "product": "Mentioned Product Name", "benefit": "Why they love it or what skin benefit it delivers" }
  ],
  "readingTimeSavings": "3 min saved",
  "skinTypeFocus": "All Skin Types / Glow-Focused / Sensitive",
  "editorsQuote": "A memorable, inspiring beauty quote summarizing the article's ethos."
}`;

            const userPrompt = `Article Details:
Title: ${articleTitle}
Subtitle: ${articleSubtitle}
Author: ${articleAuthor}
Category: ${articleCategory}

Full Content:
${textBody.slice(0, 5000)}`;

            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              response_format: { type: "json_object" },
              temperature: 0.3,
            });

            const rawText = completion.choices[0]?.message?.content || "{}";
            let parsed = fallbackSummary;
            try {
              parsed = JSON.parse(rawText);
            } catch (parseErr) {
              console.warn("Failed to parse OpenAI JSON response, using fallback:", parseErr);
            }

            return res.json({ summary: parsed, provider: "ai-editorial" });
          } catch (openaiErr: any) {
            console.warn("OpenAI article review failed, falling back to curated editorial response:", openaiErr?.message || openaiErr);
          }
        }

        // Secondary fallback to Gemini if OpenAI key wasn't available
        const gemini = getGeminiClient();
        if (gemini) {
          try {
            const prompt = `You are the AI Editorial Beauty Reviewer for Turpeen Cosmetics.
Analyze the following beauty article/profile and generate a structured executive AI Review with high-fashion editorial clarity (do not mention prices).
Title: ${articleTitle}
Author: ${articleAuthor}
Content: ${textBody.slice(0, 4000)}
Return valid JSON matching: { "executiveSummary": "...", "keyTakeaways": ["..."], "routineHighlights": [{"step":"...","tip":"..."}], "productInsights": [{"product":"...","benefit":"..."}], "readingTimeSavings": "3 min saved", "skinTypeFocus": "...", "editorsQuote": "..." }`;

            const genResult = await generateGeminiContentWithFallback(gemini, {
              contents: prompt,
              temperature: 0.3,
              responseMimeType: "application/json",
            });
            const parsed = JSON.parse(genResult.text || "{}");
            return res.json({ summary: parsed, provider: "ai-editorial" });
          } catch (gErr) {
            console.warn("Gemini fallback also unavailable:", gErr);
          }
        }

        return res.json({ summary: fallbackSummary, provider: "editorial-curated-summary" });
      }

      // CASE 2: Whole Website / Beauty Digest
      if (type === "digest") {
        const articlesList = Array.isArray(websiteData?.articles)
          ? websiteData.articles.slice(0, 10).map((a: any) => `- "${a.title}" by ${a.author} (${a.category}): ${a.excerpt}`).join("\n")
          : "Curated Turpeen Cosmetics Top Shelves, Interviews, Makeup, and Skincare Guides.";

        const routinesList = Array.isArray(websiteData?.routines)
          ? websiteData.routines.slice(0, 5).map((r: any) => `- Routine by ${r.name} (${r.location}): Favorite is ${r.favoriteProduct}. "${r.title}"`).join("\n")
          : "Community shared beauty routines from Lagos to worldwide.";

        const fallbackDigest = {
          headline: "Today's AI Editorial Digest: Glowing Skin, Intentional Routines & Lagos Beauty Culture",
          summary: "Across today's featured Top Shelves and reader routines, the overarching beauty philosophy centers on dewy barrier hydration, simplified active steps, and lightweight grooming essentials designed for effortless confidence.",
          keyStats: [
            { label: "Active Profiles", value: "12+ Stories" },
            { label: "Trending Finish", value: "Dewy Skin First" },
            { label: "Core Philosophy", value: "Skin First, Makeup Second" }
          ],
          trendingThemes: [
            { topic: "Hydration First", tag: "SKINCARE", description: "Prioritizing hydrating cleansers and oil-serum glow enhancers over heavy coverage." },
            { topic: "Effortless Grooming", tag: "MAKEUP", description: "Fluffy, natural brows and balmy lip tints dominate community favourites." },
            { topic: "Community Holy Grails", tag: "TOP SHELF", description: "Real beauty enthusiasts sharing multi-use staples for tropical and continental climates." }
          ],
          editorsTake: "Beauty in 2026 is defined by ritual and authenticity: nourishing formulas that celebrate personal skin texture with luminous results.",
          holyGrailPicks: [
            { name: "Turpeen Futuredew", reason: "Oil-serum hybrid that locks in an all-day glass-skin radiance." },
            { name: "Turpeen Boy Brow", reason: "The quintessential pomade for sculpted, feathery arch definition." },
            { name: "Turpeen Milky Jelly Cleanser", reason: "Conditioning face wash formulated with pH-balanced rose water." }
          ],
          generatedAt: "Updated Live"
        };

        if (openai) {
          try {
            const systemPrompt = `You are the AI Editorial Digest Engine for Turpeen Cosmetics.
Synthesize the current editorial publications, reader routines, and beauty philosophy into a sleek, daily executive AI Review & Beauty Digest. Do not mention any prices.
Return a valid JSON object matching this structure:
{
  "headline": "Today's AI Editorial Digest: Glowing Skin, Intentional Routines & Lagos Beauty Culture",
  "summary": "An insightful 2-sentence synthesis of today's key editorial themes across skincare minimalism, effortless makeup, and community holy grails.",
  "keyStats": [
    { "label": "Active Profiles", "value": "12+ Stories" },
    { "label": "Top Trending Category", "value": "Skincare & Dewy Finishes" },
    { "label": "Core Philosophy", "value": "Skin First, Makeup Second" }
  ],
  "trendingThemes": [
    { "topic": "Hydration First", "tag": "SKINCARE", "description": "Prioritizing hydrating cleansers and oil-serum glow enhancers over heavy coverage." },
    { "topic": "Effortless Grooming", "tag": "MAKEUP", "description": "Fluffy, natural brows and balmy lip tints dominate community favourites." },
    { "topic": "Community Holy Grails", "tag": "TOP SHELF", "description": "Real beauty enthusiasts sharing multi-use staples for tropical and continental climates." }
  ],
  "editorsTake": "Beauty in 2026 is defined by ritual and authenticity: nourishing formulas that celebrate personal skin texture with luminous results.",
  "holyGrailPicks": [
    { "name": "Turpeen Futuredew", reason: "Oil-serum hybrid that locks in an all-day glass-skin radiance." },
    { "name": "Turpeen Boy Brow", reason: "The quintessential pomade for sculpted, feathery arch definition." }
  ],
  "generatedAt": "Today"
}`;

            const userPrompt = `Website Content Snapshot:
Articles:
${articlesList}

Community Routines:
${routinesList}`;

            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              response_format: { type: "json_object" },
              temperature: 0.3,
            });

            const rawText = completion.choices[0]?.message?.content || "{}";
            let parsed = fallbackDigest;
            try {
              parsed = JSON.parse(rawText);
            } catch (e) {
              parsed = fallbackDigest;
            }

            return res.json({ digest: parsed, provider: "ai-editorial" });
          } catch (openaiErr: any) {
            console.warn("OpenAI digest generation failed:", openaiErr?.message || openaiErr);
          }
        }

        return res.json({ digest: fallbackDigest, provider: "editorial-curated-digest" });
      }

      // CASE 3: Product AI Review (Strictly NO prices)
      if (type === "product") {
        const prodName = product?.name || "Turpeen Product";
        const prodDesc = product?.description || product?.subtitle || "";
        const prodCat = product?.category || "Cosmetics";

        const fallbackInsight = {
          headline: `Formulation Analysis: ${prodName}`,
          formulationOverview: prodDesc || `${prodName} delivers weightless barrier nourishment with a clean, breathable finish that integrates seamlessly with daily routines.`,
          keyActives: [
            { name: "Barrier Lipids & Botanical Extracts", function: "Replenishes skin hydration and seals in moisture without congestion." },
            { name: "Light-Reflecting Micro-Pigments", function: "Diffuses natural light for an effortless, dewy finish." }
          ],
          skinTypeMatch: "Suitable for all skin types, including sensitive and dry textures.",
          howToLayer: "Warm 1-2 pumps between fingertips and press gently onto clean skin or over morning moisturizer before SPF.",
          editorVerdict: "A dependable, multi-use holy grail that balances effortless application with tangible barrier benefits."
        };

        if (openai) {
          try {
            const systemPrompt = `You are an elite cosmetic formulation and beauty review specialist for Turpeen Cosmetics.
Provide an intelligent, high-end editorial AI Review for the cosmetic formula.
IMPORTANT: Strictly do NOT mention, estimate, or discuss prices or costs under any circumstances. Focus exclusively on formulation texture, active ingredients, skin feel, benefits, skin type compatibility, and application method.
Return a valid JSON object matching this structure:
{
  "headline": "Why it's a cult favorite formula",
  "formulationOverview": "A 2-sentence breakdown of the texture, skin feel, and signature benefits.",
  "keyActives": [
    { "name": "Key Ingredient / Technology", "function": "Specific skin or makeup benefit" },
    { "name": "Hydration / Nourishment Agent", "function": "Long-term skin wellness effect" }
  ],
  "skinTypeMatch": "Best for All Skin Types, especially dehydrated, dry, or normal textures.",
  "howToLayer": "How to seamlessly incorporate this step into morning or evening beauty regimens.",
  "editorVerdict": "A 1-sentence editorial recommendation on why this belongs in your cosmetic pouch."
}`;

            const userPrompt = `Product Review Request:
Product: ${prodName}
Category: ${prodCat}
Description: ${prodDesc}`;

            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              response_format: { type: "json_object" },
              temperature: 0.3,
            });

            const rawText = completion.choices[0]?.message?.content || "{}";
            let parsed = fallbackInsight;
            try {
              parsed = JSON.parse(rawText);
            } catch (e) {
              parsed = fallbackInsight;
            }

            return res.json({ insight: parsed, provider: "ai-formulation" });
          } catch (openaiErr: any) {
            console.warn("OpenAI product review failed, using fallback:", openaiErr?.message || openaiErr);
          }
        }

        // Secondary fallback to Gemini if OpenAI key isn't provided
        const gemini = getGeminiClient();
        if (gemini) {
          try {
            const prompt = `You are a cosmetic formulation specialist for Turpeen Cosmetics.
Provide an intelligent AI Review for:
Product: ${prodName}
Category: ${prodCat}
Description: ${prodDesc}
Do NOT mention any prices or costs.
Return a valid JSON object matching:
{
  "headline": "Why it's a cult favorite formula",
  "formulationOverview": "A 2-sentence breakdown of texture, skin feel, and benefits.",
  "keyActives": [
    { "name": "Key Ingredient", "function": "Specific benefit" }
  ],
  "skinTypeMatch": "Skin types this is best for.",
  "howToLayer": "How to apply and layer this formula.",
  "editorVerdict": "A 1-sentence editorial review verdict."
}`;

            const genResult = await generateGeminiContentWithFallback(gemini, {
              contents: prompt,
              temperature: 0.3,
              responseMimeType: "application/json",
            });
            const parsed = JSON.parse(genResult.text || "{}");
            return res.json({ insight: parsed, provider: "ai-formulation" });
          } catch (gErr) {
            console.warn("Gemini fallback also failed:", gErr);
          }
        }

        return res.json({ insight: fallbackInsight, provider: "editorial-curated-insight" });
      }

      return res.status(400).json({ error: "Invalid summary request type" });
    } catch (err: any) {
      console.error("General Summarize Route Error:", err);
      res.status(500).json({
        error: err.message || "Failed to process summary request",
      });
    }
  };

  // Register both /api/ai/summarize and legacy /api/gemini/summarize endpoints
  app.post("/api/ai/summarize", handleSummarize);
  app.post("/api/gemini/summarize", handleSummarize);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
