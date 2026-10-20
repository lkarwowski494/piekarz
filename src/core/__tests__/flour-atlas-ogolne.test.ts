/**
 * M1-audytor-generalny-094 (DEC-06 b, decyzja przekładu właściciela 2026-10-20 „Bez numeru”):
 * dla każdego z 35 języków atlas mąk ma albo mapę typów ze źródłem w rejestrze twierdzeń,
 * albo nazwę i opis ogólny bez nazw lokalnych typów. Test danych: wyświetlania nie sprawdza
 * (przekazanie do roli 08 pod tym samym ID).
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { FLOUR_PROFILES } from '../flour-atlas';
import { MAPA_TYPOW_MAK, OPIS_OGOLNY_MAK, trybAtlasuMak, TrybAtlasuMak } from '../flour-atlas-ogolne';
import { SUPPORTED_LOCALES_35 } from '../../lib/i18n-locales';
import { setLang, t } from '../../lib/i18n';

const ROOT = join(__dirname, '..', '..', '..');

interface Twierdzenie {
  id: string;
  status: string;
}
const REJESTR: Twierdzenie[] = JSON.parse(readFileSync(join(ROOT, 'docs', 'tresci', 'rejestr.json'), 'utf8'));
const status = (id: string) => REJESTR.find((x) => x.id === id)?.status;

/** Sekcje `## <id profilu>` z pliku docs/tresci: id → tekst bez znacznika [T:...]. */
function sekcje(plik: string): Record<string, string> {
  const tekst = readFileSync(join(ROOT, 'docs', 'tresci', plik), 'utf8').replace(/\r\n/g, '\n').replace(/<!--[\s\S]*?-->/g, '');
  const wynik: Record<string, string> = {};
  for (const c of tekst.split(/^## /m).slice(1)) {
    const [naglowek, ...reszta] = c.split('\n');
    wynik[naglowek.trim()] = reszta.join(' ').replace(/\s*\[T:[A-Z0-9-,]+\]\s*/g, ' ').trim();
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
const BEZ_TYPU = (tekst: string) => {
  expect(tekst).not.toMatch(/\d/);
  expect(tekst).not.toMatch(/\btyp\b|\btype\b/i);
  for (const n of NAZWY_LOKALNE) expect(tekst.toLowerCase()).not.toContain(n.toLowerCase());
};

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
      // Brak twierdzenia o białku i przemiale (MAK-OGL-900, MAK-OGL-901 otwarte): opis pusty, nie zgadnięty
      expect(o.otwarte).toEqual(expect.arrayContaining(['MAK-OGL-900', 'MAK-OGL-901']));
      for (const id of o.otwarte) expect([p.id, id, status(id)]).toEqual([p.id, id, 'otwarte']);
      expect(o.opisPl).toBe('');
    }
  });

  it('teksty = docs/tresci (pl/maki-ogolne.md, en/maki-ogolne.md); EN jest w słowniku EN (klucz = tekst PL)', () => {
    const pl = sekcje('pl/maki-ogolne.md');
    const en = sekcje('en/maki-ogolne.md');
    expect(Object.keys(pl).sort()).toEqual(Object.keys(OPIS_OGOLNY_MAK).sort());
    expect(Object.keys(en).sort()).toEqual(Object.keys(OPIS_OGOLNY_MAK).sort());
    for (const [id, o] of Object.entries(OPIS_OGOLNY_MAK)) {
      expect([id, o.nazwaPl]).toEqual([id, pl[id]]);
      const przeklad = enDla(o.nazwaPl);
      expect([id, przeklad]).toEqual([id, en[id]]);
      expect(przeklad).not.toBe(o.nazwaPl);
    }
  });
});
