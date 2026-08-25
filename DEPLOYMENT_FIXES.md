# ZippyGo deployment fixes

## What was fixed

- Removed the broken browser-side Razorpay checkout path. ZippyGo now uses the Razorpay hosted checkout endpoint only.
- Added the missing `/api/create-razorpay-checkout` backend route.
- Added global airport search using the OurAirports dataset. Customers can search by IATA code, airport name, or city.
- Added nearby hotel and area discovery using OpenStreetMap/Overpass around the selected airport coordinates.
- Kept the existing local airport data as a fallback when the global services are temporarily unavailable.
- Fixed TypeScript contract mismatches between `App.tsx`, `Header`, `Destinations`, `SearchResults`, `ManageBooking`, and `Footer`.
- Added the missing `Currency` and `BookingExtras` types and destination-country currency lookup.
- Fixed checkout pricing so Search Results and Checkout use the same pricing calculation.
- Removed the hard-coded customer phone number.
- Removed committed API credentials from `.env.example`. Real Razorpay/Appwrite secrets must be configured in Render environment variables.
- Fixed the invalid `ZIPPYGO_RETURN_URL` example.
- Removed the unused Razorpay package.

## Render setup

### Frontend

`VITE_BACKEND_URL=https://YOUR-ZIPPYGO-BACKEND.onrender.com`

### Backend

Set:

- `PAYFLOW_API_URL`
- `PAYFLOW_PUBLIC_URL`
- `PAYFLOW_API_KEY`
- `ZIPPYGO_RETURN_URL`
- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_BOOKINGS_COLLECTION_ID`

Do not prefix server secrets with `VITE_`.

## Health checks

After deployment:

- `GET /health`
- `GET /api/appwrite/status`
- `GET /api/airports/search?q=LHR`

The airport endpoint is independent of Appwrite and payment configuration.
