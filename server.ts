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
        "summary": {
          "totalCost": "₹45,000",
          "travelTime": "12h total",
          "highlights": ["Iconic landmarks", "Local cuisine", "Hidden gems"]
        },
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
        "options": {
          "stays": [
            { "title": "Hotel Name", "price": "₹4,000/night", "rating": 4.5, "tags": ["Boutique", "Central"] }
          ],
          "food": [
            { "title": "Restaurant Name", "price": "₹800 avg", "rating": 4.2, "tags": ["Street Food", "Authentic"] }
          ],
          "places": [
            { "title": "Attraction Name", "price": "Free", "rating": 4.8, "tags": ["Must-visit", "History"] }
          ],
          "transport": [
            { "title": "Private Cab", "price": "₹1,500", "rating": 4.5, "tags": ["Fastest", "Comfort"] }
          ]
        },
        "tips": ["Tip 1", "Tip 2"]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
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

  // Google Places Autocomplete API
  app.get('/api/places/autocomplete', async (req, res) => {
    try {
      const q = req.query.q as string;
      const key = process.env.GOOGLE_MAPS_API_KEY;
      if (!key) return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY is not set in env' });
      
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&types=(cities)&key=${key}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Places Autocomplete Error:', error);
      res.status(500).json({ error: 'Failed to fetch places' });
    }
  });

  // Google Places Details API (for coordinates)
  app.get('/api/places/details', async (req, res) => {
    try {
      const placeId = req.query.place_id as string;
      const key = process.env.GOOGLE_MAPS_API_KEY;
      if (!key) return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY is not set in env' });
      
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${key}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Places Details Error:', error);
      res.status(500).json({ error: 'Failed to fetch coordinates' });
    }
  });

  // OpenWeather API
  app.get('/api/weather', async (req, res) => {
    try {
      const { lat, lon } = req.query;
      const key = process.env.WEATHER_API_KEY;
      if (!key) return res.status(500).json({ error: 'WEATHER_API_KEY is not set in env' });
      
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Weather Fetch Error:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
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
