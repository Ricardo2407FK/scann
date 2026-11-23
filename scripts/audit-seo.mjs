import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { load } from 'cheerio';

// Run against a production build, or pass the deployed origin as an argument.
// Only GET requests are made; this never submits documents or starts scans.
const origin = new URL(process.argv[2] ?? 'http://localhost:3000');
const canonicalOrigin = 'https://www.scanterity.com';
const normalize = (text) => text.replace(/\s+/g, ' ').trim();
const checkedAssets = new Map();
const pageTitles = new Set();
const pageDescriptions = new Set();
const renderedPages = new Map();
const internalLinks = [];

async function get(path, userAgent = 'Scanterity-SEO-Audit/1.0') {
  return fetch(new URL(path, origin), {
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
    headers: { 'User-Agent': userAgent },
  });
}

async function checkAsset(url) {
  const asset = new URL(url, canonicalOrigin);
  assert.equal(asset.origin, canonicalOrigin, `Unexpected asset origin: ${url}`);
  const key = asset.pathname + asset.search;
  if (checkedAssets.has(key)) return checkedAssets.get(key);
  const response = await get(key);
  assert.equal(response.status, 200, `Missing metadata asset: ${url}`);
  assert.match(response.headers.get('content-type') ?? '', /^image\//);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.ok(bytes.length > 0, `Empty image: ${url}`);
  checkedAssets.set(key, bytes);
  return bytes;
}

const sitemapResponse = await get('/sitemap.xml');
assert.equal(sitemapResponse.status, 200, 'Sitemap must return 200 without a redirect');
assert.match(sitemapResponse.headers.get('content-type') ?? '', /xml/);
const sitemap = load(await sitemapResponse.text(), { xmlMode: true });
const urls = sitemap('url > loc').map((_, element) => sitemap(element).text()).get();
assert.ok(urls.length > 0, 'Sitemap cannot be empty');
assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');
// Discover static pages independently so an accidentally omitted route fails.
const routeFiles = await readdir(new URL('../src/app/', import.meta.url), { recursive: true });
const expectedPaths = routeFiles.map((path) => path.replaceAll('\\', '/'))
  .filter((path) => /(^|\/)page\.tsx$/.test(path))
  .map((path) => `/${path.replace(/(^|\/)page\.tsx$/, '')}`);
assert.deepEqual(urls.map((url) => new URL(url).pathname).sort(), expectedPaths.sort(), 'Sitemap must include every public page');

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
  renderedPages.set(canonical.pathname, $);
  assert.equal($('html').attr('lang'), 'en');
  assert.equal($('head title').length, 1, `Missing or duplicate title: ${url}`);
  const title = normalize($('head title').text());
  assert.ok(title.length > 0 && !pageTitles.has(title), `Duplicate/empty title: ${url}`);
  pageTitles.add(title);
  assert.ok(title.length <= 65, `Review overly long search title (${title.length} characters): ${url}`);
  assert.equal($('meta[name="description"]').length, 1);
  const description = $('meta[name="description"]').attr('content');
  assert.ok(description && !pageDescriptions.has(description), `Duplicate/empty description: ${url}`);
  pageDescriptions.add(description);
  // Editorial guardrails, not search-engine limits or ranking guarantees.
  assert.ok(description.length <= 170, `Review overly long description (${description.length} characters): ${url}`);
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
  assert.equal($('main').length, 1, `Expected one main landmark: ${url}`);
  assert.equal($('main h1').length, 1, `Main heading must be inside main: ${url}`);
  assert.match($('meta[name="viewport"]').attr('content') ?? '', /width=device-width/);
  assert.equal($('meta[name="twitter:card"]').attr('content'), 'summary_large_image');
  assert.ok($('meta[property="og:image:alt"]').attr('content'), 'Social image needs descriptive alt text');

  $('a[href]').each((_, element) => {
    const target = new URL($(element).attr('href'), canonical);
    if (target.origin === canonicalOrigin) internalLinks.push({ source: url, target });
  });

  for (const element of $('meta[property="og:image"], meta[name="twitter:image"]').toArray()) {
    const bytes = await checkAsset($(element).attr('content'));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', 'Social preview must be a valid PNG');
    assert.equal(bytes.readUInt32BE(16), 1200, 'Social image width');
    assert.equal(bytes.readUInt32BE(20), 630, 'Social image height');
  }
  for (const element of $('link[rel="icon"], link[rel="apple-touch-icon"]').toArray()) {
    await checkAsset($(element).attr('href'));
  }
  for (const element of $('img').toArray()) {
    assert.notEqual($(element).attr('alt'), undefined, `Image missing alt text: ${url}`);
    assert.ok(Number($(element).attr('width')) > 0 && Number($(element).attr('height')) > 0, `Image missing reserved dimensions: ${url}`);
    const src = new URL($(element).attr('src'), canonical);
    if (src.origin === canonicalOrigin) await checkAsset(src.href);
  }

  const nodes = $('script[type="application/ld+json"]').toArray().flatMap((element) => {
    const data = JSON.parse($(element).html());
    assert.equal(data['@context'], 'https://schema.org');
    return data['@graph'] ?? [data];
  });
  assert.equal(nodes.filter((node) => node['@type'] === 'WebSite').length, 1);
  assert.equal(nodes.filter((node) => node['@type'] === 'Organization').length, 1);
  assert.equal(nodes.filter((node) => node['@type'] === 'BreadcrumbList').length, canonical.pathname === '/' ? 0 : 1, `Duplicate or missing breadcrumbs: ${url}`);
  const ids = nodes.map((node) => node['@id']).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length, `Duplicate structured-data IDs: ${url}`);
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

