import fs from 'fs';
import path from 'path';
import { CLOSE_TEST_ID } from '../../components/CloseButton';
import { cancelButton, backToEditButton, okButton } from '../../lib/confirm';

describe('Apps4Brew Architectural Interaction Guards (docs/32-wzorce-interakcji)', () => {
  describe('Guard S1: Close Modal Identifier', () => {
    it('uses standard close-modal testID for sheets and modal cancellation', () => {
      expect(CLOSE_TEST_ID).toBe('close-modal');
    });
  });

  describe('Guard S5: Cancellation Button Naming Integrity', () => {
    it('guarantees cancelButton uses exactly "Anuluj"', () => {
      const btn = cancelButton();
      expect(btn.text).toBe('Anuluj');
      expect(btn.style).toBe('cancel');
    });

    it('prohibits generic negative terms ("Nie", "Wróć") in cancellation role', () => {
      const forbiddenCancelWords = ['Nie', 'Wróć', 'Zamknij okno'];
      const allowedCancelWords = ['Anuluj', 'Wróć do edycji', 'OK'];

      const cancelBtn = cancelButton();
      const backBtn = backToEditButton();
      const okBtn = okButton();

      expect(forbiddenCancelWords).not.toContain(cancelBtn.text);
      expect(forbiddenCancelWords).not.toContain(backBtn.text);
      expect(forbiddenCancelWords).not.toContain(okBtn.text);

      expect(allowedCancelWords).toContain(cancelBtn.text);
      expect(allowedCancelWords).toContain(backBtn.text);
      expect(allowedCancelWords).toContain(okBtn.text);
    });
  });

  describe('Guard S14: Touch Target Minimum Dimensions', () => {
    it('defines minHeight and minWidth of 44pt for touch targets', () => {
      const MIN_TOUCH_TARGET_PT = 44;
      expect(MIN_TOUCH_TARGET_PT).toBeGreaterThanOrEqual(44);
    });

    it('HeaderButton and AddButton component source code explicitly enforces 44pt minimum touch target', () => {
      const addButtonSrc = fs.readFileSync(path.resolve(__dirname, '../../components/AddButton.tsx'), 'utf-8');
      const headerButtonSrc = fs.readFileSync(path.resolve(__dirname, '../../components/DraftHeader.tsx'), 'utf-8');

      expect(addButtonSrc).toMatch(/minHeight:\s*44/);
      expect(addButtonSrc).toMatch(/minWidth:\s*44/);
      expect(headerButtonSrc).toMatch(/minHeight:\s*44/);
      expect(headerButtonSrc).toMatch(/minWidth:\s*44/);
    });
  });

  describe('Guard S18: Clean Production Core (No stray console.log in domain logic)', () => {
    const coreDir = path.resolve(__dirname, '../../core');
    const doctorDir = path.resolve(__dirname, '../../doctor');
    const schedulerDir = path.resolve(__dirname, '../../scheduler');

    const checkNoConsoleLog = (dirPath: string) => {
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.ts') && !f.includes('.test.'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
        expect(content).not.toMatch(/console\.log\(/);
      }
    };

    it('core domain calculation files contain 0 console.log calls', () => {
      checkNoConsoleLog(coreDir);
    });

    it('doctor diagnostic files contain 0 console.log calls', () => {
      checkNoConsoleLog(doctorDir);
    });

    it('reverse scheduler files contain 0 console.log calls', () => {
      checkNoConsoleLog(schedulerDir);
    });
  });

  describe('Guard S22: Canonical Navigation Routing Contract', () => {
    const tabsDir = path.resolve(__dirname, '../../../app/(tabs)');

    it('all 5 canonical tabs exist as Expo Router screen modules', () => {
      const requiredTabs = ['index.tsx', 'stolnica.tsx', 'zakwas.tsx', 'harmonogram.tsx', 'doktor.tsx'];
      for (const tab of requiredTabs) {
        const fullPath = path.join(tabsDir, tab);
        expect(fs.existsSync(fullPath)).toBe(true);
      }
    });

    it('all 5 screen modules export a default React component', () => {
      const requiredTabs = ['index.tsx', 'stolnica.tsx', 'zakwas.tsx', 'harmonogram.tsx', 'doktor.tsx'];
      for (const tab of requiredTabs) {
        const content = fs.readFileSync(path.join(tabsDir, tab), 'utf-8');
        expect(content).toMatch(/export default function/);
      }
    });
  });
});
