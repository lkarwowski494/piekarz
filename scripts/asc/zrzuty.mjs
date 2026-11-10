#!/usr/bin/env node
// ============================================================================
// Piekarz — wgranie zrzutów sklepu do App Store Connect przez App Asset Library (KO-033, właściciel 2026-11-10: „Przenieść jak
// Oczko”; D-366). Port z oczko `scripts/asc/zrzuty.mjs` @ 87ade5a (tam z Treningu 2e4b0f8, przebiegi 41008000769 i 41023082786).
// Wejście: artefakt `sklep-ramki` z przebiegu zrzuty-sklepu.yml: <katalog>/<kod lokalizacji ASC>/<klasa>/NN-<ekran>.png
// (kody = pliki docs/wydanie/metadane/*.json, każdy z własnym zestawem). Klucz API i klient: scripts/asc-ustawienia.mjs (JWT ES256).
//
// Interfejs App Asset Library (D-354: appScreenshotSets/appScreenshots przestarzałe w API 4.5; odczyt dokumentacji 2026-11-10
// w D-354, opis kroków za Oczkiem): obraz wgrywany raz (rezerwacja POST /v1/appAssetLibraryImages → PUT części pod adresy
// z rezerwacji → PATCH uploaded: true), czekanie na przetworzenie, potem placement APP_SCREENSHOT na lokalizacji wersji
// i kolejność jednym żądaniem. Grupę urządzeń wybiera skrypt z /v1/appAssetLibraryRefData po dokładnych wymiarach pliku.
// Duplikatem w bibliotece jest nazwa referencyjna (409 DUPLICATE, wniosek Treningu), więc obraz najpierw szukany po niej.
//
// Zasady: NIGDY nie usuwa (klient bez DELETE); grupa, która ma już zrzuty, jest pomijana (zamiana = ręcznie w ASC); zapis tylko do
// edytowalnej wersji; zapis tylko z plikiem zgody docs/wydanie/asc-zgoda-zrzuty.json ("zapis": true i "skrot" = skrót planu z przebiegu
// na sucho, jak asc-zgoda-zgloszenie.json) i w środowisku release (workflow). W logu tylko kody lokalizacji, nazwy plików, grupy i liczby.
//
// Użycie: node scripts/asc/zrzuty.mjs --katalog <sklep-ramki> [--klasa iphone-6.9] [--lokalizacje pl,en-US] [--zgoda <plik>] [--api URL]
//   bez --zgoda albo ze zgodą wyłączoną: przebieg na sucho (tylko GET). Kody: 0 wynik; 1 błąd danych albo API; 3 zgoda na inny plan; 4 brak uprawnień (403).
// ============================================================================

import { appendFileSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BladApi, BladDanych, BladZgody, klient, sekrety, zaciemnij } from '../asc-ustawienia.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const API_DOMYSLNE = 'https://api.appstoreconnect.apple.com';
export const KLASY = ['iphone-6.9', 'iphone-6.3'];
export const PLACEMENT_TYPE = 'APP_SCREENSHOT';
export const ASSET_CATEGORY = 'APP_SCREENSHOTS_AND_PREVIEWS';
export const FEATURE_ID = 'APP_STORE_VERSIONS';
/** Limit Apple na grupę, gdy dane referencyjne go nie podają (10 zrzutów na grupę, jak Oczko). */
export const DEFAULT_MAX_PER_GROUP = 10;
/** Czekanie na przetworzenie obrazu: do 30 min na obraz, odstęp od 5 s do 60 s (Trening: część obrazów „Processing” ponad 10 min). */
export const WAIT_MS = 30 * 60 * 1000;
export const POLL_START_MS = 5000;
export const POLL_MAX_MS = 60000;
/** Stany wersji, w których ASC przyjmuje zmiany (jak EDYTOWALNE w scripts/asc-zgloszenie.mjs). */
export const EDYTOWALNE = ['PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED', 'INVALID_BINARY'];

