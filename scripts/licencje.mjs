#!/usr/bin/env node
/*
 * Licencje open source (Z-08-1, FOR-15, D-291; wzór: repo trening, scripts/licenses.mjs): lista pakietów npm, od których zależy aplikacja,
 * z licencją, notką o prawach autorskich i plikiem NOTICE — generowana z package-lock.json (graf `dependencies` aplikacji, bez devDependencies)
 * i plików LICENSE/NOTICE w node_modules. Wynik: assets/licencje.generated.json (dane poza plikami .ts: limit 20 480 B, CLAUDE.md §1.2),
 * pokazywany w Ustawieniach → Licencje open source (src/components/settings/LicencjeEkran.tsx).
 * Uproszczenie (nazwane): graf z package-lock obejmuje też narzędzia budowania wymagane przez pakiety aplikacji (np. Expo CLI) — lista jest
 * raczej za szeroka niż za wąska. Wyjątek (D-290 pkt 7): lightningcss i jego pakiety platformowe (MPL-2.0, narzędzie budowania CSS dla web,
 * nie trafia do binarki iOS) — pominięte, test tests/licencje-dane.test.ts pilnuje, że ich nie ma.
 * Czcionki i biblioteki natywne spoza npm: scripts/licencje-natywne.json (wersje pods sprawdzane z podspec React Native).
 * Użycie: node scripts/licencje.mjs (zapis) | --check (verify: błąd, gdy plik nie zgadza się z package-lock / node_modules).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'assets/licencje.generated.json');
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
const P = lock.packages;
const WYLACZONE = /^lightningcss(-|$)/;

/** Rozwiązanie zależności jak w Node: node_modules najbliżej pakietu, potem wyżej; bez wpisów dev. */
function resolve(from, dep) {
  let p = from;
  for (;;) {
    const k = (p ? p + '/' : '') + 'node_modules/' + dep;
    if (P[k] && !P[k].dev && !P[k].devOptional) return k;
    if (!p) return null;
    const i = p.lastIndexOf('/node_modules/');
    p = i < 0 ? '' : p.slice(0, i);
  }
}
const name = (k) => k.slice(k.lastIndexOf('node_modules/') + 'node_modules/'.length);
const seen = new Map();
const queue = Object.keys(P[''].dependencies ?? {}).map((d) => resolve('', d)).filter(Boolean);
while (queue.length) {
  const k = queue.pop();
  if (seen.has(k)) continue;
  const e = P[k];
  seen.set(k, e);
  for (const d of Object.keys({ ...e.dependencies, ...e.optionalDependencies, ...e.peerDependencies })) {
    if (e.peerDependenciesMeta?.[d]?.optional && !e.dependencies?.[d] && !e.optionalDependencies?.[d]) continue; // opcjonalny peer nie jest częścią aplikacji
    const r = resolve(k, d);
    if (r && !seen.has(r)) queue.push(r);
  }
}

const plikiPasujace = (dir, re) => { try { return readdirSync(join(root, dir)).filter((f) => re.test(f)).sort(); } catch { return []; } };
const licenseFiles = (dir) => plikiPasujace(dir, /^(licen[cs]e|copying)([._-].*)?$/i);
const noticeFiles = (dir) => plikiPasujace(dir, /^notice(\.[a-z]+)?$/i);
const COPY = /^\s*(?:copyright\b|\(c\)\s*\d|©)/i;
const PLACEHOLDER = /<[^>]+>|\[[^\]]*(?:yyyy|year|name)[^\]]*\]|copyright (?:notice|holders?|owner)|copyright and license|^\s*copyright\s*$/i;
const clean = (s) => s.replace(/\s+/g, ' ').trim();
const norm = (s) => s.replace(/\r\n/g, '\n').trim();
function copyrights(dir, pkgJson) {
  const out = [];
  for (const f of licenseFiles(dir)) {
    for (const line of readFileSync(join(root, dir, f), 'utf8').split(/\r?\n/)) {
      const l = clean(line);
      if (COPY.test(l) && /\d{4}|©|\(c\)/i.test(l) && !PLACEHOLDER.test(l) && l.length <= 200 && !out.includes(l)) out.push(l);
    }
  }
  if (!out.length && pkgJson) {
    const a = typeof pkgJson.author === 'string' ? pkgJson.author : pkgJson.author?.name;
    if (a) out.push(`© ${clean(a.replace(/\s*[<(][^>)]*[>)]/g, ''))}`);
  }
  return out.slice(0, 3);
}

