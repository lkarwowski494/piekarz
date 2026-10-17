// ============================================================================
// Piekarz (Crust) — Two-Way Deletion Guard (S4, NFR-INT-004)
// Pilnuje dostępności usuwania: gest przesunięcia + widoczny przycisk/akcja dla VoiceOver.
// ============================================================================

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { SwipeRow } from '../src/components/ui';

describe('Guard S4 & NFR-INT-004: Two-Way Deletion (SwipeRow & VoiceOver Action)', () => {
  it('allows deletion via accessibilityActions for VoiceOver users without swiping', () => {
    const onDelete = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <SwipeRow onDelete={onDelete} deleteLabel="Usuń wpis z dziennika">
          <Text>Chleb wiejski 2026-10-15</Text>
        </SwipeRow>
      );
    });

    const swipeRowNode = tree.root.findByProps({ accessible: true });
    expect(swipeRowNode.props.accessibilityActions).toEqual([
      { name: 'delete', label: 'Usuń wpis z dziennika' },
    ]);

    act(() => {
      swipeRowNode.props.onAccessibilityAction({
        nativeEvent: { actionName: 'delete' },
      });
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('provides a visible tap button as fallback for users not using gestures', () => {
    const onDelete = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <SwipeRow onDelete={onDelete} deleteLabel="Usuń przepis">
          <Text>Bagietka tradycyjna</Text>
        </SwipeRow>
      );
    });

    const deleteBtn = tree.root.findByProps({ testID: 'swipe-row-delete-btn' });
    expect(deleteBtn).toBeTruthy();
    expect(deleteBtn.props.accessibilityRole).toBe('button');
    expect(deleteBtn.props.accessibilityLabel).toBe('Usuń przepis');

    act(() => {
      deleteBtn.props.onPress();
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
