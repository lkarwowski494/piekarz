/**
 * M3 p7 (D-214, znalezisko 04-studio-projektowe-002; README §1 „treść wyłącznie w kartach”, §3 arkusze: „Anuluj” /
 * „Zamknij” z lewej, „Gotowe” / „Zapisz” z prawej; makieta karty.css `.ark-nav`): arkusze zamykające przepływy —
 * ocena po wypieku, zapis receptury, dodanie i edycja zakwasu, konwerter zakwasu, przepisy z odrzutu — mają pasek
 * arkusza u góry i treść w kartach; typografia z tokenów (żadnego `fontSize: <liczba>`). Zachowanie bez zmian:
 * przyciski paska wołają te same funkcje co dawne przyciski na dole treści (testy zachowania arkuszy bez zmian).
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, edges: _e, ...p }: { children?: React.ReactNode; edges?: unknown }) => React.createElement('View', p, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import fs from 'fs';
import path from 'path';
import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { FinishBakeModal } from '../components/stolnica/FinishBakeModal';
import { SaveRecipeModal } from '../components/calculator/SaveRecipeModal';
import { AddStarterModal } from '../components/zakwas/AddStarterModal';
import { EditStarterModal } from '../components/zakwas/EditStarterModal';
import { StarterConverterModal } from '../components/StarterConverterModal';
import { DiscardRecipesModal } from '../components/DiscardRecipesModal';
import { DEFAULT_BREAD_SENSORY_PROFILE } from '../components/SensoryRadarChart';
import { theme } from '../ui/theme';
import { promienie } from '../ui/tokeny';
import { setLang } from '../lib/i18n';

type Wezel = renderer.ReactTestInstance;
const ROOT = path.join(__dirname, '..', '..');
const PLIKI = [
  'src/components/stolnica/FinishBakeModal.tsx',
  'src/components/calculator/SaveRecipeModal.tsx',
  'src/components/zakwas/AddStarterModal.tsx',
  'src/components/zakwas/EditStarterModal.tsx',
  'src/components/StarterConverterModal.tsx',
  'src/components/DiscardRecipesModal.tsx',
];

const tekst = (n: Wezel | string): string => (typeof n === 'string' ? n : n.children.map(tekst).join(''));
const host = (root: Wezel, id: string): Wezel[] => root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const styl = (n: Wezel) => StyleSheet.flatten(n.props.style) ?? {};
const wPrzodku = (n: Wezel, warunek: (p: Wezel) => boolean): boolean => {
  for (let p: Wezel | null = n.parent; p; p = p.parent) if (warunek(p)) return true;
  return false;
};
const jestKarta = (p: Wezel) => typeof p.type === 'string' && styl(p).borderRadius === promienie.karta && styl(p).backgroundColor === theme.colors.powierzchnia;
const jestPaskiem = (p: Wezel) => p.props?.testID === 'pasek-arkusza';
const przyciskZTekstem = (root: Wezel, napis: string): Wezel[] =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function' && tekst(n) === napis);

interface Przypadek {
  nazwa: string;
  zamontuj: (onClose: jest.Mock, onSave: jest.Mock) => React.ReactElement;
  lewy: string;
  prawy?: string;
}

const PRZYPADKI: Przypadek[] = [
  {
    nazwa: 'ocena po wypieku (FinishBakeModal)',
    lewy: 'Anuluj',
    prawy: 'Zapisz',
    zamontuj: (onClose, onSave) => (
      <FinishBakeModal visible onClose={onClose} onSave={onSave} rating={4} onRatingChange={jest.fn()} notes="" onNotesChange={jest.fn()}
        crumbScore={3} onCrumbScoreChange={jest.fn()} crustScore={3} onCrustScoreChange={jest.fn()} tasteProfile="balanced"
        onTasteProfileChange={jest.fn()} sensoryProfile={DEFAULT_BREAD_SENSORY_PROFILE} onSensoryProfileChange={jest.fn()} />
    ),
  },
  {
    nazwa: 'zapis receptury (SaveRecipeModal)',
    lewy: 'Anuluj',
    prawy: 'Zapisz',
    zamontuj: (onClose, onSave) => <SaveRecipeModal visible recipeName="Wiejski" onRecipeNameChange={jest.fn()} onClose={onClose} onSave={onSave} />,
  },
  {
    nazwa: 'dodanie zakwasu (AddStarterModal)',
    lewy: 'Anuluj',
    prawy: 'Zapisz',
    zamontuj: (onClose, onSave) => (
      <AddStarterModal visible name="" onNameChange={jest.fn()} flour="" onFlourChange={jest.fn()} storage="ROOM_TEMP" onStorageChange={jest.fn()} onClose={onClose} onSave={onSave} />
    ),
  },
  {
    nazwa: 'edycja zakwasu (EditStarterModal)',
    lewy: 'Anuluj',
    prawy: 'Zapisz',
    zamontuj: (onClose, onSave) => (
      <EditStarterModal visible name="Zakwas" onNameChange={jest.fn()} flourType="Żytnia" onFlourTypeChange={jest.fn()} storageState="FRIDGE"
        onStorageStateChange={jest.fn()} canDelete onDelete={jest.fn()} onZalozOdNowa={jest.fn()} onClose={onClose} onSave={onSave} />
    ),
  },
  {
    nazwa: 'konwerter zakwasu (StarterConverterModal)',
    lewy: 'Zamknij',
    zamontuj: (onClose) => <StarterConverterModal visible onClose={onClose} currentStarterHydration={100} currentStarterName="Zakwas" />,
  },
  {
    nazwa: 'przepisy z odrzutu (DiscardRecipesModal)',
    lewy: 'Zamknij',
    zamontuj: (onClose) => <DiscardRecipesModal visible onClose={onClose} />,
  },
];

describe('M3 p7 (04-002): arkusze przepływów na kartach i pasku arkusza', () => {
  beforeEach(() => setLang('pl'));

  it('typografia z tokenów: w 6 arkuszach żadnego `fontSize: <liczba>`', () => {
    const trafienia = PLIKI.flatMap((p) =>
      fs.readFileSync(path.join(ROOT, p), 'utf8').split('\n').map((l, i) => (/fontSize: [0-9]/.test(l) ? `${p}:${i + 1}` : null)).filter(Boolean),
    );
    expect(trafienia).toEqual([]);
  });

  it.each(PRZYPADKI)('$nazwa: pasek arkusza (lewy, prawy) i treść w kartach', (p) => {
    const onClose = jest.fn();
    const onSave = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(p.zamontuj(onClose, onSave));
    });
    const paski = host(tree.root, 'pasek-arkusza');
    expect(paski).toHaveLength(1);
    const pasek = paski[0];
    const lewy = przyciskZTekstem(pasek, p.lewy);
    expect(lewy).toHaveLength(1);
    act(() => lewy[0].props.onPress());
    expect(onClose).toHaveBeenCalledTimes(1);
    if (p.prawy) {
      const prawy = przyciskZTekstem(pasek, p.prawy);
      expect(prawy).toHaveLength(1);
      act(() => prawy[0].props.onPress());
      expect(onSave).toHaveBeenCalledTimes(1);
      // Kolejność w pasku: lewy przed prawym (README §3)
      const wszystkie = pasek.findAll(() => true);
      expect(wszystkie.indexOf(lewy[0])).toBeLessThan(wszystkie.indexOf(prawy[0]));
    }
    // Tych przycisków nie ma drugi raz na dole treści
    expect(przyciskZTekstem(tree.root, p.lewy)).toHaveLength(1);
    // Treść wyłącznie w kartach: każdy tekst i pole poza paskiem leży w karcie (README §1)
    const poza = [...tree.root.findAllByType(Text), ...tree.root.findAllByType(TextInput)]
      .filter((n) => !wPrzodku(n, jestPaskiem))
      .filter((n) => !wPrzodku(n, jestKarta))
      .map((n) => (n.type === TextInput ? `[pole ${n.props.accessibilityLabel}]` : tekst(n)));
    expect(poza).toEqual([]);
    expect(tree.root.findAll(jestKarta).length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
});
