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
/**
 * NaglowekKarty nie renderuje swojego `testID`, tylko `${testID}-naglowek/-tytul/-ikona/-znacznik` (src/ui/karty/Karta.tsx).
 * Zrzuty #2 (run 43050106530): scena 04 czekała na `karta-diagnoza` — literał jest w kodzie jako props, elementu nie ma (D-375).
 */
const naglowekKarty = (kod: string) =>
  kod.replace(/<NaglowekKarty testID="([^"]+)"/g, (_m, id: string) => `<NaglowekKarty ${['naglowek', 'tytul', 'ikona', 'znacznik'].map((s) => `"${id}-${s}"`).join(' ')}`);
function wKodzie(id: string): boolean {
  zrodla ??= naglowekKarty(['app', 'src'].flatMap((d) => plikiKodu(join(root, d))).map((p) => readFileSync(p, 'utf8')).join('\n'));
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
// KO-045 (właściciel, 2026-11-11), D-376: zastępuje wariant KO-044/D-373. Zrzuty #1 i #2: apt-get na ubuntu-24.04 nie rozwiązywał
// azure.archive.ubuntu.com, a obraz 24.04 (20261101.360.1) nie ma ImageMagick. Komplet i ramki idą na ubuntu-22.04 (IM6 w obrazie),
// krój CJK z wydania Noto (przypięty SHA-256), Python do fonttools z setup-python — bez apt.
describe('zrzuty-sklepu.yml: ImageMagick i kroje bez apt (KO-045, D-376)', () => {
  const krok = (nazwa: string) => kroki.find((k) => k.startsWith(`      - name: ${nazwa}\n`)) ?? '';
  const zadanie = (id: string) => wf.split(`\n  ${id}:\n`)[1]?.split(/\n  [a-z]+:\n/)[0] ?? '';
  it('workflow nie woła apt', () => {
    expect(wf).not.toMatch(/apt-get|\bapt install/);
  });
  it.each(['zbierz', 'ramki'])('%s: ubuntu-22.04 (ImageMagick 6 w obrazie), brak narzędzi = głośny błąd, nie instalacja', (id) => {
    const z = zadanie(id);
    expect(z).toMatch(/\n {4}runs-on: ubuntu-22\.04\n/);
    const k = z.split('\n      - ').find((s) => s.startsWith('name: ImageMagick')) ?? '';
    expect(k).toMatch(/command -v convert >\/dev\/null && command -v identify >\/dev\/null/);
    expect(k).toMatch(/::error::/);
    expect(k).toMatch(/exit 1/);
  });
  it('ramki: krój CJK z wydania Noto Sans 2.004 z przypiętym SHA-256 pod ścieżką FONT_CJK', () => {
    const k = krok('Krój CJK (Noto Sans CJK Bold, wydanie Sans2.004)');
    expect(k).toContain('https://raw.githubusercontent.com/notofonts/noto-cjk/Sans2.004/Sans/OTC/NotoSansCJK-Bold.ttc');
    expect(k).toContain('faa5f3656a78b2e2d450d27fe8382c778bc2b6bb5ea29c986664a6a435056ceb');
    expect(k).toMatch(/sha256sum -c/);
    const fontCjk = /echo "FONT_CJK=([^"]+)"/.exec(wf)?.[1];
    expect(fontCjk).toBe('$RUNNER_TEMP/NotoSansCJK-Bold.ttc');
  });
  it('ramki: Python 3.12 z setup-python przed fonttools (fonttools 4.68.0 wymaga Pythona >= 3.11, obraz 22.04 ma 3.10)', () => {
    const z = zadanie('ramki');
    expect(z).toMatch(/uses: actions\/setup-python@v5\n {8}with:\n {10}python-version: '3\.12'\n/);
    expect(z.indexOf('actions/setup-python@')).toBeLessThan(z.indexOf('fonttools=='));
  });
});

