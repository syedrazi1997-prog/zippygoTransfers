const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.post("/api/create-order", async (req, res) => {
  try {
    const appId = process.env.CASHFREE_APP_ID?.trim();
    const secret = process.env.CASHFREE_SECRET_KEY?.trim();
    const baseUrl =
      process.env.CASHFREE_ENV?.trim() ||
      "https://sandbox.cashfree.com/pg";

    console.log("Base URL:", baseUrl);
    console.log("App ID:", appId);
    console.log("Secret Exists:", !!secret);

    const payload = {
      order_amount: Number(req.body.amount),
      order_currency: "INR",
      customer_details: {
        customer_id: "cust_" + Date.now(),
        customer_name: req.body.customer?.name || "Guest",
        customer_email:
          req.body.customer?.email || "guest@test.com",
        customer_phone:
          (req.body.customer?.phone || "9999999999")
            .replace(/\D/g, "")
            .slice(-10),
      },
      order_meta: {
        return_url:
          "https://zippygotransfers.onrender.com/#/confirmation?order_id={order_id}",
      },
    };

    console.log(payload);

    const response = await axios.post(
      `${baseUrl}/orders`,
      payload,
      {
        headers: {
          "x-client-id": appId,
          "x-secret-key": secret,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);

    res.json(response.data);
  } catch (err) {
    console.log("STATUS:", err.response?.status);
    console.log("DATA:", err.response?.data);
    console.log("MESSAGE:", err.message);

    res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message,
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server started on", PORT);
});
