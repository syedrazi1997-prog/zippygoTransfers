require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai'); // Official Google SDK

const app = express();

/* ========================================= MIDDLEWARE ========================================= */
app.use(cors());

/* Stripe webhook requires raw body - keep it untouched */
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

/* Serve static frontend assets right from the root directory */
app.use(express.static(__dirname));

/* ========================================= GEMINI AI ROUTE ========================================= */
app.post('/api/gemini/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, reply: "No message text provided." });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("Missing GEMINI_API_KEY in Environment Settings.");
            return res.status(500).json({ success: false, reply: "AI Configuration error. Check dashboard tokens." });
        }

        // Initialize the official SDK client
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are the official conversational booking agent for Zippygo Transfers. 
            Answer this customer inquiry helpfully, concisely, and professionally regarding airport transfers, taxi rules, and travel accommodations: ${message}`,
        });

        res.json({ success: true, reply: response.text });
    } catch (error) {
        console.error("Gemini System Error:", error);
        res.status(500).json({ success: false, reply: "My system lines are slightly crowded right now. Let me know if you have any questions about booking a transfer!" });
    }
});

/* ========================================= FRONTEND ROUTE ========================================= */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/* ========================================= SERVER START ========================================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server running perfectly on port ${PORT}`);
});
