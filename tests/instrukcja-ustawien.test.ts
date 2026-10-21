/**
 * Instrukcja ustawień przed wydaniem i karty ustawień na lokalizację App Store [M1-audytor-generalny-119].
 * Prośba właściciela: „dokument jak ustawić wszystko” i „setup pod każdy język/sklep”.
 * - docs/wydanie/instrukcja-ustawien.md: kroki od umów i podatków do wysyłki; ID produktów = PRODUKTY,
 *   adresy = src/lib/links.ts, ceny z D-038 (docs/wydanie/ceny.json), każdy wiersz kroku ze źródłem
 *   (plik:linia w repo albo strona Apple), odwołania plik:linia istnieją, bez sekretów i identyfikatorów kont.
 * - docs/wydanie/ustawienia/<kod ASC>.md: karta dla każdego z 34 plików docs/wydanie/metadane/; pola dosłownie
 *   z metadanych z licznikiem n / limit (znaki w punktach kodowych, słowa kluczowe w bajtach UTF-8), kod ASC,
 *   storefronty z docs/wydanie/storefronty.json, status pomiaru, ścieżki 7 zrzutów w 2 klasach, ceny (bazowa USD,
 *   ręczne z D-038, reszta automatycznie), adresy; karty aktualne względem scripts/karty-ustawien.mjs.
 * Dlaczego test: 34 karty × 6 pól ręcznie rozjechałyby się z metadanymi przy pierwszej poprawce tekstu.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PRODUKTY } from '../src/lib/platnosci/konfiguracja';
import { PRIVACY_URL, SUPPORT_URL } from '../src/lib/links';

const root = path.join(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const istnieje = (p: string) => fs.existsSync(path.join(root, p));
const INSTRUKCJA = 'docs/wydanie/instrukcja-ustawien.md';
const KARTY = 'docs/wydanie/ustawienia';
const META = 'docs/wydanie/metadane';
const zn = (s: string) => [...s].length;
const bt = (s: string) => Buffer.byteLength(s, 'utf8');

type Meta = { lokalizacja: string; status: string; nazwa: string; podtytul: string; slowaKluczowe: string; tekstPromocyjny: string; opis: string; ramki: Array<{ naglowek: string; podtytul: string }> };
type Mapa = { lokalizacje: Record<string, { jezykAsc: string; domyslny: string[]; dodatkowy: string[] }> };
type Ceny = { bazowy: string; reczne: Record<string, { waluta: string; monthly: string; yearly: string; lifetime: string }> };

const kody = istnieje(META) ? fs.readdirSync(path.join(root, META)).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')) : [];
const meta = (kod: string): Meta => JSON.parse(read(`${META}/${kod}.json`));
const mapa = (): Mapa => JSON.parse(read('docs/wydanie/storefronty.json'));
const ceny = (): Ceny => JSON.parse(read('docs/wydanie/ceny.json'));
const kwota = (s: string) => s.replace('.', ',');

/** Sekcje wymagane testem akceptacyjnym 119 (nagłówki ## w instrukcji, w tej kolejności). */
const SEKCJE = [
  /umowy.*podatki.*bank/i,
  /Small Business Program/,
  /produkty/i,
  /oferty wprowadzające/i,
  /ceny/i,
  /dostępność/i,
  /prywatność/i,
  /kategoria wiekowa/i,
  /eksport kryptografii/i,
  /metadane i zrzuty/i,
  /App Review/,
  /TestFlight.*sandbox|sandbox.*TestFlight/i,
  /wysyłka/i,
];

