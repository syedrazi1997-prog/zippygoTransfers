const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51TYoQt4xSQ4u2uQiZR8QWeq4UdZvoBffaGvsJnvxUwvrjnnyglxRBzpH5vmwRxg8MlwwP9svz2isMxd3ZIJIbyww00UziEIXX0');

// 2. Configure Brevo Mail Transport
const mailTransport = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS
    }
});

// 3. Email Helper Function
async function sendBookingEmail(email, details) {
    const mailOptions = {
        from: '"Zippygo Transfers" <confirmations@zippygo.com>',
        to: email,
        subject: `Booking Confirmed! Ref: ${details.id || 'N/A'}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
                <h2 style="color: #4CAF50;">Booking Confirmed!</h2>
                <p>Your transfer booking has been successfully processed.</p>
                <p><strong>Reference:</strong> ${details.id}</p>
                <p><strong>Vehicle:</strong> ${details.vehicle}</p>
                <p><strong>Amount Paid:</strong> ${details.currency?.toUpperCase()} ${(details.amount / 100).toFixed(2)}</p>
            </div>`
    };
    await mailTransport.sendMail(mailOptions);
}

// 4. Create Payment Intent
app.post('/api/create-stripe-payment-intent', async (req, res) => {
    const { amount, currency } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: "Missing amount" });

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency || 'gbp',
            automatic_payment_methods: { enabled: true },
        });
        res.json({ success: true, clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5. Stripe Webhook (Handles Emails)
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    console.log("🔍 Webhook request received!");
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        if (event.type === 'payment_intent.succeeded') {
            const pi = event.data.object;
            await sendBookingEmail(pi.receipt_email || pi.billing_details?.email, {
                id: pi.id,
                amount: pi.amount,
                currency: pi.currency,
                vehicle: pi.metadata?.vehicle || 'Private Transfer'
            });
        }
        res.json({ received: true });
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Backend server running on port ${port}`));
