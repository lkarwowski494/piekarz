// ============================================================================
// Piekarz — kontrakt workflow zrzutów sklepu z symulatora iOS (KO-025, 2026-11-10; sesja J, D-352..D-355).
// Workflow ma: nie mieć sekretów App Store Connect ani niczego nie wysyłać, budować Pro (EXPO_PUBLIC_E2E; bez Basic od D-365),
// przypiąć Maestro (wersja + SHA-256), robić 7 ramek z docs/wydanie/zrzuty/README.md dla lokalizacji z metadanych
// i sprawdzać wymiary klas 6,9″ i 6,3″. Sam przebieg na macOS sprawdza GitHub Actions; ten test pilnuje kroków.
// ============================================================================

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8').replace(/\r\n/g, '\n');
const wf = read('.github/workflows/zrzuty-sklepu.yml');
const skrypt = read('scripts/ci/zrzuty-sklepu.sh');
const e2e = read('.github/workflows/e2e-ios.yml');
const bundleId: string = JSON.parse(read('app.json')).expo.ios.bundleIdentifier;
const scenyDir = join(root, '.maestro', 'zrzuty-sklepu');
const pliki = (d: string): string[] =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? pliki(join(d, e.name)) : e.name.endsWith('.yaml') ? [join(d, e.name)] : []));
const ramki: string[] = JSON.parse(read('docs/wydanie/zrzuty/pl/podpisy.json')).ramki.map((r: { plik: string }) => r.plik.replace(/\.png$/, ''));
const klasy: Record<string, { px: [number, number] }> = JSON.parse(read('docs/wydanie/zrzuty/pl/podpisy.json')).klasy;

/** Kroki workflow (`- name:`/`- uses:`/`- id:` na poziomie kroków). */
const kroki = wf.split(/\n(?= {6}- (?:name|uses|id): )/).slice(1);

