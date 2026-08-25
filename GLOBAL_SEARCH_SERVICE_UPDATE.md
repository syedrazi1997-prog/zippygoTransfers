# ZippyGo Global Search & Service Update

## Changes

- Global airport search now accepts IATA code, airport name, city, country, and combinations such as `Hyderabad India` or `Hyderabad Airport`.
- Airport records are sourced globally from OurAirports and retain latitude/longitude for route calculations.
- Nearby hotels and areas use OpenStreetMap/Overpass, with Google Places and GeoNames as optional enhancements.
- Overpass has a secondary endpoint fallback for better regional resilience.
- Customers can type a destination manually. The backend geocodes the destination once at search time and calculates the airport-to-destination route distance.
- Transfer prices now scale by route-distance bands, then the existing 5% ZippyGo margin and passenger/return logic are applied.
- Car hire and airport parking keep duration-based pricing.
- Shuttle Bus and Express Shuttle are shown only for Airport Transfers and are excluded from Car Hire and Airport Parking results.
- Razorpay remains the active payment gateway.

## Render environment

Set `VITE_BACKEND_URL` on the frontend to the deployed backend URL if it differs from the default:

`https://zippygo-transfers-backend.onrender.com`

Optional:

- `GEONAMES_USERNAME`
- `GOOGLE_MAPS_API_KEY`

## Important pricing note

The route-distance transfer price is a ZippyGo estimate generated from the vehicle base rate and distance bands. It is not a live supplier quote. For live supplier availability/rates, connect a licensed transfer/hotel/car-hire inventory API later.
