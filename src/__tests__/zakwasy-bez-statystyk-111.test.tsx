/**
 * Zakwasy bez bloku statystyk z biblioteki (design-spec §12a: karty liczb `CraftStatDisplay` usunięte, wersaliki
 * zakazane; §3 kolory tylko z tokenów) [M1-audytor-generalny-111; 04-studio-projektowe-025].
 * Wiek, hydratacja, proporcja i temperatura są gdzie indziej na ekranie: karta profilu, karta cyklu,
 * ilości do dokarmienia, aktywność zakwasu.
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

import fs from 'fs';
import path from 'path';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import ZakwasyScreen from '../../app/(tabs)/zakwasy/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, getStarters, saveStarter } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const ROOT = path.join(__dirname, '..', '..');

function pliki(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' || e.name === 'node_modules' ? [] : pliki(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

describe('111: Zakwasy bez bloku statystyk z @apps4craft/ui', () => {
  it('żaden plik w app/ i src/ nie importuje CraftCard ani CraftStatDisplay', () => {
    const zImportem = [...pliki(path.join(ROOT, 'app')), ...pliki(path.join(ROOT, 'src'))]
      .filter((p) => /import\s*\{[^}]*\b(CraftCard|CraftStatDisplay)\b[^}]*\}\s*from\s*'@apps4craft\/ui'/.test(fs.readFileSync(p, 'utf8')))
      .map((p) => path.relative(ROOT, p).replace(/\\/g, '/'));
    expect(zImportem).toEqual([]);
  });

  async function renderZakwasow(): Promise<renderer.ReactTestRenderer> {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <AppAccessProvider>
          <ZakwasyScreen />
        </AppAccessProvider>
      );
    });
    await flush();
    return tree;
  }
  const teksty = (tree: renderer.ReactTestRenderer) =>
    tree.root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');

  beforeEach(async () => {
    _resetMemStore();
    zUprawnieniem();
    await initDatabase();
  });

  it('render Zakwasów z zakwasem w lodówce: bez wersalików; wiek, hydratacja, proporcja i temperatura są na ekranie', async () => {
    const [zakwas] = await getStarters();
    expect(zakwas.storageState).toBe('FRIDGE');
    const tree = await renderZakwasow();
    const wersaliki = tree.root
      .findAllByType(Text)
      .filter((n) => StyleSheet.flatten(n.props.style)?.textTransform === 'uppercase')
      .map((n) => [n.props.children].flat().join(''));
    expect(wersaliki).toEqual([]);
    const txt = teksty(tree);
    expect(txt).toContain('Wiek zakwasu');
    expect(txt).toContain(`Hydratacja ${zakwas.hydration}%`);
    expect(txt).toContain('1:2:2');
    // W lodówce temperaturą zakwasu jest temperatura lodówki z karty profilu, nie temperatura kuchni
    expect(txt).toContain('W lodówce (4°C)');
    expect(tree.root.findAllByProps({ testID: 'zakwas-sacred-card' })).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('zakwas na blacie: temperatura otoczenia w karcie aktywności, bez bloku statystyk', async () => {
    const [zakwas] = await getStarters();
    await saveStarter({ ...zakwas, storageState: 'ROOM_TEMP' });
    const tree = await renderZakwasow();
    expect(teksty(tree)).toContain('Temperatura otoczenia');
    expect(tree.root.findAllByProps({ testID: 'zakwas-sacred-card' })).toHaveLength(0);
    act(() => tree.unmount());
  });
});
