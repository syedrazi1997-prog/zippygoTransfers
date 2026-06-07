const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');

const app = express();
app.use(cors());

// 2. STRIPE WEBHOOK ROUTE (Placed BEFORE express.json())
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

  // Handle successful payment events
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log(`💰 Payment succeeded for intent: ${paymentIntent.id}`);
    
    try {
      const customerEmail = paymentIntent.receipt_email || paymentIntent.billing_details?.email;
      if (customerEmail) {
        console.log(`📧 Dispatching confirmation email to: ${customerEmail}`);
        // Your node mailer trigger logic will execute here automatically 
      }
    } catch (mailErr) {
      console.error("Failed to execute email dispatch during webhook:", mailErr);
    }
  }

  res.json({ received: true });
});

// 3. GLOBAL JSON MIDDLEWARE (Handles all routes below this point)
app.use(express.json());

const GLOBAL_MARGIN = 0.15;

// Initialize Stripe with Secret Key
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

// DYNAMIC SEARCH ROUTE - GENERATES RANDOM PRICES instead of querying MongoDB
app.post('/api/get-transfer-price', async (req, res) => {
  try {
    const { destination } = req.body;
    if (!destination) {
      return res.status(400).json({ error: "Destination parameter is missing." });
    }

    // Generate random mock prices for testing
    // Math.random() * (max - min) + min
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
    const { calculatedSubunitAmount, currency, customerEmail } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculatedSubunitAmount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: customerEmail || null
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

  const mailOptions = {
    from: '"Zippygo Transfers" <confirmations@zippygo.com>',
    to: email,
    subject: `Booking Confirmed! Ref: ${id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px;">
        <h2 style="color: #4CAF50; text-align: center;">Booking Confirmed!</h2>
        <p>Dear ${firstName} ${lastName},</p>
        <p>Your transfer booking has been successfully confirmed and processed.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <h3>Transfer Details:</h3>
        <p><strong>Booking Reference:</strong> ${id}</p>
        <p><strong>Vehicle Type:</strong> ${vehicle}</p>
        <p><strong>From:</strong> ${from}</p>
        <p><strong>To:</strong> ${to}</p>
        <p><strong>Total Amount Paid:</strong> ${currency}${price}</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #777; text-align: center;">Thank you for choosing Zippygo Transfers.</p>
      </div>
    `
  };

  try {
    await mailTransport.sendMail(mailOptions);
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
