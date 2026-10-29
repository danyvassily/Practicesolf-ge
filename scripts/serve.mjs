import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../dist/", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};
const server = http.createServer(async (req, res) => {
  try {
    const name = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      ),
      file = path.resolve(root, "." + (name === "/" ? "/index.html" : name));
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403).end("Accès refusé");
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, {
      "content-type": types[path.extname(file)] || "application/octet-stream",
      "x-content-type-options": "nosniff",
    });
    res.end(data);
  } catch {
    res.writeHead(404).end("Introuvable");
  }
});
const port = Number(process.env.PORT || 4173);
server.listen(port, "0.0.0.0", () =>
  console.log("Atelier Piano : http://localhost:" + port),
);