const rows = [];
for (const [k, e] of seen) {
  if (WYLACZONE.test(name(k))) continue;
  let pj = null;
  try { pj = JSON.parse(readFileSync(join(root, k, 'package.json'), 'utf8')); } catch { /* brak pliku: dane z package-lock */ }
  const lic = e.license ?? (typeof pj?.license === 'string' ? pj.license : Array.isArray(pj?.licenses) ? pj.licenses.map((x) => x.type ?? x).join(' OR ') : 'UNKNOWN');
  const nf = noticeFiles(k)[0];
  rows.push({ nazwa: name(k), wersja: e.version ?? pj?.version ?? '', licencja: lic, notki: copyrights(k, pj), dir: k, notice: nf ? norm(readFileSync(join(root, k, nf), 'utf8')) : undefined });
}
rows.sort((a, b) => (a.nazwa < b.nazwa ? -1 : a.nazwa > b.nazwa ? 1 : a.wersja < b.wersja ? -1 : a.wersja > b.wersja ? 1 : 0));
const uniq = [];
for (const r of rows) { const last = uniq[uniq.length - 1]; if (last && last.nazwa === r.nazwa && last.wersja === r.wersja) continue; uniq.push(r); }

/* treść licencji: z pliku LICENSE pierwszego pakietu z tą (prostą) licencją, bez linii z prawami autorskimi (notki są przy pakietach) */
const ids = [...new Set(uniq.flatMap((r) => r.licencja.replace(/[()]/g, ' ').split(/\s+(?:OR|AND)\s+|\s+/).filter((x) => x && x !== 'OR' && x !== 'AND')))].sort();
const teksty = {};
for (const id of ids) {
  const src = uniq.find((r) => r.licencja === id && licenseFiles(r.dir).length) ?? uniq.find((r) => r.licencja.includes(id) && licenseFiles(r.dir).length && !/\b(OR|AND)\b/.test(r.licencja));
  if (!src) continue;
  const txt = readFileSync(join(root, src.dir, licenseFiles(src.dir)[0]), 'utf8').split(/\r?\n/).filter((l) => !(COPY.test(clean(l)) && !PLACEHOLDER.test(clean(l)))).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  teksty[id] = { zrodlo: src.nazwa, tekst: txt };
}

/* Biblioteki natywne spoza npm i czcionki: scripts/licencje-natywne.json; wersje pods z podspec React Native (zmiana wersji RN bez aktualizacji listy = błąd) */
const RN = join(root, 'node_modules/react-native');
const LISTA = JSON.parse(readFileSync(join(root, 'scripts/licencje-natywne.json'), 'utf8'));
const helpers = readFileSync(join(RN, 'scripts/cocoapods/helpers.rb'), 'utf8');
const podVersion = (pod) => pod === 'RCT-Folly' ? /@@folly_config = \{\s*:version => '([^']+)'/.exec(helpers)?.[1]
  : pod === 'SocketRocket' ? /@@socket_rocket_config = \{\s*:version => '([^']+)'/.exec(helpers)?.[1]
  : existsSync(join(RN, 'third-party-podspecs', pod + '.podspec')) ? /spec\.version\s*=\s*['"]([^'"]+)['"]/.exec(readFileSync(join(RN, 'third-party-podspecs', pod + '.podspec'), 'utf8'))?.[1] : undefined;
