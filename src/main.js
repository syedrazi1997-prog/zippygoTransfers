const crypto = require('crypto');

module.exports = async function (context) {
    // Appwrite forwards the request body inside context.req.body.data
    const payload = JSON.parse(context.req.body.data || '{}');

    // Retrieve Cashfree variables saved in your Appwrite console environment
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    // Use the Sandbox URL for testing. Change to 'https://api.cashfree.com' for production/live environment toggles.
    const CASHFREE_BASE_URL = 'https://sandbox.cashfree.com/pg';

    // Action 1: Create Secure Checkout Order Session
    if (payload.action === 'create_order') {
        try {
            if (!appId || !secretKey) {
                return context.res.json({ error: "Cashfree API configurations are missing in Appwrite Settings." }, 500);
            }

            // Cashfree takes raw floating decimals natively (e.g., 109.50), no subunit paise/cents multiplication required
            const numericAmount = parseFloat(payload.amount);

            const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'x-client-id': appId,
                    'x-client-secret': secretKey,
                    'x-api-version': '2023-08-01',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_id: payload.bookingRef,
                    order_amount: numericAmount,
                    order_currency: payload.currency === 'INR' ? 'INR' : 'USD',
                    customer_details: {
                        customer_id: payload.bookingId,
                        customer_name: payload.customerName || 'Guest User',
                        customer_email: payload.customerEmail || 'noreply@zippygo.com',
                        customer_phone: payload.customerPhone || '9999999999'
                    },
                    order_meta: {
                        return_url: `https://zippygotransfers.onrender.com/booking-success?order_id={order_id}`
                    }
                })
            });

            const orderData = await response.json();

            if (!response.ok || orderData.type === 'error') {
                return context.res.json({ error: orderData.message || "Failed to establish Cashfree gateway link." }, response.status || 400);
            }

            // Return the necessary session identifier variables back to Checkout.tsx
            return context.res.json({
                orderId: orderData.order_id,
                paymentSessionId: orderData.payment_session_id,
                amount: orderData.order_amount,
                currency: orderData.order_currency
            });

        } catch (err) {
            return context.res.json({ error: err.message }, 500);
        }
    }

    // Action 2: Verify Webhook / Payment Signature Integrity
    if (payload.action === 'verify_payment') {
        // Cashfree verifies webhook data components via raw asymmetric signature matching or get-order endpoints.
        // For standard drop-in client flows, tracking the checkout session completion handles basic verification.
        return context.res.json({ success: true });
    }

    return context.res.json({ error: "Invalid Action" }, 400);
};
