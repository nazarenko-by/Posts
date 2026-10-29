// Мінімальний статичний сервер з gzip - однаковий для всіх трьох збірок.
// node scripts/serve.mjs <папка> <порт>
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";

const [root, port = "4400"] = process.argv.slice(2);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".json": "application/json" };

createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(root, path);
  try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); } catch { file = join(root, "index.html"); }
  try {
    const body = await readFile(file);
    const gz = /gzip/.test(req.headers["accept-encoding"] || "");
    res.writeHead(200, {
      "content-type": TYPES[extname(file)] || "application/octet-stream",
      "cache-control": "no-store",
      ...(gz ? { "content-encoding": "gzip" } : {}),
    });
    res.end(gz ? gzipSync(body) : body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(Number(port), () => console.log(`serving ${root} on http://localhost:${port}`));
