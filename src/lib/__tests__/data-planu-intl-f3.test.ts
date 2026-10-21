/**
 * Data etapu w kopii planu („Kopiuj harmonogram”) dalej niż pojutrze: dzień i miesiąc w formacie języka
 * aplikacji przez Intl (PL 25.10, EN-US 10/25), nie zawsze „DD.MM” [audyt-niezalezny F-3].
 */
import { setLang } from '../i18n';
import { formatStageDateBadge } from '../schedule-formatter';

const REF = new Date(2026, 9, 20, 12, 0);
const D = new Date(2026, 9, 25, 21, 5);

describe('formatStageDateBadge przez Intl (F-3)', () => {
  afterEach(() => setLang('pl'));

  it('PL: 25.10', () => {
    setLang('pl');
    expect(formatStageDateBadge(D, REF)).toBe('25.10');
  });

  it('EN (USA): 10/25, nie 25.10', () => {
    setLang('en');
    expect(formatStageDateBadge(D, REF)).toBe('10/25');
  });

  it('DE: 25.10. (format języka)', () => {
    setLang('de');
    expect(formatStageDateBadge(D, REF)).toBe('25.10.');
  });
});