describe('instrukcja ustawień przed wydaniem (119)', () => {
  const doc = istnieje(INSTRUKCJA) ? read(INSTRUKCJA) : '';
  const naglowki = doc.split('\n').filter((l) => /^## /.test(l));

  it('plik istnieje i ma sekcje z testu akceptacyjnego w kolejności kroków', () => {
    expect(istnieje(INSTRUKCJA)).toBe(true);
    const pozycje = SEKCJE.map((re) => naglowki.findIndex((h) => re.test(h)));
    expect(SEKCJE.map((re, i) => ({ sekcja: re.source, jest: pozycje[i] >= 0 }))).toEqual(SEKCJE.map((re) => ({ sekcja: re.source, jest: true })));
    expect([...pozycje].sort((a, b) => a - b)).toEqual(pozycje);
  });

  it('ID produktów to dokładnie PRODUKTY z src/lib/platnosci/konfiguracja.ts', () => {
    for (const id of Object.values(PRODUKTY)) expect({ id, jest: doc.includes(id) }).toEqual({ id, jest: true });
    const wDoc = new Set(doc.match(/com\.apps4brew\.baker\.[\w.]+\w/g) ?? []);
    expect([...wDoc].filter((id) => !Object.values(PRODUKTY).includes(id))).toEqual([]);
  });

  it('adresy Privacy Policy i Support to wartości z src/lib/links.ts; innych adresów apps4brew.com nie ma', () => {
    expect([doc.includes(PRIVACY_URL), doc.includes(SUPPORT_URL)]).toEqual([true, true]);
    const adresy = new Set(doc.match(/https?:\/\/(?:www\.)?apps4brew\.com[^\s)`|]*/g) ?? []);
    expect([...adresy].filter((a) => a !== PRIVACY_URL && a !== SUPPORT_URL)).toEqual([]);
  });

  it('ceny: bazowa USD i ręczne z D-038 (docs/wydanie/ceny.json), PL 4,99 / 29,99 / 79,99 zł', () => {
    const c = ceny();
    expect(c.bazowy).toBe('USA');
    expect(c.reczne.USA).toEqual({ waluta: 'USD', monthly: '0.99', yearly: '6.99', lifetime: '14.99' });
    expect(c.reczne.POL).toEqual({ waluta: 'PLN', monthly: '4.99', yearly: '29.99', lifetime: '79.99' });
    for (const [iso, p] of Object.entries(c.reczne)) {
      const wiersz = doc.split('\n').find((l) => l.startsWith('|') && l.includes(`\`${iso}\``) && l.includes(p.waluta));
      expect({ iso, wiersz: !!wiersz }).toEqual({ iso, wiersz: true });
      for (const k of [p.monthly, p.yearly, p.lifetime]) expect({ iso, k, jest: wiersz!.includes(kwota(k)) }).toEqual({ iso, k, jest: true });
    }
  });

  it('etykieta prywatności „Data Not Collected” i oferta 14 dni (Free Trial, 2 Weeks)', () => {
    expect(doc).toContain('Data Not Collected');
    expect(doc).toMatch(/2 Weeks/);
    expect(doc).toMatch(/14 dni/);
  });

  it('każdy wiersz tabeli kroków ma źródło: plik:linia w repo, strona Apple albo [DO USTALENIA]', () => {
    const wiersze = doc.split('\n').filter((l) => /^\|/.test(l) && !/^\|\s*:?-{3}/.test(l));
    const bezZrodla = wiersze.filter((l) => {
      const komorki = l.split('|').map((x) => x.trim()).filter(Boolean);
      const ostatnia = komorki[komorki.length - 1] ?? '';
      if (/^(Źródło|Zrodlo)$/i.test(ostatnia)) return false;
      return !/`[^`\s]+:\d+(?:-\d+)?`|developer\.apple\.com|\[DO USTALENIA/.test(ostatnia);
    });
    expect(bezZrodla).toEqual([]);
  });

  it('odwołania `plik:linia` wskazują istniejące pliki i linie', () => {
    const zle: string[] = [];
    for (const m of doc.matchAll(/`([^`\s]+\.[A-Za-z0-9]+):(\d+)(?:-(\d+))?`/g)) {
      const [, plik, od, doL] = m;
      if (!istnieje(plik)) { zle.push(`${plik}: brak pliku`); continue; }
      const n = read(plik).split('\n').length;
      if (Number(doL ?? od) > n || Number(od) < 1) zle.push(`${plik}:${od}${doL ? '-' + doL : ''} poza plikiem (${n})`);
    }
    expect(zle).toEqual([]);
  });

  it('każdy adres Apple ma datę odczytu', () => {
    const bezDaty = doc.split('\n').filter((l) => /developer\.apple\.com/.test(l) && !/odczyt \d{4}-\d{2}-\d{2}/.test(l));
    expect(bezDaty).toEqual([]);
  });

  it('bez sekretów i identyfikatorów kont (klucze, Team ID, IBAN)', () => {
    const wszystko = [doc, ...kody.filter((k) => istnieje(`${KARTY}/${k}.md`)).map((k) => read(`${KARTY}/${k}.md`))].join('\n');
    expect(wszystko).not.toMatch(/-----BEGIN [A-Z ]*PRIVATE KEY-----/);
    expect(wszystko.match(/\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{10}\b/g) ?? []).toEqual([]);
    expect(wszystko).not.toMatch(/\b[A-Z]{2}\d{2}(?: ?\d{4}){4,7}\b/);
  });

  it('odsyła do kart na lokalizację i polecenia generatora', () => {
    expect(doc).toContain('docs/wydanie/ustawienia/');
    expect(doc).toContain('npm run karty:ustawien');
  });
});

/** Pola karty: nagłówek „### <etykieta> · n / limit <jednostka>”, potem blok ```text z wartością. */
const POLA: Array<{ klucz: keyof Meta; etykieta: string; limit: number; bajty?: true }> = [
  { klucz: 'nazwa', etykieta: 'Nazwa (Name)', limit: 30 },
  { klucz: 'podtytul', etykieta: 'Podtytuł (Subtitle)', limit: 30 },
  { klucz: 'slowaKluczowe', etykieta: 'Słowa kluczowe (Keywords)', limit: 100, bajty: true },
  { klucz: 'tekstPromocyjny', etykieta: 'Tekst promocyjny (Promotional Text)', limit: 170 },
  { klucz: 'opis', etykieta: 'Opis (Description)', limit: 4000 },
];
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ZRZUTY = ['01-plan.png', '02-receptura.png', '03-prowadzenie-ciemny.png', '04-doktor.png', '05-zakwasy.png', '06-dziennik.png', '07-offline.png'];
const W_REPO = ['pl', 'en-US', 'nl-NL'];

describe('karty ustawień na lokalizację App Store (119)', () => {
  it('34 pliki metadanych, karta dla każdego', () => {
    expect(kody).toHaveLength(34);
    expect(kody.filter((k) => !istnieje(`${KARTY}/${k}.md`))).toEqual([]);
  });

  it.each(kody)('%s: pola dosłownie z metadanych z licznikiem n / limit zgodnym z długością', (kod) => {
    const m = meta(kod);
    const karta = istnieje(`${KARTY}/${kod}.md`) ? read(`${KARTY}/${kod}.md`) : '';
    for (const p of POLA) {
      const re = new RegExp(`^### ${esc(p.etykieta)} · (\\d+) / (\\d+) (znaków|bajtów)[^\\n]*\\n\\n\`\`\`text\\n([\\s\\S]*?)\\n\`\`\`$`, 'm');
      const hit = re.exec(karta);
      const wartosc = String(m[p.klucz]);
      const n = p.bajty ? bt(wartosc) : zn(wartosc);
      expect({ kod, pole: p.klucz, licznik: hit ? [Number(hit[1]), Number(hit[2]), hit[3]] : null, tekst: hit?.[4] })
        .toEqual({ kod, pole: p.klucz, licznik: [n, p.limit, p.bajty ? 'bajtów' : 'znaków'], tekst: wartosc });
      expect(n).toBeLessThanOrEqual(p.limit);
    }
  });

  it.each(kody)('%s: kod ASC, storefronty z mapy, status, zrzuty, ceny, adresy, kategoria, „Co nowego”', (kod) => {
    const m = meta(kod);
    const l = mapa().lokalizacje[kod];
    const karta = istnieje(`${KARTY}/${kod}.md`) ? read(`${KARTY}/${kod}.md`) : '';
    expect(l).toBeDefined();
    expect(karta).toContain(`\`${kod}\``);
    expect(karta).toContain(l.jezykAsc);
    expect(karta).toContain(`Status pomiaru: **${m.status}**`);
    for (const iso of [...l.domyslny, ...l.dodatkowy]) expect({ kod, iso, jest: karta.includes(iso) }).toEqual({ kod, iso, jest: true });
    expect(karta).toContain(`Język domyślny: ${l.domyslny.length}`);
    expect(karta).toContain(`Język dodatkowy: ${l.dodatkowy.length}`);
    const baza = W_REPO.includes(kod) ? `docs/wydanie/zrzuty/${kod}` : `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/${kod}`;
    ZRZUTY.forEach((z, i) => {
      for (const klasa of ['iphone-6.9', 'iphone-6.3']) {
        const p = `${baza}/${klasa}/${z}`;
        expect({ kod, p, jest: karta.includes(p) }).toEqual({ kod, p, jest: true });
        if (W_REPO.includes(kod)) expect({ p, plik: istnieje(p) }).toEqual({ p, plik: true });
      }
      expect(karta).toContain(m.ramki[i].naglowek);
    });
    expect(karta).toContain(PRIVACY_URL);
    expect(karta).toContain(SUPPORT_URL);
    expect(karta).toContain('Food & Drink');
    expect(karta).toContain('Productivity');
    expect(karta).toMatch(/Co nowego[\s\S]*nie dotyczy/);
    const c = ceny();
    const usa = c.reczne.USA;
    expect(karta).toContain(`${kwota(usa.monthly)} / ${kwota(usa.yearly)} / ${kwota(usa.lifetime)} USD`);
    for (const iso of [...l.domyslny, ...l.dodatkowy].filter((x) => c.reczne[x])) {
      const p = c.reczne[iso];
      expect({ kod, iso, jest: karta.includes(`${kwota(p.monthly)} / ${kwota(p.yearly)} / ${kwota(p.lifetime)} ${p.waluta}`) }).toEqual({ kod, iso, jest: true });
    }
    expect(karta).toMatch(/automatycznie/);
  });

  it('nazwy do weryfikacji natywnej oznaczone: sl, ms, el, ru (D-053)', () => {
    for (const kod of ['sl', 'ms', 'el', 'ru']) expect({ kod, znacznik: read(`${KARTY}/${kod}.md`).includes('Weryfikacja natywna') }).toEqual({ kod, znacznik: true });
  });

  it('karty są aktualne względem generatora (scripts/karty-ustawien.mjs --sprawdz, kod 0)', () => {
    const r = spawnSync(process.execPath, [path.join(root, 'scripts/karty-ustawien.mjs'), '--sprawdz'], { encoding: 'utf8' });
    expect({ kod: r.status, wyjscie: (r.stdout + r.stderr).trim().split('\n').slice(-3) }).toEqual({ kod: 0, wyjscie: expect.any(Array) });
  });

  it('package.json ma polecenie karty:ustawien', () => {
    expect(JSON.parse(read('package.json')).scripts['karty:ustawien']).toBe('node scripts/karty-ustawien.mjs');
  });
});