const e = encodeURIComponent;
const md5 = (b) => createHash('md5').update(b).digest('hex');
const sha = (s) => createHash('sha256').update(s).digest('hex');
export const kodyLokalizacji = (root = ROOT) => readdirSync(join(root, 'docs/wydanie/metadane')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();

/** Lista kodów rozdzielona przecinkami → tablica (pusta = wszystkie) albo { blad }. */
export function parsujLokalizacje(tekst, dozwolone) {
  const kody = String(tekst ?? '').split(',').map((x) => x.trim()).filter(Boolean);
  if (kody.some((x) => !/^[A-Za-z0-9-]{2,10}$/.test(x))) return { blad: 'lokalizacje: litery, cyfry i myślnik, rozdzielone przecinkami' };
  const zle = kody.filter((x) => !dozwolone.includes(x));
  if (zle.length) return { blad: `lokalizacje spoza docs/wydanie/metadane: ${zle.join(', ')}` };
  return [...new Set(kody)];
}

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
/** Wymiary i kanał alfa z nagłówka PNG (IHDR). */
export function pngInfo(buf) {
  if (buf.length < 26 || !buf.subarray(0, 8).equals(PNG_SIG)) throw new Error('to nie jest plik PNG');
  const typ = buf[25];
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), alpha: typ === 4 || typ === 6 };
}

/** Pliki z <katalog>/<kod>/<klasa>/*.png → Map(kod → [{ name, path, size, md5, width, height, alpha }]) i problemy. */
export function wczytajZrzuty({ katalog, klasa, lokalizacje = '', root = ROOT }) {
  const problemy = []; const zrzuty = new Map();
  const wszystkie = kodyLokalizacji(root);
  const wybor = parsujLokalizacje(lokalizacje, wszystkie);
  if ('blad' in wybor) return { zrzuty, problemy: [wybor.blad] };
  if (!KLASY.includes(klasa)) return { zrzuty, problemy: [`klasa: ${KLASY.join(' albo ')}`] };
  if (!katalog || !existsSync(katalog)) return { zrzuty, problemy: [`brak katalogu ${katalog ?? ''}`] };
  const kody = wybor.length ? wybor : wszystkie;
  for (const kod of kody) {
    const d = join(katalog, kod, klasa);
    if (!existsSync(d) || !statSync(d).isDirectory()) { problemy.push(`brak zrzutów ${kod}/${klasa}`); continue; }
    const lista = [];
    for (const f of readdirSync(d).filter((n) => /\.png$/i.test(n)).sort()) {
      try { const b = readFileSync(join(d, f)); lista.push({ name: f, path: join(d, f), size: b.length, md5: md5(b), ...pngInfo(b) }); }
      catch (err) { problemy.push(`${kod}/${klasa}/${f}: ${err.message}`); }
    }
    if (lista.length) zrzuty.set(kod, lista); else problemy.push(`brak plików PNG w ${kod}/${klasa}`);
  }
  for (const n of readdirSync(katalog)) if (!n.startsWith('.') && !wszystkie.includes(n)) problemy.push(`katalog ${n} nie jest lokalizacją sklepu (docs/wydanie/metadane)`);
  return { zrzuty, problemy };
}

/** Grupy urządzeń dla wymiarów pliku: specyfikacje obrazu (bez alfy) → grupy z specMappings typu APP_SCREENSHOT. */
export function groupsFor({ refData, width, height }) {
  const specs = (refData.imageSpecs ?? []).filter((s) => s.alphaAllowed === false && s.dimensions && s.dimensions.minWidth <= width && width <= s.dimensions.maxWidth
    && s.dimensions.minHeight <= height && height <= s.dimensions.maxHeight && (s.compatiblePlacementTypes ?? [PLACEMENT_TYPE]).includes(PLACEMENT_TYPE)).map((s) => s.specId);
  const type = (refData.placementTypes ?? []).find((t) => t.placementTypeId === PLACEMENT_TYPE);
  return [...new Set((type?.specMappings ?? []).filter((m) => (m.specs ?? []).some((id) => specs.includes(id))).map((m) => m.placementGroupId))];
}