for (const { source, target } of internalLinks) {
  const page = renderedPages.get(target.pathname);
  assert.ok(page, `Internal link points outside public routes: ${source} -> ${target.href}`);
  if (target.hash) {
    const id = decodeURIComponent(target.hash.slice(1));
    assert.ok(page('[id]').toArray().some((element) => page(element).attr('id') === id), `Missing anchor: ${source} -> ${target.href}`);
  }
}
for (const path of renderedPages.keys()) {
  if (path !== '/') assert.ok(internalLinks.some(({ source, target }) => new URL(source).pathname !== path && target.pathname === path), `Orphan page: ${path}`);
}

for (const agent of ['Googlebot', 'Bingbot', 'Twitterbot']) {
  const response = await get('/', agent);
  assert.equal(response.status, 200, `Crawler denied: ${agent}`);
  const $ = load(await response.text());
  assert.equal($('head title').text(), renderedPages.get('/')('head title').text());
  assert.equal(new URL($('head link[rel="canonical"]').attr('href')).href, `${canonicalOrigin}/`);
  assert.doesNotMatch($('meta[name="robots"], meta[name="googlebot"]').map((_, e) => $(e).attr('content')).get().join(','), /\b(noindex|none)\b/i);
}

// Query parameters must not create competing canonical URLs.
for (const path of renderedPages.keys()) {
  const variant = await get(`${path}?utm_source=seo-audit`);
  assert.equal(variant.status, 200);
  assert.equal(new URL(load(await variant.text())('link[rel="canonical"]').attr('href')).href, new URL(path, canonicalOrigin).href);
}

for (const path of ['/plagiarism-checker', '/ai-detector', '/check-plagiarism', '/free-plagiarism-checker', '/about/']) {
  const response = await get(path);
  assert.ok([301, 308].includes(response.status), `Alias needs a permanent redirect: ${path}`);
  const target = new URL(response.headers.get('location'), origin);
  assert.equal(target.pathname, path === '/about/' ? '/about' : '/');
  await response.arrayBuffer();
}

for (const path of ['/non-existent-page-test', '/seo-audit-missing-page']) {
  const missing = await get(path);
  assert.equal(missing.status, 404, `Missing page must not be a soft 404: ${path}`);
  const $ = load(await missing.text());
  assert.match($('meta[name="robots"]').map((_, node) => $(node).attr('content')).get().join(','), /noindex/);
  $('meta[name="robots"], meta[name="googlebot"]').each((_, node) => {
    assert.doesNotMatch($(node).attr('content') ?? '', /\bindex\b/i, '404 must not inherit a conflicting index directive');
  });
  assert.equal($('link[rel="canonical"]').length, 0, '404 must not claim the homepage canonical');
}

// Check method-rejected responses too, including the export route that skips middleware.
for (const path of ['/api/check', '/api/parse-pdf', '/api/export-pdf']) {
  const response = await get(path);
  assert.equal(response.status, 405, `GET must not start a scan or export: ${path}`);
  assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/);
  await response.arrayBuffer();
}
console.log(`SEO audit passed: ${urls.length} public pages, ${checkedAssets.size} images, internal links, crawler responses, robots, redirects, URL variants, 404s and API indexing headers.`);
