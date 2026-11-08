// Plakietka dnia kroku planu (wydzielona z harmonogram.tsx bez zmiany zachowania) [M3 p9b]
import { plakietkaDnia } from '../plakietka-dnia';
import { formatDzienData } from '../format';
import { setLang } from '../i18n';

describe('plakietkaDnia', () => {
  beforeEach(() => setLang('pl'));
  const teraz = new Date(2026, 10, 4, 23, 30);
  it('dni względem dziś po kalendarzu lokalnym, nie po 24 h', () => {
    expect(plakietkaDnia(new Date(2026, 10, 4, 0, 5), teraz)).toBe('Dziś');
    expect(plakietkaDnia(new Date(2026, 10, 5, 0, 5), teraz)).toBe('Jutro');
    expect(plakietkaDnia(new Date(2026, 10, 6, 12, 0), teraz)).toBe('Pojutrze');
    expect(plakietkaDnia(new Date(2026, 10, 3, 12, 0), teraz)).toBe('Wczoraj');
  });
  it('dalej dzień tygodnia z datą', () => {
    const d = new Date(2026, 10, 9, 8, 0);
    expect(plakietkaDnia(d, teraz)).toBe(formatDzienData(d));
  });
});
