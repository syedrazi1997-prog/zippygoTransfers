```js
const express = require('express');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');

const router = express.Router();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/* ========================================= BREVO MAIL ========================================= */

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

/* ========================================= SEARCH TRANSFERS ========================================= */

router.post('/search-transfers', async (req, res) => {
  try {
    const { tripType, passengers } = req.body;

    const passengerCount = parseInt(passengers || 2);

    const multiplier = tripType === 'return' ? 1.85 : 1;

    const options = [
      {
        vehicle: 'Shared Shuttle',
        priceGbp: (
          (14 + Math.random() * 5) *
          multiplier *
          passengerCount
        ).toFixed(2)
      },
      {
        vehicle: 'Private Saloon',
        priceGbp: (
          (38 + Math.random() * 12) *
          multiplier
        ).toFixed(2)
      },
      {
        vehicle: 'Executive Minivan',
        priceGbp: (
          (65 + Math.random() * 20) *
          multiplier
        ).toFixed(2)
      }
    ];

    return res.json({
      success: true,
      options
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* ========================================= CREATE PAYMENT INTENT ========================================= */

router.post('/create-stripe-payment-intent', async (req, res) => {
  try {
    const { amount, currency, bookingData } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),

      currency: currency.toLowerCase(),

      automatic_payment_methods: {
        enabled: true
      },

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

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
```
