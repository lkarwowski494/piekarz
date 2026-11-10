/**
 * Opis sklepu podaje katalog receptur tej wersji [M1-audytor-generalny-080; 10-wydanie-004, 01-odkrywanie-005, 11-wzrost-004].
 * DEC-01 a (D-286): „26 receptur, z czego 11 z planem i prowadzeniem krok po kroku” (stan sprzed D-317; dziś 10); liczby z kodu, nie z pamięci:
 * katalog `CATALOG_RECIPES`, plan według `powodBezPlanu` (z zakwasem: D-252, D-274; bez brioszki: D-317, 089 — licznik
 * zmieniony z `powodBezZakwasu` w 109, D-346), wersje drożdżowe
 * `WERSJE_DROZDZOWE` z planem według `maPlanDrozdzowy` (F-26 w docs/scope-contract.md). Opis pl i en-US wymienia tryb
 * maszyny do chleba (F-72) i wersję na drożdżach (D-154). Dlaczego test: katalog rósł (D-157), a opis w 34
 * lokalizacjach został przy „15 receptur” (wytyczna 2.3: „keep them up-to-date with new versions”).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CATALOG_RECIPES } from '../src/recipes/katalog';
import { powodBezPlanu } from '../src/lib/plan-receptury';
import { WERSJE_DROZDZOWE } from '../src/recipes/wersje-drozdzowe';
import { maPlanDrozdzowy } from '../src/recipes/yeast-stages';

const root = path.join(__dirname, '..');
const KAT = path.join(root, 'docs/wydanie/metadane');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const KODY = fs.readdirSync(KAT).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();
const opis = (kod: string): string => JSON.parse(fs.readFileSync(path.join(KAT, `${kod}.json`), 'utf8')).opis;
/** Liczby zapisane cyframi (także w ja, ko, zh-Hant); bez godzin, proporcji i adresów. */
const liczby = (s: string) => [...s.matchAll(/(?<![\d:./])\d+(?![\d:./])/g)].map((m) => Number(m[0]));

const wszystkie = CATALOG_RECIPES.length;
const zPlanem = CATALOG_RECIPES.filter((r) => powodBezPlanu(r.formula, { recipeId: r.id }) === null).length;
const wersje = Object.keys(WERSJE_DROZDZOWE);

describe('opis sklepu: katalog receptur tej wersji (080)', () => {
  it('kod: 26 receptur bazowych, 10 z planem (D-317); wersja drożdżowa w 4, plan w 3 (stan F-26)', () => {
    expect({ wszystkie, zPlanem, wersje: wersje.length, wersjeZPlanem: wersje.filter((id) => maPlanDrozdzowy(id)).length }).toEqual({
      wszystkie: 26,
      zPlanem: 10,
      wersje: 4,
      wersjeZPlanem: 3,
    });
  });

  it('34 lokalizacje', () => {
    expect(KODY).toHaveLength(34);
  });

  it.each(KODY)('%s: sekcja receptur podaje liczbę receptur i liczbę receptur z planem z kodu, bez „15”', (kod) => {
    const sekcja = opis(kod).split('\n\n')[1];
    const n = liczby(sekcja);
    expect({ kod, wszystkie: n.includes(wszystkie), zPlanem: n.includes(zPlanem), stare15: n.includes(15) }).toEqual({
      kod,
      wszystkie: true,
      zPlanem: true,
      stare15: false,
    });
  });

  it.each(KODY)('%s: osobna sekcja po recepturach (wersja na drożdżach i maszyna do chleba)', (kod) => {
    const akapity = opis(kod).split('\n\n');
    // wstęp, receptury, NOWA sekcja, plan, prowadzenie, zakwasy, Doktor, dziennik, dane, warto wiedzieć, zakup, języki
    expect({ kod, akapity: akapity.length, naglowekINaTresc: akapity[2].split('\n').length }).toEqual({ kod, akapity: 12, naglowekINaTresc: 2 });
  });

  it('pl i en: tryb maszyny do chleba i wersja na drożdżach w opisie', () => {
    expect(opis('pl')).toMatch(/maszyn\p{L}* do chleba/u);
    expect(opis('pl')).toMatch(/wersj[aię] na drożdżach/);
    for (const kod of ['en-US', 'en-GB', 'en-AU', 'en-CA']) {
      expect(opis(kod)).toMatch(/bread machine/);
      expect(opis(kod)).toMatch(/yeast version/);
    }
  });

  it('źródło przekładu (docs/app-store-metadata-v2.md) §1.2, §2.2 i §5.1.1 bez „15 receptur”', () => {
    const doc = read('docs/app-store-metadata-v2.md');
    expect(doc).not.toMatch(/15 receptur|15 base recipes/);
    expect(doc).toContain(`${wszystkie} receptur bazowych`);
    expect(doc).toContain(`${wszystkie} base recipes`);
  });
});
