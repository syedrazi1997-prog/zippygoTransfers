const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
const mongoose = require('mongoose');

const app = express();

// Middleware Configurations
app.use(cors());
app.use(express.json());

const GLOBAL_MARGIN = 0.15;

// Define the Schema matching your MongoDB document structure
const priceSchema = new mongoose.Schema({
  destinationKey: { type: String, required: true, lowercase: true, trim: true },
  shuttle: { type: String, required: true },
  private: { type: String, required: true }
});

const Price = mongoose.model('Price', priceSchema, 'prices');

// CONNECT TO MONGOOSE DATABASE
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Database connected successfully!"))
    .catch((err) => console.error("Database connection error:", err));
}

// Initialize Stripe with your valid sk_test Secret Key fallback
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51TYoQt4xSQ4u2uQiZR8QWeq4UdZvoBffaGvsJnvxUwvrjnnyglxRBzpH5vmwRxg8MlwwP9svz2isMxd3ZIJIbyww00UziEIXX0');

// REGISTERED BREVO MAIL RELAY CONFIGURATION
const mailTransport = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER || 'ac4bc1001@smtp-brevo.com',
    pass: process.env.BREVO_PASS || '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'
  }
});

// HEALTH CHECK ROUTE
app.get('/', (req, res) => {
  res.status(200).send("Zippygo Backend Running Perfectly.");
});

// AUTOMATED EMAIL RECEIPT PROCESSING SYSTEM
app.post('/api/send-confirmation-email', async (req, res) => {
  try {
    const order = req.body;
    if (!order.email) {
      return res.status(400).json({ success: false, message: "Missing recipient email address." });
    }

    const emailLayout = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px;">
        <h2 style="color: #10b981; margin-bottom: 4px;">Zippygo Booking Confirmed!</h2>
        <p style="font-size: 14px; color: #64748b;">Thank you for your reservation. Your transfer is booked.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p><strong>Booking Reference:</strong> ${order.id}</p>
        <p><strong>Passenger Name:</strong> ${order.firstName} ${order.lastName}</p>
        <p><strong>Vehicle Type:</strong> ${order.vehicle}</p>
        <p><strong>Route Details:</strong> ${order.from} &rarr; ${order.to}</p>
        <p><strong>Total Price:</strong> ${order.currency}${order.price}</p>
      </div>
    `;

    const mailOptions = {
      from: '"Zippygo Transfers" <bookings@zippygotransfers.com>',
      to: order.email,
      subject: `Booking Confirmed: ${order.id} - Zippygo`,
      html: emailLayout
    };

    await mailTransport.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "Receipt sent successfully!" });
  } catch (error) {
    console.error("Mail system failure logs:", error);
    return res.status(500).json({ success: false, message: "Email transmission failed.", error: error.message });
  }
});

// SEARCH ENDPOINT: Dynamically maps passenger count to customized randomized pricing matrices
app.post('/api/search-transfers', async (req, res) => {
  try {
    const { airport, destination, tripType, passengers } = req.body;
    const paxCount = parseInt(passengers) || 2;
    const perPassengerShuttleBase = Math.floor(Math.random() * (18 - 12 + 1)) + 12;
    const perPassengerPrivateBase = Math.floor(Math.random() * (35 - 25 + 1)) + 25;

    let totalShuttlePrice = perPassengerShuttleBase * paxCount;
    let totalPrivatePrice = perPassengerPrivateBase * paxCount;

    const marginMultiplier = 1 + GLOBAL_MARGIN;
    const tripMultiplier = tripType === 'return' ? 2 : 1;

    const finalShuttleGbp = (totalShuttlePrice * marginMultiplier * tripMultiplier).toFixed(2);
    const finalPrivateGbp = (totalPrivatePrice * marginMultiplier * tripMultiplier).toFixed(2);

    const dynamicDeals = [
      {
        id: "ZP-SHUTTLE-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
        vehicle: tripType === 'return' ? `Shared Shuttle Transit — for ${paxCount} Passengers (Return)` : `Shared Shuttle Transit — for ${paxCount} Passengers (One Way)`,
        priceGbp: finalShuttleGbp
      },
      {
        id: "ZP-PRIVATE-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
        vehicle: tripType === 'return' ? `Private Executive Micro-Bus — for ${paxCount} Passengers (Return)` : `Private Executive Micro-Bus — for ${paxCount} Passengers (One Way)`,
        priceGbp: finalPrivateGbp
      }
    ];

    return res.status(200).json({
      success: true,
      options: dynamicDeals,
      message: "Dynamic transfer rates calculated for passenger volumes."
    });
  } catch (error) {
    console.error("Subsystem execution error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// STRIPE INTENT ROUTE
app.post('/api/create-stripe-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const calculatedSubunitAmount = Math.round(parseFloat(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculatedSubunitAmount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true }
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error("Stripe Token Failure:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// CONVERSATIONAL AI LIVE SUPPORT CHAT ENGINE ROUTER (FREE POWERFUL CORE)
app.post('/api/live-support-chat', async (req, res) => {
  try {
    const { message, bookingContext } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Empty message tokens." });
    }

    const systemInstruction = `You are the official Zippygo Live Chat AI Support Agent. Be polite, concise, professional, and helpful. Assist the customer with airport transit rules, booking modifications, luggage options, and pricing questions. If the customer asks about an active booking, refer to this local data context if present: ${JSON.stringify(bookingContext || {})}. Keep answers under 3 sentences.`;

    const targetApiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6JLfX1to_yGyMBg8iq_U_GRXW_-SlP4cUd46kncH3aZoQ";

    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${targetApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nCustomer Inquiry: ${message}` }] }]
      })
    });

    const aiData = await aiResponse.json();
    let generatedReplyText = "I am processing your transfer data right now. Let me know if you have any questions about luggage bounds!";

    if (aiData.candidates && aiData.candidates[0].content.parts[0].text) {
      generatedReplyText = aiData.candidates[0].content.parts[0].text.trim();
    }

    return res.status(200).json({ success: true, reply: generatedReplyText });
  } catch (error) {
    console.error("AI Node Error:", error);
    return res.status(200).json({ success: true, reply: "Our booking systems are verified. How many travelers are joining your transit leg?" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server executing seamlessly on port ${PORT}`));
