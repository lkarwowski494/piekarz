/**
 * M3 p6b (D-209, D-198, README §6, makieta karty/inne.html #ustawienia): jedna karta „Język i jednostki” z ikoną
 * języka zamiast dwóch kart „Język” i „Jednostki”; wybór języka (siatka `lang-*`) i jednostek bez zmian zachowania.
 */
const mockOkno = { width: 320, height: 568, scale: 2, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { SettingsModal } from '../components/SettingsModal';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { theme } from '../ui/theme';
import { promienie, typografia } from '../ui/tokeny';
import { setLang } from '../lib/i18n';

jest.setTimeout(30000);

type Wezel = renderer.ReactTestInstance;
const ROZMIAR_TYTULU_KARTY = typografia.style.tytul2.pt - 2;

async function ustawienia(): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<SettingsModal visible onClose={() => undefined} />);
  });
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
  return tree;
}

const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
const poId = (root: Wezel, id: string): Wezel[] => root.findAll((n) => n.props?.testID === id && typeof n.type === 'string');
const jeden = (root: Wezel, id: string): Wezel => {
  const w = poId(root, id);
  expect(w.length).toBeGreaterThan(0);
  return w[0];
};
const styl = (n: Wezel) => StyleSheet.flatten(n.props.style) ?? {};
const jestNaglowkiemKarty = (n: Wezel) => {
  const s = styl(n);
  return n.props.accessibilityRole === 'header' && s.fontSize === ROZMIAR_TYTULU_KARTY && s.fontFamily === theme.typography.krojTytulow;
};
const jestKarta = (p: Wezel) => {
  const s = styl(p);
  return typeof p.type === 'string' && s.borderRadius === promienie.karta && s.backgroundColor === theme.colors.powierzchnia;
};
const karta = (n: Wezel): Wezel | null => {
  for (let p: Wezel | null = n.parent; p; p = p.parent) if (jestKarta(p)) return p;
  return null;
};
const maIkone = (k: Wezel) => k.findAll((n) => typeof n.props?.testID === 'string' && /^ikona-karty-/.test(n.props.testID)).length > 0;
const kartaZ = (root: Wezel, tytul: string): Wezel => {
  const n = root.findAllByType(Text).filter(jestNaglowkiemKarty).find((x) => tekst(x) === tytul);
  if (!n) throw new Error(`brak nagłówka karty „${tytul}”`);
  const k = karta(n);
  if (!k) throw new Error(`nagłówek „${tytul}” poza kartą`);
  return k;
};

describe('M3 p6b: Ustawienia — jedna karta „Język i jednostki” (D-209)', () => {
  beforeEach(async () => {
    setLang('pl');
    Object.assign(mockOkno, { fontScale: 1 });
    _resetMemStore();
    await initDatabase();
  });

  it('wybór języka, jednostek i zdanie o jednostkach w jednej karcie z ikoną języka; brak kart „Język” i „Jednostki”', async () => {
    const tree = await ustawienia();
    const naglowki = tree.root.findAllByType(Text).filter(jestNaglowkiemKarty).map(tekst);
    expect(naglowki.filter((n) => ['Język', 'Jednostki', 'Język i jednostki'].includes(n))).toEqual(['Język i jednostki']);
    const k = kartaZ(tree.root, 'Język i jednostki');
    for (const id of ['lang-pl', 'lang-en', 'unit-metric', 'unit-imperial']) expect([id, poId(k, id).length]).toEqual([id, 1]);
    expect(tekst(k)).toContain('Domyślnie według regionu telefonu.');
    expect(poId(k, 'ikona-karty-jezyk').length).toBeGreaterThan(0);
    expect(karta(jeden(tree.root, 'lang-pl'))).toBe(karta(jeden(tree.root, 'unit-metric')));
    act(() => tree.unmount());
  });
});
