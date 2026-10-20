/**
 * Zrzuty sklepu App Store [M1-audytor-generalny-080; 10-wydanie-010]: dla każdego języka z `docs/wydanie/zrzuty/<kod ASC>/`
 * i każdej wymaganej klasy iPhone 7 plików PNG w kolejności D-055 (§5.2), wymiary klasy, bez kanału alfa, dokładnie jedna
 * ramka ciemna, podpisy równe §3 `docs/app-store-metadata-v2.md`, oznaczenie funkcji płatnej zgodne ze strażnikiem dostępu
 * w kodzie i brak funkcji spoza kontraktu (OG-05) w podpisach.
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
const META = fs.readFileSync(path.join(root, 'docs/app-store-metadata-v2.md'), 'utf8').replace(/\r\n/g, '\n');

const KLASY: Record<string, [number, number]> = { 'iphone-6.9': [1320, 2868], 'iphone-6.3': [1206, 2622] };

/** Kolejność §5.2 i obszary strażnika dostępu, które obiecuje podpis ramki (ramka 6: ocena po wypieku i „Piecz ponownie”). */
const RAMKI: Array<{ plik: string; funkcje: Funkcja[] }> = [
  { plik: '01-plan.png', funkcje: ['harmonogram'] },
  { plik: '02-receptura.png', funkcje: ['kalkulator'] },
  { plik: '03-prowadzenie-ciemny.png', funkcje: ['stolnica'] },
  { plik: '04-doktor.png', funkcje: ['doktor'] },
  { plik: '05-zakwasy.png', funkcje: ['zakwas'] },
  { plik: '06-dziennik.png', funkcje: ['historia', 'stolnica', 'kalkulator'] },
  { plik: '07-offline.png', funkcje: [] },
];

/** Kod lokalizacji App Store Connect → język aplikacji i sekcja podpisów §3. */
const JEZYKI: Record<string, { lang: Lang; sekcja: 'PL' | 'EN' }> = { pl: { lang: 'pl', sekcja: 'PL' }, 'en-US': { lang: 'en', sekcja: 'EN' } };

/** Funkcje spoza kontraktu (OG-05): QR, druk PDF, spiżarnia, przelicznik objętości, masa lodu. */
const OG05 = /\bQR\b|druk|\bprint|spiżarn|pantry|objętoś|volume|\blód\b|\blodu\b|\bice\b/i;

function podpisyS3(sekcja: 'PL' | 'EN') {
  const s3 = META.split('\n## 3. ')[1].split('\n## 4. ')[0];
  return [1, 2, 3, 4, 5, 6, 7].map((nr) => {
    const blok = s3.split(`### Ramka ${nr}:`)[1].split('\n### ')[0];
    const pole = (re: RegExp) => blok.match(re)?.[1];
    return sekcja === 'PL'
      ? { naglowek: pole(/\*\*Główny nagłówek \(PL\):\*\* \*(.+?)\*$/m), podtytul: pole(/\*\*Podtytuł \(PL\):\*\* \*(.+?)\*$/m) }
      : { naglowek: pole(/\*\*Main Headline \(EN\):\*\* \*(.+?)\*$/m), podtytul: pole(/\*\*Sub-headline \(EN\):\*\* \*(.+?)\*$/m) };
  });
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
  it('są katalogi języków wydania pl i en-US', () => {
    expect(jezyki).toEqual(expect.arrayContaining(['en-US', 'pl']));
    for (const j of jezyki) expect(Object.keys(JEZYKI)).toContain(j);
  });

  describe.each(jezyki.length ? jezyki : ['pl', 'en-US'])('%s', (jezyk) => {
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

    it('podpisy.json: podpis każdej ramki równy §3, oznaczenie funkcji płatnej według strażnika dostępu, bez OG-05', () => {
      const plik = path.join(dir, 'podpisy.json');
      expect(fs.existsSync(plik)).toBe(true);
      const dane: unknown = JSON.parse(fs.readFileSync(plik, 'utf8'));
      const ramki: unknown = typeof dane === 'object' && dane !== null ? Reflect.get(dane, 'ramki') : null;
      expect(Array.isArray(ramki)).toBe(true);
      const lista = Array.isArray(ramki) ? ramki : [];
      const { lang, sekcja } = JEZYKI[jezyk];
      const s3 = podpisyS3(sekcja);
      setLang(lang);
      const pro = t('wymaga Piekarz Pro');
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
      });
    });
  });

  it('oznaczenie płatne: ramki 1–6 wymagają dostępu, ramka 7 (offline i prywatność) nie', () => {
    expect(RAMKI.map((r) => r.funkcje.some((f) => !dozwolona(f, false)))).toEqual([true, true, true, true, true, true, false]);
  });
});
