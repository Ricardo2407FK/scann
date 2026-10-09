# SEO configuration and release checks

The public production hostname is `https://www.scanterity.com`. The bare domain
redirects there with HTTP 308 (verified on October 9, 2026). Keep hosting redirects,
canonical tags, Open Graph URLs, structured data, and the sitemap on that hostname.
Shared metadata lives in `src/lib/seo.ts`.

All five public pages have individual English titles, descriptions, canonical URLs,
and social metadata. The existing page content, styling, and checker are unchanged.
Rendering assets are crawlable; API routes remain excluded from crawling.

## After deployment

1. Verify ownership in Google Search Console and Bing Webmaster Tools. DNS
   verification works without code changes. For HTML meta verification, set
   `GOOGLE_SITE_VERIFICATION` and/or `BING_SITE_VERIFICATION` in the build environment
   to the actual verification token (the meta tag's `content` value), then rebuild
   and deploy. Unset tokens produce no verification tag. Never use a placeholder.
2. Submit `https://www.scanterity.com/sitemap.xml` in both webmaster tools.
3. Use Search Console URL Inspection on the homepage and confirm that the rendered
   content is available and Google's selected canonical matches the declared URL.
   Request indexing after deploying the corrections.
4. Check the live robots file, sitemap, canonical tags, and response status codes.
   Public pages should return 200; missing pages should return 404 with `noindex`.
5. Validate JSON-LD using the Schema Markup Validator and inspect eligible features
   with Google's Rich Results Test. Software-app rich results require additional
   genuine review/rating data; the site must not invent ratings to satisfy that test.
6. Review indexing, search queries, clicks, and real-user Core Web Vitals in Search
   Console after Google recrawls the release.

The sitemap intentionally omits `lastmod`: deployment time is not a reliable content
revision date. Add dates only when they track substantive page updates. Add new
indexable routes to `PUBLIC_PATHS` and give each its own metadata.

Structured data describes only site identity and the homepage application. The
previous unsubstantiated rating, nonexistent site-search action, duplicate homepage
breadcrumb, and mismatched FAQ markup were removed. No rating or rich-result
eligibility is promised.

Technical SEO cannot guarantee a ranking. Future content work should substantiate
accuracy, comparison, usage, and privacy claims on the visible pages; those claims
were not rewritten in this change because preserving the site was requested.

References: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
[structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies),
and [software-app requirements](https://developers.google.com/search/docs/appearance/structured-data/software-app).
