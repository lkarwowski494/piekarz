// M1-audytor-generalny-067: BR-KALK-011 (RD-27), część liczeniowa — gramy soli z procentu wokół granicy
// typowego zakresu i liczenie bez blokady powyżej niej. Samą informację „więcej niż typowe 1,8–2,0%” (RD-27-W3)
// i jej brak na granicy (RD-27-W2) sprawdza src/__tests__/br-kalk-130-reszta.test.tsx [reaudit-noc N-13].
import { calculateDoughRecipeFromFlour } from '../domain-rules';

describe('BR-KALK-011 Gramy soli z procentu wokół granicy RD-27 (informację sprawdza br-kalk-130-reszta)', () => {
  const receptura = {
    flours: [{ name: 'Pszenna', percentage: 100 }],
    waterPercentage: 70,
    starterPercentage: 20,
  };

  test('BR-KALK-011 Sól na granicy: 1000 g mąki i 2,0% soli to 20 g soli', () => {
    const r = calculateDoughRecipeFromFlour(1000, { ...receptura, saltPercentage: 2.0 });
    expect(r.saltGrams).toBe(20);
    expect(r.saltGrams / r.baseFlourWeightGrams).toBeCloseTo(0.02, 3);
  });

  test('BR-KALK-011 Sól powyżej typowej: 2,5% przy 1000 g mąki liczy się bez blokady (25 g)', () => {
    const r = calculateDoughRecipeFromFlour(1000, { ...receptura, saltPercentage: 2.5 });
    expect(r.saltGrams).toBe(25);
    expect(r.sumCheckGrams).toBe(r.targetDoughWeightGrams);
  });
});