function plikiKodu(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : plikiKodu(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}
let zrodla: string | null = null;
function wKodzie(id: string): boolean {
  zrodla ??= ['app', 'src'].flatMap((d) => plikiKodu(join(root, d))).map((p) => readFileSync(p, 'utf8')).join('\n');
  if (zrodla.includes(`"${id}"`) || zrodla.includes(`'${id}'`)) return true;
  // szablon z przedrostkiem (`start-${czynnosc}`, `recipe-row-${id}`): każdy przedrostek do myślnika
  const czesci = id.split('-');
  return czesci.slice(1).some((_, i) => zrodla!.includes(`\`${czesci.slice(0, i + 1).join('-')}-\${`));
}

describe('zrzuty-sklepu.yml: bezpieczeństwo (KO-025)', () => {
  it('bez sekretów poza GITHUB_TOKEN (pobranie artefaktu), bez środowiska i bez wysyłki do App Store Connect', () => {
    const sekrety = [...wf.matchAll(/secrets\.(\w+)/g)].map((m) => m[1]);
    expect(new Set(sekrety)).toEqual(new Set(['GITHUB_TOKEN']));
    expect(wf).not.toMatch(/^\s+environment:/m);
    expect(wf).not.toMatch(/ASC_|asc-zgloszenie|appstoreconnect|altool|exportArchive/i);
    expect(skrypt).not.toMatch(/ASC_|asc-zgloszenie|appstoreconnect|curl /i);
  });

  it('uprawnienia tylko do odczytu, checkout bez zapisanych poświadczeń', () => {
    expect(wf).toMatch(/^permissions:\n {2}contents: read\n {2}actions: read\n/m);
    const checkouty = kroki.filter((k) => /uses: actions\/checkout@/.test(k));
    expect(checkouty.length).toBe(4); // plan, build, zrzuty, ramki (D-363)
    for (const k of checkouty) expect(k).toMatch(/persist-credentials: false/);
  });

  it('wyzwalacze: tylko gałęzie zrzuty-sklepu/** i workflow_dispatch (gałęzie napraw go nie uruchamiają)', () => {
    const on = wf.split(/\non:\n/)[1].split(/\n\S/)[0];
    expect(on).toMatch(/push:\n\s+branches: \['zrzuty-sklepu\/\*\*'\]/);
    expect(on).toMatch(/workflow_dispatch:/);
    expect(on).not.toMatch(/pull_request|schedule|naprawy/);
  });

  it('wejścia i komunikat commita idą przez env, nigdy przez ${{ }} w run', () => {
    for (const k of kroki) {
      const run = k.includes('run:') ? k.slice(k.indexOf('run:')) : '';
      expect(run).not.toMatch(/\$\{\{\s*(inputs\.|github\.event\.|matrix\.)/);
    }
  });
});

describe('zrzuty-sklepu.yml: build i Maestro', () => {
  it('jeden build: Pro z EXPO_PUBLIC_E2E; bez buildu Basic i bez atrapy ofert (zrzut zakupu robi E2E, D-365)', () => {
    const pro = kroki.find((k) => /Build Release for simulator \(Pro/.test(k)) ?? '';
    expect(pro).toMatch(/EXPO_PUBLIC_E2E: '1'/);
    expect(pro).toMatch(/zip -qry zrzuty-sklepu-app\.zip aplikacje/);
    expect(kroki.filter((k) => /xcodebuild -workspace/.test(k))).toHaveLength(1);
    expect(wf.match(/EXPO_PUBLIC_E2E: '1'/g)).toHaveLength(1);
    expect(wf).not.toMatch(/STORE_FAKE|aplikacje\/basic|APP_BASIC/);
  });

  it('Maestro przypięty: ta sama wersja co e2e-ios.yml i SHA-256 paczki, bez skryptu get.maestro.mobile.dev', () => {
    const wersja = /MAESTRO_VERSION: '(\d+\.\d+\.\d+)'/.exec(wf)?.[1];
    expect(wersja).toBe(/MAESTRO_VERSION: "(\d+\.\d+\.\d+)"/.exec(e2e)?.[1]);
    expect(wf).toMatch(/MAESTRO_ZIP_SHA256: '[0-9a-f]{64}'/);
    expect(wf).toMatch(/shasum -a 256 -c -/);
    expect(wf).not.toMatch(/get\.maestro\.mobile\.dev/);
  });

  it('symulator wybierany po dokładnej nazwie modelu z planu; brak = błąd', () => {
    expect(wf).toMatch(/x\.name === process\.env\.SYMULATOR/);
    expect(wf).toMatch(/::error::Brak symulatora/);
  });
});

// KO-044 (właściciel, 2026-11-11, D-373): zrzuty #1 — krok ImageMagick w `komplet` wisiał na `apt-get update`
// („Temporary failure resolving 'azure.archive.ubuntu.com'”) aż do timeout-minutes zadania (20 min).
describe('zrzuty-sklepu.yml: instalacja ImageMagick odporna na awarię sieci (KO-044)', () => {
  const krok = (nazwa: string) => kroki.find((k) => k.startsWith(`      - name: ${nazwa}\n`)) ?? '';
  it.each([
    ['ImageMagick', 'imagemagick'],
    ['ImageMagick i czcionki CJK', 'imagemagick fonts-noto-cjk'],
  ])('%s: własny limit 8 min, pominięcie apt przy obecnych narzędziach, apt z ponowieniami i limitem połączenia', (nazwa, pakiety) => {
    const k = krok(nazwa);
    expect(k).toMatch(/\n {8}timeout-minutes: 8\n/);
    // Skrypty wołają `convert` i `identify` (store-frames.sh, store-caption-layout.mjs, krok komplet) — oba muszą być
    expect(k).toMatch(/command -v convert >\/dev\/null && command -v identify >\/dev\/null/);
    const apt = [...k.matchAll(/sudo apt-get ([^\n]*)/g)].map((m) => m[1]);
    expect(apt).toHaveLength(2);
    for (const a of apt) expect(a).toMatch(/^\$APT_OPCJE (update|install)/);
    expect(k).toMatch(/APT_OPCJE="-o Acquire::Retries=3 -o Acquire::http::Timeout=30 -o Acquire::https::Timeout=30"/);
    expect(k).toContain(`install -y -qq ${pakiety} >/dev/null`);
  });
  it('podpisy: pominięcie apt także wymaga kroju CJK pod ścieżką FONT_CJK', () => {
    const k = krok('ImageMagick i czcionki CJK');
    const fontCjk = /echo "FONT_CJK=([^"]+)"/.exec(wf)?.[1];
    expect(fontCjk).toBe('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc');
    expect(k).toContain(`[ -f ${fontCjk} ]`);
  });
});

describe('sceny Maestro .maestro/zrzuty-sklepu', () => {
  const sceny = pliki(scenyDir);
  it('jedna scena na każdą z 7 ramek README (nazwy plików jak w obecnym zestawie) plus przygotowanie i zgoda (zakup: E2E, D-365)', () => {
    expect(ramki).toHaveLength(7);
    const nazwy = readdirSync(scenyDir).filter((f) => f.endsWith('.yaml')).map((f) => f.replace(/\.yaml$/, ''));
    expect(nazwy.sort()).toEqual(['00-przygotuj', '00-zgoda', ...ramki].sort());
  });

  it('skrypt robi wszystkie 7 ramek, scenę ciemną 03 na końcu, a zbierz sprawdza komplet tych samych 7', () => {
    const lista = /^SCENY="([^"]+)"/m.exec(skrypt)?.[1].split(' ') ?? [];
    expect([...lista].sort()).toEqual([...ramki].sort());
    expect(lista[lista.length - 1]).toBe('03-prowadzenie-ciemny');
    expect(skrypt).toMatch(/03-prowadzenie-ciemny \] && xcrun simctl ui "\$UDID" appearance dark/);
    const komplet = /for n in ([^;]+); do/.exec(wf.split('zbierz:')[1])?.[1].split(' ') ?? [];
    expect([...komplet].sort()).toEqual([...ramki].sort());
  });

  it.each(sceny.map((p) => [p.slice(scenyDir.length + 1), p]))('%s: appId aplikacji i id elementów istnieją w kodzie', (_n, p) => {
    const tekst = readFileSync(p, 'utf8');
    expect(/^appId: (.+)$/m.exec(tekst)?.[1]).toBe(bundleId);
    const ids = [...tekst.matchAll(/^\s+id: "([^"]+)"/gm)].map((m) => m[1]).filter((id) => !/[.*|]/.test(id));
    for (const id of ids) expect([id, wKodzie(id)]).toEqual([id, true]);
  });

  it('dane fikcyjne: przygotowanie czyści stan i nie wpisuje tekstu; sceny ramek nie czyszczą danych', () => {
    const przyg = readFileSync(join(scenyDir, '00-przygotuj.yaml'), 'utf8');
    expect(przyg).toMatch(/clearState: true/);
    expect(przyg).not.toMatch(/inputText/);
    for (const r of ramki) expect(readFileSync(join(scenyDir, `${r}.yaml`), 'utf8')).not.toMatch(/clearState: true/);
  });

  it('okno zgody systemu: raz na zadanie w en-US przed lokalizacjami, bez ponownej instalacji Pro w pętli; obsłużone po pierwszym dokarmieniu', () => {
    const przed = skrypt.split('for wpis in $JEZYKI; do')[0];
    const petla = skrypt.split('for wpis in $JEZYKI; do')[1].split('\ndone\n')[0];
    expect(przed).toMatch(/jezyk en-US en_US\ninstaluj "\$APP_PRO"\nif ! maestro_run en-US 00-zgoda 1/);
    expect(petla).not.toMatch(/instaluj/);
    const przyg = readFileSync(join(scenyDir, '00-przygotuj.yaml'), 'utf8');
    expect(przyg).toMatch(/- tapOn:\n {4}id: "zakladanie-pierwsze-dokarmienie-btn"\n(?:#[^\n]*\n)*- runFlow: sub\/okno-systemu\.yaml/);
  });

  // Zrzuty #1 (run 43030916299, 2026-11-11): po pierwszym dokarmieniu zakwas jest w zakładaniu, a ZakwasDziennik renderuje
  // kartę zakładania PRZED kartą cyklu (StarterCycleCard), więc `zakwas-karta` leży pod ekranem i `visible` nie przechodzi
  // na żadnym rozmiarze. Czekanie na ekranie: pas (`zakwas-cykl`) i zniknięcie startu zakładania, jak E2E 05-drugi-zakwas-pro.
  it('sceny nie czekają na elementy karty cyklu zakwasu (pod kartą zakładania, poza ekranem); po dokarmieniu: start zakładania znika, pas zakwasu widoczny', () => {
    const karta = read('src/components/zakwas/StarterCycleCard.tsx').split('export function StarterCycleCard')[1].split('const styles')[0];
    const idKarty = [...karta.matchAll(/testID="([^"]+)"/g)].map((m) => m[1]);
    expect(idKarty).toEqual(expect.arrayContaining(['zakwas-karta', 'zakwas-dokarm-btn']));
    for (const p of sceny) {
      const tekst = readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
      const czekane = [...tekst.matchAll(/(?:^|\n)\s*(?:- )?(?:visible|assertVisible):\n\s+id: "([^"]+)"/g)].map((m) => m[1]);
      expect([p.slice(scenyDir.length + 1), czekane.filter((id) => idKarty.includes(id))]).toEqual([p.slice(scenyDir.length + 1), []]);
    }
    for (const s of ['00-przygotuj', '00-zgoda']) {
      const tekst = readFileSync(join(scenyDir, `${s}.yaml`), 'utf8').replace(/\r\n/g, '\n');
      const poOknie = tekst.split('- runFlow: sub/okno-systemu.yaml\n')[1] ?? '';
      expect([s, poOknie]).toEqual([s, expect.stringMatching(/^(?:#[^\n]*\n)*- extendedWaitUntil:\n {4}notVisible:\n {6}id: "zakladanie-start"\n {4}timeout: \d+\n- extendedWaitUntil:\n {4}visible:\n {6}id: "zakwas-cykl"\n/)]);
    }
  });

  // KO-043 (właściciel, 2026-11-11): ramka 05 = zakwas po zakładaniu. „Podwoił objętość” w 0–8 h po dokarmieniu kończy
  // zakładanie (isReadyAfterFeeding, setupCompletedAt), po restarcie karta cyklu z „Gotowy do ciasta.” (D-372).
  it('przygotowanie kończy zakładanie przez „Podwoił objętość”, a ramka 05 pokazuje kartę cyklu z „Gotowy do ciasta.” (KO-043)', () => {
    const przyg = readFileSync(join(scenyDir, '00-przygotuj.yaml'), 'utf8').replace(/\r\n/g, '\n');
    const poPasie = przyg.split('      id: "zakwas-cykl"\n    timeout: 15000\n')[1] ?? '';
    expect(poPasie).toMatch(/^(?:#[^\n]*\n)*- scrollUntilVisible:\n {4}element:\n {6}id: "zakwas-podwoil-btn"\n- tapOn:\n {4}id: "zakwas-podwoil-btn"\n- scrollUntilVisible:\n {4}element:\n {6}id: "zakladanie-wynik-ready"\n {4}direction: UP\n/);
    const r05 = readFileSync(join(scenyDir, '05-zakwasy.yaml'), 'utf8').replace(/\r\n/g, '\n');
    expect(r05).toMatch(/- scrollUntilVisible:\n {4}element:\n {6}id: "zakwas-gotowy"\n {4}centerElement: true\n/);
    expect(read('src/components/zakwas/ZakwasDziennik.tsx')).toContain('testID="zakwas-gotowy"');
  });

  it('bez ekranu zakupu w zrzutach sklepu (D-365): ani scen, ani katalogów review/ i bez-oferty/; plik daje E2E z atrapą ofert', () => {
    const bezKomentarzy = (t: string) => t.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
    for (const t of [skrypt, wf]) expect(bezKomentarzy(t)).not.toMatch(/zakup\.yaml|zakup-oferta|bez-oferty|review\/zakup|ZAKUP/);
    expect(e2e).toMatch(/test \.maestro\/e2e-zakup/);
    expect(JSON.parse(read('docs/wydanie/asc-zgloszenie.json')).zrzutZakupu).toBe('docs/wydanie/zrzuty/review/zakup.png');
  });
});

type Czesc = { rozmiar: string; katalog: string; czesc: string; jezyki: string; zakup?: string };
type Plan = { matrix: { include: Czesc[] }; jezyki: string[]; rozmiary: string[] };
const PLAN = join(root, 'scripts', 'ci', 'zrzuty-sklepu-plan.mjs');
const planuj = (...a: string[]): Plan => JSON.parse(execFileSync(process.execPath, [PLAN, ...a], { encoding: 'utf8' }));
const planujKod = (...a: string[]) => spawnSync(process.execPath, [PLAN, ...a], { encoding: 'utf8' });
const metadane = readdirSync(join(root, 'docs', 'wydanie', 'metadane')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();

describe('plan przebiegu scripts/ci/zrzuty-sklepu-plan.mjs', () => {
  it('pusty filtr = wszystkie lokalizacje z docs/wydanie/metadane (każda ma język symulatora, inaczej błąd)', () => {
    expect(metadane.length).toBeGreaterThanOrEqual(34);
    const w = planuj('--na-zadanie', '3');
    expect(w.jezyki).toEqual(metadane);
    expect(w.matrix.include).toHaveLength(2 * Math.ceil(metadane.length / 3));
    expect(wf).toContain('--na-zadanie 3');
    const wszystkie = w.matrix.include.filter((c) => c.rozmiar === '6.9').flatMap((c) => c.jezyki.split(' ').map((j) => j.split(':')[0]));
    expect(wszystkie).toEqual(metadane);
    for (const c of w.matrix.include) for (const j of c.jezyki.split(' ')) expect(j).toMatch(/^[A-Za-z-]+:[A-Za-z-]+:[a-z]{2}_[A-Z]{2}$/);
  });

  it('tylko=pl: dwa zadania (6,9″ i 6,3″)', () => {
    const w = planuj('--tylko', 'pl');
    expect(w.matrix.include.map((c) => [c.czesc, c.jezyki])).toEqual([
      ['iphone-6.9-1', 'pl:pl:pl_PL'],
      ['iphone-6.3-1', 'pl:pl:pl_PL'],
    ]);
  });

  it('plan bez pola zakupu (D-365)', () => {
    expect(planuj().matrix.include.filter((c) => 'zakup' in c)).toEqual([]);
  });

  it.each([
    ['--tylko', 'xx'],
    ['--tylko', 'pl;rm -rf'],
    ['--rozmiary', '5.5'],
    ['--na-zadanie', '0'],
  ])('złe wejście %s %s: kod 1 i ::error::, nie cichy wybór', (a, b) => {
    const r = planujKod(a, b);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/::error::/);
    expect(r.stdout).toBe('');
  });

  it('wymiary klas zgodne z tabelą README (podpisy.json) i sprawdzane w zadaniu zbierz', () => {
    const plan = read('scripts/ci/zrzuty-sklepu-plan.mjs');
    for (const [katalog, { px }] of Object.entries(klasy)) {
      expect(plan).toContain(`katalog: '${katalog}'`);
      expect(plan).toMatch(new RegExp(`katalog: '${katalog}', symulator: '[^']+', px: '${px.join('x')}'`));
      expect(wf).toContain(`*/${katalog}/*) [ "$wym" = ${px.join('x')} ]`);
    }
  });
});
