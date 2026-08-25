export type SeoPage = 'home' | 'transfers' | 'car_hire' | 'parking' | 'about' | 'blog';

const SITE_URL = 'https://zippygotransfers.com';

const pages: Record<SeoPage, { title: string; description: string; path: string }> = {
  home: {
    title: 'ZippyGo | Airport Transfers, Car Hire & Airport Parking Worldwide',
    description: 'Book airport transfers, private transfers, shuttle buses, car hire and airport parking worldwide. Compare prices and book your journey online with ZippyGo.',
    path: '/',
  },
  transfers: {
    title: 'Airport Transfers Worldwide | Private Transfers & Shuttle Buses | ZippyGo',
    description: 'Book reliable airport transfers worldwide. Compare private transfers, minivans and shuttle buses from airports to hotels and destinations with ZippyGo.',
    path: '/airport-transfers/',
  },
  car_hire: {
    title: 'Car Hire Worldwide | Compare Rental Cars & Prices | ZippyGo',
    description: 'Compare car hire prices worldwide. Search airport car rentals by pickup and return dates, calculate rental duration and book online with ZippyGo.',
    path: '/car-hire/',
  },
  parking: {
    title: 'Airport Parking Worldwide | Compare Airport Parking Prices | ZippyGo',
    description: 'Find and compare airport parking worldwide. Search by airport, parking dates and duration, then book convenient airport parking with ZippyGo.',
    path: '/airport-parking/',
  },
  about: { title: 'About ZippyGo | Worldwide Ground Transport', description: 'Learn about ZippyGo airport transfers, car hire and airport parking services worldwide.', path: '/about/' },
  blog: { title: 'ZippyGo Travel Blog | Airport Transfer & Travel Guides', description: 'Travel guides, airport transfer tips, car hire advice and airport parking information from ZippyGo.', path: '/blog/' },
};

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attribute, key); document.head.appendChild(el); }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
  el.href = href;
}

function upsertJsonLd(id: string, data: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) { el = document.createElement('script'); el.id = id; el.type = 'application/ld+json'; document.head.appendChild(el); }
  el.textContent = JSON.stringify(data);
}

export function setSeo(page: SeoPage = 'home') {
  const config = pages[page] || pages.home;
  const canonical = `${SITE_URL}${config.path}`;
  document.title = config.title;
  upsertMeta('name', 'description', config.description);
  upsertMeta('name', 'robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', config.title);
  upsertMeta('property', 'og:description', config.description);
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('property', 'og:site_name', 'ZippyGo');
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', config.title);
  upsertMeta('name', 'twitter:description', config.description);
  upsertLink('canonical', canonical);

  upsertJsonLd('zippygo-website-schema', {
    '@context': 'https://schema.org', '@type': 'WebSite', name: 'ZippyGo', url: SITE_URL,
    potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
  });
  upsertJsonLd('zippygo-organization-schema', {
    '@context': 'https://schema.org', '@type': 'Organization', name: 'ZippyGo', url: SITE_URL,
    email: 'support@zippygotransfers.com', description: 'Global airport transfers, car hire and airport parking booking platform.',
  });
  upsertJsonLd('zippygo-service-schema', {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'ZippyGo Ground Transport Services', itemListElement: [
      { '@type': 'Service', position: 1, name: 'Airport Transfers', serviceType: 'Airport transfer booking', areaServed: 'Worldwide', provider: { '@type': 'Organization', name: 'ZippyGo' } },
      { '@type': 'Service', position: 2, name: 'Car Hire', serviceType: 'Car rental booking', areaServed: 'Worldwide', provider: { '@type': 'Organization', name: 'ZippyGo' } },
      { '@type': 'Service', position: 3, name: 'Airport Parking', serviceType: 'Airport parking booking', areaServed: 'Worldwide', provider: { '@type': 'Organization', name: 'ZippyGo' } },
    ],
  });
  upsertJsonLd('zippygo-faq-schema', {
    '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Can I search for airports by airport code or name?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. ZippyGo supports global airport searches by IATA code, airport name and city.' } },
      { '@type': 'Question', name: 'Can I book a return airport transfer?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Select return transfer and enter the return date and time. Return pricing is calculated automatically.' } },
      { '@type': 'Question', name: 'Can I search airport parking and car hire?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. ZippyGo provides separate airport parking and car hire searches with duration-based pricing.' } },
    ],
  });
}

export function getPageForView(view: string): SeoPage {
  if (view === 'results' || view === 'checkout' || view === 'confirmation') return 'home';
  if (view === 'about') return 'about';
  if (view === 'blog') return 'blog';
  return 'home';
}
