/**
 * M1-audytor-generalny-041 (06-tresci-006, D-307): jedna mąka = jedna nazwa. Klucze PL tej samej mąki w danych
 * aplikacji są kanonem z docs/tresci/wektory/maki-nazwy-2026-11-09.json, a przekład każdej nazwy z „typ NNN”
 * w EN i 33 językach ma numer polskiego typu i jest jeden dla jednej mąki (logika sprawdz-maki.mjs roli 06).
 * Nazwy sprzed zmiany zostają w słownikach i dalej prowadzą do profilu atlasu (receptury i zapasy użytkownika).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CATALOG_RECIPES } from '../src/recipes/katalog';
import { FLOUR_PROFILES, DAWNE_NAZWY_ATLASU, profilPoNazwie } from '../src/core/flour-atlas';
import { POPULAR_FLOUR_BLENDS } from '../src/core/domain-rules';
import { nazwaMakiMieszanki } from '../src/lib/nazwa-maki-mieszanki';
import { setLang, t } from '../src/lib/i18n';

const root = path.join(__dirname, '..');
interface Wpis { kluczPl: string; kanonPl: string; en: string }
const WEKTOR: { klucze: Wpis[]; kanon: { kanonPl: string; en: string }[] } = JSON.parse(
  fs.readFileSync(path.join(root, 'docs/tresci/wektory/maki-nazwy-2026-11-09.json'), 'utf8'),
);
const MAKA = /^Mąka (pszenna|żytnia|orkiszowa)\b.*?\btyp (\d{3,4})(?!\s*\/)/;
/**
 * Dwa klucze z kilkoma mąkami zostają (wyjątek nazwany): kanon „… albo typ …” ma numer pierwszej mąki, więc jego
 * przekład byłby drugą nazwą tej mąki w języku (reguła 2 sprawdz-maki.mjs); przekład z oboma numerami według kanonu.
 */
const ZOSTAJA = ['Mąka pszenna typ 650 lub graham', 'Mąka żytnia (typ 720 / 2000)'];
const KANON = new Set(WEKTOR.kanon.map((k) => k.kanonPl));

const PARA = /'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g;
function slownik(dir: string): Record<string, string> {
  const o: Record<string, string> = {};
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
    for (const m of fs.readFileSync(path.join(dir, f), 'utf8').matchAll(PARA)) o[m[1]!] = m[2]!;
  }
  return o;
}
const JEZYKI: Record<string, Record<string, string>> = { en: slownik(path.join(root, 'src/lib/i18n-en')) };
for (const k of fs.readdirSync(path.join(root, 'src/lib/i18n-slowniki')).filter((x) => !x.endsWith('.ts'))) {
  JEZYKI[k] = slownik(path.join(root, 'src/lib/i18n-slowniki', k));
}

describe('041 (D-307): nazwy mąk — kanon PL w danych, numer typu i jedna nazwa w każdym języku', () => {
  afterEach(() => setLang('pl'));

  it('nazwy mąk z typem w danych aplikacji (receptury, atlas, mieszanki) są kanonem D-307', () => {
    const nazwy = [
      ...CATALOG_RECIPES.flatMap((r) => r.formula.flours.map((f) => f.name)),
      ...FLOUR_PROFILES.map((p) => p.namePl),
      ...POPULAR_FLOUR_BLENDS.flatMap((b) => b.flours.map((f) => f.name)),
    ].filter((n) => MAKA.test(n));
    expect(nazwy.length).toBeGreaterThan(40);
    expect([...new Set(nazwy)].filter((n) => !KANON.has(n))).toEqual([]);
  });

  it('nazwy sprzed zmiany prowadzą do tego samego profilu atlasu co kanon (zapisane receptury i zapasy)', () => {
    const zmienione = WEKTOR.klucze.filter((w) => w.kluczPl !== w.kanonPl && !ZOSTAJA.includes(w.kluczPl));
    for (const w of zmienione) {
      if (!profilPoNazwie(w.kanonPl)) continue; // kanon spoza atlasu (np. orkisz 630, MAK-TYP-902): nazwa przez słownik
      expect([w.kluczPl, nazwaMakiMieszanki({ name: w.kluczPl }, 'de')]).toEqual([w.kluczPl, nazwaMakiMieszanki({ name: w.kanonPl }, 'de')]);
    }
    expect(Object.keys(DAWNE_NAZWY_ATLASU)).toContain('Mąka pszenna typ 650 (Bułkowa)');
    expect(nazwaMakiMieszanki({ name: 'Mąka pszenna chlebowa typ 750' }, 'de')).toBe(nazwaMakiMieszanki({ name: 'Mąka pszenna typ 750 (chlebowa)' }, 'de'));
  });

  it('EN: każdy klucz mapy (stary i kanon) ma nazwę EN z wektora', () => {
    setLang('en');
    for (const w of WEKTOR.klucze) {
      expect([w.kluczPl, t(w.kluczPl)]).toEqual([w.kluczPl, w.en]);
      if (!ZOSTAJA.includes(w.kluczPl)) expect([w.kanonPl, t(w.kanonPl)]).toEqual([w.kanonPl, w.en]);
    }
  });

  it.each(Object.keys(JEZYKI))('%s: przekład nazwy z „typ NNN” ma numer typu i jedna mąka ma jedną nazwę', (jez) => {
    const bezNumeru: string[] = [];
    const wg = new Map<string, Set<string>>();
    for (const [k, v] of Object.entries(JEZYKI[jez]!)) {
      const m = k.match(MAKA);
      if (!m || / lub /.test(k)) continue;
      if (!v.includes(m[2]!)) bezNumeru.push(`${k} → ${v}`);
      const klucz = `${m[1]} ${m[2]}`;
      wg.set(klucz, new Set([...(wg.get(klucz) ?? []), v]));
    }
    expect(bezNumeru).toEqual([]);
    expect([...wg].filter(([, n]) => n.size > 1).map(([k, n]) => `${k}: ${[...n].join(' | ')}`)).toEqual([]);
  });
});
