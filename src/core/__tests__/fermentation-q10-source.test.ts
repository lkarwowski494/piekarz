/**
 * Q10 = 3,0 w 20–26 °C (FER-Q10-002, z modelu 1a Gänzle i in. 1998, szczebel 2; DEC-08 c) w Harmonogramie,
 * adaptacji czasu fermentacji i predyktorze szczytu zakwasu; 2,0 i 2,15 wycofane [M1-audytor-generalny-041;
 * 07-jakosc-006, 01-odkrywanie-008, 06-tresci-009]. Wektory z wyniku roli 06 (rachunek, tolerancja 1 min / 0,01 h).
 */
import * as fs from 'fs';
import * as path from 'path';
import { calculateFermentationAdaptation } from '../domain-rules';
import { predictStarterPeak } from '../starter-peak-predictor';
import { Q10_FERMENTATION } from '../fermentation-q10';

describe('Q10 fermentacji ze źródła', () => {
  it('stała Q10 = 3,0', () => {
    expect(Q10_FERMENTATION).toBe(3.0);
  });

  it('RD-08: 4,0 h w 24 °C → 21 °C 5,56 h, 26 °C 3,21 h, 20 °C 6,21 h (BR-HARMO-003 Czas w zakresie modelu)', () => {
    expect(calculateFermentationAdaptation(4, 21).adaptedHours).toBeCloseTo(5.56, 2);
    expect(calculateFermentationAdaptation(4, 26).adaptedHours).toBeCloseTo(3.21, 2);
    expect(calculateFermentationAdaptation(4, 20).adaptedHours).toBeCloseTo(6.21, 2);
  });

  // okno zaokrąglone do 0,1 h, więc tolerancja 0,05 (2,0 dałoby 1,149 i 0,758)
  it('predyktor: okno szczytu skaluje się mnożnikiem 3,0^((22 − T)/10)', () => {
    const base = { lastFedAt: 0, now: 0, ratio: [1, 2, 2] as [number, number, number], flourGrain: 'wheat' as const, hydration: 100 };
    const at = (t: number) => predictStarterPeak({ ...base, currentTempC: t });
    const w22 = at(22).estimatedPeakHoursMin;
    expect(at(20).estimatedPeakHoursMin / w22).toBeCloseTo(1.2457, 1);
    expect(at(26).estimatedPeakHoursMin / w22).toBeCloseTo(0.6444, 1);
  });

  it('tekst Harmonogramu z pliku treści, bez „Q10 = 2.0”', () => {
    const root = path.join(__dirname, '../../..');
    const card = fs.readFileSync(path.join(root, 'src/components/harmonogram/TargetReadyCard.tsx'), 'utf8');
    const pl = fs
      .readFileSync(path.join(root, 'docs/tresci/pl/fermentacja-temperatura.md'), 'utf8')
      .split('\n')
      .find((l) => l.endsWith('[T:FER-Q10-002]'))!
      .replace('[T:FER-Q10-002]', '')
      .trim();
    expect(card).not.toMatch(/Q10 = 2\.0/);
    expect(card).toContain(pl);
  });
});
