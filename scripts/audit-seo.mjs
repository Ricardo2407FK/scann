import assert from 'node:assert/strict';
import { load } from 'cheerio';

// Run against a production build, or pass the deployed origin as an argument.
// Only GET requests are made; this never submits documents or starts scans.
const origin = new URL(process.argv[2] ?? 'http://localhost:3000');
const canonicalOrigin = 'https://www.scanterity.com';
const normalize = (text) => text.replace(/\s+/g, ' ').trim();
const checkedAssets = new Set();
const pageTitles = new Set();
const pageDescriptions = new Set();

async function get(path) {
  return fetch(new URL(path, origin), {
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
    headers: { 'User-Agent': 'Scanterity-SEO-Audit/1.0' },
  });
}

async function checkAsset(url) {
  const asset = new URL(url, canonicalOrigin);
  assert.equal(asset.origin, canonicalOrigin, `Unexpected asset origin: ${url}`);
  if (checkedAssets.has(asset.pathname)) return;
  const response = await get(asset.pathname + asset.search);
  assert.equal(response.status, 200, `Missing metadata asset: ${url}`);
  assert.match(response.headers.get('content-type') ?? '', /^image\//);
  await response.arrayBuffer();
  checkedAssets.add(asset.pathname);
}

const sitemapResponse = await get('/sitemap.xml');
assert.equal(sitemapResponse.status, 200, 'Sitemap must return 200 without a redirect');
assert.match(sitemapResponse.headers.get('content-type') ?? '', /xml/);
const sitemap = load(await sitemapResponse.text(), { xmlMode: true });
const urls = sitemap('url > loc').map((_, element) => sitemap(element).text()).get();
assert.ok(urls.length > 0, 'Sitemap cannot be empty');
assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');

const robotsResponse = await get('/robots.txt');
assert.equal(robotsResponse.status, 200);
const robots = await robotsResponse.text();
assert.ok(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
assert.match(robots, /^User-Agent: \*$/im);
assert.match(robots, /^Allow: \/$/im);
assert.match(robots, /^Disallow: \/api\/$/im);
assert.doesNotMatch(robots, /^Disallow:\s*(?:\/\s*$|\/_next)/im);

for (const url of urls) {
  const canonical = new URL(url);
  assert.equal(canonical.origin, canonicalOrigin);
  assert.equal(canonical.search + canonical.hash, '', 'Sitemap contains a URL variant');
  const response = await get(canonical.pathname);
  assert.equal(response.status, 200, `Sitemap URL must be indexable: ${url}`);
  assert.doesNotMatch(response.headers.get('x-robots-tag') ?? '', /noindex|none/i);
  const $ = load(await response.text());
  assert.equal($('html').attr('lang'), 'en');
  assert.equal($('head title').length, 1, `Missing or duplicate title: ${url}`);
  const title = normalize($('head title').text());
  assert.ok(title.length > 0 && !pageTitles.has(title), `Duplicate/empty title: ${url}`);
  pageTitles.add(title);
  assert.equal($('meta[name="description"]').length, 1);
  const description = $('meta[name="description"]').attr('content');
  assert.ok(description && !pageDescriptions.has(description), `Duplicate/empty description: ${url}`);
  pageDescriptions.add(description);
  assert.equal($('link[rel="canonical"]').length, 1);
  assert.equal(new URL($('head link[rel="canonical"]').attr('href')).href, url);
  $('meta[name="robots"], meta[name="googlebot"]').each((_, element) => {
    assert.doesNotMatch($(element).attr('content') ?? '', /\b(noindex|none)\b/i);
  });
  assert.equal(new URL($('meta[property="og:url"]').attr('content')).href, url);
  assert.equal($('meta[property="og:title"]').attr('content'), title);
  assert.equal($('meta[name="twitter:title"]').attr('content'), title);
  assert.equal($('meta[property="og:description"]').attr('content'), description);
  assert.equal($('meta[name="twitter:description"]').attr('content'), description);
  assert.equal($('h1').length, 1, `Expected a server-rendered main heading: ${url}`);

  for (const element of $('meta[property="og:image"], meta[name="twitter:image"]').toArray()) {
    await checkAsset($(element).attr('content'));
  }
  for (const element of $('link[rel="icon"], link[rel="apple-touch-icon"]').toArray()) {
    await checkAsset($(element).attr('href'));
  }

  const nodes = $('script[type="application/ld+json"]').toArray().flatMap((element) => {
    const data = JSON.parse($(element).html());
    assert.equal(data['@context'], 'https://schema.org');
    return data['@graph'] ?? [data];
  });
  assert.ok(nodes.some((node) => node['@type'] === 'WebSite'));
  assert.ok(nodes.some((node) => node['@type'] === 'Organization'));
  const content = $('body').clone();
  content.find('script, style').remove();
  const visibleText = normalize(content.text());
  for (const node of nodes) {
    if (node['@type'] === 'FAQPage') {
      for (const question of node.mainEntity) {
        assert.ok(visibleText.includes(normalize(question.name)), `Invisible FAQ: ${question.name}`);
        assert.ok(visibleText.includes(normalize(question.acceptedAnswer.text)), `Invisible FAQ answer: ${question.name}`);
      }
    }
    if (node['@type'] === 'BreadcrumbList') {
      assert.ok(node.itemListElement.length >= 2, 'Breadcrumbs need at least two items');
      assert.equal(node.itemListElement.at(-1).item, url);
    }
  }
  console.log(`PASS ${canonical.pathname}: indexable HTML, canonical, metadata, assets and JSON-LD`);
}

// Query parameters must not create competing canonical URLs.
const variant = await get('/?utm_source=seo-audit');
assert.equal(variant.status, 200);
assert.equal(new URL(load(await variant.text())('link[rel="canonical"]').attr('href')).href, `${canonicalOrigin}/`);

for (const path of ['/non-existent-page-test', '/seo-audit-missing-page']) {
  const missing = await get(path);
  assert.equal(missing.status, 404, `Missing page must not be a soft 404: ${path}`);
  const $ = load(await missing.text());
  assert.match($('meta[name="robots"]').map((_, node) => $(node).attr('content')).get().join(','), /noindex/);
  assert.equal($('link[rel="canonical"]').length, 0, '404 must not claim the homepage canonical');
}

// Check method-rejected responses too, including the export route that skips middleware.
for (const path of ['/api/check', '/api/parse-pdf', '/api/export-pdf']) {
  const response = await get(path);
  assert.equal(response.status, 405, `GET must not start a scan or export: ${path}`);
  assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/);
  await response.arrayBuffer();
}
console.log(`SEO audit passed: ${urls.length} public pages, ${checkedAssets.size} metadata assets, robots, URL variants, 404s and API indexing headers.`);
