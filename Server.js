import express from 'express';
import cors from 'cors'; //
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const app = express();

// Middleware Configurations
app.use(cors());
app.use(express.json());

const GLOBAL_MARGIN = 0.15;

// CONNECT TO MONGOOSE DATABASE
// This uses the MONGO_URI environment variable you configured in Render
// Define the Schema matching your MongoDB document structure
const priceSchema = new mongoose.Schema({
  destinationKey: { type: String, required: true, lowercase: true, trim: true },
  shuttle: { type: String, required: true },
  private: { type: String, required: true }
});

// Create the model. It will look for a collection named "prices" in your database
const Price = mongoose.model('Price', priceSchema);
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Database connected successfully!"))
    .catch((err) => console.error("Database connection error:", err));
} else {
  console.log("Warning: MONGO_URI environment variable is missing.");
}

// Initialize Razorpay with Fallbacks
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SrbMdYkhgSZhGZ',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'Og111ZSrIdsfkSS67ZgQissX'
});

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

// HEALTH CHECK ROUTE (Required for Render to monitor app status)
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

// SEARCH ENDPOINT: Pulls prices dynamically matching destination keys
// Change this line to be async so we can await database results
app.post('/api/search-transfers', async (req, res) => {
  try {
    const { airport, destination, tripType } = req.body;
    if (!destination) {
      return res.status(400).json({ success: false, message: "Missing destination payload." });
    }

   // Combine both inputs into a single string to ensure we catch the keyword wherever the user typed it
    const searchCombined = `${airport || ''} ${destination || ''}`.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
    let baseShuttlePrice = 25.00;
    let basePrivatePrice = 80.00;
    let matchFound = false;

    // Fetch all active price rules from your MongoDB collection
    const priceRecords = await Price.find({});

    // Scan database records against the combined search string
    const matchedRecord = priceRecords.find(record => {
      const cleanKey = record.destinationKey.toLowerCase().trim();
      return searchCombined.includes(cleanKey) || cleanKey.includes(searchCombined);
    });

    if (matchedRecord) {
      baseShuttlePrice = parseFloat(matchedRecord.shuttle) || baseShuttlePrice;
      basePrivatePrice = parseFloat(matchedRecord.private) || basePrivatePrice;
      matchFound = true;
    }
    // ───────────────────────────────────────────────────────────────────

    const marginMultiplier = 1 + GLOBAL_MARGIN;
    const tripMultiplier = tripType === 'return' ? 2 : 1;

    const finalShuttleGbp = (baseShuttlePrice * marginMultiplier * tripMultiplier).toFixed(2);
    const finalPrivateGbp = (basePrivatePrice * marginMultiplier * tripMultiplier).toFixed(2);

    const combinedDeals = [
      {
        id: "ZP-SHUTTLE-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
        vehicle: tripType === 'return' ? 'Shared Shuttle Transit (Return)' : 'Shared Shuttle Transit (One Way)',
        priceGbp: finalShuttleGbp,
        isEstimated: !matchFound
      },
      {
        id: "ZP-PRIVATE-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
        vehicle: tripType === 'return' ? 'Private Executive Micro-Bus (Return)' : 'Private Executive Micro-Bus (One Way)',
        priceGbp: finalPrivateGbp,
        isEstimated: !matchFound
      }
    ];

    return res.status(200).json({
      success: true,
      options: combinedDeals,
      message: matchFound ? "Exact match located from database." : "Using generalized regional transfer rates."
    });

  } catch (error) {
    console.error("Database search system error:", error);
    return res.status(500).json({ success: false, error: "Internal search configurations fault." });
  }
});
// CRITICAL FIX: Dynamically binding port for Render with local fallback to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server executing seamlessly on port ${PORT}`));
