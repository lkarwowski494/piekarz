import * as Clipboard from 'expo-clipboard';
import { formatFeedingToText, copyFeedingToClipboard } from '../feeding-formatter';
import { StoredStarter } from '../../data/db';
import { StarterFeedingResult } from '../../core/domain-rules';
import * as announceModule from '../announce';

describe('Feeding Formatter & Clipboard Specification (lib/feeding-formatter)', () => {
  const sampleStarter: StoredStarter = {
    id: 'starter_boleslaw',
    name: 'Bolesław',
    flourType: 'Żytnia razowa typ 2000',
    hydration: 100,
    birthDate: Date.now() - 1000 * 60 * 60 * 24 * 100,
    storageState: 'FRIDGE',
    lastFedAt: Date.now() - 1000 * 60 * 60 * 12,
  };

  const sampleFeeding: StarterFeedingResult = {
    starterGrams: 30,
    flourGrams: 60,
    waterGrams: 60,
    targetYieldGrams: 150,
    ratioDescription: '1:2:2',
    tipPl: 'Standardowe dokarmienie przed pieczeniem (4–6h w 24–26°C do szczytu objętości).',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatFeedingToText', () => {
    it('formats starter feeding details with jar ingredients and baking tip', () => {
      const text = formatFeedingToText(sampleStarter, sampleFeeding, [1, 2, 2]);

      expect(text).toContain('Dokarmienie zakwasu: Bolesław');
      expect(text).toContain('Proporcja: 1:2:2');
      expect(text).toContain('Docelowa masa zaczynu: 150 g');
      expect(text).toContain('1. Zakwas matka: 30 g');
      expect(text).toContain('2. Mąka (Żytnia razowa typ 2000): 60 g');
      expect(text).toContain('3. Woda: 60 g');
      expect(text).toContain('Standardowe dokarmienie przed pieczeniem');
      expect(text).toContain('Apps4Craft Studio');
    });
  });

  describe('copyFeedingToClipboard', () => {
    it('writes feeding text to clipboard and triggers accessibility announcement', async () => {
      const announceSpy = jest.spyOn(announceModule, 'announce').mockImplementation(() => {});

      const success = await copyFeedingToClipboard(sampleStarter, sampleFeeding, [1, 2, 2]);

      expect(success).toBe(true);
      expect(Clipboard.setStringAsync).toHaveBeenCalled();
      expect(announceSpy).toHaveBeenCalledWith('Skopiowano dokarmienie do schowka');
    });
  });
});
