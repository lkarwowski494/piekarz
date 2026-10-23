/**
 * Zrzuty sklepu App Store [M1-audytor-generalny-080; 10-wydanie-010]: dla każdego języka z `docs/wydanie/zrzuty/<kod ASC>/`
 * i każdej wymaganej klasy iPhone 7 plików PNG w kolejności D-055 (§5.2), wymiary klasy, bez kanału alfa, dokładnie jedna
 * ramka ciemna, podpisy równe polom `ramki` z `docs/wydanie/metadane/<kod ASC>.json` (jedno źródło roli 10, 095),
 * oznaczenie funkcji płatnej zgodne ze strażnikiem dostępu w kodzie i równe `t('wymaga Piekarz Pro')` w języku
 * lokalizacji, brak funkcji spoza kontraktu (OG-05) i brak „Crust” (D-053) w podpisach.
 * W repo: pl, en-US i nl-NL (najdłuższe podpisy, pomiar roli 10 w 095); pozostałe 31 lokalizacji poza gitem (decyzja M2, p7).
 *
 * Klasy: App Store Connect Help, „Screenshot specifications” (odczyt 2026-10-20): „iPhone: At least one screenshot for
 * iPhone with Dynamic Island (medium display)” (1206 × 2622 px); klasa Face ID (large display) jest wymagana, gdy nie ma
 * zrzutów Dynamic Island (large display), więc dajemy też 6.9" (1320 × 2868 px). iPad: app.json `supportsTablet: false`.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { setLang, t, type Lang } from '../src/lib/i18n';
import { dozwolona } from '../src/lib/platnosci/dostep';
import type { Funkcja } from '../src/lib/platnosci/konfiguracja';

const root = path.join(__dirname, '..');
const KATALOG = path.join(root, 'docs/wydanie/zrzuty');
const METADANE = path.join(root, 'docs/wydanie/metadane');

const KLASY: Record<string, [number, number]> = { 'iphone-6.9': [1320, 2868], 'iphone-6.3': [1206, 2622] };

/**
 * Kolejność §5.2 i obszary strażnika dostępu, które obiecuje podpis ramki (ramka 6: ocena po wypieku i „Piecz ponownie”).
 * Przepisane z kontraktu D-038 [M3 P-a]: funkcje według kontraktu Basic/Pro (D-112, D-113) — ramka 1 to plan wstecz
 * (Pro), ramka 5 ilości do dokarmienia i przypomnienie (Pro), reszta Basic. Pliki PNG z dawnym oznaczeniem na ramkach
 * 2, 3, 4 i 6 wygeneruje ponownie rola 10 (Z-8 w docs/monetyzacja.md).
 */
const RAMKI: Array<{ plik: string; funkcje: Funkcja[] }> = [
  { plik: '01-plan.png', funkcje: ['plan-wstecz'] },
  { plik: '02-receptura.png', funkcje: ['kalkulator'] },
  { plik: '03-prowadzenie-ciemny.png', funkcje: ['stolnica'] },
  { plik: '04-doktor.png', funkcje: ['doktor'] },
  { plik: '05-zakwasy.png', funkcje: ['proporcje-zakwasu', 'przypomnienia-zakwasu'] },
  { plik: '06-dziennik.png', funkcje: ['historia', 'stolnica', 'kalkulator'] },
  { plik: '07-offline.png', funkcje: [] },
];

/** Kod lokalizacji App Store Connect → język aplikacji (jak `LOKALIZACJE` w scripts/sprawdz-metadane.mjs). */
const JEZYKI: Record<string, Lang> = {
  'en-US': 'en', 'en-GB': 'en', 'en-AU': 'en', 'en-CA': 'en',
  'de-DE': 'de', 'nl-NL': 'nl', 'fr-FR': 'fr', 'fr-CA': 'fr', it: 'it', 'es-ES': 'es', 'es-MX': 'es-419',
  'pt-BR': 'pt-BR', 'pt-PT': 'pt', pl: 'pl', cs: 'cs', sk: 'sk', hu: 'hu', hr: 'hr', sl: 'sl', ro: 'ro',
  sv: 'sv', no: 'nb', da: 'da', fi: 'fi', ru: 'ru', uk: 'uk', el: 'el', tr: 'tr', ja: 'ja', ko: 'ko',
  'zh-Hant': 'zh-Hant', id: 'id', ms: 'ms', vi: 'vi',
};

/** Ramki w repo (decyzja M2, p7): pl, en-US i nl-NL jako kontrola najdłuższych podpisów. */
const W_REPO = ['en-US', 'nl-NL', 'pl'];

/** Funkcje spoza kontraktu (OG-05): QR, druk PDF, spiżarnia, przelicznik objętości, masa lodu. */
const OG05 = /\bQR\b|druk|\bprint|spiżarn|pantry|objętoś|volume|\blód\b|\blodu\b|\bice\b/i;

