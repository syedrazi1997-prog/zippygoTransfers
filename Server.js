import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) so your frontend can fetch data
app.use(cors());
app.use(express.json());

// 1. CONFIGURATIONS & GLOBAL PARAMETERS
const GLOBAL_MARGIN = 0.15; // 15% clear profit markup layout

// Initialize Razorpay with your active Test Credentials
const razorpay = new Razorpay({
    key_id: 'rzp_test_SrbMdYkhgSZhGZ', 
    key_secret: 'Og111ZSrIdsfkSS67ZgQissX'
});

// Configure Email Delivery System
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_BUSINESS_EMAIL@gmail.com', // Replace with your company/test email 
        pass: 'YOUR_GMAIL_APP_PASSWORD'       // Replace with your secure 16-character Google App Password
    }
});

// 2. MAIN SEARCH ENDPOINT: Returns dynamic catalog options matching the custom destination matrix
app.post('/api/search-transfers', (req, res) => {
    try {
        const { airport, destination, tripType } = req.body;
        const searchDest = destination.toLowerCase();

        // Base prices in GBP (Before profit margins or trip-type multipliers are applied)
        let baseShuttlePrice = 25.00; 
        let basePrivatePrice = 80.00; 

        // Destination-Based Pricing Matrix Filters
        if (searchDest.includes("marriott") || searchDest.includes("hilton")) {
            baseShuttlePrice = 35.00;
            basePrivatePrice = 110.00;
        } else if (searchDest.includes("sharm") || searchDest.includes("london") || searchDest.includes("airport")) {
            baseShuttlePrice = 45.00;
            basePrivatePrice = 140.00;
        } else if (searchDest.includes("beach resort") || searchDest.includes("plaza")) {
            baseShuttlePrice = 18.50;
            basePrivatePrice = 65.00;
        }

        // Apply margins and trip type calculation parameters
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
        res.status(500).json({ success: false, message: "Error acquiring transport configurations." });
    }
});

// 3. SECURE RAZORPAY TRANSACTION ORDER GENERATOR
app.post('/api/create-razorpay-order', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const options = {
            amount: Math.round(parseFloat(amount) * 100), // Convert to subunit pennies
            currency: currency || "GBP",
            receipt: "rcpt_" + Math.random().toString(36).substr(2, 6).toUpperCase()
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order: order });
    } catch (error) {
        console.error("Razorpay order token creation failed:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. AUTOMATED TRANSACTION EMAIL NOTIFIER WEBHOOK
app.post('/api/send-confirmation-email', async (req, res) => {
    try {
        const order = req.body;

        const emailLayout = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px;">
                <h2 style="color: #10b981; margin-bottom: 4px;">Zippygo Booking Confirmed!</h2>
                <p style="font-size: 14px; color: #64748b;">Thank you for booking your airport transit with us. Your payment has been securely processed.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 15px;"><strong>Booking Reference:</strong> ${order.id}</p>
                <p style="font-size: 14px;"><strong>Passenger Name:</strong> ${order.firstName} ${order.lastName}</p>
                <p style="font-size: 14px;"><strong>Vehicle Assigned:</strong> ${order.vehicle}</p>
                <p style="font-size: 14px;"><strong>Route:</strong> ${order.from} &rarr; ${order.to}</p>
                <p style="font-size: 14px;"><strong>Flight Number:</strong> ${order.flight}</p>
                <p style="font-size: 16px; margin-top: 20px;"><strong>Total Paid:</strong> ${order.currency}${order.price}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center;">© 2026 Zippygo. All rights reserved.</p>
            </div>
        `;

        const mailOptions = {
            from: '"Zippygo Transfers" <YOUR_BUSINESS_EMAIL@gmail.com>',
            to: order.email,
            subject: `Booking Confirmed: ${order.id} - Zippygo`,
            html: emailLayout
        };

        await mailTransport.sendMail(mailOptions);
        res.json({ success: true, message: "Confirmation receipt delivered." });
    } catch (error) {
        console.error("Email layout pipeline crashed:", error);
        res.status(500).json({ success: false, message: "Could not distribute transaction alert." });
    }
});

// Root engine structural status ping
app.get('/', (req, res) => {
    res.send('ZippyGo Transfers Backend is running smoothly.');
});

// Configure dynamic listener for platform deployment execution
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is actively running on port ${PORT}`);
});
