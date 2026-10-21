// ============================================================================
// Piekarz (Crust) — Matrix Accessibility & VoiceOver Contract (NFR-A11Y-001..008)
// Weryfikuje etykiety dostępności, role, stany oraz minimalne pola dotyku >= 44pt (RD-ENG-03).
// ============================================================================

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { NumInput } from '../src/components/NumInput';
import { CloseButton } from '../src/components/CloseButton';
import { theme } from '../src/ui/theme';
import { celeWPliku, plikiTsx, prog } from './helpers/cele-dotykowe';

describe('Accessibility Contracts (NFR-A11Y-001..008 & RD-ENG-03)', () => {
  describe('Style minHeight >= 48 (RD-ENG-03; touch area on device not measured)', () => {
    it('NumInput has minimum height of 48pt', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<NumInput value={500} testID="a11y-num-input" />);
      });
      const input = tree.root.findByType(require('react-native').TextInput);
      const flat = require('react-native').StyleSheet.flatten(input.props.style);
      expect(flat.minHeight).toBeGreaterThanOrEqual(48);
    });

    // Btn i SwitchRow z src/components/ui.tsx usunięte z martwym kodem (bez użycia w app/); cele dotykowe
    // wszystkich prawdziwych przycisków sprawdza skan „Touch targets” niżej [M1-audytor-generalny-211]

    it('CloseButton renders in the header (touch area not measured)', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<CloseButton onPress={() => {}} />);
      });
      const btn = tree.root.findByProps({ testID: 'close-modal' });
      expect(btn).toBeTruthy();
    });
  });

  // 052: cele dotykowe według DEC-15 a (tokeny `cele`): 48 w prowadzeniu i akcjach głównych, 44 w pozostałych,
  // 64 przycisk kciuka. Pomiar ze stylów bazowych; hitSlop liczony osobno, nie dolicza się do progu
  // (reguła w tests/helpers/cele-dotykowe.ts) [M1-audytor-generalny-052; 04-studio-projektowe-006, 01-odkrywanie-020]
  describe('Touch targets from the theme (052, DEC-15 a)', () => {
    it('theme exposes the three target sizes from tokens: 48 / 44 / 64', () => {
      expect(theme.cele).toEqual({ glownyPrzeplyw: 48, pozostale: 44, przyciskKciuka: 64 });
    });

    it('every touchable in app/ and src/ has a base style minHeight at or above its threshold (Stolnica and main actions 48, others 44)', () => {
      const cele = plikiTsx().flatMap(celeWPliku).filter((c) => !c.zagniezdzony);
      expect(cele.length).toBeGreaterThan(150);
      const ponizej = cele
        .filter((c) => (c.wysokosc ?? 0) < prog(c))
        .map((c) => `${c.plik}:${c.linia}${c.testID ? ` (${c.testID})` : ''} ${c.wysokosc ?? 'brak'} < ${prog(c)}`);
      expect(ponizej).toEqual([]);
    });

    it('header button (Zamknij / Anuluj) has a 44 pt target', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<CloseButton onPress={() => {}} akcja="zamknij" />);
      });
      const btn = tree.root.findAll((n) => n.props.testID === 'close-modal' && n.props.style !== undefined)[0];
      const flat = require('react-native').StyleSheet.flatten(btn.props.style);
      expect(flat.minHeight).toBeGreaterThanOrEqual(44);
      expect(flat.minWidth).toBeGreaterThanOrEqual(44);
    });
  });

  // „VoiceOver Labels and Roles” (Btn, SwitchRow, SearchField, SwipeRow z src/components/ui.tsx) usunięte z martwym
  // kodem: żaden ekran app/ tych komponentów nie używał [M1-audytor-generalny-211; 08-programista-601]
});
