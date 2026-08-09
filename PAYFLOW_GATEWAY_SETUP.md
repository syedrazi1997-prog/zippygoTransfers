# ZippyGo → PayFlow gateway setup

Cashfree has been removed from the ZippyGo checkout flow.

## ZippyGo backend environment

On the Render backend service set:

- `PAYFLOW_API_URL=https://payflow-com.onrender.com/api/v1`
- `PAYFLOW_API_KEY=pf_test_...` for test mode, or `pf_live_...` for production
- `ZIPPYGO_RETURN_URL=https://zippygotransfers.onrender.com/`
- `PORT` is supplied by Render

The PayFlow API key must be a server environment variable. Do not put it in Vite/client code.

## Checkout flow

1. ZippyGo creates the booking in Appwrite.
2. ZippyGo backend calls PayFlow `POST /api/v1/payment-links`.
3. PayFlow validates the API key and creates a one-use hosted payment link.
4. The browser is redirected to `https://payflow-com.onrender.com/checkout/<link_id>`.
5. PayFlow verifies the payment.
6. PayFlow redirects the customer to ZippyGo with `payment_status=success` and the booking reference.
7. ZippyGo restores the pending booking state from local storage and shows the confirmation page.

## Deploy order

1. Run the PayFlow SQL migration.
2. Deploy/restart PayFlow with the server environment variables above.
3. Generate a PayFlow Test API key from Settings → API Keys.
4. Put that `pf_test_...` key into the ZippyGo backend environment.
5. Deploy ZippyGo.
6. Test a small test payment before switching to a live `pf_live_...` key.
