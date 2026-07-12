import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL("../public/", import.meta.url);
const launchDate = new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString();
const server = createServer(async (request, response) => {
  if (request.url === "/api/coming-soon-config") {
    response.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    response.end(JSON.stringify({ success: true, countdownEnabled: true, launchDate, headline: "Coming Soon", subtext: "Preparing to launch", description: "A signed-out local rendering harness.", features: ["Guided Experience Builders", "Subscription Plans"] }));
    return;
  }
  const pathname = request.url.split("?")[0] === "/coming-soon/" ? "/coming-soon/index.html" : request.url.split("?")[0];
  const safe = normalize(pathname).replace(/^([/\\])+/, "");
  try {
    const body = await readFile(new URL(safe, root));
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };
    response.writeHead(200, { "Content-Type": types[extname(safe)] || "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});
server.listen(8791, "127.0.0.1", () => console.log("Coming Soon harness listening on http://127.0.0.1:8791/coming-soon/"));
