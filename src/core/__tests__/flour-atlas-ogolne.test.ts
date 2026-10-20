/**
 * M1-audytor-generalny-094 (DEC-06 b, decyzja przekładu właściciela 2026-10-20 „Bez numeru”;
 * decyzja właściciela 2026-10-20 w 06-tresci-fix-p7-001: „(a) rola 06 szuka źródeł białka i przemiału
 * dla każdego profilu; opisy ogólne z tymi danymi”):
 * dla każdego z 35 języków atlas mąk ma albo mapę typów ze źródłem w rejestrze twierdzeń,
 * albo nazwę i opis ogólny bez nazw lokalnych typów. Test danych: wyświetlania nie sprawdza
 * (przekazanie do roli 08 pod tym samym ID).
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { FLOUR_PROFILES } from '../flour-atlas';
import {
  MAPA_TYPOW_MAK,
  OPIS_OGOLNY_MAK,
  OpisOgolnyMaki,
  PrzemialMaki,
  trybAtlasuMak,
  TrybAtlasuMak,
} from '../flour-atlas-ogolne';
import { SUPPORTED_LOCALES_35 } from '../../lib/i18n-locales';
import { setLang, t } from '../../lib/i18n';

const ROOT = join(__dirname, '..', '..', '..');

interface Twierdzenie {
  id: string;
  status: string;
  twierdzenie: string;
}
const REJESTR: Twierdzenie[] = JSON.parse(readFileSync(join(ROOT, 'docs', 'tresci', 'rejestr.json'), 'utf8'));
const status = (id: string) => REJESTR.find((x) => x.id === id)?.status;
const tresc = (id: string) => REJESTR.find((x) => x.id === id)?.twierdzenie ?? '';

/** Sekcje `## <id profilu>` z pliku docs/tresci: pierwszy akapit = nazwa, reszta = opis (bez znaczników [T:...]). */
function sekcje(plik: string): Record<string, { nazwa: string; opis: string }> {
  const tekst = readFileSync(join(ROOT, 'docs', 'tresci', plik), 'utf8').replace(/\r\n/g, '\n').replace(/<!--[\s\S]*?-->/g, '');
  const bezZnacznikow = (s: string) => s.replace(/\s*\[T:[A-Z0-9-,]+\]\s*/g, ' ').replace(/\s+/g, ' ').trim();
  const wynik: Record<string, { nazwa: string; opis: string }> = {};
  for (const c of tekst.split(/^## /m).slice(1)) {
    const [naglowek, ...reszta] = c.split('\n');
    const akapity = reszta.join('\n').trim().split(/\n\s*\n/);
    wynik[naglowek.trim()] = { nazwa: bezZnacznikow(akapity[0] ?? ''), opis: bezZnacznikow(akapity.slice(1).join(' ')) };
  }
  return wynik;
}

function enDla(pl: string): string {
  setLang('en');
  try {
    return t(pl);
  } finally {
    setLang('pl');
  }
}

/** Nazwy lokalne polskich typów: dopiski w nawiasach nazw profili i nazwy handlowe z docs/tresci/pl/maki-typy.md. */
const NAZWY_LOKALNE = [
  'Tortowa', 'Krupczatka', 'Wrocławska', 'Poznańska', 'Bułkowa', 'Luksusowa', 'Graham', 'Forte', 'chlebowa',
];
/** Bez numeru typu (żadnej liczby trzycyfrowej i dłuższej), bez słowa „typ” i bez nazw lokalnych typów. */
const BEZ_TYPU = (tekst: string) => {
  expect(tekst).not.toMatch(/\d{3,}/);
  expect(tekst).not.toMatch(/\btyp\b|\btype\b/i);
  for (const n of NAZWY_LOKALNE) expect(tekst.toLowerCase()).not.toContain(n.toLowerCase());
};

/** Liczby w tekście PL (przecinek dziesiętny) albo EN (kropka), np. „10,6–14,3%” → ['10,6', '14,3']. */
const liczby = (tekst: string) => (tekst.match(/\d+(?:[.,]\d+)?/g) ?? []).map((x) => x.replace('.', ','));

/** Dane, od których zależy nazwa: profile o tych samych danych mogą mieć tę samą nazwę. */
const dane = (o: OpisOgolnyMaki) => JSON.stringify([o.przemial, o.bialko, o.opisPl]);

describe('094: atlas mąk w 35 językach — mapa typów ze źródłem albo opis ogólny', () => {
  afterEach(() => setLang('pl'));

  it('każdy z 35 języków ma tryb atlasu; mapa typów tylko z twierdzeniami potwierdzonymi w rejestrze', () => {
    expect(SUPPORTED_LOCALES_35).toHaveLength(35);
    const tryby: TrybAtlasuMak[] = ['mapa-typow', 'opis-ogolny'];
    for (const { code } of SUPPORTED_LOCALES_35) {
      const tryb = trybAtlasuMak(code);
      expect(tryby).toContain(tryb);
      if (tryb === 'mapa-typow') {
        const twierdzenia = MAPA_TYPOW_MAK[code];
        expect(twierdzenia.length).toBeGreaterThan(0);
        for (const id of twierdzenia) expect([code, id, status(id)]).toEqual([code, id, 'potwierdzone']);
      } else {
        expect(tryb).toBe('opis-ogolny');
      }
    }
    // Stan na 2026-10-20: jedyna sprawdzona mapa to polska (narzedzia-api konfiguracja jezykiZeSprawdzonaMapaMak)
    expect(Object.keys(MAPA_TYPOW_MAK)).toEqual(['pl']);
    expect(SUPPORTED_LOCALES_35.filter((l) => trybAtlasuMak(l.code) === 'opis-ogolny')).toHaveLength(34);
    // Kod spoza listy też dostaje opis ogólny
    expect(trybAtlasuMak('xx')).toBe('opis-ogolny');
  });

  it('każdy profil atlasu ma nazwę i opis ogólny; id profili bez zmian', () => {
    expect(Object.keys(OPIS_OGOLNY_MAK).sort()).toEqual(FLOUR_PROFILES.map((p) => p.id).sort());
  });

  it('nazwa i opis ogólny PL i EN bez polskiego numeru typu i bez nazw lokalnych typów', () => {
    for (const [id, o] of Object.entries(OPIS_OGOLNY_MAK)) {
      for (const tekst of [o.nazwaPl, o.opisPl, enDla(o.nazwaPl), o.opisPl ? enDla(o.opisPl) : '']) {
        try {
          BEZ_TYPU(tekst);
        } catch (e) {
          throw new Error(`${id}: „${tekst}” — ${(e as Error).message}`);
        }
      }
    }
  });

  it('zboże w nazwie ogólnej zgadza się z profilem; twierdzenia istnieją w rejestrze i są potwierdzone', () => {
    const zboze = { wheat: /^Mąka pszenna/, rye: /^Mąka żytnia/, spelt: /^Mąka orkiszowa/ };
    for (const p of FLOUR_PROFILES) {
      const o = OPIS_OGOLNY_MAK[p.id];
      expect([p.id, o.nazwaPl]).toEqual([p.id, expect.stringMatching(zboze[p.grain])]);
      for (const id of o.twierdzenia) expect([p.id, id, status(id)]).toEqual([p.id, id, 'potwierdzone']);
      for (const id of o.otwarte) expect([p.id, id, status(id)]).toEqual([p.id, id, 'otwarte']);
    }
  });

  it('białko i przemiał: z twierdzeniem potwierdzonym albo oznaczone jako otwarte (MAK-OGL-900, MAK-OGL-901)', () => {
    const stopnie: PrzemialMaki[] = ['niskowyciągowa', 'wysokowyciągowa', 'razowa'];
    for (const [id, o] of Object.entries(OPIS_OGOLNY_MAK)) {
      if (o.bialko) {
        expect([id, o.bialko.twierdzenia.length > 0]).toEqual([id, true]);
        for (const tw of o.bialko.twierdzenia) expect(o.twierdzenia).toContain(tw);
        // Zakres białka jest w nazwie i każda jego granica w jednym z twierdzeń
        const wNazwie = liczby(o.nazwaPl);
        for (const x of [o.bialko.odPct, o.bialko.doPct]) {
          const s = x.toFixed(1).replace('.', ',');
          expect([id, wNazwie]).toEqual([id, expect.arrayContaining([s])]);
          expect([id, o.bialko.twierdzenia.some((tw) => liczby(tresc(tw)).includes(s))]).toEqual([id, true]);
        }
        expect(o.otwarte).not.toContain('MAK-OGL-900');
      } else {
        expect([id, o.otwarte]).toEqual([id, expect.arrayContaining(['MAK-OGL-900'])]);
      }
      if (o.przemial) {
        expect(stopnie).toContain(o.przemial.stopien);
        expect([id, o.nazwaPl]).toEqual([id, expect.stringContaining(o.przemial.stopien.slice(0, -1))]);
        for (const tw of o.przemial.twierdzenia) expect(o.twierdzenia).toContain(tw);
        expect(o.otwarte).not.toContain('MAK-OGL-901');
      } else {
        expect([id, o.otwarte]).toEqual([id, expect.arrayContaining(['MAK-OGL-901'])]);
      }
      // Bez danych nie ma opisu; każda liczba z nazwy i opisu stoi w twierdzeniu profilu
      if (!o.bialko && !o.przemial) expect([id, o.opisPl]).toEqual([id, '']);
      const zTwierdzen = o.twierdzenia.flatMap((tw) => liczby(tresc(tw)));
      for (const n of liczby(`${o.nazwaPl} ${o.opisPl}`)) expect([id, n, zTwierdzen.includes(n)]).toEqual([id, n, true]);
    }
  });

  it('badanie 2026-10-20: dane białka i przemiału są wszędzie tam, gdzie rejestr ma źródło; bez źródła tylko profile z listy', () => {
    // Profile bez przeczytanego źródła (wynik roli 06, fix p7b): białko — MAK-OGL-900, przemiał — MAK-OGL-901
    const bezBialka = ['rye_500', 'spelt_630', 'wheat_1850', 'wheat_manitoba'];
    const bezPrzemialu = [...bezBialka, 'rye_1400', 'rye_2000', 'rye_720', 'spelt_2000', 'wheat_405'].sort();
    const ids = Object.keys(OPIS_OGOLNY_MAK).sort();
    expect(ids.filter((id) => !OPIS_OGOLNY_MAK[id].bialko)).toEqual(bezBialka);
    expect(ids.filter((id) => !OPIS_OGOLNY_MAK[id].przemial)).toEqual(bezPrzemialu);
  });

  it('rozróżnialność: dwa profile tego samego zboża nie mają tej samej nazwy PL ani EN, chyba że ich dane są identyczne', () => {
    for (const a of FLOUR_PROFILES) {
      for (const b of FLOUR_PROFILES) {
        if (a.id >= b.id || a.grain !== b.grain) continue;
        const oa = OPIS_OGOLNY_MAK[a.id];
        const ob = OPIS_OGOLNY_MAK[b.id];
        if (dane(oa) === dane(ob)) continue;
        expect([a.id, b.id, oa.nazwaPl === ob.nazwaPl]).toEqual([a.id, b.id, false]);
        expect([a.id, b.id, enDla(oa.nazwaPl) === enDla(ob.nazwaPl)]).toEqual([a.id, b.id, false]);
      }
    }
  });

  it('teksty = docs/tresci (pl/maki-ogolne.md, en/maki-ogolne.md); EN jest w słowniku EN (klucz = tekst PL)', () => {
    const pl = sekcje('pl/maki-ogolne.md');
    const en = sekcje('en/maki-ogolne.md');
    expect(Object.keys(pl).sort()).toEqual(Object.keys(OPIS_OGOLNY_MAK).sort());
    expect(Object.keys(en).sort()).toEqual(Object.keys(OPIS_OGOLNY_MAK).sort());
    for (const [id, o] of Object.entries(OPIS_OGOLNY_MAK)) {
      expect([id, o.nazwaPl, o.opisPl]).toEqual([id, pl[id].nazwa, pl[id].opis]);
      const nazwaEn = enDla(o.nazwaPl);
      const opisEn = o.opisPl ? enDla(o.opisPl) : '';
      expect([id, nazwaEn, opisEn]).toEqual([id, en[id].nazwa, en[id].opis]);
      expect(nazwaEn).not.toBe(o.nazwaPl);
      if (o.opisPl) expect(opisEn).not.toBe(o.opisPl);
    }
  });
});
