// D-155: blokada „Plan wypieku jest tylko dla chleba na zakwasie” (plan-receptury.ts) nie dotyczy wersji drożdżowej
// z planem; orkisz na drożdżach bez podziału czasu (DRO-WER-SP-001) ma własny powód; reszta bez zmian (D-3) [M3 p9b]
import { powodBezPlanu, powodBezZakwasu } from '../plan-receptury';
import { setLang } from '../i18n';

const BEZ_ZAKWASU = 'Plan wypieku jest tylko dla chleba na zakwasie, a ta receptura nie ma zakwasu.';
const ORKISZ = 'Plan dla tej receptury na drożdżach czeka na czasy etapów. Ilości i wskazówki są wyżej.';
const drozdze = { starterPercentage: 0 };

describe('D-155 powód braku planu', () => {
  beforeEach(() => setLang('pl'));

  it('wersja drożdżowa z planem: plan dostępny', () => {
    expect(powodBezPlanu(drozdze, { recipeId: 'graham_bread_honey', wersja: 'drozdze' })).toBeNull();
    expect(powodBezPlanu(drozdze, { recipeId: 'rye_100_pan', wersja: 'drozdze' })).toBeNull();
    expect(powodBezPlanu(drozdze, { recipeId: 'tartine_high_hydration_80', wersja: 'drozdze' })).toBeNull();
  });

  it('orkisz na drożdżach: własny powód zamiast zdania o zakwasie', () => {
    expect(powodBezPlanu(drozdze, { recipeId: 'spelt_ancient_seeded', wersja: 'drozdze' })).toBe(ORKISZ);
  });

  it('receptura bez zakwasu i bez wersji drożdżowej (pizza) oraz wersja bez danych: jak D-3', () => {
    expect(powodBezPlanu(drozdze, { recipeId: 'pizza_napoletana_48h' })).toBe(BEZ_ZAKWASU);
    expect(powodBezPlanu(drozdze, { recipeId: 'pizza_napoletana_48h', wersja: 'drozdze' })).toBe(BEZ_ZAKWASU);
    expect(powodBezPlanu(drozdze, {})).toBe(BEZ_ZAKWASU);
    expect(powodBezPlanu(drozdze, {})).toBe(powodBezZakwasu(drozdze));
  });

  it('receptura na zakwasie: plan dostępny', () => {
    expect(powodBezPlanu({ starterPercentage: 20 }, { recipeId: 'graham_bread_honey', wersja: 'zakwas' })).toBeNull();
    expect(powodBezPlanu({ starterPercentage: 20 }, {})).toBeNull();
  });

  it('EN: oba powody przetłumaczone', () => {
    setLang('en');
    expect(powodBezPlanu(drozdze, { recipeId: 'spelt_ancient_seeded', wersja: 'drozdze' })).not.toBe(ORKISZ);
    expect(powodBezPlanu(drozdze, {})).not.toBe(BEZ_ZAKWASU);
  });
});
