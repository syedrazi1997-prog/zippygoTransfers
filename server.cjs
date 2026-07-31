const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health Check Route (Required for Render & status monitoring)
app.get('/', (req, res) => {
  res.status(200).send('ZippyGo Backend API is active and running!');
});

// Cashfree Order Creation API Route
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, customer } = req.body;

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    // Defaults to Sandbox if env URL is not set
    const baseUrl = process.env.CASHFREE_ENV || 'https://sandbox.cashfree.com/pg';

    if (!appId || !secretKey) {
      console.error('Missing Cashfree Environment Keys!');
      return res.status(500).json({
        error: 'Cashfree API keys are missing in backend environment variables.',
      });
    }

    // Clean phone number to ensure valid 10-digit format for Cashfree
    const cleanPhone = (customer?.phone || '9999999999')
      .replace(/[^0-9]/g, '')
      .slice(-10);

    const payload = {
      order_amount: Number(amount) || 3069,
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_name: customer?.name || 'Guest User',
        customer_email: customer?.email || 'customer@example.com',
        customer_phone: cleanPhone || '9999999999',
      },
      order_meta: {
        return_url: 'https://zippygotransfers.onrender.com/#/confirmation?order_id={order_id}',
      },
    };

    const response = await axios.post(`${baseUrl}/orders`, payload, {
      headers: {
        'x-client-id': appId,
        'x-secret-key': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
    });

    return res.status(200).json({
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
    });
  } catch (error) {
    console.error('Cashfree API Error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to initiate payment order.',
    });
  }
});

// Bind to process.env.PORT and host '0.0.0.0' (Mandatory for Render)
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
