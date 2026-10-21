// ============================================================================
// Piekarz (Crust) — 16 Interaction Guards Contract Suite (S1..S16, NFR-INT-001..016)
// Rygorystyczny skan całego repozytorium pod kątem wzorców interfejsu i interakcji.
// ============================================================================

import fs from 'fs';
import path from 'path';
import { CLOSE_TEST_ID } from '../src/components/CloseButton';
import { cancelButton, backToEditButton, okButton } from '../src/lib/confirm';

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
    // Wcześniej sprawdzane w src/components/ui.tsx (martwy kod, usunięty) [M1-audytor-generalny-211]
    it('NumInput exists and is exported from src/components/NumInput.tsx', () => {
      const src = fs.readFileSync(path.join(srcDir, 'components', 'NumInput.tsx'), 'utf-8');
      expect(src).toMatch(/export (function|const) NumInput\b/);
    });
  });

  // S4 & NFR-INT-004: SwipeRow z src/components/ui.tsx nie był używany przez żaden ekran; usunięty z martwym
  // kodem (usuwanie w aplikacji: „Cofnij”, D-051) [M1-audytor-generalny-211]

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
      // Jedyny przełącznik (SwitchRow w martwym src/components/ui.tsx) usunięty [M1-audytor-generalny-211]; reguła
      // dotyczy każdego przyszłego <Switch> w app/ i src/
      const switchFiles = walk(appDir, (f) => f.endsWith('.tsx'))
        .concat(walk(srcDir, (f) => f.endsWith('.tsx')))
        .filter((f) => !f.includes('__tests__') && fs.readFileSync(f, 'utf-8').includes('<Switch'));
      for (const f of switchFiles) {
        expect({ f, rola: fs.readFileSync(f, 'utf-8').includes('accessibilityRole="switch"') }).toEqual({ f, rola: true });
      }
    });
  });

  // S7 & NFR-INT-007
  describe('S7: Keyboard Handling Contracts', () => {
    it('primary tab screens with inputs wrap or configure scrollviews with keyboard dismissal', () => {
      // Ekrany po D-051 2a: 4 zakładki, plan wypieku, prowadzenie i Doktor [M1-audytor-generalny-101]
      const tabs = ['(tabs)/(dzis)/index.tsx', '(tabs)/receptury/index.tsx', '(tabs)/receptury/receptura.tsx', '(tabs)/receptury/harmonogram.tsx', '(tabs)/zakwasy/index.tsx', '(tabs)/dziennik/index.tsx', 'stolnica.tsx', 'doktor.tsx'];
      for (const t of tabs) {
        const content = fs.readFileSync(path.join(appDir, t), 'utf-8');
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
      const partsDir = path.join(srcDir, 'lib', 'i18n-en');
      const i18nEn = fs
        .readdirSync(partsDir)
        .map((f) => fs.readFileSync(path.join(partsDir, f), 'utf-8'))
        .join('\n');
      expect(i18nEn.toLowerCase()).toContain('wypiek');
      expect(i18nEn.toLowerCase()).not.toContain('trening');
      expect(i18nEn.toLowerCase()).not.toContain('kawa');
    });
  });

  // S10 & NFR-INT-010
  describe('S10: Safe Navigation Routing', () => {
    it('all tabs declare canonical export default component', () => {
      const tabs = ['(tabs)/(dzis)/index.tsx', '(tabs)/receptury/index.tsx', '(tabs)/receptury/harmonogram.tsx', '(tabs)/zakwasy/index.tsx', '(tabs)/dziennik/index.tsx', 'stolnica.tsx', 'doktor.tsx'];
      for (const t of tabs) {
        const content = fs.readFileSync(path.join(appDir, t), 'utf-8');
        expect(content).toMatch(/export default function/);
      }
    });
  });

  // S11, S12, S13 (Empty, Missing, Btn) i S15 (SearchField, normSearch): komponenty z src/components/ui.tsx
  // i src/lib/norm-search.ts nie były używane przez żaden ekran app/; usunięte z martwym kodem [M1-audytor-generalny-211]

  // S14 & NFR-INT-014: formatowanie jednostek i dat w jednym miejscu (fasady units.ts i date.ts były martwe)
  describe('S14: Centralized Unit & Date Formatting', () => {
    it('unit and date formatters exist in src/lib/unit-converter.ts and src/lib/format.ts', () => {
      expect(fs.readFileSync(path.join(srcDir, 'lib', 'unit-converter.ts'), 'utf-8')).toMatch(/export function formatWeight\b/);
      expect(fs.readFileSync(path.join(srcDir, 'lib', 'format.ts'), 'utf-8')).toMatch(/export function formatDate\b/);
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
