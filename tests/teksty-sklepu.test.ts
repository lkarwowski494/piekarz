/**
 * Teksty o aplikacji (opis sklepu, README, strona www) twierdzą tylko to, co robi kod tej wersji
 * [M1-audytor-generalny-035; 10-wydanie-003, 01-odkrywanie-017, 11-wzrost-003].
 * Pełna tabela twierdzenie → plik:linia: raport roli 10 (fix-2026-10-19-p3/wynik.md); ten test pilnuje,
 * żeby obietnice bez pokrycia z audytu M1 nie wróciły i żeby pola sklepu mieściły się w limitach Apple
 * (App Store Connect Help, odczyt 2026-10-19: nazwa i podtytuł 30 znaków, tekst promocyjny 170, opis 4000).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

const DOKUMENTY = [
  'README.md',
  'docs/app-store-metadata-v2.md',
  'docs/15-app-store.md',
  'site/index.html',
  'site/support.html',
  'site/privacy.html',
];

/** Linie, które opisują wycięcie funkcji (lista odcięć), mogą ją nazwać. */
const LINIA_ODCIECIA = /wyci[eę]t|lista odcięć|KL-\d|PÓŹNIEJ|ukryte/i;

const BEZ_POKRYCIA: readonly [RegExp, string][] = [
  [/12 faz|12 FAZ|12-stage|12 stages/i, 'Stolnica ma kroki z planu, nie 12 faz (DEC-04 a)'],
  [/12 (recovery protocols|planów ratunkowych|protokoł)/i, 'Doktor ma 4 protokoły ratunkowe (src/doctor/dough-recovery.ts)'],
  [/≥\s?5[26]\s?pt|\\ge 5[26]|56 pt|52 pt/i, 'tekst bez liczby pola dotyku (DEC-15 a)'],
  [/Doktor Ciasta/, 'nazwa w aplikacji: Doktor Chleba'],
  [/fiszk|Mental Baker Drill|trening intuicji|flashcard/i, 'trener i fiszki wycięte (KL-13)'],
  [/atlas (europejskich )?(typów )?mąk|flour atlas/i, 'słownik i atlas mąk bez wejścia w aplikacji (F-46 PÓŹNIEJ)'],
  [/never drift or pause|odporne na uśpienie|odpornymi na tło|zero timer drift/i, 'sygnał przy uśpionym telefonie to powiadomienie lokalne (F-16)'],
  [/przeniesiesz parametry na Stolnicę|on your workbench|Przenieś do Stolnicy|naprawić recepturę na Stolnicy/i, 'pivot wczytuje gotową recepturę do Kalkulatora'],
  [/35 języ|35 languages/i, 'w 1.0 aktywne PL i EN (DEC-06 b, ACTIVE_LANGS)'],
  [/kahm[^.]*bezpieczn|bezpieczny kożuch|kahm yeast\*?\)? od groźnej/i, 'każdy nalot → wyrzuć (DEC-10 a, ZAK-NAL-001)'],
  [/zabija drożdże/i, 'twierdzenie dziedzinowe bez wpisu w rejestrze treści'],
  [/23:00[^0-9]{1,5}06:00|22:00[^0-9]{1,5}06:30/, 'okno snu domyślnie 23:00–06:30 (src/scheduler/reverse-scheduler.ts)'],
  [/1161|1037 testów|566 (cases|wzorcowych)/i, 'liczby testów bez pomiaru'],
];

const POLA_LIMITY: readonly [RegExp, number][] = [
  [/^\| \*\*(Nazwa aplikacji \(Name\)|App Name)\*\* \| `([^`]*)` \| \*\*(\d+)\*\*/, 30],
  [/^\| \*\*(Podtytuł \(Subtitle\)|Subtitle)\*\* \| `([^`]*)` \| \*\*(\d+)\*\*/, 30],
  [/^\| \*\*(Tekst promocyjny \(Promotional Text\)|Promotional Text)\*\* \| `([^`]*)` \| \*\*(\d+)\*\*/, 170],
];

const znaki = (s: string) => [...s].length;

describe('Store, README and site texts claim only what this version does (035)', () => {
  it.each(DOKUMENTY)('%s has no claims without code coverage from the M1 audit', (f) => {
    const found = read(f)
      .split('\n')
      .flatMap((linia, i) =>
        LINIA_ODCIECIA.test(linia) ? [] : BEZ_POKRYCIA.filter(([re]) => re.test(linia)).map(([, why]) => `${f}:${i + 1} ${why}`),
      );
    expect(found).toEqual([]);
  });

  it('README does not list hidden (PÓŹNIEJ) features as implemented', () => {
    const lines = read('README.md').split('\n');
    const hidden = /Słownik Odpowiedników|Lievito Madre|Przepisy na Odrzut|Strata piecow|strata wypiekow|Rodzina Apps4Craft/i;
    expect(lines.filter((l) => hidden.test(l) && /Wdrożone/.test(l))).toEqual([]);
  });

  it('metadata fields fit Apple limits and the stated character counts are true', () => {
    const rows = read('docs/app-store-metadata-v2.md').split('\n');
    let checked = 0;
    for (const row of rows) {
      for (const [re, limit] of POLA_LIMITY) {
        const m = row.match(re);
        if (!m) continue;
        checked += 1;
        expect({ pole: m[1], znaki: znaki(m[2]) }).toEqual({ pole: m[1], znaki: Number(m[3]) });
        expect(znaki(m[2])).toBeLessThanOrEqual(limit);
      }
    }
    expect(checked).toBe(6);
  });

  it('both store descriptions fit 4000 characters, state their length and disclose the paid access', () => {
    const text = read('docs/app-store-metadata-v2.md').replace(/\r\n/g, '\n');
    const blocks = [...text.matchAll(/### [12]\.2\. Pełny Opis Aplikacji \(Description (PL|EN)[^)]*?(\d[\d ]*) \/ 4 000 znaków\)\n\n```text\n([\s\S]*?)\n```/g)];
    expect(blocks.map((b) => b[1])).toEqual(['PL', 'EN']);
    for (const [, lang, stated, body] of blocks) {
      expect({ lang, znaki: znaki(body) }).toEqual({ lang, znaki: Number(stated.replace(/ /g, '')) });
      expect(znaki(body)).toBeLessThanOrEqual(4000);
      expect(body).toMatch(lang === 'PL' ? /subskrypcj/ : /subscription/);
    }
  });

  it('site home page names the platform and the paid access', () => {
    const html = read('site/index.html');
    expect(html).toMatch(/iOS/);
    expect(html).toMatch(/subskrypcj/);
    expect(html).toMatch(/okres(em)? próbn/);
  });
});
