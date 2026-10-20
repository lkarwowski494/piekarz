/**
 * Teksty o aplikacji (opis sklepu, README, strona www) twierdzą tylko to, co robi kod tej wersji
 * [M1-audytor-generalny-035; 10-wydanie-003, 01-odkrywanie-017, 11-wzrost-003].
 * Pełna tabela twierdzenie → plik:linia: raport roli 10 (fix-2026-10-19-p3/wynik.md); ten test pilnuje,
 * żeby obietnice bez pokrycia z audytu M1 nie wróciły i żeby pola sklepu mieściły się w limitach Apple
 * (App Store Connect Help, odczyt 2026-10-19: nazwa i podtytuł 30 znaków, tekst promocyjny 170, opis 4000).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getLocalesByStatus } from '../src/lib/i18n-locales';

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

  /**
   * Kontrakt B (D-043, OG-05): opis sklepu, README, strona i podpisy zrzutów bez QR, druku PDF, spiżarni,
   * przelicznika objętości i masy lodu; nazwa według D-053 bez „Crust”; bez deklaracji licencji, której
   * repo nie ma (brak pliku licencji i pola `license`: decyzja właściciela) [M1-audytor-generalny-035].
   * Linie listy odcięć (PÓŹNIEJ, wycięte, ukryte) mogą nazwać funkcję.
   */
  it.each(DOKUMENTY)('%s: bez funkcji PÓŹNIEJ i NIE (OG-05), bez „Crust” i bez „GPLv3”', (f) => {
    const found = read(f)
      .split('\n')
      .flatMap((linia, i) => {
        const why: string[] = [];
        if (!LINIA_ODCIECIA.test(linia) && OG05.test(linia)) why.push('funkcja PÓŹNIEJ/NIE (OG-05)');
        if (/\bCrust\b/.test(linia)) why.push('nazwa według D-053: Piekarz / Baker');
        if (/GPL|Open Core/i.test(linia)) why.push('licencja bez pliku licencji (decyzja właściciela)');
        return why.map((w) => `${f}:${i + 1} ${w}`);
      });
    expect(found).toEqual([]);
  });

  /**
   * Liczba języków w tekście = liczba języków `released` w rejestrze (src/lib/i18n-locales.ts). Zastępuje dawny zakaz
   * „35 języków” z czasów PL i EN: po 093 liczba jest prawdziwa, a każda inna liczba języków albo spadek liczby
   * języków w rejestrze bez zmiany tekstu daje błąd [M1-audytor-generalny-095].
   */
  it.each(DOKUMENTY)('%s: liczba języków w tekście jest liczbą języków released', (f) => {
    const released = getLocalesByStatus('released').length;
    const found = read(f)
      .split('\n')
      .flatMap((linia, i) => [...linia.matchAll(/(\d+) (języ|languages)/gi)].map((m) => ({ gdzie: `${f}:${i + 1}`, liczba: Number(m[1]) })))
      .filter((x) => x.liczba !== released);
    expect(found).toEqual([]);
  });

  /** Lista języków bez liczby („polski i angielski”, „pl, en”) też musi zgadzać się z rejestrem [M1-audytor-generalny-095]. */
  it.each([...DOKUMENTY, 'docs/wydanie/sklep.md'])('%s: nie podaje języków aplikacji jako tylko polski i angielski', (f) => {
    const zle = read(f)
      .split('\n')
      .map((linia, i) => ({ gdzie: `${f}:${i + 1}`, linia }))
      .filter((x) => /[Jj]ęzyki[^|\n]*:\s*polski i angielski|Languages:\s*Polish and English|\|\s*Języki\s*\|\s*pl, en\b/.test(x.linia));
    expect(getLocalesByStatus('released').length).toBeGreaterThan(2);
    expect(zle).toEqual([]);
  });

  it('README: funkcje PÓŹNIEJ (F-08, F-30, F-45, F-50, lekcje Akademii F-44) nie są „Wdrożone”', () => {
    const lines = read('README.md').split('\n');
    expect(lines.filter((l) => /`F-(08|30|45|50)`/.test(l) && /Wdrożone/.test(l))).toEqual([]);
    expect(lines.filter((l) => /Akademi|Szkoł[ay] Chleba|lekcj/i.test(l) && /Wdrożone/.test(l) && !/PÓŹNIEJ/.test(l))).toEqual([]);
  });

  it('podpisy zrzutów (§3) idą w kolejności D-055 i wskazują istniejące ekrany', () => {
    const doc = read('docs/app-store-metadata-v2.md').replace(/\r\n/g, '\n');
    const s3 = doc.split(/^## /m).find((s) => /^3\. /.test(s)) ?? '';
    const ramki = [...s3.matchAll(/^### Ramka (\d): ([^\n]+)/gm)].map((m) => m[2]);
    expect(ramki.length).toBe(7);
    const kolejnosc = [/[Pp]lan/, /[Rr]eceptur|ilości/, /[Pp]rowadzenie/, /Doktor/, /[Zz]akwas/, /[Dd]ziennik/, /[Oo]ffline|[Pp]rywatno/];
    ramki.forEach((r, i) => expect({ i, r, ok: kolejnosc[i].test(r) }).toEqual({ i, r, ok: true }));
    for (const [, plik] of s3.matchAll(/`((?:app|src)\/[^`]+\.tsx)`/g)) expect({ plik, jest: fs.existsSync(path.join(root, plik)) }).toEqual({ plik, jest: true });
    expect(s3).toMatch(/ciemn/);
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
    /** Źródło 34 lokalizacji (095): nazwa, podtytuł i tekst promocyjny każdej lokalizacji w tych samych limitach. */
    const KAT = 'docs/wydanie/metadane';
    const pliki = fs.readdirSync(path.join(root, KAT)).filter((f) => f.endsWith('.json'));
    expect(pliki).toHaveLength(34);
    let wJson = 0;
    for (const f of pliki) {
      const m = JSON.parse(read(`${KAT}/${f}`));
      for (const [p, limit] of [['nazwa', 30], ['podtytul', 30], ['tekstPromocyjny', 170], ['opis', 4000]] as const) {
        wJson += 1;
        expect({ f, p, ok: znaki(m[p]) <= limit && znaki(m[p]) > 0 }).toEqual({ f, p, ok: true });
      }
    }
    expect(wJson).toBe(34 * 4);
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

/**
 * Strona produktu zaczyna od głównej pracy i prywatności [M1-audytor-generalny-081; 10-wydanie-011]
 * (DEC-16 a, 2026-10-19). Pierwsze zdanie opisu i podtytuł = pola §5 dla `pl` i `en-US` (źródło przekładu 34
 * lokalizacji, D-054); prywatność w pierwszych trzech zdaniach; ograniczenia nazwane; nazwa według D-053;
 * opis bez funkcji PÓŹNIEJ i NIE z kontraktu B (OG-05: QR, druk PDF, spiżarnia, przelicznik objętości, masa lodu).
 */
/** Funkcje PÓŹNIEJ i NIE, których teksty o aplikacji nie obiecują (OG-05, `docs/zakres-wplyw-na-plan.md`). */
const OG05 =
  /\bQR\b|wydruk|drukuj|(?<!\p{L})druk(?!\p{L})|\bPDF\b|\bprint|spiżarni|pantry|flour inventory|przelicznik objęto|objętość ↔|volume (to weight|conver)|cups? to grams|szklank|(?<!\p{L})(lód|lodu)(?!\p{L})|\bice\b/iu;

describe('strona produktu: główna praca i prywatność na początku (081)', () => {
  const doc = read('docs/app-store-metadata-v2.md').replace(/\r\n/g, '\n');
  const opis = (naglowek: RegExp) => new RegExp(naglowek.source + '[^\\n]*\\n\\n```text\\n([\\s\\S]*?)\\n```').exec(doc)?.[1] ?? '';
  const pl = opis(/### 1\.2\. Pełny Opis Aplikacji/);
  const en = opis(/### 2\.2\. Pełny Opis Aplikacji/);
  const gb = opis(/#### 5\.1\.1\. Pełny opis en-GB, en-AU, en-CA/);
  const zdania = (s: string) => s.split('\n')[0].match(/[^.!?]+[.!?]/g) ?? [];
  /** Wiersz tabeli §5: kolumny po kodzie lokalizacji. */
  const wiersz5 = (kod: string) => {
    const linia = doc.split('\n').find((l) => l.startsWith('| ') && l.includes(`| \`${kod}\` |`)) ?? '';
    const k = linia.split(' | ').map((c) => c.replace(/^\| |`/g, '').trim());
    return { nazwa: k[2], podtytul: k[4], pierwsze: k[8] };
  };
  const pole = (re: RegExp) => doc.split('\n').map((l) => l.match(re)?.[1]).filter(Boolean);

  it.each([
    ['pl', () => pl],
    ['en-US', () => en],
    ['en-GB', () => gb],
  ] as const)('%s: pierwsze zdanie opisu jest pierwszym zdaniem z §5 (główna praca)', (kod, tekst) => {
    expect(tekst().length).toBeGreaterThan(500);
    expect(zdania(tekst())[0]).toBe(wiersz5(kod).pierwsze);
  });

  it('nazwa i podtytuł PL i EN w §1.1 i §2.1 są tymi samymi polami co §5 (D-053)', () => {
    expect(pole(/^\| \*\*(?:Nazwa aplikacji \(Name\)|App Name)\*\* \| `([^`]*)`/)).toEqual([wiersz5('pl').nazwa, wiersz5('en-US').nazwa]);
    expect(pole(/^\| \*\*(?:Podtytuł \(Subtitle\)|Subtitle)\*\* \| `([^`]*)`/)).toEqual([wiersz5('pl').podtytul, wiersz5('en-US').podtytul]);
    expect(wiersz5('pl').podtytul).toMatch(/[Pp]lan/);
    expect(wiersz5('en-US').podtytul).toMatch(/Calculator/);
  });

  it('prywatność (bez konta, bez śledzenia) w pierwszych trzech zdaniach i ograniczenia nazwane', () => {
    expect(zdania(pl).slice(0, 3).join(' ')).toMatch(/bez konta[\s\S]*bez śledzenia/);
    expect(zdania(en).slice(0, 3).join(' ')).toMatch(/without an account[\s\S]*no tracking/);
    expect(pl).toMatch(/iPhon[\s\S]*nie synchronizuje[\s\S]*Bez zgody na powiadomienia/);
    expect(en).toMatch(/iPhone[\s\S]*does not sync[\s\S]*Without permission for notifications/);
  });

  it('tekst promocyjny PL i EN mówi o głównej pracy i prywatności, bez żargonu (True Baker, 4-DDT)', () => {
    const promo = pole(/^\| \*\*(?:Tekst promocyjny \(Promotional Text\)|Promotional Text)\*\* \| `([^`]*)`/);
    expect(promo).toHaveLength(2);
    expect(promo[0]).toMatch(/gotowy[\s\S]*Bez konta/);
    expect(promo[1]).toMatch(/ready[\s\S]*No account/);
    for (const p of promo) expect(p).not.toMatch(/True Baker|4-DDT|Sleep Guard|100%/);
  });

  it('nazwa „Piekarz” / „Baker” bez dawnej „Crust” w całym dokumencie metadanych', () => {
    expect(doc.match(/Crust\b/g) ?? []).toEqual([]);
    expect(pl).toMatch(/^Piekarz /);
    expect(en).toMatch(/^Baker /);
  });

  it('opisy PL, EN i en-GB bez funkcji PÓŹNIEJ i NIE (OG-05) i bez Akademii bez wejścia (F-44)', () => {
    for (const tekst of [pl, en, gb]) {
      expect(tekst.split('\n').filter((l) => OG05.test(l))).toEqual([]);
      expect(tekst).not.toMatch(/Akademi|Academy|lekcj|lesson/i);
    }
  });

  it('opisy PL, EN i en-GB kończą się zdaniem o 35 językach z rejestru (093), bez „polski i angielski” [095]', () => {
    expect(getLocalesByStatus('released')).toHaveLength(35);
    expect(getLocalesByStatus('planned')).toEqual([]);
    expect(pl.split('\n').pop()).toMatch(/35 języ/);
    expect(en.split('\n').pop()).toMatch(/35 languages/);
    expect(gb.split('\n').pop()).toMatch(/35 languages/);
    for (const tekst of [pl, en, gb]) expect(tekst).not.toMatch(/polski i angielski|Polish and English/);
  });

  it('en-GB, en-AU, en-CA: opis = §2.2 z pisownią lokalną, w limicie 4000 znaków z podaną liczbą', () => {
    expect(gb).toBe(en.replace(/flavor/g, 'flavour').replace(/discoloration/g, 'discolouration'));
    expect(gb).not.toMatch(/flavor\b|discoloration/);
    const podane = /#### 5\.1\.1\.[^\n]*— (\d[\d ]*) \/ 4 000 znaków/.exec(doc)?.[1];
    expect(Number(podane?.replace(/ /g, ''))).toBe(znaki(gb));
    expect(znaki(gb)).toBeLessThanOrEqual(4000);
  });
});
