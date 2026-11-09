// BR-RECP-001 (docs/brd/wymagania-dziennik.md): scenariusze „Katalog w 1.0”, „Nazwa chroniona tylko jako pochodzenie”
// i „Formuła ze specyfikacji produkcji” na danych katalogu w kodzie (D-157, D-177, D-236). Wpis „katalog ma 15
// receptur” w scripts/br-wyjatki.json był nieaktualny (07-jakosc-006) [M1-audytor-generalny-070].
// Bez testu (wpis „czesciowe”): nazwa „Pizza w stylu neapolitańskim” (dopisek „w stylu” odrzucony w D-177).
import { EN } from '../../lib/i18n.en';
import { LADOWANIE_SLOWNIKOW } from '../../lib/i18n-slowniki';
import { MASTER_RECIPES } from '../presets';
import { CATALOG_RECIPES, KATALOG_M3_RECIPES } from '../katalog';

// Receptury, których formuła pochodzi ze specyfikacji nazwy chronionej: zdanie o pochodzeniu w opisie
const POCHODZENIE = /Formuła pochodzi (?:ze specyfikacji|z jednolitego dokumentu)[^.„]*„([^”]+)”\.$/;
const zeSpecyfikacji = CATALOG_RECIPES.flatMap((r) => {
  const m = POCHODZENIE.exec(r.descriptionPl);
  return m?.[1] ? [{ r, nazwa: m[1] }] : [];
});
const NAZWY_CHRONIONE = zeSpecyfikacji.map((x) => x.nazwa);
const SLOWNIKI = Object.entries(LADOWANIE_SLOWNIKOW).map(([jezyk, wczytaj]) => [jezyk, wczytaj()] as const);
const ZDANIE_SPECYFIKACJI = 'Ilości i temperatury podaję tak, jak w opisie produkcji ze źródła, bez przeliczenia na kuchnię domową i piekarnik domowy.';

describe('BR-RECP-001 Receptury bazowe: katalog 1.0', () => {
  it('BR-RECP-001 Katalog w 1.0: 26 receptur — 15 dotychczasowych i 11 zatwierdzonych, bez trzech warunkowych (D-236)', () => {
    expect(CATALOG_RECIPES).toHaveLength(26);
    expect(CATALOG_RECIPES.slice(0, 15)).toEqual(MASTER_RECIPES);
    expect(MASTER_RECIPES).toHaveLength(15);
    expect(KATALOG_M3_RECIPES).toHaveLength(11);
    expect(new Set(CATALOG_RECIPES.map((r) => r.id)).size).toBe(26);
    const nazwy = CATALOG_RECIPES.map((r) => `${r.id} ${r.namePl}`).join('\n');
    expect(nazwy).not.toMatch(/piadin|stollen|strucla|orkiszow\S* szybk|szybk\S* .*orkisz/i);
  });

  it('BR-RECP-001 Katalog w 1.0 (część): żaden z 26 tytułów nie zawiera nazwy chronionej ze specyfikacji (PL, EN i 33 słowniki)', () => {
    expect(NAZWY_CHRONIONE.length).toBeGreaterThanOrEqual(5);
    for (const r of CATALOG_RECIPES) {
      const tytuly = [r.namePl, EN[r.namePl] ?? '', ...SLOWNIKI.map(([, s]) => s[r.namePl] ?? '')];
      for (const nazwa of NAZWY_CHRONIONE) expect(tytuly.filter((t) => t.toLowerCase().includes(nazwa.toLowerCase()))).toEqual([]);
      expect(EN[r.namePl]).toBeTruthy();
    }
  });

  it('BR-RECP-001 Nazwa chroniona tylko jako pochodzenie: nazwa tylko w zdaniu o pochodzeniu formuły, tytuł opisowy', () => {
    expect(zeSpecyfikacji.map((x) => x.r.id).sort()).toEqual(
      ['boiled_bread_ring', 'cheese_crumble_yeast_cake', 'durum_semolina_sourdough', 'karelian_rye_pasties', 'latvian_scalded_rye'],
    );
    for (const { r, nazwa } of zeSpecyfikacji) {
      expect(r.namePl).not.toContain(nazwa);
      expect(r.namePl).not.toMatch(/w stylu/i);
      // Opis: nazwa występuje raz, w ostatnim zdaniu („Formuła pochodzi …”); notatka jej nie powtarza
      const zdania = r.descriptionPl.split(/(?<=\.)\s+/);
      expect(zdania.filter((z) => z.includes(nazwa))).toEqual([zdania[zdania.length - 1]]);
      expect(r.descriptionPl.split(nazwa)).toHaveLength(2);
      expect(r.notesPl ?? '').not.toContain(nazwa);
      // EN: tytuł bez nazwy, opis z nazwą (przekład zdania o pochodzeniu)
      expect(EN[r.namePl]).not.toContain(nazwa);
      expect(EN[r.descriptionPl]).toContain(nazwa);
    }
  });

  it('BR-RECP-001 Formuła ze specyfikacji produkcji: notatka mówi, że ilości i temperatury są jak w źródle, bez przeliczenia na dom', () => {
    expect(zeSpecyfikacji).toHaveLength(5);
    for (const { r } of zeSpecyfikacji) {
      expect(r.notesPl?.startsWith(ZDANIE_SPECYFIKACJI)).toBe(true);
      expect(EN[r.notesPl ?? '']).toBeTruthy();
    }
    // Przykład scenariusza: pierożki 250–300 °C (KAT-KAR-003) — temperatura pieca z przedziału specyfikacji, nie domowa
    const pierozki = CATALOG_RECIPES.find((r) => r.id === 'karelian_rye_pasties')!;
    expect(pierozki.notesPl).toContain('250–300 °C');
    expect(pierozki.bakeTempBrowningC).toBeGreaterThanOrEqual(250);
    expect(pierozki.bakeTempBrowningC).toBeLessThanOrEqual(300);
  });
});
