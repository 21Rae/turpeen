import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

// Lazy initialization of OpenAI client
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

export default async function handler(req: any, res: any) {
  // Allow CORS if accessed cross-origin or in preview
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Only POST is supported.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { message, history } = body || {};

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

      return res.status(200).json({ text: replyText, provider: "openai" });
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
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText =
        response.text ||
        "I'm sorry, I couldn't generate a response. How else can I assist you with Turpeen Cosmetics today?";
      return res.status(200).json({ text: replyText, provider: "gemini" });
    }

    return res.status(500).json({
      error:
        "OpenAI API key is missing. Please add OPENAI_API_KEY to your Vercel Project Settings under Environment Variables (and redeploy).",
    });
  } catch (error: any) {
    console.error("Chat API Error (Vercel):", error);
    return res.status(500).json({
      error:
        error.message ||
        "An error occurred while communicating with the AI service.",
    });
  }
}