const bledy = [];
for (const p of LISTA.pods) if (podVersion(p.pod) !== p.version) bledy.push(`${p.pod}: lista ${p.version}, podspec ${podVersion(p.pod) ?? 'brak'}`);
for (const f of readdirSync(join(RN, 'third-party-podspecs')).filter((f) => f.endsWith('.podspec') && f !== 'ReactNativeDependencies.podspec')) {
  if (!LISTA.pods.some((p) => p.pod + '.podspec' === f)) bledy.push(`${f}: brak na liście scripts/licencje-natywne.json`);
}
for (const p of LISTA.pods) {
  if (teksty[p.license]) continue;
  const f = join(root, 'scripts/licencje-natywne', p.license + '.txt');
  if (existsSync(f)) teksty[p.license] = { zrodlo: p.name, tekst: norm(readFileSync(f, 'utf8')) };
  else bledy.push(`${p.pod}: brak treści licencji ${p.license} (scripts/licencje-natywne/${p.license}.txt)`);
}
/* czcionki: plik licencji kroju z repo jest źródłem treści (zastępuje ewentualną treść z pakietu o tym samym SPDX) */
for (const f of LISTA.fonts ?? []) {
  if (!existsSync(join(root, f.file))) { bledy.push(`${f.name}: brak pliku licencji ${f.file}`); continue; }
  teksty[f.license] = { zrodlo: f.name, tekst: norm(readFileSync(join(root, f.file), 'utf8')) };
}
if (bledy.length) { console.error('licencje natywne:\n  ' + bledy.join('\n  ')); process.exit(1); }

const wpis = (nazwa, wersja, licencja, notki, notice) => ({ nazwa, wersja, licencja, notki, ...(notice ? { notice } : {}) });
const wszystkie = [...uniq.map((r) => r.licencja), ...LISTA.pods.map((p) => p.license), ...(LISTA.fonts ?? []).map((f) => f.license)];
const uzyte = [...new Set(wszystkie.flatMap((l) => l.replace(/[()]/g, ' ').split(/\s+(?:OR|AND)\s+|\s+/).filter((x) => x && x !== 'OR' && x !== 'AND')))].sort();
const dane = {
  _opis: 'Wygenerowane: node scripts/licencje.mjs (Z-08-1, FOR-15) — nie edytuj ręcznie; verify sprawdza zgodność (--check). pakiety: pakiety npm, od których zależy aplikacja (package-lock, bez devDependencies i lightningcss); czcionki i natywne: scripts/licencje-natywne.json.',
  pakiety: uniq.map((r) => wpis(r.nazwa, r.wersja, r.licencja, r.notki, r.notice)),
  czcionki: (LISTA.fonts ?? []).map((f) => wpis(f.name, f.version, f.license, f.copyright)),
  natywne: LISTA.pods.map((p) => wpis(p.name, p.version, p.license, p.copyright)),
  teksty: Object.fromEntries(Object.entries(teksty).sort(([a], [b]) => (a < b ? -1 : 1))),
  bezTresci: uzyte.filter((id) => !teksty[id]),
};
const body = JSON.stringify(dane) + '\n';
if (process.argv.includes('--check')) {
  const cur = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (cur !== body) { console.error('licencje: assets/licencje.generated.json nie zgadza się z package-lock.json / node_modules — uruchom: node scripts/licencje.mjs'); process.exit(1); }
  console.log(`licencje: OK (${dane.pakiety.length} pakietów, ${dane.natywne.length} bibliotek natywnych, ${dane.czcionki.length} czcionek, ${Object.keys(dane.teksty).length} treści licencji)`);
} else {
  writeFileSync(OUT, body);
  console.log(`licencje: zapisano ${dane.pakiety.length} pakietów, ${Object.keys(dane.teksty).length} treści licencji; bez treści: ${dane.bezTresci.join(', ') || '—'}`);
}
