const Razorpay = require('razorpay');
const crypto = require('crypto');

module.exports = async function (context) {
    const payload = JSON.parse(context.req.body.data || '{}');
    
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    if (payload.action === 'create_order') {
        try {
            const order = await razorpay.orders.create({
                amount: Math.round(payload.amount * 83.5 * 100), // Convert USD to INR Paise
                currency: 'INR',
                receipt: payload.bookingRef,
            });

            return context.res.json({
                keyId: process.env.RAZORPAY_KEY_ID,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency
            });
        } catch (err) {
            return context.res.json({ error: err.message }, 500);
        }
    }

    if (payload.action === 'verify_payment') {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload;
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
        const digest = shasum.digest('hex');

        if (digest === razorpaySignature) {
            return context.res.json({ success: true });
        } else {
            return context.res.json({ error: "Invalid signature verification" }, 400);
        }
    }

    return context.res.json({ error: "Invalid Action" }, 400);
};
