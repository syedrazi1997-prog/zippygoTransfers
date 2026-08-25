# Vehicle image update

The transfer vehicle catalog now uses the vehicle images supplied in the ZippyGo transfer screenshots, cropped into local project assets so the displayed vehicle matches its description.

Mappings:
- Shuttle Bus -> `/vehicles/shuttle-bus.png`
- Express Shuttle -> `/vehicles/express-shuttle.png`
- Private Transfer -> `/vehicles/private-transfer.png`
- Private Minivan -> `/vehicles/private-minivan.png`
- Premium Transfer -> `/vehicles/premium-transfer.png`

Search results use `object-contain` so vehicle images are not cropped or distorted.

Razorpay and the existing global airport/hotel/area search remain unchanged.