/** Limit zrzutów na grupę z danych referencyjnych; brak danych → 10. */
export function maxPerGroup(refData, group) {
  for (const f of refData.features ?? []) {
    if ((f.featureId ?? f.feature ?? f.id) !== FEATURE_ID) continue;
    for (const p of f.placementPolicies ?? []) {
      if ((p.placementTypeId ?? p.placementType) !== PLACEMENT_TYPE) continue;
      for (const g of p.groupLimits ?? []) if ((g.groupIds ?? []).includes(group) && Number.isInteger(g.maxCount)) return g.maxCount;
    }
  }
  return DEFAULT_MAX_PER_GROUP;
}

/** Klient bez DELETE: tylko jeden, wszystkie, post, patch (skrypt nigdy nie usuwa). */
export const bezUsuwania = (k) => ({ jeden: k.jeden, wszystkie: k.wszystkie, post: k.post, patch: k.patch });

const stanWersji = (r) => r.attributes?.appStoreState ?? r.attributes?.appVersionState ?? '';
/** Aplikacja, edytowalna wersja iOS, jej lokalizacje, biblioteka i dane referencyjne (tylko GET). */
export async function odkryj(k, bundleId) {
  const apps = (await k.wszystkie(`/v1/apps?filter[bundleId]=${e(bundleId)}&limit=200`)).data;
  if (apps.length !== 1) throw new BladDanych(`App Store Connect: aplikacji ${bundleId} nie znaleziono`);
  const app = apps[0].id;
  const wersje = (await k.wszystkie(`/v1/apps/${e(app)}/appStoreVersions?filter[platform]=IOS&limit=200`)).data;
  const w = wersje.find((x) => EDYTOWALNE.includes(stanWersji(x))) ?? null;
  const lok = w ? new Map((await k.wszystkie(`/v1/appStoreVersions/${e(w.id)}/appStoreVersionLocalizations?limit=200`)).data.map((l) => [l.attributes?.locale, l.id])) : new Map();
  const lib = await k.jeden(`/v1/apps/${e(app)}/assetLibrary`);
  const ref = await k.jeden('/v1/appAssetLibraryRefData');
  const refData = (Array.isArray(ref) ? ref[0]?.attributes : ref?.attributes) ?? {};
  return { wersja: w, lok, biblioteka: lib?.id ?? null, refData, stany: wersje.map(stanWersji) };
}

/** Plan: wiersze { kod, locId, group, files, action: 'wgraj'|'pomiń', reason } i błędy. `istniejace(locId, group)` → liczba placementów grupy. */
export async function planuj({ zrzuty, lok, refData, istniejace }) {
  const wiersze = []; const bledy = [];
  for (const [kod, pliki] of zrzuty) {
    const grupy = new Map();
    for (const f of pliki) {
      if (f.alpha) { bledy.push(`${kod}/${f.name}: kanał alfa (Apple: obrazy bez alfy)`); continue; }
      const g = groupsFor({ refData, width: f.width, height: f.height });
      if (g.length !== 1) { bledy.push(`${kod}/${f.name}: ${f.width}×${f.height} — ${g.length ? `niejednoznaczna grupa (${g.join(', ')})` : 'brak pasującej specyfikacji w danych Apple'}`); continue; }
      if (!grupy.has(g[0])) grupy.set(g[0], []);
      grupy.get(g[0]).push(f);
    }
    for (const [group, gf] of grupy) {
      const max = maxPerGroup(refData, group);
      if (gf.length > max) { bledy.push(`${kod}: ${gf.length} zrzutów w grupie ${group} > limit ${max}`); continue; }
      const locId = lok.get(kod);
      if (!locId) { wiersze.push({ kod, group, files: gf, action: 'pomiń', reason: 'brak lokalizacji wersji w ASC (najpierw zgłoszenie metadanych, asc-zgloszenie.yml)' }); continue; }
      const ma = await istniejace(locId, group);
      if (ma > 0) { wiersze.push({ kod, locId, group, files: gf, action: 'pomiń', reason: `grupa ma już ${ma} zrzutów (nic nie usuwam; zamiana ręcznie w ASC)${ma < gf.length ? ` — niekompletna: ${ma} z ${gf.length}` : ''}` }); continue; }
      wiersze.push({ kod, locId, group, files: gf, action: 'wgraj', reason: '' });
    }
  }
  return { wiersze, bledy };
}

