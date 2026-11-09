// Porównuje dane pieczenia receptur w src/recipes/*.ts z wektorem roli 06 (docs/tresci/wektory/pieczenie-receptur-2026-11-09.json).
// Użycie: node sprawdz-pieczenie.mjs [repo=.]  Kod 0: zgodne; 1: rozbieżności. Parametry „plan.*” i „faza.*” pomija (logika roli 08).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const repo = process.argv[2] ?? '.';
const w = JSON.parse(readFileSync(join(repo, 'docs/tresci/wektory/pieczenie-receptur-2026-11-09.json'), 'utf8'));
const dane = {};
for (const f of readdirSync(join(repo, 'src/recipes')).filter((f) => /^(presets|katalog-m3)-.*\.ts$/.test(f))) {
  let id = null;
  for (const l of readFileSync(join(repo, 'src/recipes', f), 'utf8').split('\n')) {
    const m = l.match(/^\s{4}id: '([^']+)'/); if (m) { id = m[1]; dane[id] = {}; continue; }
    const p = l.match(/^\s{4}(bakeTimeSteamMinutes|bakeTimeBrowningMinutes|bakeTempSteamC|bakeTempBrowningC|recommendedVessel): '?([\w.]+)'?,/);
    if (id && p) dane[id][p[1]] = isNaN(Number(p[2])) ? p[2] : Number(p[2]);
  }
}
let bledy = 0, ok = 0;
for (const p of w.parametry) {
  const [id, pole] = p.parametr.split('.');
  if (!dane[id] || !(pole in dane[id])) continue;
  const v = dane[id][pole];
  const zgodne = p.granica === 'przedział' ? v >= p.min && v <= p.max : v === p.wartosc;
  if (zgodne) ok++; else { bledy++; console.log(`ROZBIEŻNE ${p.parametr}: kod ${v}, wektor ${p.granica === 'przedział' ? `${p.min}–${p.max}` : p.wartosc} (${p.twierdzenie})`); }
}
console.log(`${ok} zgodnych, ${bledy} rozbieżnych`);
process.exitCode = bledy ? 1 : 0;
