# ZippyGo SEO setup

The build now creates crawlable airport-transfer landing pages and an XML sitemap.

## Build

Run:

```bash
npm run build
```

The build first creates the Vite application and then runs `scripts/generate-seo-pages.mjs`.
The generator downloads the current OurAirports catalogue and creates one page for each IATA-coded large, medium, or small airport.

Example URLs:

- `/airport-transfers/dubai-international-airport-dxb/`
- `/airport-transfers/london-heathrow-airport-lhr/`
- `/airport-transfers/john-f-kennedy-international-airport-jfk/`

It also creates:

- `/airport-transfers/`
- `/sitemap.xml`
- `/robots.txt`

Set `VITE_SITE_URL` during build if the production domain differs from `https://zippygotransfers.com`.

## Google Search Console

After deployment:

1. Verify the domain in Google Search Console.
2. Submit `https://YOUR-DOMAIN/sitemap.xml`.
3. Inspect a few airport URLs and request indexing for the most important destinations.

The site uses normal `<a href>` links for airport landing pages so crawlers can discover them, and each landing page has a unique title, description, canonical URL and JSON-LD structured data.
