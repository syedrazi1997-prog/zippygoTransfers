require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const paymentRoutes = require('./payments');

const app = express();

/* ========================================= MIDDLEWARE ========================================= */

app.use(cors());

/* Stripe webhook requires raw body */
app.use('/api/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

/* ========================================= STATIC FRONTEND ========================================= */

app.use(express.static(path.join(__dirname, 'public')));

/* ========================================= API ROUTES ========================================= */

app.use('/api', paymentRoutes);

/* ========================================= FRONTEND ROUTE ========================================= */

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ========================================= HEALTH CHECK ========================================= */

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

/* ========================================= SERVER ========================================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
