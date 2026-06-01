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

// Initialize Stripe with your test key directly as a fallback
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'mk_1TYoQu4xSQ4u2uQiGsS3I4ee');

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

// SEARCH ENDPOINT
app.post('/api/search-transfers', async (req, res) => {
  try {
    const { airport, destination, tripType } = req.body;
    const searchCombined = `${airport || ''} ${destination || ''}`.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
    let baseShuttlePrice = Math.floor(Math.random() * (45 - 25 + 1)) + 25;
    let basePrivatePrice = Math.floor(Math.random() * (110 - 70 + 1)) + 70;
    let matchFound = false;

    let priceRecords = await Price.find({});
    if (priceRecords.length > 0) {
      const matchedRecord = priceRecords.find(record => {
        return searchCombined.includes(record.destinationKey.toLowerCase().trim());
      });
      if (matchedRecord) {
        baseShuttlePrice = parseFloat(matchedRecord.shuttle) || baseShuttlePrice;
        basePrivatePrice = parseFloat(matchedRecord.private) || basePrivatePrice;
        matchFound = true;
      }
    }

    const marginMultiplier = 1 + GLOBAL_MARGIN;
    const tripMultiplier = tripType === 'return' ? 2 : 1;

    const combinedDeals = [
      {
        id: "ZP-SHUTTLE-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
        vehicle: tripType === 'return' ? 'Shared Shuttle Transit (Return)' : 'Shared Shuttle Transit (One Way)',
        priceGbp: (baseShuttlePrice * marginMultiplier * tripMultiplier).toFixed(2)
      },
      {
        id: "ZP-PRIVATE-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
        vehicle: tripType === 'return' ? 'Private Executive Micro-Bus (Return)' : 'Private Executive Micro-Bus (One Way)',
        priceGbp: (basePrivatePrice * marginMultiplier * tripMultiplier).toFixed(2)
      }
    ];

    return res.status(200).json({ success: true, options: combinedDeals });
  } catch (error) {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server executing seamlessly on port ${PORT}`));