/** Skrót planu (zgoda): lokalizacja, grupa i pliki z sumą MD5 każdego wiersza do wgrania; bez identyfikatorów ASC. */
export const skrot = (wiersze) => sha(wiersze.filter((w) => w.action === 'wgraj').map((w) => `${w.kod}|${w.group}|${w.files.map((f) => `${f.name}:${f.md5}`).join(',')}`).join('\n'));

export const tabela = (wiersze) => ['| Lokalizacja | Grupa urządzeń | Zrzuty | Działanie |', '|---|---|---|---|',
  ...wiersze.map((w) => `| ${w.kod} | ${w.group ?? '—'} | ${w.files?.length ?? 0} | ${w.action}${w.reason ? ` — ${w.reason}` : ''}${w.error ? ' (błąd)' : ''} |`)].join('\n');

const gotowy = (st) => !!st && !['AWAITING_UPLOAD', 'UPLOAD_COMPLETE', 'FAILED'].includes(st);
const uzywalny = (img, size) => img.size === size && !['FAILED', 'AWAITING_UPLOAD', 'ARCHIVED', 'REJECTED'].includes(img.state);
export const znajdzObraz = (lib, ref, size) => lib.filter((i) => i.ref === ref && uzywalny(i, size)).sort((x, y) => y.created.localeCompare(x.created))[0] ?? null;
export const czytajBiblioteke = async (k, id) => (await k.wszystkie(`/v1/appAssetLibraries/${e(id)}/images?limit=200`)).data
  .map((r) => ({ id: r.id, ref: r.attributes?.referenceName ?? '', size: r.attributes?.fileSize, state: r.attributes?.state ?? '', created: r.attributes?.createdDate ?? '' }));

/** Rezerwacja → PUT części (adresy z odpowiedzi, bez nagłówka Authorization) → uploaded: true. */
async function wyslij({ k, fetchFn, biblioteka, ref, file, body }) {
  const r = await k.post('/v1/appAssetLibraryImages', { data: { type: 'appAssetLibraryImages',
    attributes: { fileName: file.name, fileSize: body.length, category: ASSET_CATEGORY, referenceName: ref },
    relationships: { assetLibrary: { data: { type: 'appAssetLibraries', id: biblioteka } } } } });
  const id = r.data.id;
  for (const op of r.data.attributes?.uploadOperations ?? []) {
    const headers = Object.fromEntries((op.requestHeaders ?? []).map((h) => [h.name, h.value]));
    const w = await fetchFn(op.url, { method: op.method, headers, body: body.subarray(op.offset, op.offset + op.length) });
    if (!w.ok) throw new Error(`wgrywanie części pliku ${file.name} → ${w.status}`);
  }
  await k.patch(`/v1/appAssetLibraryImages/${e(id)}`, { data: { type: 'appAssetLibraryImages', id, attributes: { uploaded: true } } });
  return id;
}

/** Obraz dla nazwy referencyjnej: istniejący (ponowne użycie) albo nowy; zły stary dostaje inną nazwę (nic nie usuwam). */
export async function obraz({ k, fetchFn, biblioteka, lib, ref, file, body, now }) {
  const jest = znajdzObraz(lib, ref, body.length);
  if (jest) return { id: jest.id, file, reused: true, since: now(), done: gotowy(jest.state) };
  for (const stary of lib.filter((i) => i.ref === ref)) {
    await k.patch(`/v1/appAssetLibraryImages/${e(stary.id)}`, { data: { type: 'appAssetLibraryImages', id: stary.id, attributes: { referenceName: `${ref} [zastąpiony ${String(stary.id).slice(0, 8)}]` } } });
  }
  try {
    return { id: await wyslij({ k, fetchFn, biblioteka, ref, file, body }), file, reused: false, since: now(), done: false };
  } catch (err) {
    if (!(err instanceof BladApi) || err.status !== 409 || !/DUPLICATE/.test(err.message)) throw err;
    const znow = znajdzObraz(await czytajBiblioteke(k, biblioteka), ref, body.length);
    if (!znow) throw new Error(`nazwa referencyjna ${file.name} zajęta, a obrazu nie da się użyć ponownie`);
    return { id: znow.id, file, reused: true, since: now(), done: gotowy(znow.state) };
  }
}

