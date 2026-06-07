const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');

const app = express();
app.use(cors());

// Initialize Stripe instance with Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51TYoQt4xSQ4u2uQiZR8QWeq4UdZvoBffaGvsJnvxUwvrjnnyglxRBzpH5vmwRxg8MlwwP9svz2isMxd3ZIJIbyww00UziEIXX0');

// REGISTERED BREVO MAIL RELAY CONFIGURATION
const mailTransport = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

// Helper Function for Reusable Email Logic
async function sendBookingEmail(email, details) {
  const mailOptions = {
    from: '"Zippygo Transfers" <confirmations@zippygo.com>',
    to: email,
    subject: `Booking Confirmed! Ref: ${details.id || 'N/A'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px;">
        <h2 style="color: #4CAF50; text-align: center;">Booking Confirmed!</h2>
        <p>Dear Customer,</p>
        <p>Your transfer booking has been successfully confirmed and processed.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <h3>Transfer Details:</h3>
        <p><strong>Booking Reference:</strong> ${details.id || 'Processed'}</p>
        <p><strong>Vehicle Type:</strong> ${details.vehicle || 'Standard Transfer'}</p>
        <p><strong>Amount Paid:</strong> ${(details.amount / 100).toFixed(2)} ${details.currency?.toUpperCase()}</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #777; text-align: center;">Thank you for choosing Zippygo Transfers.</p>
      </div>
    `
  };
  await mailTransport.sendMail(mailOptions);
}

// 1. STRIPE WEBHOOK ROUTE (Must remain raw for signature validation)
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; 

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment events automatically
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log(`💰 Payment succeeded for intent: ${paymentIntent.id}`);
    
    try {
      const customerEmail = paymentIntent.receipt_email || paymentIntent.billing_details?.email;
      if (customerEmail) {
        console.log(`📧 Dispatching confirmation email to: ${customerEmail}`);
        // Automated trigger logic executes here
        await sendBookingEmail(customerEmail, {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          vehicle: paymentIntent.metadata?.vehicle || 'Confirmed Transfer'
        });
      }
    } catch (mailErr) {
      console.error("Failed to execute email dispatch during webhook:", mailErr);
    }
  }

  res.json({ received: true });
});

// 2. GLOBAL JSON MIDDLEWARE (Applied ONLY to routes below)
app.use(express.json());

// DYNAMIC SEARCH ROUTE
app.post('/api/get-transfer-price', async (req, res) => {
  try {
    const { destination } = req.body;
    if (!destination) {
      return res.status(400).json({ error: "Destination parameter is missing." });
    }

    const randomShuttlePrice = (Math.random() * (45 - 15) + 15).toFixed(2);
    const randomPrivatePrice = (Math.random() * (120 - 60) + 60).toFixed(2);

    console.log(`Generated random prices for ${destination}: Shuttle = £${randomShuttlePrice}, Private = £${randomPrivatePrice}`);

    res.json({
      shuttle: randomShuttlePrice,
      private: randomPrivatePrice
    });
  } catch (error) {
    console.error("Price inquiry engine breakdown:", error);
    res.status(500).json({ error: "Internal service disruption." });
  }
});

// CREATE STRIPE PAYMENT INTENT ROUTE
app.post('/api/create-stripe-payment-intent', async (req, res) => {
  try {
    const { calculatedSubunitAmount, currency, customerEmail, vehicle } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculatedSubunitAmount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: customerEmail || null,
      metadata: { vehicle: vehicle || 'Standard' } // Passed to webhook later
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe engine failed to initialize intent:", error);
    res.status(500).json({ error: error.message });
  }
});

// MANUAL EMAIL ROUTE TRACE OVERRIDE
app.post('/api/send-confirmation-email', async (req, res) => {
  const { id, email, firstName, lastName, vehicle, from, to, currency, price } = req.body;

  try {
    await sendBookingEmail(email, {
      id,
      amount: price * 100, // Convert to subunit for helper function
      currency,
      vehicle: `${vehicle} (From: ${from} To: ${to})`
    });
    res.status(200).json({ success: true, message: "Confirmation email dispatched safely." });
  } catch (error) {
    console.error("Nodemailer service failed to deliver message relay:", error);
    res.status(500).json({ error: "Failed to dispatch email confirmation." });
  }
});

// START THE SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server executing live operations on network interface port: ${PORT}`);
});
