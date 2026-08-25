# Google Search Console sitemap fix

The Search Console property currently shown for ZippyGo is `https://zippygotransfers.onrender.com`.

This release aligns the public sitemap, robots.txt, homepage canonical metadata, and runtime SEO URLs with that host.

Submit only `sitemap.xml` in Search Console. Do not submit page paths such as `/Car Hire` or `/Airport transfers` as sitemaps.

If the site is later moved to the permanent custom domain, set `VITE_SITE_URL` to that exact canonical origin and regenerate the static sitemap/robots files for that domain.
