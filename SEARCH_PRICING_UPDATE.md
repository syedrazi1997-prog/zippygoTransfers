# ZippyGo Search, Airport & Pricing Update

Implemented in this build:

## Airport / pickup search
- Airport search accepts any IATA code, airport name, or city.
- Search uses a global OurAirports dataset through the backend instead of a small hard-coded airport list.
- Selecting an airport canonicalizes the pickup location to the exact airport.
- Nearby hotel and area suggestions are loaded from OpenStreetMap/Overpass within approximately 20 km of the selected airport and ranked by distance.
- The existing local airport data remains as a fallback when the global services are unavailable.

## Local currency
- The app automatically switches to the destination/airport country's currency when a search is submitted.
- Prices are displayed in that currency on results and checkout.
- Razorpay receives the converted local-currency amount, while the internal base price remains in USD for calculation consistency.
- Manual currency selection in the header is still available after the search.

## Pricing
- A 5% margin is applied to the supplier/base price.
- The supplier/base vehicle rate is treated as a one-passenger rate.
- 1 passenger = one per-person rate.
- 2 passengers = two per-person rates.
- 3 passengers = three per-person rates, and so on.
- Search Results and Checkout use the same `calculateVehiclePriceUSD` function so the displayed total remains consistent.
