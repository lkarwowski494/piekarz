// Nazwy mąk w słownikach EN i 33 języków: (1) przekład klucza z „typ NNN” zawiera NNN; (2) jedna mąka (zboże + typ) = jedna nazwa w języku.
// Użycie: node sprawdz-maki.mjs [repo=.]  Kod 0: bez naruszeń; 1: naruszenia.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const repo = process.argv[2] ?? '.';
const PARA = /'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g;
const slownik = (dir) => {
  const o = {};
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.ts'))) for (const m of readFileSync(join(dir, f), 'utf8').matchAll(PARA)) o[m[1]] = m[2];
  return o;
};
const jezyki = { en: slownik(join(repo, 'src/lib/i18n-en')) };
for (const k of readdirSync(join(repo, 'src/lib/i18n-slowniki'))) if (!k.endsWith('.ts')) jezyki[k] = slownik(join(repo, 'src/lib/i18n-slowniki', k));
const MAKA = /^Mąka (pszenna|żytnia|orkiszowa)\b.*?\btyp (\d{3,4})(?!\s*\/)/;
let bez = 0, wiele = 0;
for (const [jez, s] of Object.entries(jezyki)) {
  const wg = new Map();
  for (const [k, v] of Object.entries(s)) {
    const m = k.match(MAKA); if (!m || / lub /.test(k)) continue;
    if (!v.includes(m[2])) { bez++; console.log(`BEZ NUMERU ${jez}: „${k}” → „${v}”`); }
    const klucz = `${m[1]} ${m[2]}`; wg.set(klucz, new Set([...(wg.get(klucz) ?? []), v]));
  }
  for (const [kl, nazwy] of wg) if (nazwy.size > 1) { wiele++; console.log(`WIELE NAZW ${jez}: ${kl} → ${[...nazwy].map((n) => `„${n}”`).join(', ')}`); }
}
console.log(`języki: ${Object.keys(jezyki).length}; przekłady bez numeru typu: ${bez}; mąki z więcej niż jedną nazwą w języku: ${wiele}`);
process.exitCode = bez || wiele ? 1 : 0;
