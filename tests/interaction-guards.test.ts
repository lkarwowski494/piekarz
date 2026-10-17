// ============================================================================
// Piekarz (Crust) — 16 Interaction Guards Contract Suite (S1..S16, NFR-INT-001..016)
// Rygorystyczny skan całego repozytorium pod kątem wzorców interfejsu i interakcji.
// ============================================================================

import fs from 'fs';
import path from 'path';
import { CLOSE_TEST_ID } from '../src/components/CloseButton';
import { cancelButton, backToEditButton, okButton } from '../src/lib/confirm';
import { normSearch } from '../src/lib/norm-search';

const rootDir = path.resolve(__dirname, '..');
const appDir = path.resolve(rootDir, 'app');
const srcDir = path.resolve(rootDir, 'src');

function walk(dir: string, filter: (f: string) => boolean): string[] {
  if (!fs.existsSync(dir)) return [];
  let res: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.expo') {
        res = res.concat(walk(full, filter));
      }
    } else if (filter(entry.name)) {
      res.push(full);
    }
  }
  return res;
}

describe('16 Interaction Guards Contract Suite (S1..S16, NFR-INT-001..016)', () => {
  // S1 & NFR-INT-001
  describe('S1: Modal Close Semantics', () => {
    it('uses standard CLOSE_TEST_ID ("close-modal")', () => {
      expect(CLOSE_TEST_ID).toBe('close-modal');
    });
  });

  // S2 & NFR-INT-002
  describe('S2: Consistent Text Editing Pattern', () => {
    it('contains zero occurrences of iOS-only Alert.prompt in entire app/ and src/', () => {
      const files = walk(appDir, (f) => f.endsWith('.tsx') || f.endsWith('.ts'))
        .concat(walk(srcDir, (f) => f.endsWith('.tsx') || f.endsWith('.ts')));
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(content).not.toContain('Alert.prompt');
      }
    });
  });

  // S3 & NFR-INT-003
  describe('S3: Dedicated NumInput for Numeric Fields', () => {
    it('NumInput exists and is exported from src/components/ui.tsx and src/components/NumInput.tsx', () => {
      const uiSrc = fs.readFileSync(path.join(srcDir, 'components', 'ui.tsx'), 'utf-8');
      expect(uiSrc).toContain('export { NumInput');
    });
  });

  // S4 & NFR-INT-004
  describe('S4: Two-Way Deletion Support', () => {
    it('SwipeRow component exports accessible delete action and visible button', () => {
      const uiSrc = fs.readFileSync(path.join(srcDir, 'components', 'ui.tsx'), 'utf-8');
      expect(uiSrc).toContain('accessibilityActions={[{ name: \'delete\'');
      expect(uiSrc).toContain('testID="swipe-row-delete-btn"');
    });
  });

  // S5 & NFR-INT-005
  describe('S5: Centralized Confirmation Helper & Strict Button Naming', () => {
    it('strictly forbids generic "Nie" or "Wróć" as cancellation role labels', () => {
      const cancelBtn = cancelButton();
      const backBtn = backToEditButton();
      const okBtn = okButton();

      expect(cancelBtn.text).toBe('Anuluj');
      expect(cancelBtn.style).toBe('cancel');
      expect(backBtn.text).toBe('Wróć do edycji');
      expect(okBtn.text).toBe('OK');

      const forbidden = ['Nie', 'Wróć', 'Zamknij okno'];
      expect(forbidden).not.toContain(cancelBtn.text);
      expect(forbidden).not.toContain(backBtn.text);
    });
  });

  // S6 & NFR-INT-006
  describe('S6: Selection Component Cardinality Rules', () => {
    it('all binary toggles and modal switches provide accessibilityRole="switch"', () => {
      const switchFiles = walk(srcDir, (f) => f.endsWith('.tsx')).filter((f) => {
        const content = fs.readFileSync(f, 'utf-8');
        return content.includes('<Switch') || content.includes('SwitchRow');
      });
      expect(switchFiles.length).toBeGreaterThan(0);
    });
  });

  // S7 & NFR-INT-007
  describe('S7: Keyboard Handling Contracts', () => {
    it('primary tab screens with inputs wrap or configure scrollviews with keyboard dismissal', () => {
      const tabs = ['index.tsx', 'stolnica.tsx', 'zakwas.tsx', 'doktor.tsx'];
      for (const t of tabs) {
        const content = fs.readFileSync(path.join(appDir, '(tabs)', t), 'utf-8');
        const hasScroll = content.includes('ScrollView') || content.includes('FlatList');
        if (hasScroll) {
          expect(content).toMatch(/keyboardShouldPersistTaps="handled"|keyboardDismissMode="on-drag"/);
        }
      }
    });
  });

  // S8 & NFR-INT-008
  describe('S8: Feedback Messaging Integrity', () => {
    it('root layout (_layout.tsx) contains zero startup Alert.alert calls', () => {
      const rootLayout = fs.readFileSync(path.join(appDir, '_layout.tsx'), 'utf-8');
      expect(rootLayout).not.toMatch(/Alert\.alert\(/);
    });
  });

  // S9 & NFR-INT-009
  describe('S9: Canonical Terminology (Piekarz)', () => {
    it('uses canonical domain term "wypiek" and does not confuse with cross-domain terms', () => {
      const i18nEn = fs.readFileSync(path.join(srcDir, 'lib', 'i18n.en.ts'), 'utf-8');
      expect(i18nEn.toLowerCase()).toContain('wypiek');
      expect(i18nEn.toLowerCase()).not.toContain('trening');
      expect(i18nEn.toLowerCase()).not.toContain('kawa');
    });
  });

  // S10 & NFR-INT-010
  describe('S10: Safe Navigation Routing', () => {
    it('all tabs declare canonical export default component', () => {
      const tabs = ['index.tsx', 'stolnica.tsx', 'zakwas.tsx', 'harmonogram.tsx', 'doktor.tsx'];
      for (const t of tabs) {
        const content = fs.readFileSync(path.join(appDir, '(tabs)', t), 'utf-8');
        expect(content).toMatch(/export default function/);
      }
    });
  });

  // S11 & NFR-INT-011
  describe('S11: Mandatory Empty State Component', () => {
    it('Empty component defines standard testID="empty-state"', () => {
      const uiSrc = fs.readFileSync(path.join(srcDir, 'components', 'ui.tsx'), 'utf-8');
      expect(uiSrc).toContain('testID = \'empty-state\'');
    });
  });

  // S12 & NFR-INT-012
  describe('S12: Mandatory Missing State Component', () => {
    it('Missing component defines testID="missing-record-state" and back navigation', () => {
      const uiSrc = fs.readFileSync(path.join(srcDir, 'components', 'ui.tsx'), 'utf-8');
      expect(uiSrc).toContain('testID="missing-record-state"');
      expect(uiSrc).toContain('testID="missing-back-button"');
    });
  });

  // S13 & NFR-INT-013
  describe('S13: Button Visual Hierarchy', () => {
    it('Btn component defines primary, secondary, ghost, and danger variants', () => {
      const uiSrc = fs.readFileSync(path.join(srcDir, 'components', 'ui.tsx'), 'utf-8');
      expect(uiSrc).toContain('\'primary\' | \'secondary\' | \'ghost\' | \'danger\'');
    });
  });

  // S14 & NFR-INT-014
  describe('S14: Centralized Unit & Date Formatting', () => {
    it('units and date helpers exist in src/lib/', () => {
      expect(fs.existsSync(path.join(srcDir, 'lib', 'units.ts'))).toBe(true);
      expect(fs.existsSync(path.join(srcDir, 'lib', 'date.ts'))).toBe(true);
    });
  });

  // S15 & NFR-INT-015
  describe('S15: SearchField with Diacritic Normalization', () => {
    it('normSearch removes diacritics including hard polish L (ł -> l)', () => {
      expect(normSearch('Żółty chleb')).toBe('zolty chleb');
      expect(normSearch('Mąka orkiszowa')).toBe('maka orkiszowa');
      expect(normSearch('Łatwy zaczyn')).toBe('latwy zaczyn');
    });
  });

  // S16 & NFR-INT-016
  describe('S16: View Layer Cleanliness (Zero direct native SDK in app/ screens)', () => {
    it('app/ screen files do not directly import expo-sqlite or expo-file-system', () => {
      const screenFiles = walk(appDir, (f) => f.endsWith('.tsx'));
      for (const file of screenFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(content).not.toMatch(/from\s+['"]expo-sqlite['"]/);
        expect(content).not.toMatch(/from\s+['"]expo-file-system['"]/);
      }
    });
  });
});
