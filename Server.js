import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import fs from 'fs';
import path from 'path';

const app = express();

// Middleware Configurations
app.use(cors());
app.use(express.json());

const GLOBAL_MARGIN = 0.15;

// Initialize Razorpay with your credentials
const razorpay = new Razorpay({
  key_id: 'rzp_test_SrbMdYkhgSZhGZ', 
  key_secret: 'Og111ZSrIdsfkSS67ZgQissX' 
});

// 🔑 REGISTERED BREVO MAIL RELAY CONFIGURATION
const mailTransport = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, 
  auth: {
    user: 'ac4bc1001@smtp-brevo.com',
    pass: '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'
  }
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
      from: '"Zippygo Transfers" <bookings@zippygotransfers.com>', // Must be your verified Brevo sender domain
      to: order.email,
      subject: `Booking Confirmed: ${order.id} - Zippygo`,
      html: emailLayout
    };

    await mailTransport.sendMail(mailOptions);
    
    return res.status(200).json({ 
      success: true, 
      message: "Receipt sent successfully!" 
    });

  } catch (error) {
    console.error("Mail system failure logs:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Email transmission failed.", 
      error: error.message 
    });
  }
});

// SEARCH ENDPOINT: Pulls prices dynamically matching destination keys
app.post('/api/search-transfers', (req, res) => {
  try {
    const { airport, destination, tripType } = req.body; 
    if (!destination) {
      return res.status(400).json({ success: false, message: "Missing destination payload." });
    } 

    // Clean up input for seamless comparison (remove spaces, punctuation, lowercase it)
    const searchDest = destination.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    
    // Default fallback base rates if no exact match is found
    let baseShuttlePrice = 25.00;
    let basePrivatePrice = 80.00; 
    let matchFound = false;

    const filePath = path.resolve('prices.json'); 
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf8');
      const priceMatrix = JSON.parse(rawData);
      
      // Smart fuzzy matching: Check if any part of the keys or destinations intersect
      const matchedKey = Object.keys(priceMatrix).find(key => {
        const cleanKey = key.toLowerCase().trim();
        return searchDest.includes(cleanKey) || cleanKey.includes(searchDest);
      });
      
      if (matchedKey) {
        baseShuttlePrice = parseFloat(priceMatrix[matchedKey].shuttle) || baseShuttlePrice;
        basePrivatePrice = parseFloat(priceMatrix[matchedKey].private) || basePrivatePrice;
        matchFound = true;
        console.log(`Matched key found: ${matchedKey}`);
      }
    } 

    const marginMultiplier = 1 + GLOBAL_MARGIN;
    const tripMultiplier = tripType === 'return' ? 2 : 1;
    const finalShuttleGbp = (baseShuttlePrice * marginMultiplier * tripMultiplier).toFixed(2);
    const finalPrivateGbp = (basePrivatePrice * marginMultiplier * tripMultiplier).toFixed(2);

    // Always compile deals, using standard fallback rates if matching failed
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

    // CRITICAL: Always respond with success: true and the options array
    return res.status(200).json({ 
      success: true, 
      options: combinedDeals,
      message: matchFound ? "Exact match located." : "Using generalized regional transfer rates."
    });

  } catch (error) {
    console.error("Search system error:", error);
    return res.status(500).json({ success: false, error: "Internal search configurations fault." });
  }
});

// App listener configured strictly to run on port 3000
const PORT = 10000;
app.listen(PORT, () => console.log(`Server executing seamlessly on port ${PORT}`));
