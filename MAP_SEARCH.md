# Global airport / hotel / area search

ZippyGo uses OurAirports for the global airport catalogue and OpenStreetMap/Overpass for nearby hotels and areas. This avoids requiring a paid maps key for the default search flow.

Google Maps Platform is optional via `GOOGLE_MAPS_API_KEY`. Google is not completely free: it has monthly free usage thresholds and pay-as-you-go billing. See the official pricing page before enabling it.

The default OSM implementation should be used responsibly: cache results, identify the application with a User-Agent, keep traffic moderate, and do not build client-side autocomplete directly against public Nominatim. The app does not use Nominatim autocomplete.
