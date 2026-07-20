const crypto = require('crypto');

module.exports = async function (context) {
    try {
        const payload = JSON.parse(context.req.body?.data || '{}');

        context.log("Incoming Payload:");
        context.log(JSON.stringify(payload));

        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;

        if (!appId || !secretKey) {
            context.error("Cashfree credentials are missing.");

            return context.res.json({
                success: false,
                error: "Cashfree credentials are missing."
            }, 500);
        }

        const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg";

        switch (payload.action) {

            case "create_order": {

                const amount = Number(payload.amount);

                if (isNaN(amount) || amount <= 0) {
                    return context.res.json({
                        success: false,
                        error: "Invalid order amount."
                    }, 400);
                }

                const orderId = `${payload.bookingRef}-${Date.now()}`;

                context.log(`Creating Cashfree Order: ${orderId}`);

                const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
                    method: "POST",
                    headers: {
                        "x-client-id": appId,
                        "x-client-secret": secretKey,
                        "x-api-version": "2023-08-01",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        order_id: orderId,
                        order_amount: amount,
                        order_currency: payload.currency || "INR",

                        customer_details: {
                            customer_id: payload.bookingId || crypto.randomUUID(),
                            customer_name: payload.customerName || "Guest User",
                            customer_email: payload.customerEmail || "guest@example.com",
                            customer_phone: payload.customerPhone || "9999999999"
                        },

                        order_meta: {
                            return_url:
                                `https://zippygotransfers.onrender.com/booking-success?order_id={order_id}`
                        }
                    })
                });

                const orderData = await response.json();

                context.log("Cashfree Response:");
                context.log(JSON.stringify(orderData));

                if (!response.ok) {

                    context.error(JSON.stringify(orderData));

                    return context.res.json({
                        success: false,
                        error: orderData.message || "Cashfree order creation failed.",
                        response: orderData
                    }, response.status);
                }

                if (!orderData.payment_session_id) {

                    context.error("payment_session_id missing.");

                    return context.res.json({
                        success: false,
                        error: "Cashfree did not return payment_session_id.",
                        response: orderData
                    }, 500);
                }

                return context.res.json({
                    success: true,
                    orderId: orderData.order_id,
                    paymentSessionId: orderData.payment_session_id,
                    amount: orderData.order_amount,
                    currency: orderData.order_currency
                });
            }

            case "verify_payment": {

                context.log("Payment verification requested.");

                return context.res.json({
                    success: true
                });
            }

            default:

                return context.res.json({
                    success: false,
                    error: "Invalid action."
                }, 400);
        }

    } catch (err) {

        context.error(err.stack);

        return context.res.json({
            success: false,
            error: err.message
        }, 500);
    }
};
