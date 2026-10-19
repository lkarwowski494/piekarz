import {
  generateRecipeBenchSheetHtml,
  generateStarterJarLabelSvg,
  generateStarterJarLabelHtml,
  generateStarterJarSheetHtml,
  printRecipeSheetDirectly,
  exportRecipeSheetAsPdf,
  printStarterLabelDirectly,
  exportStarterLabelAsPdf,
} from '../pdf-sheet-generator';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

describe('pdf-sheet-generator', () => {
  const mockRecipeOptions = {
    recipeName: 'Chleb Wiejski na Zakwasie',
    totalFlourGrams: 500,
    overallHydrationPercent: 72.0,
    flours: [
      { name: 'Mąka pszenna chlebowa t750', percentage: 80, weightGrams: 400 },
      { name: 'Mąka żytnia razowa t2000', percentage: 20, weightGrams: 100 },
    ],
    waterGrams: 360,
    starterGrams: 100,
    starterHydration: 100,
    saltGrams: 10,
    saltPercent: 2.0,
    targetDDT: 25.0,
    waterTempTarget: 22.5,
    ambientTemp: 23.0,
    targetDoughWeightGrams: 970,
    loavesCount: 1,
    bakedSingleLoafWeight: 820,
    notes: 'Pieczenie w żeliwnym garnku z parą',
  };

  const mockStarterOptions = {
    starterName: 'Bolesław',
    flourType: 'Żytnia razowa t2000',
    hydration: 100,
    feedingRatio: '1:2:2',
    storageState: 'FRIDGE' as const,
    ageDays: 120,
    lastFedDate: '15.10.2026',
  };

  describe('generateRecipeBenchSheetHtml', () => {
    it('generates valid HTML document with recipe details and baker percentages', () => {
      const html = generateRecipeBenchSheetHtml(mockRecipeOptions);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Chleb Wiejski na Zakwasie');
      expect(html).toContain('Mąka pszenna chlebowa t750');
      expect(html).toContain('400 g');
      expect(html).toContain('100 g');
      expect(html).toContain('360 g');
      expect(html).toContain('100 g');
      expect(html).toContain('10 g');
      expect(html).toContain('Cel DDT: 25,0°C');
      expect(html).toContain('970 g');
      expect(html).toContain('Pieczenie w żeliwnym garnku z parą');
    });

    it('escapes XML special characters in recipe name and notes', () => {
      const html = generateRecipeBenchSheetHtml({
        ...mockRecipeOptions,
        recipeName: 'Chleb <Specjalny> & "Pyszny"',
        notes: 'Uwaga na 100% wilgotność > 80%',
      });

      expect(html).toContain('Chleb &lt;Specjalny&gt; &amp; &quot;Pyszny&quot;');
      expect(html).toContain('&gt; 80%');
      expect(html).not.toContain('<Specjalny>');
    });
  });

  describe('generateStarterJarLabelSvg and HTML', () => {
    it('generates valid SVG with starter attributes and storage information', () => {
      const svg = generateStarterJarLabelSvg(mockStarterOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('Bolesław');
      expect(svg).toContain('Żytnia razowa t2000');
      expect(svg).toContain('Hydratacja: 100%');
      expect(svg).toContain('Proporcja: 1:2:2');
      expect(svg).toContain('Lodówka (4°C)');
      expect(svg).toContain('120 dni');
    });

    it('generates single label and A4 sheet HTML with multiple cards', () => {
      const singleHtml = generateStarterJarLabelHtml(mockStarterOptions);
      expect(singleHtml).toContain('<!DOCTYPE html>');
      expect(singleHtml).toContain('Bolesław');

      const sheetHtml = generateStarterJarSheetHtml(mockStarterOptions, 4);
      expect(sheetHtml).toContain('ARKUSZ DRUKU ETYKIET');
      expect(sheetHtml).toContain('Bolesław');
    });
  });

  describe('print and export integration', () => {
    it('calls Print.printAsync when printing directly', async () => {
      await printRecipeSheetDirectly(mockRecipeOptions);
      expect(Print.printAsync).toHaveBeenCalledWith(
        expect.objectContaining({ html: expect.stringContaining('Chleb Wiejski na Zakwasie') })
      );

      await printStarterLabelDirectly(mockStarterOptions, true);
      expect(Print.printAsync).toHaveBeenCalledWith(
        expect.objectContaining({ html: expect.stringContaining('Bolesław') })
      );
    });

    it('calls Print.printToFileAsync and Sharing.shareAsync when exporting PDF', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);

      const recipeUri = await exportRecipeSheetAsPdf(mockRecipeOptions);
      expect(Print.printToFileAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalled();
      expect(recipeUri).toBe('file:///mock/print.pdf');

      const starterUri = await exportStarterLabelAsPdf(mockStarterOptions, true);
      expect(starterUri).toBe('file:///mock/print.pdf');
    });
  });
});
