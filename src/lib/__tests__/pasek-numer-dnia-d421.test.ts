/**
 * Numer dnia na pasku tygodnia i w miesiącu to sama liczba (L004-13-P2-zh07, KO-067, D-421). Zrzuty #13: w zh-Hant
 * Intl daje „15日” (część „literal”), napis szerszy niż kolumna dnia na 6,3″ łamał się na „15 / 日”. Dzień tygodnia nad
 * liczbą i data w nagłówku tygodnia („11月15日 – 11月21日”) niosą resztę; pełną datę czyta etykieta VoiceOver dnia.
 */
import { setLang, type Lang } from '../i18n';
import { dniPaska } from '../kalendarz-pasek';
import { formatNumerDnia } from '../format';
import { wStrefie } from '../../core/__tests__/helpers/strefa';

const lok = (y: number, m: number, d: number, h = 0) => new Date(y, m - 1, d, h).getTime();

describe('numer dnia = sama liczba we wszystkich językach (D-421)', () => {
  wStrefie('Asia/Taipei');
  afterEach(() => setLang('pl'));

  it.each<Lang>(['zh-Hant', 'ja', 'ko', 'pl', 'en', 'hu', 'vi'])('%s: numery 15–21, bez znaku dnia („日”, „일”)', (l) => {
    setLang(l);
    expect(dniPaska(lok(2026, 11, 17, 10), 0).map((d) => d.numer)).toEqual(['15', '16', '17', '18', '19', '20', '21']);
  });

  it('formatNumerDnia: sama liczba dnia z Intl; bez zera wiodącego', () => {
    expect(formatNumerDnia(lok(2026, 11, 5), 'zh-Hant')).toBe('5');
    expect(formatNumerDnia(new Date(2026, 10, 15), 'ko')).toBe('15');
    expect(formatNumerDnia(lok(2026, 11, 22), 'pl')).toBe('22');
  });
});

describe('formatNumerDnia niezależnie od silnika Intl (D-421, dopisek 2026-11-17)', () => {
  // Hermes na iOS (PlatformIntlApple, formatToParts) tnie napis po znakach alfanumerycznych: „15日” to jedna część
  // { type: 'day', value: '15日' }. Atrapa odtwarza to zachowanie.
  const oryg = Intl.DateTimeFormat.prototype.formatToParts;
  beforeEach(() => {
    Intl.DateTimeFormat.prototype.formatToParts = function (this: Intl.DateTimeFormat, d?: Date | number) {
      const dzien = new Date(d ?? 0).getDate();
      return [{ type: 'day', value: `${dzien}日` }] as Intl.DateTimeFormatPart[];
    };
  });
  afterEach(() => { Intl.DateTimeFormat.prototype.formatToParts = oryg; });

  it.each(['zh-Hant', 'ja', 'ko'])('%s: jedna część „15日” z formatToParts nadal daje samą liczbę', (l) => {
    expect(formatNumerDnia(new Date(2026, 10, 15), l)).toBe('15');
    expect(formatNumerDnia(new Date(2026, 10, 5), l)).toBe('5');
  });
});
