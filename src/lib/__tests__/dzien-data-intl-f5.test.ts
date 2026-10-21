/**
 * Dzień tygodnia z datą („Pon., 26 paź”, „Mon, Oct 26”) przez Intl.DateTimeFormat w języku aplikacji: spójne
 * skróty dni i miesięcy we wszystkich 35 językach zamiast par kluczy „Pon.”/„sty” z przekładu maszynowego
 * (hr „Čet.” z kropką i „Pon” bez) [audyt-niezalezny F-5]. Poprawki skrótów hr w słowniku do czasu, aż
 * app/(tabs)/receptury/harmonogram.tsx (tor p15a) przejdzie na formatDzienData.
 */
import { setLang } from '../i18n';
import { formatDzienData } from '../format';
import { LADOWANIE_SLOWNIKOW } from '../i18n-slowniki';

const D = new Date(2026, 9, 26, 9, 0); // poniedziałek 26.10.2026

describe('formatDzienData (F-5)', () => {
  afterEach(() => setLang('pl'));

  it('każdy język: wynik Intl dla tego języka (dzień tygodnia, dzień, miesiąc)', () => {
    for (const [lang, oczekiwany] of [
      ['pl', new Intl.DateTimeFormat('pl', { weekday: 'short', day: 'numeric', month: 'short' }).format(D)],
      ['en', new Intl.DateTimeFormat('en', { weekday: 'short', day: 'numeric', month: 'short' }).format(D)],
      ['hr', new Intl.DateTimeFormat('hr', { weekday: 'short', day: 'numeric', month: 'short' }).format(D)],
    ] as const) {
      setLang(lang);
      expect(formatDzienData(D)).toBe(oczekiwany);
    }
  });

  it('PL zawiera skrót dnia i miesiąca, EN po angielsku', () => {
    setLang('pl');
    expect(formatDzienData(D)).toMatch(/pon/i);
    expect(formatDzienData(D)).toMatch(/paź/);
    setLang('en');
    expect(formatDzienData(D)).toMatch(/Mon/);
    expect(formatDzienData(D)).toMatch(/Oct/);
  });

  it('hr: skróty dni w słowniku spójne (bez kropki), „Uto” zamiast „Ut.”', () => {
    const hr = LADOWANIE_SLOWNIKOW.hr();
    expect(['Niedz.', 'Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pt.', 'Sob.'].map((k) => hr[k])).toEqual(['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub']);
  });
});
