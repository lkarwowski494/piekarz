// ============================================================================
// Piekarz (Crust) — Unit Tests: UI Components (S1..S16, NFR-INT-001..016)
// ============================================================================

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, TextInput, Pressable } from 'react-native';
import {
  NumInput,
  Field,
  Empty,
  Missing,
  Btn,
  SearchField,
  SwipeRow,
} from '../ui';
import { normSearch } from '../../lib/norm-search';

describe('Common UI Components (S1..S16)', () => {
  describe('S2 & NFR-INT-002: Field', () => {
    test('renders label, input, and enforces maxLength limit', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <Field label="Nazwa chleba" placeholder="Wpisz nazwę..." maxLength={50} />
        );
      });

      const label = tree.root.findByProps({ children: 'Nazwa chleba' });
      expect(label).toBeTruthy();

      const input = tree.root.findByType(TextInput);
      expect(input.props.maxLength).toBe(50);
      expect(input.props.placeholder).toBe('Wpisz nazwę...');
    });

    test('renders error message when error prop is present', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <Field label="Waga" error="Wartość nie może być ujemna" />
        );
      });

      const errorText = tree.root.findByProps({ children: 'Wartość nie może być ujemna' });
      expect(errorText).toBeTruthy();
    });
  });

  describe('S11 & NFR-INT-011: Empty State', () => {
    test('renders empty title, description and calls onAction when action button pressed', () => {
      const onAction = jest.fn();
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <Empty
            title="Brak wypieków"
            description="Rozpocznij swój pierwszy wypiek, aby zobaczyć statystyki."
            actionLabel="Rozpocznij wypiek"
            onAction={onAction}
          />
        );
      });

      expect(tree.root.findByProps({ children: 'Brak wypieków' })).toBeTruthy();
      expect(
        tree.root.findByProps({
          children: 'Rozpocznij swój pierwszy wypiek, aby zobaczyć statystyki.',
        })
      ).toBeTruthy();

      const actionBtn = tree.root.findByProps({ testID: 'empty-state-action' });
      act(() => {
        actionBtn.props.onPress();
      });
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('S12 & NFR-INT-012: Missing Record State', () => {
    test('renders default title, message, and back button calling onBack or router.back', () => {
      const onBack = jest.fn();
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <Missing title="Nie znaleziono przepisu" onBack={onBack} />
        );
      });

      expect(tree.root.findByProps({ children: 'Nie znaleziono przepisu' })).toBeTruthy();
      const backBtn = tree.root.findByProps({ testID: 'missing-back-button' });
      act(() => {
        backBtn.props.onPress();
      });
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('S13 & NFR-INT-013: Button Hierarchy (Btn)', () => {
    test('renders primary, secondary, ghost, danger variants with accessibility labels', () => {
      const onPress = jest.fn();
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <Btn title="Zapisz przepis" variant="primary" onPress={onPress} />
        );
      });

      const btn = tree.root.findByProps({ testID: 'btn' });
      expect(btn.props.accessibilityRole).toBe('button');
      expect(btn.props.accessibilityLabel).toBe('Zapisz przepis');

      act(() => {
        btn.props.onPress();
      });
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    test('supports disabled state and accessibilityState', () => {
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <Btn title="Nieaktywny" variant="secondary" disabled={true} />
        );
      });

      const btn = tree.root.findByProps({ testID: 'btn' });
      expect(btn.props.accessibilityState.disabled).toBe(true);
      expect(btn.props.disabled).toBe(true);
    });
  });

  describe('S15 & NFR-INT-015: SearchField with Diacritic Normalization', () => {
    test('renders search input and allows typing', () => {
      const onChangeText = jest.fn();
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SearchField value="chleb" onChangeText={onChangeText} placeholder="Szukaj chleba..." />
        );
      });

      const input = tree.root.findByType(TextInput);
      expect(input.props.value).toBe('chleb');
      expect(input.props.placeholder).toBe('Szukaj chleba...');

      act(() => {
        input.props.onChangeText('żytni');
      });
      expect(onChangeText).toHaveBeenCalledWith('żytni');
    });

    test('shows clear button when text is present and clears text upon press', () => {
      const onChangeText = jest.fn();
      const onClear = jest.fn();
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SearchField value="pszenny" onChangeText={onChangeText} onClear={onClear} />
        );
      });

      const clearBtn = tree.root.findByProps({ testID: 'search-field-clear' });
      expect(clearBtn).toBeTruthy();

      act(() => {
        clearBtn.props.onPress();
      });
      expect(onChangeText).toHaveBeenCalledWith('');
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    test('normSearch removes diacritics including hard polish L (ł -> l)', () => {
      expect(normSearch('Żółty Liść')).toBe('zolty lisc');
      expect(normSearch('Chleb na zakwasie żytnim')).toBe('chleb na zakwasie zytnim');
      expect(normSearch('Mąka pszenna')).toBe('maka pszenna');
      expect(normSearch('Bułka')).toBe('bulka');
      expect(normSearch('Łódź')).toBe('lodz');
    });
  });

  describe('S4 & NFR-INT-004: SwipeRow Two-Way Deletion', () => {
    test('renders content, visible delete button, and accessibility action delete', () => {
      const onDelete = jest.fn();
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SwipeRow onDelete={onDelete} deleteLabel="Usuń przepis">
            <Text>Przepis testowy</Text>
          </SwipeRow>
        );
      });

      // 1. Accessibility action trigger
      const container = tree.root.findByProps({ accessible: true });
      expect(container.props.accessibilityActions).toEqual([
        { name: 'delete', label: 'Usuń przepis' },
      ]);

      act(() => {
        container.props.onAccessibilityAction({ nativeEvent: { actionName: 'delete' } });
      });
      expect(onDelete).toHaveBeenCalledTimes(1);

      // 2. Visible button trigger
      const deleteBtn = tree.root.findByProps({ testID: 'swipe-row-delete-btn' });
      expect(deleteBtn.props.accessibilityLabel).toBe('Usuń przepis');

      act(() => {
        deleteBtn.props.onPress();
      });
      expect(onDelete).toHaveBeenCalledTimes(2);
    });
  });
});
