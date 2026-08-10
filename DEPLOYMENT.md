# ZippyGo + PayFlow deployment

## 1. ZippyGo
Set on the ZippyGo backend Render service:

- `PAYFLOW_API_URL=https://payflow-com.onrender.com/api/v1`
- `PAYFLOW_API_KEY=pf_test_...` (or `pf_live_...`)
- `PAYFLOW_PUBLIC_URL=https://payflow-com.onrender.com`
- `ZIPPYGO_RETURN_URL=https://YOUR-ZIPPYGO-FRONTEND-DOMAIN/`

Set on the ZippyGo frontend:

- `VITE_BACKEND_URL=https://YOUR-ZIPPYGO-BACKEND-DOMAIN`
- `VITE_PAYFLOW_PUBLIC_URL=https://payflow-com.onrender.com`

Never put `PAYFLOW_API_KEY` in a `VITE_` variable.

## 2. PayFlow
The PayFlow Render service must have:

- `SUPABASE_URL=https://lxbvechmapkaedahbwlv.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY`
- `PAYFLOW_PUBLIC_URL=https://payflow-com.onrender.com`

Run the SQL migrations in `PayFlow/supabase/migrations/` before using the public API.

The PayFlow server now exposes:

`POST /api/v1/payment-links`

It validates `Authorization: Bearer pf_test_...` / `pf_live_...`, creates the `payment_links` record, and returns `link_id` and `checkout_url`.

## 3. Pricing fix
ZippyGo keeps USD as the internal canonical price, applies the 5% margin once, multiplies the per-person transfer price by the selected passenger count, and converts to the selected local currency exactly once for display/payment.

The PayFlow checkout page no longer converts an already-converted local amount a second time.
