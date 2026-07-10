import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = await readFile(path.join(root, "public/assets/js/destinations-data.js"), "utf8");
const destinations = JSON.parse(source.match(/\[(.*)\]/s)[0]);

for (const destination of destinations) {
  const html = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${destination.name} Travel Planning Guide | JA Experiences &amp; Discovery</title>
  <meta name="description" content="Practical ${destination.name} travel planning guidance and personalised research support from JA Experiences & Discovery.">
  <link rel="stylesheet" href="/assets/css/theme.css?v=20260709-airo-2">
  <link rel="stylesheet" href="/assets/css/public-saas.css?v=20260710-public-finish-1">
  <script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="762d90c4-b030-45b0-9e70-c21806c665e3" data-blockingmode="auto" type="text/javascript"></script>
</head>
<body data-page="destinations">
  <div id="siteShellHeader"></div>
  <main id="destinationGuide" data-slug="${destination.slug}" data-name="${destination.name.replaceAll('"', "&quot;")}"></main>
  <div id="siteShellFooter"></div>
  <script src="/assets/js/site-shell.js?v=20260710-public-finish-1"></script>
  <script src="/assets/js/destination-page.js?v=20260620-6"></script>
</body>
</html>
`;
  await writeFile(path.join(root, "public/destinations", destination.slug, "index.html"), html);
}

console.log(`Generated ${destinations.length} destination guides.`);
