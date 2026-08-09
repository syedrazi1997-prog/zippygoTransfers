# ZippyGo Search, Airport & Pricing Update

Implemented in this build:

## Airport / pickup search
- Airport search now accepts IATA code, airport name or city.
- Selecting an airport canonicalizes the pickup location to the exact airport.
- Transfer search displays the selected pickup/arrival airport and the inferred destination airport.
- Hotel suggestions are filtered by the selected airport's city.
- The airport dataset was expanded with a much broader European airport list and the existing global airports remain available.

## Local currency
- The app automatically switches to the destination/airport country's currency when a search is submitted.
- Prices are displayed in that currency on results and checkout.
- PayFlow receives the converted local-currency amount, while the internal base price remains in USD for calculation consistency.
- Manual currency selection in the header is still available after the search.

## Pricing
- A 5% margin is applied to supplier/base pricing.
- The quoted/base price is treated as the price for 2 adults.
- 2 adults = base price.
- 3 adults = base price + 1 additional adult at base/2.
- 4 adults = base price + 2 additional adults at base/2 each.
- The same calculation is used on Search Results and Checkout so the displayed amount cannot drift between screens.
- The search now starts at 2 adults instead of 1.

## Important deployment note
The project currently stores the booking's internal `amount` as the USD calculation and `amount_in_currency` as the local-currency payment amount. If your existing Appwrite `bookings` collection does not contain `amount_in_currency`, keep the existing schema as-is; the field was already used by the original project.

The current environment does not have the project's npm dependencies available, so a local TypeScript build could not be completed in this environment. The code changes were made against the supplied project structure and existing APIs.
