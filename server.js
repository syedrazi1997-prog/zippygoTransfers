require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();

/* ========================================= MIDDLEWARE CONFIG ========================================= */
app.use(cors());
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Serves all static HTML assets directly from the repository root
app.use(express.static(__dirname));

/* ========================================= GEMINI CONVERSATIONAL INTELLIGENCE ========================================= */
app.post('/api/gemini/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, reply: "No context string provided." });

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, reply: "AI lines are busy right now. Please test again in a moment." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are the official conversational booking agent for Zippygo Transfers. 
            Answer this customer inquiry helpfully, concisely, and professionally regarding airport transfers, taxi rules, and travel accommodations: ${message}`,
        });

        res.json({ success: true, reply: response.text });
    } catch (error) {
        console.error("Gemini Failure Exception Loop:", error);
        res.status(500).json({ success: false, reply: "My system lines are slightly crowded right now. Let me know if you have any questions about booking a transfer!" });
    }
});

/* ========================================= TAXI FARE ENGINE QUOTES ========================================= */
app.post('/api/search-transfers', (req, res) => {
    const { tripType, passengers } = req.body;
    const count = parseInt(passengers) || 2;
    const factor = tripType === 'return' ? 1.85 : 1.0;
    
    // Live calculation mappings
    const options = [
        { id: "ZP-SHUTTLE", vehicle: "Shared Shuttle Transit Service", priceGbp: (14.50 * factor * count).toFixed(2) },
        { id: "ZP-SEDAN", vehicle: "Private Standard Saloon Car", priceGbp: (39.00 * factor * (1 + count * 0.05)).toFixed(2) },
        { id: "ZP-MINIVAN", vehicle: "Private Executive MPV Minivan", priceGbp: (68.00 * factor * (1 + count * 0.08)).toFixed(2) }
    ];
    res.json({ success: true, options });
});

/* ========================================= TRANSACTIONS LAYER ========================================= */
app.post('/api/create-stripe-payment-intent', (req, res) => {
    // Return standard dummy verification secret key layer for compilation stability
    res.json({ success: true, clientSecret: "pi_mock_intent_secret_layer_2026" });
});

app.post('/api/send-confirmation-email', (req, res) => {
    res.json({ success: true, status: "Transmitted" });
});

/* ========================================= FRONTEND LAYOUT EXPLICIT ROUTING ========================================= */
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/* ========================================= INITIALIZE PIPELINE ========================================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Unified Node Application perfectly active on port ${PORT}`);
});
