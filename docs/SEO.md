# Search visibility

SEO metadata changes do not guarantee a ranking position. The app's interface,
visible copy, scanner and reports are unchanged by this update.

The production hostname is `https://www.scanterity.com`. The bare domain redirects
there with HTTP 308 (verified October 13, 2026). Keep hosting redirects and all
discovery signals on that hostname. Shared metadata lives in `src/lib/seo.ts`.
Add new indexable routes to `PUBLIC_PATHS` and give each its own metadata.

## What is configured

- Every public page has a unique title and description, a self-referencing HTTPS
  canonical on `www.scanterity.com`, and matching Open Graph/Twitter metadata.
- The sitemap lists the five existing public pages. It omits build timestamps:
  add `lastModified` only when actual per-page content update dates are tracked.
- Crawlers can load the HTML, JavaScript, styles and images. APIs are excluded
  from crawling and also return `X-Robots-Tag: noindex, nofollow, nosnippet`.
  Robots directives are crawler instructions, not access controls.
- JSON-LD describes the organization, website, app, visible FAQs and child-page
  breadcrumbs. It does not invent search functionality, reviews or ratings.
  Google retired FAQ rich results in May 2026; the FAQ schema is descriptive.
  Software rich-result eligibility
  may require genuine visible review/rating data that this app does not have.
- Missing pages use Next.js's 404/noindex behavior without inheriting a homepage
  canonical or a conflicting global `index` directive.
- Existing Google HTML verification and optional `GOOGLE_SITE_VERIFICATION` /
  `BING_SITE_VERIFICATION` environment variables are preserved.

## Verify locally

Run `npm run build`, start that build with `npm start`, then run `npm run audit:seo`.
For a different local port, pass its origin, such as
`npm run audit:seo -- http://localhost:3100`.
The audit uses GET requests only; it does not upload documents or invoke scans.
It checks rendered HTML and HTTP responses, including every sitemap URL,
canonical consistency, structured data matching visible FAQs, assets, real 404s,
and API noindex headers.

## After deployment

1. Run `npm run audit:seo -- https://www.scanterity.com` against the deployed build.
2. Verify ownership in Google Search Console and Bing Webmaster Tools. DNS
   verification needs no code change. For meta verification, set the actual token
   in `GOOGLE_SITE_VERIFICATION` or `BING_SITE_VERIFICATION` before building; unset
   values emit no verification tag. Submit
   `https://www.scanterity.com/sitemap.xml` in both tools. Inspect the homepage URL and request
   indexing after the changed build is live. Submission does not ensure indexing.
3. Check Page indexing for exclusions, Google's selected canonical for the home
   page, and the Core Web Vitals report. Use the Rich Results Test to inspect the
   deployed schema; do not add fabricated ratings to remove eligibility warnings.
4. Track impressions, clicks and queries in Search Console over subsequent weeks.
   Further growth needs useful, trustworthy content and earned links. Existing
   claims about detection accuracy, source coverage, privacy and comparisons with
   other tools should be substantiated before expanding marketing content.

These are post-deployment steps, not actions performed by a local code change.

## References

- [Google's SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Sitemap best practices](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [FAQ rich result retirement](https://developers.google.com/search/updates#may-2026)
- [Software app structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [Sitelinks search box retirement](https://developers.google.com/search/blog/2024/10/sitelinks-search-box)
