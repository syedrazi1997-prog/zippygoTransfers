# ZippyGo free global search

ZippyGo now uses a free/open search stack:

1. **OurAirports** — global IATA airport search by code, airport name or city.
2. **OpenStreetMap + Overpass** — nearby hotels and areas around the selected airport. No API key is required.
3. **GeoNames (optional)** — structured nearby city/place enrichment. A free GeoNames account is required only if you set `GEONAMES_USERNAME`.
4. **Google Places (optional)** — if `GOOGLE_MAPS_API_KEY` is configured, Google is used first and OSM remains the fallback.

For production, avoid sending high-volume traffic directly to public Overpass infrastructure. The project caches airport data and destination responses. If ZippyGo grows significantly, run your own Overpass/Nominatim infrastructure or use a hosted OSM provider.

## Render environment variables

```text
GEONAMES_USERNAME=
GOOGLE_MAPS_API_KEY=
```

Neither variable is required for the default free OSM search.

GeoNames free services have usage limits, so the app treats GeoNames as an enrichment layer rather than a required dependency.

## Vehicle images

Vehicle cards use local assets under `public/vehicles/`, mapped explicitly to the vehicle ID:

- `economy-sedan` → `economy-sedan.svg`
- `executive-sedan` → `executive-sedan.svg`
- `luxury-sedan` → `luxury-sedan.svg`
- `passenger-van` → `executive-van.svg`

This prevents unrelated external stock images from appearing for a vehicle description.
