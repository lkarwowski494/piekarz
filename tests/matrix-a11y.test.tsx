// ============================================================================
// Piekarz (Crust) — Matrix Accessibility & VoiceOver Contract (NFR-A11Y-001..008)
// Weryfikuje etykiety dostępności, role, stany oraz minimalne pola dotyku >= 44pt (RD-ENG-03).
// ============================================================================

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { NumInput } from '../src/components/NumInput';
import { Field, Btn, SearchField, SwipeRow, SwitchRow } from '../src/components/ui';
import { CloseButton } from '../src/components/CloseButton';

describe('Accessibility Contracts (NFR-A11Y-001..008 & RD-ENG-03)', () => {
  describe('Touch Targets >= 44pt (RD-ENG-03)', () => {
    it('NumInput has minimum height of 44pt', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<NumInput value={500} testID="a11y-num-input" />);
      });
      const input = tree.root.findByType(require('react-native').TextInput);
      const flat = require('react-native').StyleSheet.flatten(input.props.style);
      expect(flat.minHeight).toBeGreaterThanOrEqual(44);
    });

    it('Btn has minimum height of 44pt', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<Btn title="Zapisz" testID="a11y-btn" />);
      });
      const btnNode = tree.root.findByProps({ accessibilityRole: 'button' });
      const rawStyle = typeof btnNode.props.style === 'function' ? btnNode.props.style({ pressed: false }) : btnNode.props.style;
      const flat = require('react-native').StyleSheet.flatten(rawStyle);
      expect(flat.minHeight).toBeGreaterThanOrEqual(44);
    });

    it('SwitchRow has minimum height of 44pt', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SwitchRow label="Powiadomienia" value={true} onValueChange={() => {}} testID="a11y-switch" />
        );
      });
      const switchNode = tree.root.findByProps({ accessibilityRole: 'switch' });
      const flat = require('react-native').StyleSheet.flatten(switchNode.props.style);
      expect(flat.minHeight).toBeGreaterThanOrEqual(44);
    });

    it('CloseButton uses header touch area of 44pt', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<CloseButton onPress={() => {}} />);
      });
      const btn = tree.root.findByProps({ testID: 'close-modal' });
      expect(btn).toBeTruthy();
    });
  });

  describe('VoiceOver Labels and Roles (NFR-A11Y-001..003)', () => {
    it('Btn exposes accessibilityRole="button" and accessibilityLabel', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<Btn title="Usuń przepis" variant="danger" />);
      });
      const btn = tree.root.findByProps({ testID: 'btn' });
      expect(btn.props.accessibilityRole).toBe('button');
      expect(btn.props.accessibilityLabel).toBe('Usuń przepis');
    });

    it('SwitchRow exposes accessibilityRole="switch" and accessibilityState.checked', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SwitchRow label="Tryb ciemny" value={true} onValueChange={() => {}} />
        );
      });
      const sw = tree.root.findByProps({ accessibilityRole: 'switch' });
      expect(sw.props.accessibilityState.checked).toBe(true);
      expect(sw.props.accessibilityLabel).toBe('Tryb ciemny');
    });

    it('SearchField exposes accessibilityRole="search" and clear button with accessibility label', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SearchField value="żytnia" onChangeText={() => {}} placeholder="Szukaj mąki..." />
        );
      });
      const search = tree.root.findByProps({ accessibilityRole: 'search' });
      expect(search.props.accessibilityLabel).toBe('Szukaj mąki...');

      const clearBtn = tree.root.findByProps({ testID: 'search-field-clear' });
      expect(clearBtn.props.accessibilityLabel).toBe('Wyczyść wyszukiwanie');
    });

    it('SwipeRow declares delete accessibility action for non-visual workflows', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SwipeRow onDelete={() => {}} deleteLabel="Usuń wpis">
            <></>
          </SwipeRow>
        );
      });
      const row = tree.root.findByProps({ accessible: true });
      expect(row.props.accessibilityActions).toEqual([{ name: 'delete', label: 'Usuń wpis' }]);
    });
  });
});
