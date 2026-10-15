import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { formatRecipeText, copyRecipeToClipboard } from '../recipe-formatter';
import { calculateDoughRecipe, calculateBakeLossMetrics } from '../../core/domain-rules';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: { Success: 'success' },
}));

describe('Recipe Formatter & Clipboard Sharing (Apps4Brew Format Standard)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleCalc = calculateDoughRecipe({
    targetDoughWeightGrams: 1700,
    flours: [
      { name: 'Mąka pszenna typ 750', percentage: 80.0 },
      { name: 'Mąka żytnia typ 720', percentage: 20.0 },
    ],
    waterPercentage: 68.0,
    saltPercentage: 2.0,
    starterPercentage: 20.0,
    starterHydration: 100.0,
  });

  const sampleBakeLoss = calculateBakeLossMetrics(1700, 14.0, sampleCalc.totalWaterGrams, 2);

  it('formats full recipe document with yield, flours, DDT and bake loss', () => {
    const formatted = formatRecipeText({
      recipeName: 'Wiejski chleb 72%',
      calc: sampleCalc,
      bakeLoss: sampleBakeLoss,
      targetDdt: 25.0,
      waterTempTarget: 22.0,
      loavesCount: 2,
    });

    expect(formatted).toContain('Wiejski chleb 72%');
    expect(formatted).toContain('1700 g');
    expect(formatted).toContain('True Baker\'s %');
    expect(formatted).toContain('Strata piecowa: 14.0%');
    expect(formatted).toContain('Mąka pszenna typ 750 (80.0%)');
    expect(formatted).toContain('Mąka żytnia typ 720 (20.0%)');
    expect(formatted).toContain('Zakwas');
    expect(formatted).toContain('Sól');
    expect(formatted).toContain('Docelowa temperatura ciasta (DDT): 25.0°C');
    expect(formatted).toContain('Apps4Brew');
  });

  it('includes ice requirements note when ice is specified', () => {
    const formatted = formatRecipeText({
      recipeName: 'Letni chleb lodowy',
      calc: sampleCalc,
      targetDdt: 24.0,
      waterTempTarget: 3.5,
      iceGrams: 85,
      tapWaterTemp: 22.0,
      loavesCount: 1,
    });

    expect(formatted).toContain('w tym lód: 85 g');
    expect(formatted).toContain('woda z kranu (22°C)');
  });

  it('copies formatted text to clipboard and triggers haptic feedback', async () => {
    const text = 'Chleb testowy 800g';
    const result = await copyRecipeToClipboard(text);

    expect(result).toBe(true);
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(text);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });
});