/** Podpisy 7 ramek z metadanych lokalizacji (`docs/wydanie/metadane/<kod>.json`, pole `ramki`). */
function podpisyMetadanych(kod: string): Array<{ naglowek: unknown; podtytul: unknown }> {
  const dane: unknown = JSON.parse(fs.readFileSync(path.join(METADANE, `${kod}.json`), 'utf8'));
  const ramki: unknown = typeof dane === 'object' && dane !== null ? Reflect.get(dane, 'ramki') : null;
  const lista: unknown[] = Array.isArray(ramki) ? ramki : [];
  return lista.map((r) => ({
    naglowek: typeof r === 'object' && r !== null ? Reflect.get(r, 'naglowek') : undefined,
    podtytul: typeof r === 'object' && r !== null ? Reflect.get(r, 'podtytul') : undefined,
  }));
}

/** Nagłówek IHDR: szerokość, wysokość, typ koloru (4 i 6 = z kanałem alfa). */
function ihdr(plik: string) {
  const b = fs.readFileSync(plik);
  expect(b.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(b.subarray(12, 16).toString('ascii')).toBe('IHDR');
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), typKoloru: b[25] };
}

const jezyki = fs.existsSync(KATALOG)
  ? fs.readdirSync(KATALOG, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];

afterAll(() => setLang('pl'));

describe('zrzuty sklepu App Store (080)', () => {
  it('są katalogi lokalizacji w repo: pl, en-US i nl-NL (najdłuższe podpisy); każdy katalog to lokalizacja z metadanych', () => {
    expect(jezyki).toEqual(expect.arrayContaining(W_REPO));
    for (const j of jezyki) {
      expect(Object.keys(JEZYKI)).toContain(j);
      expect(fs.existsSync(path.join(METADANE, `${j}.json`))).toBe(true);
    }
  });

  describe.each([...new Set([...jezyki, ...W_REPO])].sort())('%s', (jezyk) => {
    const dir = path.join(KATALOG, jezyk);

    it.each(Object.keys(KLASY))('klasa %s: 7 PNG w kolejności §5.2, wymiary klasy, bez alfy, jedna ramka ciemna', (klasa) => {
      const pliki = fs.existsSync(path.join(dir, klasa)) ? fs.readdirSync(path.join(dir, klasa)).filter((p) => p.endsWith('.png')).sort() : [];
      expect(pliki).toEqual(RAMKI.map((r) => r.plik));
      expect(pliki.filter((p) => p.includes('-ciemny'))).toEqual(['03-prowadzenie-ciemny.png']);
      for (const p of pliki) {
        const { w, h, typKoloru } = ihdr(path.join(dir, klasa, p));
        expect({ p, w, h }).toEqual({ p, w: KLASY[klasa][0], h: KLASY[klasa][1] });
        expect({ p, alfa: typKoloru === 4 || typKoloru === 6 }).toEqual({ p, alfa: false });
      }
    });

    it('podpisy.json: podpis każdej ramki równy metadanym lokalizacji, oznaczenie płatne według strażnika w języku lokalizacji, bez OG-05 i „Crust”', () => {
      const plik = path.join(dir, 'podpisy.json');
      expect(fs.existsSync(plik)).toBe(true);
      const dane: unknown = fs.existsSync(plik) ? JSON.parse(fs.readFileSync(plik, 'utf8')) : null;
      const ramki: unknown = typeof dane === 'object' && dane !== null ? Reflect.get(dane, 'ramki') : null;
      expect(Array.isArray(ramki)).toBe(true);
      const lista = Array.isArray(ramki) ? ramki : [];
      const s3 = podpisyMetadanych(jezyk);
      expect(s3).toHaveLength(7);
      setLang(JEZYKI[jezyk]);
      const pro = t('wymaga Piekarz Pro');
      if (JEZYKI[jezyk] !== 'pl') expect(pro).not.toBe('wymaga Piekarz Pro');
      expect(lista).toHaveLength(7);
      RAMKI.forEach((r, i) => {
        const x: unknown = lista[i];
        const pole = (k: string): unknown => (typeof x === 'object' && x !== null ? Reflect.get(x, k) : undefined);
        const platna = r.funkcje.some((f) => !dozwolona(f, false));
        expect({ plik: pole('plik'), naglowek: pole('naglowek'), podtytul: pole('podtytul'), oznaczenie: pole('oznaczenie') }).toEqual({
          plik: r.plik,
          naglowek: s3[i].naglowek,
          podtytul: s3[i].podtytul,
          oznaczenie: platna ? pro : null,
        });
        expect(`${s3[i].naglowek} ${s3[i].podtytul}`).not.toMatch(OG05);
        expect(`${s3[i].naglowek} ${s3[i].podtytul} ${platna ? pro : ''}`).not.toMatch(/\bCrust\b/);
      });
    });
  });

  it('oznaczenie Pro: ramka 1 (plan wstecz) i 5 (dokarmianie z przypomnieniem) wymagają Pro, pozostałe to Basic (D-112, D-113)', () => {
    expect(RAMKI.map((r) => r.funkcje.some((f) => !dozwolona(f, false)))).toEqual([true, false, false, false, true, false, false]);
  });
});
