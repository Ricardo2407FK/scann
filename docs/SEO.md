# Search visibility

The production canonical origin is `https://www.scanterity.com`. Shared metadata
lives in `src/lib/seo.ts`. Add every new indexable page to `PUBLIC_PATHS` and give
it its own `createPageMetadata()` export. Preserve the hosting redirect from the
bare domain to `www`; code canonicals do not configure DNS or hosting redirects.

Technical SEO helps crawlers understand the site. It cannot guarantee indexing,
a particular ranking, or a rich result.

## Configuration

- All seven public pages have unique titles and descriptions, a self-referencing
  HTTPS canonical, and matching Open Graph and Twitter metadata. Tracking query
  parameters canonicalize to the clean page URL.
- Index directives belong to public pages, not the root layout. Missing URLs
  return HTTP 404 with `noindex`, without a conflicting Googlebot `index` directive
  or a homepage canonical.
- The sitemap contains only canonical public pages. It omits estimated update
  dates and build timestamps. Add `lastModified` only when reliable per-page
  content update dates are maintained.
- Robots rules permit public pages and their rendering assets. APIs are excluded
  from crawling and return `X-Robots-Tag: noindex, nofollow, nosnippet`. A crawler
  blocked by robots.txt cannot see the response header; neither mechanism is an
  access control, and private data must still be protected by the application.
- JSON-LD describes the organization, website, application, visible FAQs, steps
  and child-page breadcrumbs. The privacy page emits one breadcrumb list. Site
  names use the actual brand, and the logo is not represented as an app screenshot.
  No fabricated ratings or reviews are present. Descriptive schema does not imply
  eligibility for a Google rich result.
- A 1200 x 630 social card is generated at build time in
  `src/app/opengraph-image.tsx`, with no external asset requests. The organization
  retains its existing logo. Social previews are separate from ranking signals.
- Each public page has one main landmark and one server-rendered H1. Scanner
  states remain inside the homepage landmark. Visible page copy, CSS, scanner
  logic, upload limits, exports, analytics and advertising are preserved.
- The header logo uses Next.js image optimization with responsive sizes and its
  existing dimensions and styling. Fallback and results-only fonts remain
  available but no longer preload on every page. These reduce unnecessary initial
  requests; they are not a claim of measured Core Web Vitals improvements.
- Keyword lists, obsolete crawler-hint meta tags and redundant language
  alternates have been removed. The site currently has one English version.
- Google HTML verification is preserved. Real verification tokens can be set
  before building through `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`,
  and `YANDEX_SITE_VERIFICATION`; missing values emit no verification tag.

## Local verification

Build with `npm run build`, then start that build with `npm start` and run
`npm run audit:seo`. To use a different port:

```sh
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100
node scripts/audit-seo.mjs http://127.0.0.1:3100
```

The audit makes GET requests only and does not submit documents or start scans.
It checks every public route against the sitemap, rendered metadata, canonical
URLs, landmarks, image responses and social-image dimensions, visible FAQs,
duplicate structured data, internal links and anchors, orphan pages, Googlebot /
Bingbot / Twitterbot responses, redirects, query variants, 404s and API headers.
Title and description length checks are editorial guardrails, not search-engine
limits or a prediction of how snippets will display.

Run the existing scanner regression suite with `npm test -- --runInBand`.

## Verification on November 2, 2026

- Clean production build and TypeScript validation passed on Next.js 16.2.9.
- The expanded local SEO audit passed for all seven public pages and ten images.
- Existing regression suite: nine suites and 143 tests passed.
- Rendered visible text, navigation targets and initial controls matched the saved
  pre-change HTML on all seven public pages. No CSS files or scanner algorithms
  were modified.
- Font preloads decreased from five to three. The 384-pixel WebP logo response
  measured 8,604 bytes, compared with the original 370,759-byte PNG. This is a
  specific asset measurement, not a field performance score.
- The generated social card was visually inspected at 1200 x 630.
- Interactive browser QA was unavailable because the browser tool's sandbox
  launcher failed on an unreadable Q: drive. No browser layout or Core Web Vitals
  score is claimed. The public homepage was readable through web browsing, but
  the live command-line audit encountered a connection reset. Production
  deployment and a complete post-deployment audit remain outstanding.

## Deployment and owner follow-up

1. Deploy the reviewed build through the site's existing hosting workflow. Local
   source changes do not update the production site.
2. Run `node scripts/audit-seo.mjs https://www.scanterity.com` against the deployed
   build. Confirm that HTTP and the bare domain redirect permanently to HTTPS on
   `www`, preserving the page path. Preview hosts should be excluded from search
   at the hosting layer while production remains indexable.
3. Verify ownership in Google Search Console and Bing Webmaster Tools. Submit
   `https://www.scanterity.com/sitemap.xml`, inspect the homepage and supporting
   pages, and request indexing. Submission does not ensure indexing.
4. Review indexing exclusions, selected canonicals, crawl errors, mobile usability
   and field Core Web Vitals. Use Google's Rich Results Test and Schema Markup
   Validator on the deployed pages. Check real social previews after deployment.
5. Substantiate the existing marketing claims before expanding content. In
   particular, review assertions about detection accuracy, source coverage,
   comparisons with competitors, unlimited use and document privacy. Search
   providers receive selected queries and the engine uses temporary in-memory
   query caches; claims of no third-party sharing or immediate wiping need review.
   This SEO change does not rewrite the site's policies or product claims.
6. Track impressions, clicks and search queries over time. Useful original
   content, evidence supporting product claims, and earned links remain ongoing
   work; keyword repetition and manufactured ratings are not substitutes.

Search Console submissions, account verification, production deployment and
field performance measurements are separate from local code validation.

## References

- [Google SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Search snippets](https://developers.google.com/search/docs/appearance/snippet)
- [Site names](https://developers.google.com/search/docs/appearance/site-names)
- [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Sitemap best practices](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
