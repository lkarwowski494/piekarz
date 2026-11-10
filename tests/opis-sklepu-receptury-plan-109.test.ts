/**
 * Liczba receptur z planem w tekstach o aplikacji = katalog tej wersji [M1-audytor-generalny-109; 10-wydanie-701].
 * Po D-317 (089) brioszka na Lievito Madre nie ma planu (`powodBezPlanu` ≠ null), a opis w 34 lokalizacjach, źródło
 * PL/EN (docs/app-store-metadata-v2.md) i README podawały dalej 11. Liczba z kodu, nie z pamięci: receptury katalogu,
 * dla których `powodBezPlanu(...) === null`. Wszystkie lokalizacje zapisują liczbę cyframi (także ja, ko, zh-Hant);
 * zapis słowny nie przejdzie testu, bo test szuka liczby w cyfrach. Dlaczego test: powtórka 080 („15 receptur”) —
 * wytyczna 2.3 („keep them up-to-date with new versions”); katalog i plan zmieniają się, tekst sklepu nie sam z siebie.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CATALOG_RECIPES } from '../src/recipes/katalog';
import { powodBezPlanu } from '../src/lib/plan-receptury';

const root = path.join(__dirname, '..');
const KAT = path.join(root, 'docs/wydanie/metadane');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const KODY = fs.readdirSync(KAT).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();
const opis = (kod: string): string => JSON.parse(fs.readFileSync(path.join(KAT, `${kod}.json`), 'utf8')).opis;
/** Liczby zapisane cyframi; bez godzin, proporcji i adresów (jak w 080). */
const liczby = (s: string) => [...s.matchAll(/(?<![\d:./])\d+(?![\d:./])/g)].map((m) => Number(m[0]));

const wszystkie = CATALOG_RECIPES.length;
const zPlanem = CATALOG_RECIPES.filter((r) => powodBezPlanu(r.formula, { recipeId: r.id }) === null).length;
/** Liczby w akapicie poza liczbą wszystkich receptur: zostaje tylko liczba receptur z planem. */
const pozaWszystkimi = (akapit: string) => liczby(akapit).filter((n) => n !== wszystkie);

describe('teksty o aplikacji: liczba receptur z planem = katalog (109)', () => {
  it('katalog: część receptur ma plan, część nie (liczba z powodBezPlanu)', () => {
    expect(zPlanem).toBeGreaterThan(0);
    expect(zPlanem).toBeLessThan(wszystkie);
  });

  it('34 lokalizacje', () => {
    expect(KODY).toHaveLength(34);
  });

  it.each(KODY)('%s: sekcja receptur podaje liczbę receptur z planem z katalogu', (kod) => {
    const sekcja = opis(kod).split('\n\n')[1];
    expect({ kod, liczby: pozaWszystkimi(sekcja) }).toEqual({ kod, liczby: [zPlanem] });
  });

  it('źródło PL/EN (docs/app-store-metadata-v2.md): każdy akapit receptur podaje liczbę z planem z katalogu', () => {
    const akapity = read('docs/app-store-metadata-v2.md')
      .split('\n')
      .filter((l) => /receptur bazowych|base recipes/.test(l));
    // §1.2 (PL), §2.2 (EN) i §5.1.1 (EN)
    expect(akapity).toHaveLength(3);
    for (const a of akapity) expect({ a: a.slice(0, 40), liczby: pozaWszystkimi(a) }).toEqual({ a: a.slice(0, 40), liczby: [zPlanem] });
  });

  it('README: wiersz „Receptury i ilości” podaje liczbę z planem z katalogu', () => {
    const wiersz = read('README.md').split('\n').find((l) => l.startsWith('| **Receptury i ilości**'))!;
    const m = /\((\d+) z planem/.exec(wiersz);
    expect(m && Number(m[1])).toBe(zPlanem);
  });
});
