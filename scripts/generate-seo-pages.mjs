import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const siteUrl = String(process.env.VITE_SITE_URL || "https://zippygotransfers.com").replace(/\/+$/, "");
const airportsUrl = "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv";

function csvLine(line) {
  const out = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (ch === "," && !quoted) { out.push(value); value = ""; }
    else value += ch;
  }
  out.push(value);
  return out;
}

function slugify(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}
function airportSlug(a) { return `${slugify(a.name)}-${a.code.toLowerCase()}`; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

async function getAirports() {
  try {
    const response = await fetch(airportsUrl, { headers: { "User-Agent": "ZippyGoSEO/1.0" } });
    if (!response.ok) throw new Error(`OurAirports returned ${response.status}`);
    const lines = (await response.text()).split(/\r?\n/).filter(Boolean);
    const headers = csvLine(lines.shift() || "");
    const index = Object.fromEntries(headers.map((h, i) => [h, i]));
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return lines.map(line => {
      const row = csvLine(line);
      const code = row[index.iata_code] || "";
      const type = row[index.type] || "";
      const name = row[index.name] || "";
      const city = row[index.municipality] || "";
      const country = row[index.iso_country] || "";
      if (!/^[A-Z0-9]{3}$/i.test(code) || !name || !["large_airport", "medium_airport", "small_airport"].includes(type)) return null;
      return { code: code.toUpperCase(), name, city, country, countryName: displayNames.of(country) || country, latitude: Number(row[index.latitude_deg]), longitude: Number(row[index.longitude_deg]) };
    }).filter(Boolean);
  } catch (error) {
    console.warn(`SEO airport catalogue download failed: ${error.message}. Using bundled popular airports.`);
    return [
      { code: "LHR", name: "London Heathrow Airport", city: "London", country: "GB", countryName: "United Kingdom" },
      { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "AE", countryName: "United Arab Emirates" },
      { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "US", countryName: "United States" },
      { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "FR", countryName: "France" },
      { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "JP", countryName: "Japan" },
      { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "SG", countryName: "Singapore" },
    ];
  }
}

async function main() {
  const template = await fs.readFile(path.join(dist, "index.html"), "utf8");
  const airports = await getAirports();
  const unique = Array.from(new Map(airports.map(a => [`${a.code}-${a.name}`.toLowerCase(), a])).values());
  const now = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${siteUrl}/`, lastmod: now, changefreq: "weekly", priority: "1.0" },
    { loc: `${siteUrl}/airport-transfers/`, lastmod: now, changefreq: "weekly", priority: "0.9" },
  ];

  const hubHtml = template
    .replace(/<title>.*?<\/title>/i, `<title>Airport Transfers Worldwide | ZippyGo</title>`)
    .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="Book private and shared airport transfers worldwide with ZippyGo.">`)
    .replace('</head>', `<link rel="canonical" href="${siteUrl}/airport-transfers/">\n<meta name="robots" content="index,follow">\n</head>`);
  await fs.mkdir(path.join(dist, "airport-transfers"), { recursive: true });
  await fs.writeFile(path.join(dist, "airport-transfers", "index.html"), hubHtml, "utf8");

  for (const airport of unique) {
    const slug = airportSlug(airport);
    const url = `${siteUrl}/airport-transfers/${slug}/`;
    const title = `${airport.name} Transfers | Airport Taxi & Private Transfers | ZippyGo`;
    const description = `Book airport transfers from ${airport.name} (${airport.code}) to hotels, city areas and destinations in ${airport.city}. Compare private and shared transfer options with ZippyGo.`;
    const payload = JSON.stringify(airport).replace(/</g, "\\u003c");
    let html = template;
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    html = html.replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(description)}">`);
    if (!html.includes('name="description"')) html = html.replace('</head>', `<meta name="description" content="${escapeHtml(description)}">\n</head>`);
    html = html.replace('</head>', `<link rel="canonical" href="${escapeHtml(url)}">\n<meta name="robots" content="index,follow">\n<meta property="og:title" content="${escapeHtml(title)}">\n<meta property="og:description" content="${escapeHtml(description)}">\n<script>window.__ZIPPYGO_SEO_AIRPORT__=${payload};</script>\n</head>`);
    const target = path.join(dist, "airport-transfers", slug, "index.html");
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, html, "utf8");
    urls.push({ loc: url, lastmod: now, changefreq: "monthly", priority: "0.8" });
  }

  const chunkSize = 45000;
  const chunks = [];
  for (let i = 0; i < urls.length; i += chunkSize) chunks.push(urls.slice(i, i + chunkSize));
  if (chunks.length === 1) {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chunks[0].map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join("\n")}\n</urlset>\n`;
    await fs.writeFile(path.join(dist, "sitemap.xml"), sitemap, "utf8");
  } else {
    const sitemapEntries = [];
    for (let i = 0; i < chunks.length; i += 1) {
      const filename = `sitemap-${i + 1}.xml`;
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chunks[i].map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join("\n")}\n</urlset>\n`;
      await fs.writeFile(path.join(dist, filename), sitemap, "utf8");
      sitemapEntries.push(`${siteUrl}/${filename}`);
    }
    const index = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map(loc => `  <sitemap><loc>${loc}</loc><lastmod>${now}</lastmod></sitemap>`).join("\n")}\n</sitemapindex>\n`;
    await fs.writeFile(path.join(dist, "sitemap.xml"), index, "utf8");
  }
  await fs.writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`, "utf8");
  console.log(`Generated ${unique.length} airport SEO pages and sitemap.xml`);
}

main().catch(error => { console.error(error); process.exit(1); });
