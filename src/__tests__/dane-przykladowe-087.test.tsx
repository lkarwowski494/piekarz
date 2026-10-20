/**
 * Pierwsze uruchomienie bez danych zmyślonych (design-spec §6 Start `pierwsze-uruchomienie`, §11 „087”: start bez
 * danych; przykłady oznaczone ramką „przykład”) [M1-audytor-generalny-087; 04-studio-projektowe-014].
 * Przy pustej bazie (jak na telefonie po instalacji: SQLite bez zakwasów, wpisów i receptur własnych) żadna
 * zakładka nie pokazuje nazw ani liczb jako danych użytkownika; dane przykładowe tylko ze znacznikiem „przykład”.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import RecepturyScreen from '../../app/(tabs)/receptury/index';
import ZakwasyScreen from '../../app/(tabs)/zakwasy/index';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { CorruptStateRecoveryBanner } from '../components/CorruptStateRecoveryBanner';
import { ZakwasSacredCard } from '../components/zakwas/ZakwasSacredCard';
import { StarterProfileCard } from '../components/zakwas/StarterProfileCard';
import { StarterPeakActivityCard } from '../components/zakwas/StarterPeakActivityCard';
import { BakeStatsCard } from '../components/stolnica/BakeStatsCard';
import { initDatabase, _resetMemStore, deleteStarter, getStarters } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { _resetStanu } from '../lib/platnosci/stan';

const mockIap = (Iap as unknown as { __mock: { reset: () => void } }).__mock;

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

/** Teksty ekranu poza banerem stanu uszkodzonego (ochrona danych, nie dane użytkownika). */
function teksty(root: renderer.ReactTestInstance): string {
  const baner = new Set(root.findAllByType(CorruptStateRecoveryBanner).flatMap((b) => b.findAllByType(Text)));
  return root
    .findAllByType(Text)
    .filter((n) => !baner.has(n))
    .map((n) => [n.props.children].flat().join(''))
    .join(' | ');
}

async function render(Ekran: React.ComponentType) {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <AppAccessProvider>
        <Ekran />
      </AppAccessProvider>
    );
  });
  await flush();
  return tree;
}

describe('087: pusta baza — bez danych zmyślonych jako dane użytkownika', () => {
  beforeEach(async () => {
    _resetMemStore();
    mockIap.reset();
    _resetStanu();
    await initDatabase();
    await saveBakeSession(null);
    // Pamięć testów zakłada zakwas startowy; baza SQLite na telefonie go nie ma (sqlite-schema.ts: seed tylko w pamięci)
    for (const s of await getStarters()) await deleteStarter(s.id);
  });

  it('Dziś: wybór czynności bez liczb i nazw', async () => {
    const tree = await render(StartScreen);
    const txt = teksty(tree.root);
    expect(txt).toContain('Zakładam zakwas');
    expect(txt).not.toMatch(/\d/);
    act(() => tree.unmount());
  });

  it('Zakwasy: bez zakwasu nie ma profilu, wieku ani ostatniego dokarmienia — tylko dodanie zakwasu', async () => {
    const tree = await render(ZakwasyScreen);
    const txt = teksty(tree.root);
    expect(txt).not.toContain('Bolesław');
    expect(txt).toContain('Nie masz jeszcze zakwasu. Dodaj zakwas, który masz, albo załóż nowy.');
    expect(tree.root.findAllByType(ZakwasSacredCard)).toHaveLength(0);
    expect(tree.root.findAllByType(StarterProfileCard)).toHaveLength(0);
    expect(tree.root.findAllByType(StarterPeakActivityCard)).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: 'add-starter-btn' }).length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('Dziennik: bez wpisów nie ma statystyk z zer, jest stan pusty', async () => {
    const tree = await render(DziennikScreen);
    expect(tree.root.findAllByType(BakeStatsCard)).toHaveLength(0);
    expect(teksty(tree.root)).toContain('Brak wcześniejszych wypieków');
    act(() => tree.unmount());
  });

  it('Receptury: tylko receptury bazowe pod własnym nagłówkiem, bez sekcji „Moje przepisy”', async () => {
    const tree = await render(RecepturyScreen);
    const txt = teksty(tree.root);
    // Nazwy grup według §11c 106: „Receptury bazowe” i „Moje receptury” [M1-audytor-generalny-106]
    expect(txt).toContain('Receptury bazowe');
    expect(txt).not.toContain('Moje receptury');
    act(() => tree.unmount());
  });
});
