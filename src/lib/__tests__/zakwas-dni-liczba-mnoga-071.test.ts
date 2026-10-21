// Etykieta zakwasu w lodówce z liczbą dni w formie CLDR języka aplikacji (Intl.PluralRules), nie „(1 dni)”
// ani „(1 days)” [M1-audytor-generalny-071; 09-lokalizacja-006; 09-lokalizacja-504].
import { setLang, tPlural, type Lang } from '../i18n';
import { calculateStarterPhase } from '../../core/sourdough-physics';
import { etykietaFazyZakwasu } from '../../components/zakwas/StarterPeakActivityCard';

const DOBA = 24 * 3600 * 1000;
const teraz = Date.UTC(2026, 9, 21, 12);
const etykieta = (dni: number) => etykietaFazyZakwasu(calculateStarterPhase(teraz - dni * DOBA, 'FRIDGE', teraz));
const DNI = { one: '{n} dzień', few: '{n} dni', many: '{n} dni', other: '{n} dnia' };

describe('liczba dni w etykiecie zakwasu w lodówce (071)', () => {
  afterEach(() => setLang('pl'));

  it('pl: 1, 2, 5 i 22 dni w formie polskiej', () => {
    setLang('pl');
    expect(etykieta(1)).toBe('Uśpiony w lodówce (1 dzień)');
    expect(etykieta(2)).toBe('Uśpiony w lodówce (2 dni)');
    expect(etykieta(5)).toBe('Uśpiony w lodówce (5 dni)');
    expect(etykieta(22)).toBe('Wymaga odświeżenia (22 dni w chłodzie)');
    expect(calculateStarterPhase(teraz - DOBA, 'FRIDGE', teraz).labelPl).toBe('Uśpiony w lodówce (1 dzień)');
  });

  it('en: 1 day, 2 days', () => {
    setLang('en');
    expect(etykieta(1)).toBe('Dormant in the fridge (1 day)');
    expect(etykieta(2)).toBe('Dormant in the fridge (2 days)');
    expect(etykieta(21)).toBe('Needs a refresh (21 days in the cold)');
  });

  it.each<Lang>(['ru', 'cs', 'sl', 'de'])('%s: liczba dni z form CLDR języka (1, 2, 5, 21)', (l) => {
    setLang(l);
    for (const n of [1, 2, 5]) expect(etykieta(n)).toContain(tPlural(n, DNI));
    expect(etykieta(21)).toContain(tPlural(21, DNI));
    expect(etykieta(1)).not.toMatch(/lodówce|dzień|1 days/);
  });

  it('ru: 1 день, 2 дня, 5 дней', () => {
    setLang('ru');
    expect(etykieta(1)).toContain('1 день');
    expect(etykieta(2)).toContain('2 дня');
    expect(etykieta(5)).toContain('5 дней');
  });
});
