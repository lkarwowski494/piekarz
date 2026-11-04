/**
 * 06m (D-266 a): `DODATKI_MASZYNY` (D-261) to dane treści — dodatki przepisane z notatki i opisu receptury katalogu.
 * Test pilnuje przepisania w jedną stronę: składnik z listy rodzajów, który notatka albo opis receptury wymienia,
 * musi być we wpisie. Wyjątki są nazwane niżej z powodem (np. tłuszcz tylko do natłuszczenia formy).
 * Skutek dla reguł: RD-38 (jajka, mleko, ser) i RD-39 (cukier, tłuszcz: „francuski” tylko bez obu).
 */
import { CATALOG_RECIPES } from '../katalog';
import { DODATKI_MASZYNY } from '../maszyna-receptur';
import type { SkladnikMaszyny } from '../../core/maszyna';

/** Słowa w notatce i opisie (PL) → rodzaj składnika. Formy odmiany z tekstów katalogu. */
const SLOWA: readonly [SkladnikMaszyny, RegExp][] = [
  ['tluszcz', /(?<!\p{L})(?:masł\p{L}*|olej\p{L}*|oliw\p{L}*|naoliw\p{L}*|tłuszcz\p{L}*|margaryn\p{L}*)/iu],
  ['cukier', /(?<!\p{L})(?:cukr\p{L}*|cukier|miod\p{L}*|miód)/iu],
  ['mleko', /(?<!\p{L})(?:mlek\p{L}*|mleku)(?!\p{L})(?! w proszku)/iu],
  ['jajka', /(?<!\p{L})(?:jaj\p{L}*|żółt\p{L}*)/iu],
  ['ser', /(?<!\p{L})(?:ser|serow\p{L}*|twar\p{L}*)(?!\p{L})/iu],
];

/** Słowo w tekście, które nie jest składnikiem receptury (powód przy wpisie). */
const POZA_RECEPTURA: Readonly<Record<string, readonly SkladnikMaszyny[]>> = {};

describe('06m: DODATKI_MASZYNY zgodne z notatką i opisem receptury (D-261, D-266)', () => {
  it('każdy składnik wymieniony w notatce albo opisie receptury z trybem maszyny jest w jej wpisie dodatków', () => {
    const braki: string[] = [];
    for (const [id, dodatki] of Object.entries(DODATKI_MASZYNY)) {
      const r = CATALOG_RECIPES.find((x) => x.id === id);
      if (!r) {
        braki.push(`${id}: brak receptury w katalogu`);
        continue;
      }
      const tekst = `${r.descriptionPl} ${r.notesPl}`;
      for (const [rodzaj, wzor] of SLOWA) {
        if (wzor.test(tekst) && !dodatki.includes(rodzaj) && !(POZA_RECEPTURA[id] ?? []).includes(rodzaj)) {
          braki.push(`${id}: „${tekst.match(wzor)?.[0]}” → ${rodzaj}`);
        }
      }
    }
    expect(braki).toEqual([]);
  });

  it('ciabatta z bigą: oliwa z notatki („Do ciasta właściwego dodaj 3% oliwy z oliwek”) to tłuszcz', () => {
    expect(DODATKI_MASZYNY.ciabatta_con_biga).toContain('tluszcz');
  });
});
