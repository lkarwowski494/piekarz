/**
 * Wgrywanie zrzutów sklepu przez App Asset Library (scripts/asc/zrzuty.mjs, .github/workflows/asc-zrzuty.yml; KO-033 „Przenieść jak
 * Oczko”, D-366). Atrapa klienta ASC w pamięci (ten sam interfejs co klient z scripts/asc-ustawienia.mjs: jeden, wszystkie, post, patch,
 * usun) zapisuje każde żądanie. Pilnuje: na sucho tylko GET; nigdy DELETE; grupa z istniejącymi zrzutami pominięta; zapis tylko ze zgodą
 * na ten sam skrót planu; kolejność plików w placementach; alfa i nieznane wymiary blokują zapis; adresy wgrywania nie trafiają do logu.
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const MOD = join(root, 'scripts/asc/zrzuty.mjs');

/** Uruchamia kod ESM z modułem skryptu (Jest nie ładuje .mjs wprost) i zwraca JSON z stdout. */
function esm(kod: string): any {
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', `import * as Z from ${JSON.stringify(MOD)}; ${kod}`], { encoding: 'utf8', cwd: root });
  if (r.status !== 0) throw new Error(r.stderr);
  return JSON.parse(r.stdout);
}

/** PNG 1×1 z nagłówkiem IHDR o zadanych wymiarach (reszta pliku nieistotna dla skryptu). */
function png(w: number, h: number, alfa = false): Buffer {
  const b = Buffer.alloc(40);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.write('IHDR', 12, 'latin1');
  b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20); b[24] = 8; b[25] = alfa ? 6 : 2;
  return b;
}

function katalog(pliki: Record<string, Buffer>): string {
  const d = mkdtempSync(join(tmpdir(), 'ramki-'));
  for (const [p, b] of Object.entries(pliki)) { mkdirSync(join(d, p, '..'), { recursive: true }); writeFileSync(join(d, p), b); }
  return d;
}

const EKRANY = ['01-plan', '02-receptura', '03-prowadzenie-ciemny', '04-doktor', '05-zakwasy', '06-dziennik', '07-offline'];
const zestaw = (kod: string, w = 1320, h = 2868) => Object.fromEntries(EKRANY.map((e) => [`${kod}/iphone-6.9/${e}.png`, png(w, h)]));

/** Atrapa ASC (kod JS wklejany do procesu ESM): wersja w edycji, lokalizacje pl i en-US, biblioteka, dane referencyjne z jedną grupą 6,9″. */
const ATRAPA = `
const zadania = [];
const placementy = { 'loc-pl': 0, 'loc-en': 0 };
const obrazy = new Map(); let nr = 0;
const refData = { imageSpecs: [{ specId: 's69', alphaAllowed: false, dimensions: { minWidth: 1320, maxWidth: 1320, minHeight: 2868, maxHeight: 2868 } }],
  placementTypes: [{ placementTypeId: 'APP_SCREENSHOT', specMappings: [{ placementGroupId: 'IPHONE_69', specs: ['s69'] }] }] };
const k = {
  jeden: async (s) => { zadania.push(['GET', s]);
    if (s.includes('/assetLibrary')) return { id: 'lib-1' };
    if (s.includes('appAssetLibraryRefData')) return [{ attributes: refData }];
    const m = /appAssetLibraryImages\\/([^/?]+)$/.exec(s); if (m) return { id: m[1], attributes: { state: 'PREPARE_FOR_SUBMISSION' } };
    return null; },
  wszystkie: async (s) => { zadania.push(['GET', s]);
    if (s.startsWith('/v1/apps?')) return { data: [{ id: 'app-1' }], included: [] };
    if (s.includes('/appStoreVersions?')) return { data: [{ id: 'ver-1', attributes: { appStoreState: 'PREPARE_FOR_SUBMISSION' } }], included: [] };
    if (s.includes('/appStoreVersionLocalizations?')) return { data: [{ id: 'loc-pl', attributes: { locale: 'pl' } }, { id: 'loc-en', attributes: { locale: 'en-US' } }], included: [] };
    const p = /appStoreVersionLocalizations\\/([^/]+)\\/placements/.exec(s); if (p) return { data: Array.from({ length: placementy[p[1]] ?? 0 }, (_, i) => ({ id: 'p' + i })), included: [] };
    if (s.includes('/images?')) return { data: [], included: [] };
    return { data: [], included: [] }; },
  post: async (s, c) => { zadania.push(['POST', s, c?.data?.attributes?.fileName ?? c?.data?.relationships?.orderedPlacements?.data?.length ?? '']);
    if (s === '/v1/appAssetLibraryImages') { const id = 'img-' + (++nr); obrazy.set(id, c.data.attributes.fileName);
      return { data: { id, attributes: { uploadOperations: [{ method: 'PUT', url: 'https://magazyn.example/tajne-' + id, offset: 0, length: c.data.attributes.fileSize, requestHeaders: [] }] } } }; }
    if (s === '/v1/appAssetLibraryPlacements') return { data: { id: 'pl-' + c.data.relationships.image.data.id } };
    return { data: { id: 'x' } }; },
  patch: async (s, c) => { zadania.push(['PATCH', s, c?.data?.attributes?.uploaded ?? '']); return { data: {} }; },
  usun: async (s) => { zadania.push(['DELETE', s]); return null; },
};
const fetchFn = async (url, o) => { zadania.push([o.method, 'magazyn']); return { ok: true, status: 200 }; };
const logi = [];
const log = (t) => logi.push(t);
`;

