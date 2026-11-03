// arkusz.mjs — arkusz zbiorczy „przed / po” z gotowych PNG (rola 04, M3 E3, 2026-11-03).
// Użycie: node arkusz.mjs <opis.json> <wyjście.png>
// opis.json: { "tytul": "…", "kolumny": [ { "podpis": "…", "plik": "ścieżka.png", "wys": 900 } , … ], "uwaga": "…" }
// Ścieżki w opisie liczone względem katalogu opisu. Obrazy skalowane do wspólnej wysokości (domyślnie 900 px).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const [opisPlik, wyjscie] = process.argv.slice(2);
if (!opisPlik || !wyjscie) { console.error('Użycie: node arkusz.mjs <opis.json> <wyjście.png>'); process.exit(2); }
const opis = JSON.parse(readFileSync(opisPlik, 'utf8'));
const baza = dirname(resolve(opisPlik));
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const wys = opis.wys || 900;
const kol = opis.kolumny.map((k) => `<figure><img src="${pathToFileURL(resolve(baza, k.plik)).href}" style="height:${k.wys || wys}px"><figcaption>${esc(k.podpis)}</figcaption></figure>`).join('');
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:24px;background:#D9DAD5;font:15px/1.35 "Noto Sans",sans-serif;color:#1C1D1B;display:inline-block}
h1{font:700 24px "Noto Sans",sans-serif;margin:0 0 4px} p{margin:0 0 16px;max-width:1400px;color:#4B4D48}
.r{display:flex;gap:20px;align-items:flex-start} figure{margin:0;display:flex;flex-direction:column;gap:8px}
img{display:block;box-shadow:0 1px 4px #0003;border-radius:6px} figcaption{font-weight:600;max-width:420px}
</style><h1>${esc(opis.tytul)}</h1><p>${esc(opis.uwaga || '')}</p><div class="r">${kol}</div>`;
const b = await chromium.launch();
const s = await b.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
const tmp = resolve(wyjscie) + '.tmp.html'; writeFileSync(tmp, html);
await s.goto(pathToFileURL(tmp).href);
await s.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => { throw new Error('brak obrazu ' + i.src); }))));
await s.locator('body').screenshot({ path: wyjscie });
await b.close(); unlinkSync(tmp);
console.log('OK', wyjscie);
