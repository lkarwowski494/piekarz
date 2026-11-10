import http from 'node:http'; import { readFile, stat } from 'node:fs/promises'; import { join, extname } from 'node:path';
const root = process.argv[2], port = Number(process.argv[3] || 8089);
const typy = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.wasm':'application/wasm', '.png':'image/png', '.ttf':'font/ttf', '.otf':'font/otf', '.json':'application/json', '.ico':'image/x-icon', '.svg':'image/svg+xml' };
http.createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); let f = join(root, p);
  try { if ((await stat(f)).isDirectory()) f = join(f, 'index.html'); } catch { f = join(root, 'index.html'); }
  try { const b = await readFile(f); res.writeHead(200, { 'Content-Type': typy[extname(f)] || 'application/octet-stream', 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(port, () => console.log('ok', port));
