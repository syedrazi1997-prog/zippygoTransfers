require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();

/* ========================================= PRODUCTION SEPARATED CORS MIDDLEWARE ========================================= */
app.use(cors({
    origin: ['https://zippygotransfers.onrender.com', 'http://localhost:10000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

/* ========================================= DYNAMIC CHAT PROCESSING ========================================= */
app.post('/api/gemini/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, reply: "No prompt text provided." });

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, reply: "AI lines are crowded. Check environment keys." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are the official conversational booking agent for Zippygo Transfers. 
            Answer this customer inquiry helpfully, concisely, and professionally regarding airport transfers, luggage options, fleet sizing, or prices: ${message}`,
        });

        res.json({ success: true, reply: response.text });
    } catch (error) {
        console.error("Gemini Error Handler Context:", error);
        res.status(500).json({ success: false, reply: "My system lines are slightly crowded right now. Let me know if you have any questions about booking a transfer!" });
    }
});

/* ========================================= LIVE SEARCH DATA AGGREGATION ========================================= */
app.post('/api/search-transfers', (req, res) => {
    const { tripType, passengers } = req.body;
    const passengerCount = parseInt(passengers) || 2;
    const baseMultiplier = tripType === 'return' ? 1.85 : 1.0;
    
    const options = [
        { id: "ZP-SHUTTLE", vehicle: "Shared Shuttle Transit Service", priceGbp: (14.50 * baseMultiplier * passengerCount).toFixed(2) },
        { id: "ZP-SEDAN", vehicle: "Private Standard Saloon Car", priceGbp: (39.00 * baseMultiplier * (1 + passengerCount * 0.05)).toFixed(2) },
        { id: "ZP-MINIVAN", vehicle: "Private Executive MPV Minivan", priceGbp: (68.00 * baseMultiplier * (1 + passengerCount * 0.08)).toFixed(2) }
    ];
    res.json({ success: true, options });
});

/* ========================================= MOCK PAYMENT FOR COMPILATION ========================================= */
app.post('/api/create-stripe-payment-intent', (req, res) => {
    res.json({ success: true, clientSecret: "pi_mock_intent_secret_layer_2026" });
});

app.post('/api/send-confirmation-email', (req, res) => {
    res.json({ success: true, status: "Queued" });
});

/* ========================================= PRODUCTION SEPARATED MULTI-PAGE ROUTER ========================================= */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'results.html'));
});

/* ========================================= PIPELINE STARTUP ========================================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Architecture executing perfectly on port ${PORT}`);
});