function przebieg(kat: string, opcje: { zgoda?: string; lokalizacje?: string; placementyPl?: number } = {}) {
  return esm(`${ATRAPA}
    placementy['loc-pl'] = ${opcje.placementyPl ?? 0};
    const { zrzuty, problemy } = Z.wczytajZrzuty({ katalog: ${JSON.stringify(kat)}, klasa: 'iphone-6.9', lokalizacje: ${JSON.stringify(opcje.lokalizacje ?? 'pl,en-US')} });
    const zgoda = ${opcje.zgoda === undefined ? 'null' : `{ skrot: ${JSON.stringify(opcje.zgoda)}, zgoda: '2026-11-10: test' }`};
    const kod = await Z.przebieg({ kOdczyt: { ...k, post: () => { throw new Error('zapis na sucho'); }, patch: () => { throw new Error('zapis na sucho'); } },
      kZapis: zgoda ? k : null, fetchFn, zrzuty, problemy, zgoda, bundleId: 'com.apps4brew.baker', log, sleep: async () => {}, now: () => 0 });
    const skrot = /Skrót planu: ([0-9a-f]{64})/.exec(logi.join('\\n'))?.[1] ?? null;
    console.log(JSON.stringify({ kod, zadania, log: logi.join('\\n'), skrot, problemy }));`);
}

