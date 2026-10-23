/**
 * Tanie P2 z weryfikacji W przebiegu M3 (raport roli 04 z 2026-10-22), bez decyzji wyglądu ani zakresu:
 * - 04-studio-projektowe-014: tytuł pasa nocy (krój Sofia) reaguje na „Pogrubiony tekst” jak tytuł kroku (158);
 * - 04-studio-projektowe-017: `primaryColor` w app.json z tokenów (akcent kierunku A), nie bursztyn sprzed D-049.
 */
jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));

import React from 'react';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AccessibilityInfo, StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { PasZakladki } from '../components/nawigacja/PasZakladki';
import { kolory } from '../ui/tokeny';

async function wagaTytulu(pogrubiony: boolean) {
  jest.spyOn(AccessibilityInfo, 'isBoldTextEnabled').mockResolvedValue(pogrubiony);
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<PasZakladki gora={20} tytul="Receptury" />);
  });
  const tytul = tree.root.findAll((n) => n.type === Text && n.props.accessibilityRole === 'header')[0]!;
  const waga = StyleSheet.flatten(tytul.props.style).fontWeight;
  act(() => tree.unmount());
  return waga;
}

describe('04-studio-projektowe-014: tytuł pasa a „Pogrubiony tekst”', () => {
  afterEach(() => jest.restoreAllMocks());
  it('wyłączony: 700; włączony: 900 (wagaTytulu, jak tytuł kroku)', async () => {
    expect(await wagaTytulu(false)).toBe('700');
    expect(await wagaTytulu(true)).toBe('900');
  });
});

describe('04-studio-projektowe-017: kolor aplikacji w app.json z tokenów', () => {
  it('primaryColor = akcent motywu jasnego (kierunek A, D-049)', () => {
    const app = JSON.parse(readFileSync(join(__dirname, '..', '..', 'app.json'), 'utf8'));
    expect(app.expo.primaryColor).toBe(kolory.jasny.akcent);
  });
});
