// A local preview that serves the site the way Vercel does (vercel.json: cleanUrls), so links
// without ".html" work: /about is about.html, and /about.html redirects to /about.
//   node serve.mjs [port]     (default 4318)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".vcf": "text/vcard" };
const isFile = (f) => stat(f).then((s) => s.isFile(), () => false);

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith(".html")) {
    res.writeHead(308, { Location: (p === "/index.html" ? "/" : p.slice(0, -5)) + url.search });
    return res.end();
  }
  if (p === "/") p = "/index.html";
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  if (!(await isFile(file)) && (await isFile(`${file}.html`))) file += ".html";
  if (!(await isFile(file))) {
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    return res.end(await readFile(path.join(ROOT, "404.html")).catch(() => "Not found"));
  }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  res.end(await readFile(file));
}).listen(Number(process.argv[2]) || 4318, "127.0.0.1");
