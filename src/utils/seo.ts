import { Product, StoreConfig } from '../types/store';

export function updateHeadSEO(
  config: StoreConfig,
  customTitle?: string,
  customDescription?: string,
  currentProduct?: Product
) {
  // 1. Title
  const title = customTitle || (currentProduct 
    ? `${currentProduct.title} | ${config.storeName}` 
    : config.metaTitle || `${config.storeName} | Premium Fashion & Apparel`);
  document.title = title;

  // 2. Meta Description
  const description = customDescription || (currentProduct 
    ? currentProduct.description.slice(0, 160)
    : config.metaDescription);
  
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // 3. OpenGraph Tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) {
    const imageUrl = currentProduct ? currentProduct.images[0] : config.logoUrl;
    ogImage.setAttribute('content', imageUrl);
  }

  // 4. Favicon & Apple Touch Icon binding
  const faviconLink = document.getElementById('dynamic-favicon') as HTMLLinkElement;
  if (faviconLink && config.faviconUrl) {
    faviconLink.href = config.faviconUrl;
  }

  const appleLink = document.getElementById('dynamic-apple-icon') as HTMLLinkElement;
  if (appleLink && config.logoUrl) {
    appleLink.href = config.logoUrl;
  }

  // 5. Dynamic JSON-LD Schema
  let schemaScript = document.getElementById('json-ld-schema');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'json-ld-schema';
    schemaScript.setAttribute('type', 'application/ld+json');
    document.head.appendChild(schemaScript);
  }

  if (currentProduct) {
    const productSchema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": currentProduct.title,
      "image": currentProduct.images,
      "description": currentProduct.description,
      "sku": currentProduct.id,
      "brand": {
        "@type": "Brand",
        "name": config.storeName
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "BDT",
        "price": currentProduct.salePrice || currentProduct.price,
        "availability": currentProduct.sizes.some(s => s.stock > 0) 
          ? "https://schema.org/InStock" 
          : "https://schema.org/OutOfStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": currentProduct.rating || 4.9,
        "reviewCount": currentProduct.reviewCount || 100
      }
    };
    schemaScript.textContent = JSON.stringify(productSchema, null, 2);
  } else {
    const storeSchema = {
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      "name": config.storeName,
      "url": window.location.origin,
      "logo": config.logoUrl,
      "description": config.metaDescription,
      "telephone": config.contactPhone,
      "email": config.contactEmail,
      "priceRange": "৳500 - ৳5000",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dhaka",
        "addressCountry": "BD"
      }
    };
    schemaScript.textContent = JSON.stringify(storeSchema, null, 2);
  }
}

export function generateRobotsTxt(storeName: string): string {
  return `# robots.txt for ${storeName}
User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Sitemap: ${window.location.origin}/sitemap.xml
`;
}

export function generateSitemapXml(storeName: string, products: Product[]): string {
  const origin = window.location.origin;
  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

  products.forEach(p => {
    xml += `  <url>
    <loc>${origin}/product/${p.slug || p.id}</loc>
    <lastmod>${p.createdAt || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
}
