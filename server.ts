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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

        return res.json({ text: replyText, provider: "openai" });
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

        const response = await gemini.models.generateContent({
          model: "gemini-3.7-flash",
          contents: formattedContents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });

        const replyText =
          response.text ||
          "I'm sorry, I couldn't generate a response. How else can I assist you with Turpeen Cosmetics today?";
        return res.json({ text: replyText, provider: "gemini" });
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

  // Dedicated Google AI Summary Endpoint
  app.post("/api/gemini/summarize", async (req, res) => {
    try {
      const { type, article, product, websiteData } = req.body;

      const gemini = getGeminiClient();
      if (!gemini) {
        return res.status(503).json({
          error: "Google Gemini AI is not initialized. Please ensure GEMINI_API_KEY is set in your environment.",
        });
      }

      // CASE 1: Article Summary
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

        const prompt = `You are the Google AI Editorial Beauty Summarizer for Turpeen Cosmetics.
Analyze the following beauty article/profile and generate a structured executive AI Summary with high-fashion editorial clarity.

Article Details:
Title: ${articleTitle}
Subtitle: ${articleSubtitle}
Author: ${articleAuthor}
Category: ${articleCategory}

Full Content:
${textBody.slice(0, 5000)}

Please return a valid JSON object matching this exact schema:
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

        const response = await gemini.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const rawText = response.text || "{}";
        let parsed;
        try {
          parsed = JSON.parse(rawText);
        } catch (e) {
          parsed = {
            executiveSummary: rawText.slice(0, 250),
            keyTakeaways: [
              "Focus on consistent skin hydration and barrier protection.",
              "Less is more: multi-use hero products elevate daily routines.",
              "Tailor your skincare rituals to your skin's daily moisture needs."
            ],
            readingTimeSavings: "2 min saved",
            skinTypeFocus: "Universal / All Skin Types",
          };
        }

        return res.json({ summary: parsed, provider: "google-gemini-3.7-flash" });
      }

      // CASE 2: Whole Website / Beauty Digest
      if (type === "digest") {
        const articlesList = Array.isArray(websiteData?.articles)
          ? websiteData.articles.slice(0, 10).map((a: any) => `- "${a.title}" by ${a.author} (${a.category}): ${a.excerpt}`).join("\n")
          : "Curated Turpeen Cosmetics Top Shelves, Interviews, Makeup, and Skincare Guides.";

        const routinesList = Array.isArray(websiteData?.routines)
          ? websiteData.routines.slice(0, 5).map((r: any) => `- Routine by ${r.name} (${r.location}): Favorite is ${r.favoriteProduct}. "${r.title}"`).join("\n")
          : "Community shared beauty routines from Lagos to worldwide.";

        const prompt = `You are the Google AI Editorial Digest Engine for Turpeen Cosmetics.
Synthesize the current editorial publications, reader routines, and beauty philosophy into a sleek, daily executive Google AI Beauty Overview.

Website Content Snapshot:
Articles:
${articlesList}

Community Routines:
${routinesList}

Return a valid JSON object matching this structure:
{
  "headline": "Today's Google AI Editorial Digest: Glowing Skin, Intentional Routines & Lagos Beauty Culture",
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
    { "name": "Turpeen Futuredew", "reason": "Oil-serum hybrid that locks in an all-day glass-skin radiance." },
    { "name": "Turpeen Boy Brow", "reason": "The quintessential pomade for sculpted, feathery arch definition." }
  ],
  "generatedAt": "Today"
}`;

        const response = await gemini.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const rawText = response.text || "{}";
        let parsed;
        try {
          parsed = JSON.parse(rawText);
        } catch (e) {
          parsed = {
            headline: "Google AI Beauty Digest • Turpeen Cosmetics",
            summary: "Today's editorial briefing curates simplified routines, barrier-first skincare, and effortless makeup techniques.",
            trendingThemes: [],
            editorsTake: "Nourishing formulations and intentional beauty rituals lead today's top shelves.",
            keyStats: [{ label: "Stories", value: "Curated Daily" }],
            holyGrailPicks: [],
            generatedAt: "Today"
          };
        }

        return res.json({ digest: parsed, provider: "google-gemini-3.7-flash" });
      }

      // CASE 3: Product Breakdown
      if (type === "product") {
        const prodName = product?.name || "Turpeen Product";
        const prodPrice = product?.price || "$20";
        const prodDesc = product?.description || product?.subtitle || "";
        const prodCat = product?.category || "Cosmetics";

        const prompt = `You are Google AI Cosmetic Formulation Specialist.
Provide an intelligent formulation insight for:
Product: ${prodName}
Category: ${prodCat}
Price: ${prodPrice}
Description: ${prodDesc}

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

        const response = await gemini.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const rawText = response.text || "{}";
        let parsed;
        try {
          parsed = JSON.parse(rawText);
        } catch (e) {
          parsed = {
            headline: `${prodName} AI Insight`,
            formulationOverview: prodDesc || "A luxurious, dermatologist-tested formula designed for effortless everyday wear.",
            keyActives: [{ name: "Hydrating Complex", function: "Locks in moisture" }],
            skinTypeMatch: "All skin types",
            howToLayer: "Apply as desired throughout the day.",
            editorVerdict: "A dependable staple for everyday radiance."
          };
        }

        return res.json({ insight: parsed, provider: "google-gemini-3.7-flash" });
      }

      return res.status(400).json({ error: "Invalid summary request type" });
    } catch (err: any) {
      console.error("Gemini Summarize API Error:", err);
      res.status(500).json({
        error: err.message || "Failed to generate Google AI summary",
      });
    }
  });

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
