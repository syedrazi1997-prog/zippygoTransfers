// server.js (Node.js / Express backend)
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, customer } = req.body;

    const response = await axios.post(
      'https://sandbox.cashfree.com/pg/orders', // or https://api.cashfree.com/pg/orders for Prod
      {
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${Date.now()}`,
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
        },
      },
      {
        headers: {
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-secret-key': process.env.CASHFREE_SECRET_KEY,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
        },
      }
    );

    // Return the payment_session_id to the React front-end
    res.json({ payment_session_id: response.data.payment_session_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
