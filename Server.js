import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import fs from 'fs';
import path from 'path';

const app = express();
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
    secure: false, // true for port 465, false for other ports
    auth: {
        user: 'ac4bc1001@smtp-brevo.com', 
        pass: 'YOUR_BREVO_SMTP_PASSWORD' // 🌟 PASTE YOUR MASTER BREVO SECRET SMTP PASSWORD STRING HERE
    }
});

// SEARCH ENDPOINT: Pulls prices dynamically matching destination keys
app.post('/api/search-transfers', (req, res) => {
    try {
        const { airport, destination, tripType } = req.body;
        const searchDest = destination.toLowerCase();
        
        let baseShuttlePrice = 25.00; 
        let basePrivatePrice = 80.00; 

        const filePath = path.resolve('./prices.json');
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath);
            const priceMatrix = JSON.parse(rawData);
            const matchedKey = Object.keys(priceMatrix).find(key => searchDest.includes(key));
            if (matchedKey) {
                baseShuttlePrice = priceMatrix[matchedKey].shuttle;
                basePrivatePrice = priceMatrix[matchedKey].private;
            }
        }

        const marginMultiplier = 1 + GLOBAL_MARGIN;
        const tripMultiplier = tripType === 'return' ? 2 : 1;
        const finalShuttleGbp = (baseShuttlePrice * marginMultiplier * tripMultiplier).toFixed(2);
        const finalPrivateGbp = (basePrivatePrice * marginMultiplier * tripMultiplier).toFixed(2);

        const combinedDeals = [
            {
                id: "GT-SHUTTLE-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
                vehicle: tripType === 'return' ? 'Shared Shuttle Transit (Return)' : 'Shared Shuttle Transit (One Way)',
                priceGbp: finalShuttleGbp,
                type: "Shuttle Service",
                badgeColor: "bg-blue-100",
                textColor: "text-blue-800",
                description: "⏱️ Centralized terminal drops • Free cancellations • Luggage tracking included."
            },
            {
                id: "GT-PRIVATE-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
                vehicle: tripType === 'return' ? 'Premium Private Sedan (Return)' : 'Premium Private Sedan (One Way)',
                priceGbp: finalPrivateGbp,
                type: "Private Sedan",
                badgeColor: "bg-emerald-100",
                textColor: "text-emerald-800",
                description: "⏱️ Meet & Greet at arrivals gate • Flight tracking synchronization • Complimentary bottled water."
            }
        ];
        res.json({ success: true, deals: combinedDeals });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error acquiring configurations." });
    }
});

// SECURE RAZORPAY TRANSACTION SESSION INITIATOR
app.post('/api/create-razorpay-order', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const options = {
            amount: Math.round(parseFloat(amount) * 100),
            currency: currency || "GBP",
            receipt: "rcpt_" + Math.random().toString(36).substr(2, 6).toUpperCase()
        };
        const order = await razorpay.orders.create(options);
        res.json({ success: true, order: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// AUTOMATED EMAIL RECEIPT PROCESSING SYSTEM
app.post('/api/send-confirmation-email', async (req, res) => {
    try {
        const order = req.body;
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
            from: '"Zippygo Transfers" <ac4bc1001@smtp-brevo.com>', // Must be authorized sender inside your Brevo Dashboard settings
            to: order.email,
            subject: `Booking Confirmed: ${order.id} - Zippygo`,
            html: emailLayout
        };

        await mailTransport.sendMail(mailOptions);
        res.json({ success: true, message: "Receipt sent successfully!" });
    } catch (error) {
        console.error("Mail system failure logs:", error);
        res.status(500).json({ success: false, message: "Email transmission failed." });
    }
});

// Root check endpoint
app.get('/', (req, res) => {
    res.send('ZippyGo Production Backend API Engine.');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server actively running on port ${PORT}`);
});
