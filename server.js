require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
const app = express();

/* ========================================= CORS CONFIGURATION ========================================= */
app.use(cors());

/* ========================================= STRIPE INITIALIZATION ========================================= */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ========================================= BREVO SMTP CONFIGURATION ========================================= */
const mailTransport = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

/* ========================================= STRIPE WEBHOOK ========================================= */
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ Webhook verified:', event.type);

    /* ========================================= PAYMENT SUCCESS ========================================= */
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata || {};
      const customerEmail = metadata.email;

      if (!customerEmail) {
        console.log('⚠️ No customer email found');
        return res.json({ received: true });
      }

      /* ========================================= SEND CONFIRMATION EMAIL ========================================= */
      const mailOptions = {
        from: '"Zippygo Transfers" <ac4bc1001@smtp-brevo.com>',
        to: customerEmail,
        subject: `Booking Confirmation - ${metadata.bookingId || paymentIntent.id}`,
        html: `
          <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:40px;">
            <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:16px;">
              <div style="text-align:center;margin-bottom:30px;">
                <h1 style="color:#10b981;margin:0;">Zippygo Transfers</h1>
                <p style="color:#64748b;">Airport Transfer Confirmation</p>
              </div>
              <h2 style="color:#111827;">✅ Booking Confirmed</h2>
              <p>Hello <strong>${metadata.firstName || 'Customer'}</strong>,</p>
              <p>Thank you for booking with <strong>Zippygo Transfers</strong>.</p>
              <p>Your airport transfer has been successfully confirmed.</p>
              <div style="background:#f1f5f9;padding:20px;border-radius:12px;margin-top:25px;">
                <h3 style="margin-top:0;color:#111827;">Booking Details</h3>
                <p><strong>Booking Reference:</strong> ${metadata.bookingId || paymentIntent.id}</p>
                <p><strong>Passenger:</strong> ${metadata.firstName || ''} ${metadata.lastName || ''}</p>
                <p><strong>Vehicle:</strong> ${metadata.vehicle || 'Private Transfer'}</p>
                <p><strong>Route:</strong> ${metadata.from || 'Airport'} ➜ ${metadata.to || 'Hotel'}</p>
                <p><strong>Flight Number:</strong> ${metadata.flight || 'N/A'}</p>
                <p><strong>Phone:</strong> ${metadata.phone || 'N/A'}</p>
                <p><strong>Payment ID:</strong> ${paymentIntent.id}</p>
                <h2 style="margin-top:20px;color:#111827;">Total Paid: ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}</h2>
              </div>
              <div style="margin-top:30px;">
                <p>We look forward to serving you.</p>
                <p>Regards,<br><strong>Zippygo Transfers</strong></p>
              </div>
            </div>
          </div>`
      };

      await mailTransport.sendMail(mailOptions);
      console.log('✅ Confirmation email sent');
    }
    res.json({ received: true });
  } catch (err) {
    console.error('❌ Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

/* ========================================= ENABLE JSON BODY PARSER ========================================= */
app.use(express.json());

/* ========================================= CREATE PAYMENT INTENT ========================================= */
app.post('/api/create-stripe-payment-intent', async (req, res) => {
  try {
    const { amount, currency, bookingData } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    /* ========================================= CREATE STRIPE PAYMENT INTENT ========================================= */
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: (currency || 'gbp').toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: bookingData?.id || '',
        firstName: bookingData?.firstName || '',
        lastName: bookingData?.lastName || '',
        email: bookingData?.email || '',
        phone: bookingData?.phone || '',
        vehicle: bookingData?.vehicle || '',
        from: bookingData?.from || '',
        to: bookingData?.to || '',
        flight: bookingData?.flight || ''
      }
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ========================================= HEALTH CHECK ROUTE ========================================= */
app.get('/', (req, res) => {
  // Directly loads your visual index page on the root link!
  res.sendFile(__dirname + '/index.html'); 
});

/* ========================================= START SERVER ========================================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
