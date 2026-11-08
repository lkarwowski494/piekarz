/**
 * TORB-09-GODZ (decyzja 09m, odrzucona uwaga es k17/k30): godzina z formatTime ma zawsze dwie cyfry godziny
 * ("01:30", także w 12 h: "01:30 p.m."), więc w es, pt, it i el rodzajnik/przyimek zależny od godziny
 * ("a las", "às", "alle", "στις") byłby błędny dla godziny 1 ("a la una", "à 1h", "all'una", "στη μία").
 * Przekład nie może go stawiać przed miejscem na godzinę; zamiast tego: bez rodzajnika, "alle ore", "την ώρα".
 */
import { LADOWANIE_SLOWNIKOW } from '../i18n-slowniki';

const GODZINA = '\\{(?:h|godzina|nastepne|godzinaStartu|godzinaGotowe|od|do|pieczenie|gotowe|time)\\}';
/** Rodzajnik osierocony przed dwukropkiem („pronta às: {time}”) też jest błędem. */
const OSIEROCONY = /(?<![\p{L}])(?:a las|às|alle|στις):/u;
const ZAKAZANE: Record<string, RegExp> = {
  es: new RegExp(`(?<![\\p{L}])(?:a las|de las|desde las|hasta las|para las) ${GODZINA}`, 'u'),
  'es-419': new RegExp(`(?<![\\p{L}])(?:a las|de las|desde las|hasta las|para las) ${GODZINA}`, 'u'),
  pt: new RegExp(`(?<![\\p{L}])(?:às|as|das|até às|até as|pelas|pelo) ${GODZINA}`, 'u'),
  'pt-BR': new RegExp(`(?<![\\p{L}])(?:às|as|das|até às|até as|pelas|pelo) ${GODZINA}`, 'u'),
  it: new RegExp(`(?<![\\p{L}])(?:alle|dalle|delle|fino alle|entro le) ${GODZINA}`, 'u'),
  el: new RegExp(`(?<![\\p{L}])(?:στις|τις|έως τις) ${GODZINA}`, 'u'),
};

describe('godzina w przekładzie bez rodzajnika zależnego od godziny (TORB-09-GODZ)', () => {
  it.each(Object.keys(ZAKAZANE))('%s: żaden tekst nie stawia rodzajnika przed godziną', (kod) => {
    const s = LADOWANIE_SLOWNIKOW[kod]();
    const zle = Object.entries(s).filter(([, v]) => ZAKAZANE[kod].test(v) || OSIEROCONY.test(v)).map(([k]) => k);
    expect(zle).toEqual([]);
  });
});
