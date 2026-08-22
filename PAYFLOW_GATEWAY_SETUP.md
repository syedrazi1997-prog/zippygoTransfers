# ZippyGo → PayFlow + Appwrite setup

## What was fixed

The previous checkout wrote the pending booking directly from the browser to Appwrite and only then called the payment backend. That made a browser-level `TypeError: Failed to fetch` possible when Appwrite CORS, permissions, project configuration, or the database ID was wrong.

The checkout now calls only the ZippyGo backend:

1. Browser → `POST /api/create-payflow-checkout`
2. ZippyGo backend → Appwrite (server API key)
3. ZippyGo backend → PayFlow `POST /api/v1/payment-links`
4. Backend returns the hosted checkout URL
5. Browser redirects to PayFlow
6. PayFlow returns to ZippyGo

Manage My Booking also uses the backend, so Appwrite is no longer exposed directly to the customer browser.

## Render backend variables

Set these on the ZippyGo backend service:

- `PORT` — Render supplies this automatically; `10000` is a local fallback.
- `PAYFLOW_API_URL=https://payflow-com.onrender.com/api/v1`
- `PAYFLOW_PUBLIC_URL=https://payflow-com.onrender.com`
- `PAYFLOW_API_KEY=pf_test_...` for testing or `pf_live_...` for production
- `ZIPPYGO_RETURN_URL=https://YOUR-ZIPPYGO-FRONTEND.onrender.com/`
- `APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1`
- `APPWRITE_PROJECT_ID=YOUR_APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY=YOUR_SERVER_SIDE_APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID=YOUR_APPWRITE_DATABASE_ID`
- `APPWRITE_BOOKINGS_COLLECTION_ID=bookings` (or your actual collection ID)

Never put `APPWRITE_API_KEY` or `PAYFLOW_API_KEY` in Vite variables.

## Appwrite configuration

In Appwrite Console:

1. Open the ZippyGo project.
2. Open Databases and identify the database ID.
3. Open the bookings collection/table and identify its ID.
4. Create a server API key under Project → Integrations/API Keys.
5. Give the key the minimum database/data scopes required to create, read and update booking documents/rows.
6. Add the key to the Render backend as `APPWRITE_API_KEY`.

The server-side Appwrite API key is intentionally used because Appwrite API keys are secrets and are intended for server SDK/API access. Appwrite documents that API-key access is controlled by scopes and that keys should not be exposed in client applications.

## Required bookings fields

The existing code expects these fields in the `bookings` collection:

- `booking_ref`
- `service_type`
- `pickup_location`
- `dropoff_location`
- `pickup_date`
- `pickup_time`
- `return_date`
- `vehicle_id`
- `vehicle_name`
- `passengers`
- `luggage`
- `customer_name`
- `customer_email`
- `amount`
- `currency`
- `amount_in_currency`
- `customer_phone`
- `flight_number`
- `extras`
- `payment_status`

Keep the attribute types compatible with the existing project. The payment code stores several optional values as `null`, so optional Appwrite attributes should allow empty/null values or the backend should be adjusted to use empty strings.

For reliable lookups, new bookings use the booking reference as the Appwrite document ID.

## Test the backend before testing payment

Open:

`https://YOUR-ZIPPYGO-BACKEND.onrender.com/health`

Expected:

```json
{
  "ok": true,
  "gateway": "PayFlow",
  "payflow_configured": true,
  "appwrite_configured": true
}
```

Then open:

`https://YOUR-ZIPPYGO-BACKEND.onrender.com/api/appwrite/status`

Expected:

```json
{
  "ok": true,
  "database_id": "...",
  "collection_id": "..."
}
```

If `/api/appwrite/status` fails, fix Appwrite configuration before testing PayFlow.

## Frontend Render variables

On the frontend/static site set:

`VITE_BACKEND_URL=https://YOUR-ZIPPYGO-BACKEND.onrender.com`

After changing a Vite variable, redeploy/rebuild the frontend.

Do not use `http://...` for the backend when the ZippyGo site is served over HTTPS. Browsers can block that request as mixed content.

## PayFlow

The backend expects:

`POST /api/v1/payment-links`

The PayFlow API key stays server-side.

The current checkout accepts a returned `checkout_url`/`url`, or the backend can construct a hosted checkout URL when PayFlow returns a `link_id`.

## Important payment-status note

The current return flow restores the confirmation page when PayFlow sends `payment_status=success`. For production, the payment status should also be verified server-to-server using the PayFlow webhook/verification mechanism before changing the Appwrite booking from `pending` to `paid`. Do not rely only on a browser query parameter for financial settlement.
