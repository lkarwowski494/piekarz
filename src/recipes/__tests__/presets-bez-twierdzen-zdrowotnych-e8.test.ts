/**
 * Opisy receptur bazowych nie zawierają twierdzeń o wartości odżywczej ani zdrowotnej: aplikacja nie ma dla nich
 * przeczytanego źródła (rejestr treści, D-035), a słowo „odżywczy” sugeruje korzyść zdrowotną [audyt-niezalezny E-8].
 */
import { MASTER_RECIPES } from '../presets';
import { EN } from '../../lib/i18n.en';

const ZDROWIE_PL = /odżywcz|zdrow|dietetycz|wartości odżywcz/i;
const ZDROWIE_EN = /nourish|nutritious|healthy|wholesome/i;

describe('receptury bazowe bez twierdzeń zdrowotnych (E-8)', () => {
  it.each(MASTER_RECIPES.map((r) => [r.id, r] as const))('%s: opis i notatki PL bez słów o wartości odżywczej', (_id, r) => {
    expect([r.namePl, r.descriptionPl, r.notesPl ?? ''].filter((s) => ZDROWIE_PL.test(s))).toEqual([]);
  });

  it.each(MASTER_RECIPES.map((r) => [r.id, r] as const))('%s: przekład EN opisu bez słów o wartości odżywczej', (_id, r) => {
    const en = EN[r.descriptionPl] ?? '';
    expect({ en, zdrowie: ZDROWIE_EN.test(en) }).toEqual({ en, zdrowie: false });
  });
});
