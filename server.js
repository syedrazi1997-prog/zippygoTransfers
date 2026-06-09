require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();

/* ========================================= MIDDLEWARE ========================================= */
app.use(cors());

// Stripe Webhook needs the raw body intact
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Serves front-end files directly from the repository root
app.use(express.static(__dirname));

/* ========================================= GEMINI AI ROUTE ========================================= */
app.post('/api/gemini/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, reply: "No message text provided." });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("Missing GEMINI_API_KEY in Render environment configuration.");
            return res.status(500).json({ success: false, reply: "AI lines are busy. Check dashboard token bindings." });
        }

        // Initialize the standard Google Gen AI SDK
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are the official conversational booking agent for Zippygo Transfers. 
            Answer this customer inquiry helpfully, concisely, and professionally regarding airport transfers, luggage options, fleet sizing, or prices: ${message}`,
        });

        res.json({ success: true, reply: response.text });
    } catch (error) {
        console.error("Gemini Route Exception Error:", error);
        res.status(500).json({ success: false, reply: "My system lines are slightly crowded right now. Let me know if you have any questions about booking a transfer!" });
    }
});

/* ========================================= MOCK SEARCH ENDPOINT ========================================= */
app.post('/api/search-transfers', (req, res) => {
    const { tripType, passengers } = req.body;
    const passengerCount = parseInt(passengers) || 2;
    const baseMultiplier = tripType === 'return' ? 1.85 : 1.0;
    
    const options = [
        { id: "ZP-SHUTTLE", vehicle: "Shared Shuttle Transit Service", priceGbp: ((14.50) * baseMultiplier * passengerCount).toFixed(2) },
        { id: "ZP-SEDAN", vehicle: "Private Standard Saloon Car", priceGbp: ((39.00) * baseMultiplier * (1 + passengerCount * 0.05)).toFixed(2) },
        { id: "ZP-MINIVAN", vehicle: "Private Executive MPV Minivan", priceGbp: ((68.00) * baseMultiplier * (1 + passengerCount * 0.08)).toFixed(2) }
    ];
    res.json({ success: true, options });
});

/* ========================================= STRUCTURAL FRONTEND ROUTE ========================================= */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/* ========================================= SERVER LIFECYCLE ========================================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server executing perfectly on port ${PORT}`);
});
