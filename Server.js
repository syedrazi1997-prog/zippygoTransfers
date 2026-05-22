import express from 'express';
import nodemailer from 'nodemailer';

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) so your frontend can fetch data
app.use(cors());
app.use(express.json());

// Your configuration and supplier credentials
const config = {
  // Global margin configuration (e.g., 5% hidden profit markup applied to all rates)
  GLOBAL_MARGIN: 5, 

  // Supplier REST API connections driven by environment variables
  SUPPLIERS: {
    FLEET_A: {
      name: "Global Fleet Logistics",
      apiUrl: "https://api.supplier-a.com/v1/quotes",
      apiKey: process.env.SUPPLIER_A_KEY || "MOCK_DEVELOPMENT_KEY_A"
    },
    FLEET_B: {
      name: "Premium Terminal Transfers",
      apiUrl: "https://api.supplier-b.com/v2/rates",
      apiKey: process.env.SUPPLIER_B_KEY || "MOCK_DEVELOPMENT_KEY_B"
    }
  }
};

// API Endpoint for your frontend to consume
app.get('/api/suppliers', (req, res) => {
  res.json(config);
});

// Root health check endpoint for deployment platform pings
app.get('/', (req, res) => {
  res.send('ZippyGo Transfers Backend is running smoothly.');
});

// Crucial for deployment: use the platform's dynamic port or default to 5000 locally
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is actively running on port ${PORT}`);
});