/** Czeka na przetworzenie wszystkich obrazów (rosnący odstęp, do WAIT_MS na obraz). */
export async function czekaj({ k, obrazy, sleep, now }) {
  let odstep = POLL_START_MS;
  for (;;) {
    const czeka = obrazy.filter((i) => !i.done && !i.error);
    if (!czeka.length) return;
    for (const im of czeka) {
      try {
        const st = (await k.jeden(`/v1/appAssetLibraryImages/${e(im.id)}`))?.attributes?.state;
        if (st === 'FAILED') im.error = `przetwarzanie ${im.file.name} nie powiodło się (szczegóły w App Store Connect)`;
        else if (gotowy(st)) im.done = true;
      } catch (err) { im.error = `odczyt stanu ${im.file.name}: ${zaciemnij(err.message)}`; }
      if (!im.done && !im.error && now() - im.since >= WAIT_MS) im.error = `przetwarzanie ${im.file.name} trwa zbyt długo`;
    }
    if (obrazy.some((i) => !i.done && !i.error)) { await sleep(odstep); odstep = Math.min(Math.round(odstep * 1.5), POLL_MAX_MS); }
  }
}

/** Zgoda z pliku: null = na sucho; inaczej { skrot, zgoda } (format jak asc-zgoda-zgloszenie.json). */
export function zgodaZPliku(p) {
  if (!p || !existsSync(p)) return null;
  const z = JSON.parse(readFileSync(p, 'utf8'));
  if (z.zapis !== true) return null;
  if (!/^[0-9a-f]{64}$/.test(z.skrot ?? '') || !/^\d{4}-\d{2}-\d{2}: \S/.test(z.zgoda ?? '')) throw new BladZgody('plik zgody: "skrot" (64 znaki hex) i "zgoda" („RRRR-MM-DD: słowa właściciela”) są wymagane');
  return z;
}

/**
 * Główny przebieg. `kOdczyt` = klient tylko do odczytu, `kZapis` = klient z zapisem (tylko przy zgodzie). Zwraca kod wyjścia.
 */
