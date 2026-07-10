import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the server-side Gemini client with recommended httpOptions and User-Agent.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for the Chatbot Aijay
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

      // Build the contents array from user message and history.
      const formattedContents: any[] = [];
      
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          formattedContents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        });
      }
      
      // Append the latest user message
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I'm sorry, I couldn't generate a response. How else can I assist you with Turpeen Cosmetics today?";
      res.json({ text: replyText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred while communicating with Gemini." });
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
