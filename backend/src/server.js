import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = resolve(fileURLToPath(new URL(".", import.meta.url)));
const frontendDist = resolve(here, "../../frontend/dist");
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function sendFile(response, filePath) {
  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  createReadStream(filePath).pipe(response);
}

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || "/").split("?")[0]);
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const requestedFile = join(frontendDist, safePath);
  const filePath = existsSync(requestedFile) && statSync(requestedFile).isFile()
    ? requestedFile
    : join(frontendDist, "index.html");

  if (!existsSync(filePath)) {
    response.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Build the frontend first with: npm run build");
    return;
  }

  sendFile(response, filePath);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`ZyID local server listening on http://0.0.0.0:${port}`);
});