export async function przebieg({ kOdczyt, kZapis = null, fetchFn = fetch, zrzuty, problemy = [], zgoda = null, bundleId, log = console.log,
  read = (p) => readFileSync(p), sleep = (ms) => new Promise((r) => setTimeout(r, ms)), now = () => Date.now() }) {
  const zapis = zgoda !== null;
  log(`## Zrzuty sklepu → App Store Connect (App Asset Library): ${zapis ? 'ZAPIS ze zgodą' : 'NA SUCHO (tylko GET)'}\n`);
  let kod = problemy.length ? 1 : 0;
  for (const p of problemy) log(`BŁĄD pliku: ${p}`);
  const d = await odkryj(kOdczyt, bundleId);
  if (!d.wersja || !d.biblioteka) {
    log(!d.wersja ? `### Brak edytowalnej wersji iOS w App Store Connect\n\nStany wersji: ${d.stany.join(', ') || 'brak'}.` : '### Brak biblioteki zasobów aplikacji (assetLibrary)');
    return 1;
  }
  const istniejace = async (locId, group) => (await kOdczyt.wszystkie(`/v1/appStoreVersionLocalizations/${e(locId)}/placements?filter[placementType]=${PLACEMENT_TYPE}&filter[placementGroup]=${e(group)}&limit=200`)).data.length;
  const { wiersze, bledy } = await planuj({ zrzuty, lok: d.lok, refData: d.refData, istniejace });
  if (bledy.length) { kod = 1; log('### Błędy planu (zapis zablokowany)\n'); for (const b of bledy) log(`- ${b}`); log(''); }
  const s = skrot(wiersze);
  log(tabela(wiersze));
  const ile = (a) => wiersze.filter((w) => w.action === a).length;
  log(`\nwgraj ${ile('wgraj')}, pomiń ${ile('pomiń')}\nSkrót planu: ${s}`);
  if (!zapis) {
    if (kod === 0) log('Na sucho — nic nie zapisano. Zapis: skrót do docs/wydanie/asc-zgoda-zrzuty.json ("zapis": true, "zgoda"), potem workflow w trybie apply (środowisko release).');
    return kod;
  }
  if (kod) { log('Zapis wstrzymany — błędy planu, nic nie zapisano.'); return 1; }
  if (zgoda.skrot !== s) { log(`ODMOWA: zgoda na inny plan (skrót w pliku zgody ≠ ${s}); nic nie zapisano.`); return 3; }
  const k = bezUsuwania(kZapis);
  const refOf = (w, f) => `piekarz-1.0/${w.kod}/${f.name}`;
  const plan = new Map(); for (const w of wiersze.filter((x) => x.action === 'wgraj')) for (const f of w.files) plan.set(refOf(w, f), f);
  const lib = plan.size ? await czytajBiblioteke(kOdczyt, d.biblioteka) : [];
  const obrazy = new Map();
  for (const [ref, f] of plan) {
    try { obrazy.set(ref, await obraz({ k, fetchFn, biblioteka: d.biblioteka, lib, ref, file: f, body: read(f.path), now })); }
    catch (err) { obrazy.set(ref, { file: f, error: zaciemnij(err.message) }); }
  }
  const all = [...obrazy.values()];
  log(`Obrazy: wgrano ${all.filter((i) => !i.error && !i.reused).length}, użyto ponownie ${all.filter((i) => i.reused).length}, błędy ${all.filter((i) => i.error).length}; czekam na przetworzenie.`);
  await czekaj({ k, obrazy: all.filter((i) => !i.error), sleep, now });
  for (const w of wiersze.filter((x) => x.action === 'wgraj')) {
    try {
      const im = w.files.map((f) => obrazy.get(refOf(w, f)));
      const zly = im.find((i) => i.error); if (zly) throw new Error(zly.error);
      const umieszczone = [];
      for (const { id } of im) {
        const p = await k.post('/v1/appAssetLibraryPlacements', { data: { type: 'appAssetLibraryPlacements', attributes: { placementType: PLACEMENT_TYPE, placementGroup: w.group },
          relationships: { image: { data: { type: 'appAssetLibraryImages', id } }, appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: w.locId } } } } });
        umieszczone.push({ type: 'appAssetLibraryPlacements', id: p.data.id });
      }
      await k.post('/v1/appAssetLibraryPlacementOrderingRequests', { data: { type: 'appAssetLibraryPlacementOrderingRequests', attributes: { placementGroup: w.group },
        relationships: { orderedPlacements: { data: umieszczone }, appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: w.locId } } } } });
      w.written = true;
    } catch (err) { w.error = zaciemnij(err.message); kod = 1; log(`BŁĄD ${w.kod}: ${w.error}`); }
  }
  log(`\nZapisano ${wiersze.filter((w) => w.written).length} z ${ile('wgraj')} zestawów.`);
  return kod;
}

const arg = (argv, n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };

async function main(argv) {
  const { zrzuty, problemy } = wczytajZrzuty({ katalog: arg(argv, '--katalog'), klasa: arg(argv, '--klasa') ?? 'iphone-6.9', lokalizacje: arg(argv, '--lokalizacje') ?? '' });
  const zgoda = zgodaZPliku(arg(argv, '--zgoda'));
  const api = arg(argv, '--api') ?? API_DOMYSLNE;
  const dane = sekrety();
  const bundleId = JSON.parse(readFileSync(resolve(ROOT, 'app.json'), 'utf8')).expo.ios.bundleIdentifier;
  const wynik = [];
  const log = (t) => { wynik.push(t); console.log(t); };
  const kodWyjscia = await przebieg({ kOdczyt: klient(api, dane, true), kZapis: zgoda ? klient(api, dane, false) : null, zrzuty, problemy, zgoda, bundleId, log });
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${wynik.join('\n')}\n`);
  return kodWyjscia;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2)).then((kod) => process.exit(kod), (blad) => {
    if (blad instanceof BladApi && blad.status === 403) { console.error(`BŁĄD: App Store Connect odmówił dostępu (403): ${zaciemnij(blad.message)}`); process.exit(4); }
    if (blad instanceof BladZgody) { console.error(`BŁĄD zgody: ${blad.message}`); process.exit(3); }
    console.error(`BŁĄD: ${zaciemnij(String(blad?.message ?? blad)).slice(0, 300)}`);
    process.exit(1);
  });
}
