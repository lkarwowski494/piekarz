/**
 * Nazwy kafli „Dziś” bez słowa, które nie mieści się w kaflu (L004-13-P2-nl07, KO-067, D-420). Zrzuty #13: nl-NL
 * „zuurdesemstart/er op” — słowo 16 liter dzielone w środku na kaflu 6,3″ (ok. 117 pt przy 15 pt). Pomiar z zrzutów 6,3″ wszystkich
 * 34 lokalizacji: mieści się „surdeigsstarter” (no, 15 liter), nie mieści „zuurdesemstarter” (16). Pismo bez spacji
 * (ja, zh-Hant) łamie się między znakami z natury i jest pominięte. Granica 15 liter to pomiar dla 6,3″ (402 pt);
 * przy 320 pt słowo dłuższe niż wiersz łamie się jak w UILabel (D-142), poza zakresem tego testu.
 */
import { ACTIVE_LANGS, setLang, t } from '../i18n';

const KLUCZE = ['Zakładam zakwas', 'Piekę na zakwasie', 'Piekę na drożdżach albo pizzę'] as const;
const MAX_LITER_SLOWA = 15;
const BEZ_SPACJI = ['ja', 'zh-Hant'];

afterEach(() => setLang('pl'));

describe('kafle „Co dziś robisz?”: najdłuższe słowo mieści się w kaflu 6,3″ (D-420)', () => {
  it.each(ACTIVE_LANGS.filter((l) => !BEZ_SPACJI.includes(l)))('%s: słowa nazw kafli ≤ 15 liter', (l) => {
    setLang(l);
    const za_dlugie = KLUCZE.flatMap((k) => t(k).split(/\s+/).filter((s) => [...s.replace(/[^\p{L}\p{M}]/gu, '')].length > MAX_LITER_SLOWA));
    expect(za_dlugie).toEqual([]);
  });
});