describe('scripts/asc/zrzuty.mjs: App Asset Library (D-366)', () => {
  const kat = katalog({ ...zestaw('pl'), ...zestaw('en-US') });

  it('na sucho: tylko GET, plan „wgraj” dla obu lokalizacji, skrót planu, kod 0', () => {
    const r = przebieg(kat);
    expect(r.kod).toBe(0);
    expect(r.zadania.every((z: string[]) => z[0] === 'GET')).toBe(true);
    expect(r.log).toMatch(/\| pl \| IPHONE_69 \| 7 \| wgraj \|/);
    expect(r.log).toMatch(/\| en-US \| IPHONE_69 \| 7 \| wgraj \|/);
    expect(r.skrot).toMatch(/^[0-9a-f]{64}$/);
  });

  it('zgoda na inny skrót: kod 3, żadnego zapisu', () => {
    const r = przebieg(kat, { zgoda: '0'.repeat(64) });
    expect(r.kod).toBe(3);
    expect(r.zadania.filter((z: string[]) => z[0] !== 'GET')).toEqual([]);
  });

  it('zgoda na ten skrót: rezerwacja, PUT, uploaded, 7 placementów w kolejności plików i kolejność; nigdy DELETE; adresy wgrywania poza logiem', () => {
    const skrot = przebieg(kat).skrot;
    const r = przebieg(kat, { zgoda: skrot });
    expect(r.kod).toBe(0);
    expect(r.zadania.some((z: string[]) => z[0] === 'DELETE')).toBe(false);
    const rezerwacje = r.zadania.filter((z: string[]) => z[0] === 'POST' && z[1] === '/v1/appAssetLibraryImages').map((z: string[]) => z[2]);
    expect(rezerwacje).toEqual([...EKRANY, ...EKRANY].map((e) => `${e}.png`));
    expect(r.zadania.filter((z: string[]) => z[0] === 'PUT')).toHaveLength(14);
    expect(r.zadania.filter((z: unknown[]) => z[0] === 'PATCH' && z[2] === true)).toHaveLength(14);
    expect(r.zadania.filter((z: string[]) => z[1] === '/v1/appAssetLibraryPlacements')).toHaveLength(14);
    expect(r.zadania.filter((z: string[]) => z[1] === '/v1/appAssetLibraryPlacementOrderingRequests').map((z: string[]) => z[2])).toEqual([7, 7]);
    expect(r.log).not.toMatch(/magazyn\.example|tajne-/);
    expect(r.log).toMatch(/Zapisano 2 z 2 zestawów/);
  });

  it('grupa z istniejącymi zrzutami: pominięta (nic nie usuwa), reszta planu dalej', () => {
    const r = przebieg(kat, { placementyPl: 3 });
    expect(r.log).toMatch(/\| pl \| IPHONE_69 \| 7 \| pomiń — grupa ma już 3 zrzutów \(nic nie usuwam; zamiana ręcznie w ASC\) — niekompletna: 3 z 7 \|/);
    expect(r.log).toMatch(/\| en-US \| IPHONE_69 \| 7 \| wgraj \|/);
  });

  it('kanał alfa albo nieznany wymiar: błąd planu, kod 1, zapis zablokowany nawet ze zgodą', () => {
    const zly = katalog({ ...zestaw('pl'), 'pl/iphone-6.9/08-extra.png': png(1320, 2868, true), ...zestaw('en-US', 1000, 2000) });
    const r = przebieg(zly);
    expect(r.kod).toBe(1);
    expect(r.log).toMatch(/pl\/08-extra\.png: kanał alfa/);
    expect(r.log).toMatch(/en-US\/01-plan\.png: 1000×2000 — brak pasującej specyfikacji/);
    const z = przebieg(zly, { zgoda: r.skrot });
    expect(z.kod).toBe(1);
    expect(z.zadania.filter((x: string[]) => x[0] !== 'GET')).toEqual([]);
  });

  it('wejście: lokalizacja spoza metadanych i katalog nie-lokalizacji to problemy; brak zestawu lokalizacji to problem', () => {
    expect(przebieg(kat, { lokalizacje: 'xx' }).problemy).toEqual(['lokalizacje spoza docs/wydanie/metadane: xx']);
    const r = esm(`console.log(JSON.stringify(Z.wczytajZrzuty({ katalog: ${JSON.stringify(katalog({ ...zestaw('pl'), 'smieci/a.png': png(1, 1) }))}, klasa: 'iphone-6.9', lokalizacje: 'pl,de-DE' }).problemy))`);
    expect(r).toEqual(['brak zrzutów de-DE/iphone-6.9', 'katalog smieci nie jest lokalizacją sklepu (docs/wydanie/metadane)']);
  });

  it('kod skryptu: bez DELETE i bez przestarzałych appScreenshotSets/appScreenshots; klient zapisu opakowany bezUsuwania', () => {
    const src = read('scripts/asc/zrzuty.mjs').split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
    expect(src).not.toMatch(/\.usun\(|'DELETE'|appScreenshotSets|\/v1\/appScreenshots/);
    expect(src).toMatch(/const k = bezUsuwania\(kZapis\)/);
    expect(esm(`console.log(JSON.stringify(Object.keys(Z.bezUsuwania({ jeden: 1, wszystkie: 1, post: 1, patch: 1, usun: 1 }))))`)).toEqual(['jeden', 'wszystkie', 'post', 'patch']);
  });
});

describe('.github/workflows/asc-zrzuty.yml (D-366)', () => {
  const wf = read('.github/workflows/asc-zrzuty.yml');
  const zadanie = (n: string) => wf.split(new RegExp(`\\n {2}${n}:\\n`))[1]?.split(/\n {2}[a-z-]+:\n/)[0] ?? '';

  it('tylko ręcznie; uprawnienia do odczytu; checkout bez poświadczeń; sekrety tylko ASC_* i GITHUB_TOKEN', () => {
    expect(wf).toMatch(/^on:\n {2}workflow_dispatch:\n/m);
    expect(wf).not.toMatch(/^\s+(push|pull_request|schedule):/m);
    expect(wf).toMatch(/^permissions:\n {2}contents: read\n {2}actions: read\n/m);
    expect(wf.match(/uses: actions\/checkout@/g)?.length).toBe(2);
    expect(wf.match(/persist-credentials: false/g)?.length).toBe(2);
    expect(new Set([...wf.matchAll(/secrets\.(\w+)/g)].map((m) => m[1]))).toEqual(new Set(['GITHUB_TOKEN', 'ASC_KEY_ID', 'ASC_ISSUER_ID', 'ASC_KEY_P8_BASE64', 'ASC_KEY_P8']));
  });

  it('na sucho: bez środowiska i bez --zgoda; zapis: środowisko release, tryb apply i zgoda z pliku, --zgoda', () => {
    const sucho = zadanie('na-sucho'); const zapis = zadanie('zapis');
    expect(sucho).not.toMatch(/environment:/);
    expect(sucho).not.toMatch(/--zgoda/);
    expect(sucho).toMatch(/node scripts\/asc\/zrzuty\.mjs --katalog sklep-ramki/);
    expect(zapis).toMatch(/environment: release/);
    expect(zapis).toMatch(/if: inputs\.tryb == 'apply' && needs\.na-sucho\.outputs\.zapis == 'true'/);
    expect(zapis).toMatch(/--zgoda docs\/wydanie\/asc-zgoda-zrzuty\.json/);
    expect(JSON.parse(read('docs/wydanie/asc-zgoda-zrzuty.json'))).toMatchObject({ zapis: false, skrot: null, zgoda: null });
  });

  it('wejście: artefakt sklep-ramki z przebiegu zrzuty-sklepu.yml (ID tylko cyfry), wejścia przez env, nie wklejane w skrypt', () => {
    expect(wf.match(/name: sklep-ramki/g)?.length).toBe(2);
    expect(wf).toMatch(/case "\$PRZEBIEG" in ''\|\*\[!0-9\]\*\) echo "::error::/);
    for (const l of wf.split('\n').filter((x) => /^\s+run: /.test(x))) expect(l).not.toMatch(/\$\{\{\s*inputs\./);
    expect(read('.github/workflows/zrzuty-sklepu.yml')).toMatch(/name: sklep-ramki\n {10}path: sklep-ramki\n {10}retention-days: 14/);
  });
});
