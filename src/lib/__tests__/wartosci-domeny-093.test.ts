// Wartości domeny w szablonach (PRZEKLAD-README, problem 5): pola *Pl wstawiane do tekstu ({namePl},
// {flavorProfilePl}, ${elapsedDays}) dawały polski tekst w każdym języku, bo t() dostawało gotowe zdanie PL bez
// wpisu w słowniku. Przy wyświetlaniu: szablon i wartości z przekładu; pola *Pl w wynikach bez zmian
// [M1-audytor-generalny-093].
import { setLang, t, tPlural, type Lang } from '../i18n';
import { calculatePrefermentBreakdown, PREFERMENT_DEFINITIONS } from '../../core/preferments';
import { calculateStarterPhase } from '../../core/sourdough-physics';
import { wskazowkaZaczynu } from '../wskazowka-zaczynu';
import { etykietaFazyZakwasu } from '../../components/zakwas/StarterPeakActivityCard';

const poolish = calculatePrefermentBreakdown({ prefermentType: 'poolish', prefermentFlourPercentage: 20, totalFlourGrams: 500, totalTargetHydration: 70, saltPercentage: 2 });
const DOBA = 24 * 3600 * 1000;

describe('wartości domeny w języku użytkownika (093)', () => {
  afterEach(() => setLang('pl'));

  it('pole PL w wyniku obliczeń bez zmian (zapis i testy domeny)', () => {
    // Czas dojrzewania poolish z docs/tresci/pl/zaczyny.md (ZAC-CZA-001) [M1-audytor-generalny-131]
    // M3 T2 (D-123): czas dojrzewania bez przypisu do źródła; te same wartości (od 8 godzin)
    expect(poolish.fermentationTipPl).toMatch(/^Poolish \(Rzadki zaczyn 100%\): Czas dojrzewania od 8 godzin/);
    expect(wskazowkaZaczynu(poolish)).toBe(poolish.fermentationTipPl);
  });

  it.each<Lang>(['en', 'de'])('%s: wskazówka zaczynu z szablonu i nazw w języku aplikacji', (l) => {
    setLang(l);
    const d = PREFERMENT_DEFINITIONS.poolish;
    const w = wskazowkaZaczynu(poolish);
    expect(w).toContain(t(d.namePl));
    expect(w).toContain(t(d.flavorProfilePl));
    expect(w).not.toMatch(/Czas dojrzewania|Rzadki zaczyn| w 18/);
  });

  it('en: czas dojrzewania z przekładu (docs/tresci/en/zaczyny.md, ZAC-CZA-001)', () => {
    setLang('en');
    expect(wskazowkaZaczynu(poolish)).toContain('from 8 hours (more yeast) to 14–16 hours (less yeast)');
  });

  it.each<Lang>(['en', 'de'])('%s: etykieta fazy zakwasu w lodówce z liczbą dni w szablonie', (l) => {
    const teraz = Date.UTC(2026, 9, 21, 12);
    const faza = calculateStarterPhase(teraz - 3 * DOBA, 'FRIDGE', teraz);
    expect(faza.labelPl).toBe('Uśpiony w lodówce (3 dni)');
    setLang(l);
    const e = etykietaFazyZakwasu(faza);
    // Liczba dni z odmianą CLDR w parametrze {dni} [M1-audytor-generalny-071]
    expect(e).toBe(t('Uśpiony w lodówce ({dni})', { dni: tPlural(3, { one: '{n} dzień', few: '{n} dni', many: '{n} dni', other: '{n} dnia' }) }));
    expect(e).not.toMatch(/lodówce/);
    const glodny = etykietaFazyZakwasu(calculateStarterPhase(teraz - 7 * DOBA, 'FRIDGE', teraz));
    expect(glodny).toContain('7');
    expect(glodny).not.toMatch(/odświeżenia/);
  });
});
