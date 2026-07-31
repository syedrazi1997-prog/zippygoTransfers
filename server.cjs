const express = require("express");
const cors = require("cors");
const { Cashfree } = require("cashfree-pg");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("ZippyGo Backend Running");
});

// Initialize Cashfree
const cashfree = new Cashfree(
  Cashfree.SANDBOX,
  process.env.CASHFREE_APP_ID.trim(),
  process.env.CASHFREE_SECRET_KEY.trim()
);

app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, customer } = req.body;

    const request = {
      order_id: `order_${Date.now()}`,
      order_amount: Number(amount),
      order_currency: "INR",

      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_name: customer?.name || "Guest User",
        customer_email: customer?.email || "guest@test.com",
        customer_phone: (customer?.phone || "9999999999")
          .replace(/\D/g, "")
          .slice(-10),
      },

      order_meta: {
        return_url:
          "https://zippygotransfers.onrender.com/#/confirmation?order_id={order_id}",
      },
    };

    const response = await cashfree.PGCreateOrder(request);

    return res.json({
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
    });
  } catch (err) {
    console.error("Cashfree Error");
    console.error("Status:", err.response?.status);
    console.error("Body:", err.response?.data);

    return res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message,
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});