describe('sceny Maestro .maestro/zrzuty-sklepu', () => {
  const sceny = pliki(scenyDir);
  it('jedna scena na każdą z 7 ramek README (nazwy plików jak w obecnym zestawie) plus przygotowanie i zgoda (zakup: E2E, D-365)', () => {
    expect(ramki).toHaveLength(7);
    const nazwy = readdirSync(scenyDir).filter((f) => f.endsWith('.yaml')).map((f) => f.replace(/\.yaml$/, ''));
    // KO-049 (D-385): przygotowanie w dwóch częściach, między nimi skrypt przestawia zegar maszyny (dokarmienie → podwojenie po 6 h)
    expect(nazwy.sort()).toEqual(['00-przygotuj', '00-przygotuj-podwojenie', '00-zgoda', ...ramki].sort());
  });

  // KO-051 (D-383): 07 po 03 — „Dziś” z wypiekiem zostawionym przez 03 zamiast pustego stanu; 07 w trybie jasnym.
  it('skrypt robi wszystkie 7 ramek, scenę ciemną 03 przed 07 (ostatnią, jasną), a zbierz sprawdza komplet tych samych 7', () => {
    const lista = /^SCENY="([^"]+)"/m.exec(skrypt)?.[1].split(' ') ?? [];
    expect([...lista].sort()).toEqual([...ramki].sort());
    expect(lista.slice(-2)).toEqual(['03-prowadzenie-ciemny', '07-offline']);
    expect(skrypt).toMatch(/03-prowadzenie-ciemny \] && xcrun simctl ui "\$UDID" appearance dark/);
    expect(skrypt).toMatch(/07-offline \] && xcrun simctl ui "\$UDID" appearance light/);
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
      expect([s, poOknie]).toEqual([s, expect.stringMatching(/^(?:#[^\n]*\n)*- extendedWaitUntil:\n {4}notVisible:\n {6}id: "zakladanie-start"\n {4}timeout: \d+\n(?:#[^\n]*\n)*- scrollUntilVisible:\n {4}element:\n {6}id: "zakwas-cykl"\n/)]);
    }
  });

  // Zrzuty #2 (run 43050106530, 2026-11-11): na 6,3″ w pl ekran Zakwasy jest przewinięty w dół do przycisku pierwszego
  // dokarmienia, więc pas zakwasu (`zakwas-cykl`, PasZakwasu) leży NAD kadrem i `extendedWaitUntil visible` nie przechodzi
  // (hierarchia step-013: karta-profil y=-49). Na 6,9″ i w en-US przewinięcie było mniejsze. Czekanie = przewijanie w górę (D-374).
  it('po przewinięciu w dół do pierwszego dokarmienia pas zakwasu jest szukany przewijaniem w górę z limitem czasu, nie samym czekaniem (D-374)', () => {
    for (const s of ['00-przygotuj', '00-zgoda']) {
      const tekst = readFileSync(join(scenyDir, `${s}.yaml`), 'utf8').replace(/\r\n/g, '\n');
      expect([s, tekst]).toEqual([s, expect.stringMatching(/- scrollUntilVisible:\n {4}element:\n {6}id: "zakladanie-pierwsze-dokarmienie-btn"\n/)]);
      expect([s, tekst]).toEqual([s, expect.stringMatching(/- scrollUntilVisible:\n {4}element:\n {6}id: "zakwas-cykl"\n {4}direction: UP\n {4}timeout: 15000\n/)]);
      expect([s, tekst]).toEqual([s, expect.not.stringMatching(/visible:\n {6}id: "zakwas-cykl"/)]);
    }
  });

  // KO-046 (właściciel, 2026-11-11), D-377: nagłówka diagnozy nie da się wyśrodkować (koniec listy Doktora), a Maestro 2.11
  // przyjmuje samą widoczność dopiero po 5 próbach centrowania (~4–5 s każda) — dłużej niż limit 20 s. Ramka 04 = cała karta
  // diagnozy: przewinięcie do ostatniego elementu karty, bez centerElement.
  it('ramka 04: przewinięcie do „Kopiuj jako tekst” (koniec karty diagnozy), bez centerElement (KO-046, D-377)', () => {
    const r04 = readFileSync(join(scenyDir, '04-doktor.yaml'), 'utf8').replace(/\r\n/g, '\n');
    const kroki04 = r04.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
    expect(kroki04).not.toMatch(/centerElement/);
    expect(kroki04).toMatch(/- scrollUntilVisible:\n {4}element:\n {6}id: "copy-diagnosis-btn"\n?$/);
    expect(read('src/components/doktor/DiagnosisResultCard.tsx')).toContain('testID="copy-diagnosis-btn"');
  });

  // Zrzuty #3 (run 43072716967, job 130706952647, 2026-11-11): na 6,3″ (402×874 pt) „Doktor Chleba” leży na końcu listy
  // Dziennika pod krawędzią ekranu (maestro.log: dziennik-doktor-btn bounds=[16,854][386,906], tap w (201,880)); tapOn
  // nie przewija, więc Doktor się nie otworzył. Na 6,9″ przycisk mieścił się (y 830–882 przy 956). Przewinięcie przed tapnięciem (D-378).
  // Zrzuty #5 (run 43166559855): po D-381 na 6,9″ przycisk spadł pod pasek kart (y 885–937, pasek od 873) i stuknięcie trafiło
  // w „Zakwasy”; D-391 dokłada `scroll` do końca treści i ponowne przewinięcie przed tapnięciem (straż: zrzuty-sklepu-przewijanie).
  it('ramka 04: „Doktor Chleba” przewinięty do końca treści przed tapnięciem (6,3″ pod krawędzią ekranu D-378, 6,9″ pod paskiem kart D-391)', () => {
    const r04 = readFileSync(join(scenyDir, '04-doktor.yaml'), 'utf8').replace(/\r\n/g, '\n');
    const kroki04 = r04.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
    expect(kroki04).toMatch(/- tapOn:\n {4}id: "tab-dziennik"\n- scrollUntilVisible:\n {4}element:\n {6}id: "dziennik-doktor-btn"\n- scroll\n- scrollUntilVisible:\n {4}element:\n {6}id: "dziennik-doktor-btn"\n- tapOn:\n {4}id: "dziennik-doktor-btn"\n/);
    expect(read('app/(tabs)/dziennik/index.tsx')).toContain('testID="dziennik-doktor-btn"');
  });

  // KO-043 (właściciel, 2026-11-11): ramka 05 = zakwas po zakładaniu. „Podwoił objętość” w 0–8 h po dokarmieniu kończy
  // zakładanie (isReadyAfterFeeding, setupCompletedAt), po restarcie karta cyklu z „Gotowy do ciasta.” (D-372).
  it('przygotowanie kończy zakładanie przez „Podwoił objętość”, a ramka 05 pokazuje kartę cyklu z „Gotowy do ciasta.” (KO-043)', () => {
    // KO-049 (D-385): podwojenie w części 2 przygotowania (00-przygotuj-podwojenie.yaml), po restarcie i zakładce Zakwasy;
    // część 1 kończy się na pasie zakwasu po pierwszym dokarmieniu
    const przyg = readFileSync(join(scenyDir, '00-przygotuj.yaml'), 'utf8').replace(/\r\n/g, '\n');
    expect(przyg.trimEnd().endsWith('      id: "zakwas-cykl"\n    direction: UP\n    timeout: 15000')).toBe(true);
    const czesc2 = readFileSync(join(scenyDir, '00-przygotuj-podwojenie.yaml'), 'utf8').replace(/\r\n/g, '\n');
    expect(czesc2).not.toMatch(/clearState: true/);
    const poPasie = czesc2.split('- runFlow: sub/start.yaml\n- tapOn:\n    id: "tab-zakwasy"\n')[1] ?? '';
    expect(poPasie).toMatch(/^(?:#[^\n]*\n)*- scrollUntilVisible:\n {4}element:\n {6}id: "zakwas-podwoil-btn"\n- tapOn:\n {4}id: "zakwas-podwoil-btn"\n- scrollUntilVisible:\n {4}element:\n {6}id: "zakladanie-wynik-ready"\n {4}direction: UP\n/);
    const r05 = readFileSync(join(scenyDir, '05-zakwasy.yaml'), 'utf8').replace(/\r\n/g, '\n');
    // KO-055 (D-393, zmienia KO-052/D-382): karta cyklu nad profilem, więc bez przewijania; na końcu asercja widoczności
    // „Gotowy do ciasta.” (istota KO-043). Rachunek kadru: tests/zrzuty-sklepu-kadry.test.ts.
    expect(r05).toMatch(/- assertVisible:\n {4}id: "zakwas-gotowy"\n?$/);
    expect(r05.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n")).not.toMatch(/scrollUntilVisible|^- scroll|swipe/m);
    expect(r05.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n")).not.toMatch(/centerElement/);
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

// KO-047 (właściciel, 2026-11-11), D-380: wejście `sceny` — przebieg wybranych scen (np. 04 na 6,3″) zamiast wszystkich 7.
// Puste = wszystkie, jak dotąd. Niepełny zestaw nie udaje kompletu: artefakty z przyrostkiem `-czesciowe`, więc asc-zrzuty.yml
// (pobiera `sklep-ramki`) nie dostanie go do wysyłki, a komplet sprawdza tylko wybrane sceny.
describe('wybór scen: wejście `sceny` (KO-047, D-380)', () => {
  type PlanSceny = Plan & { sceny: string[]; komplet: boolean; przyrostek: string };
  const planS = (...a: string[]) => planuj(...a) as PlanSceny;
  const kolejnosc = /^SCENY="([^"]+)"/m.exec(skrypt)?.[1].split(' ') ?? [];
  const zadanie = (id: string) => wf.split(`\n  ${id}:\n`)[1]?.split(/\n  [a-z]+:\n/)[0] ?? '';

  it('puste = wszystkie 7 w kolejności skryptu, komplet, bez przyrostka (domyślne zachowanie bez zmian)', () => {
    const w = planS('--tylko', 'pl');
    expect(kolejnosc).toHaveLength(7);
    expect(w.sceny).toEqual(kolejnosc);
    expect(w.komplet).toBe(true);
    expect(w.przyrostek).toBe('');
  });

  it('wybór po pełnej nazwie albo numerze, w kolejności skryptu (03 ostatnia), bez powtórzeń; niepełny = `-czesciowe`', () => {
    const w = planS('--sceny', '03-prowadzenie-ciemny,04,04-doktor');
    expect(w.sceny).toEqual(['04-doktor', '03-prowadzenie-ciemny']);
    expect(w.komplet).toBe(false);
    expect(w.przyrostek).toBe('-czesciowe');
    expect(planS('--sceny', [...kolejnosc].reverse().join(',')).komplet).toBe(true);
  });

  it.each([['xx'], ['08'], ['04;rm -rf'], ['00-przygotuj']])('złe sceny %s: kod 1 i ::error::', (s) => {
    const r = planujKod('--sceny', s);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/::error::/);
    expect(r.stdout).toBe('');
  });

  it('workflow: wejście `sceny` (domyślnie puste) i znacznik [sceny=…] z pierwszej linii commita idą przez env do planu', () => {
    expect(wf).toMatch(/\n {6}sceny:\n {8}description: '[^']+'\n {8}required: false\n {8}type: string\n {8}default: ''\n/);
    const plan = zadanie('plan');
    expect(plan).toMatch(/WE_SCENY: \$\{\{ inputs\.sceny \}\}/);
    expect(plan).toMatch(/sceny="\$WE_SCENY"/);
    expect(plan).toMatch(/sceny=\$\(printf '%s' "\$linia" \| sed -n 's\/\.\*\\\[sceny=/);
    expect(plan).toMatch(/--sceny "\$sceny"/);
    expect(plan).toMatch(/sceny: \$\{\{ steps\.plan\.outputs\.sceny \}\}/);
    expect(plan).toMatch(/przyrostek: \$\{\{ steps\.plan\.outputs\.przyrostek \}\}/);
  });

  it('zrzuty: lista scen z planu do skryptu przez env; skrypt odrzuca scenę spoza swojej listy', () => {
    expect(zadanie('zrzuty')).toMatch(/ZRZUTY_SCENY: \$\{\{ needs\.plan\.outputs\.sceny \}\}/);
    const wybor = skrypt.split('# --- wybór scen')[1]?.split('\n\n')[0] ?? '';
    expect(wybor).toMatch(/ZRZUTY_SCENY/);
    expect(wybor).toMatch(/::error::/);
    expect(wybor).toMatch(/exit 2/);
  });

  it('komplet sprawdza tylko sceny z planu, a niepełny zestaw ma artefakty z przyrostkiem (nie `sklep-zrzuty`/`sklep-ramki`)', () => {
    const zb = zadanie('zbierz');
    expect(zb).toMatch(/SCENY_PLAN: \$\{\{ needs\.plan\.outputs\.sceny \}\}/);
    expect(zb).toMatch(/case " \$SCENY_PLAN " in \*" \$n "\*\) ;; \*\) continue ;; esac/);
    expect(zb).toMatch(/\[ -n "\$SCENY_PLAN" \] \|\| \{ echo "::error::[^"]+"; exit 1; \}/);
    expect(zb).toMatch(/name: sklep-zrzuty\$\{\{ needs\.plan\.outputs\.przyrostek \}\}/);
    const rm = zadanie('ramki');
    expect(rm).toMatch(/needs: \[zbierz, plan\]/);
    expect(rm.match(/name: sklep-zrzuty\$\{\{ needs\.plan\.outputs\.przyrostek \}\}/g)).toHaveLength(1);
    expect(rm).toMatch(/name: sklep-ramki\$\{\{ needs\.plan\.outputs\.przyrostek \}\}/);
    expect(wf).not.toMatch(/name: sklep-(?:zrzuty|ramki)\n/);
  });
});
