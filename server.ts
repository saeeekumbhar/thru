import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // AI Itinerary Generation Route
  app.post('/api/generate-itinerary', async (req, res) => {
    try {
      const { destination, days, preferences } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `You are an expert travel planner. Create a detailed ${days}-day itinerary for ${destination}. 
      The user's preferences are: ${preferences}.
      
      Respond ONLY with a valid JSON object matching this structure:
      {
        "title": "Trip to ${destination}",
        "days": [
          {
            "day": 1,
            "theme": "Arrival & Exploration",
            "activities": [
              {
                "time": "10:00 AM",
                "place": "Name of place",
                "description": "Brief description",
                "type": "sightseeing|food|transport|accommodation"
              }
            ]
          }
        ],
        "budgetEstimate": "$500",
        "tips": ["Tip 1", "Tip 2"]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text;
      if (!text) throw new Error('No response from AI');
      
      const itinerary = JSON.parse(text);
      res.json(itinerary);
    } catch (error) {
      console.error('AI Generation Error:', error);
      res.status(500).json({ error: 'Failed to generate itinerary' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
