/**
 * Blokada funkcji bez okresu próbnego i zakupu: dane użytkownika czytelne (także dla VoiceOver) i niezasłonięte,
 * zablokowane tylko akcje — dotknięcie akcji w treści otwiera ekran zakupu, a wiersz z kłódką i „wymaga Piekarz Pro”
 * stoi nad treścią, nie na niej (D-039, DEC-01 d; design-spec §6 `tylko-historia`)
 * [M1-audytor-generalny-108; 04-studio-projektowe-026]. Test dla każdego ekranu z blokadą.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
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
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
// Po 106 treść receptury (z blokadą 'kalkulator') jest na ekranie receptura.tsx; index to lista receptur [M1-audytor-generalny-106]
import RecepturyScreen from '../../app/(tabs)/receptury/receptura';
import ZakwasyScreen from '../../app/(tabs)/zakwasy/index';
import DoktorScreen from '../../app/doktor';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { BlokadaFunkcji } from '../components/BlokadaFunkcji';
import { PaywallModal } from '../components/PaywallModal';
import { initDatabase, _resetMemStore, saveBakeLog } from '../data/sqlite-store';
import { t } from '../lib/i18n';
import { bezUprawnienia } from '../../tests/helpers/platnosci';

type Wezel = renderer.ReactTestInstance;

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree;
}

const paywall = (root: Wezel) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
const tekst = (n: Wezel) => [n.props.children].flat().join('');

/** Węzły od `n` w górę do `granica` (bez niej). */
function przodkowie(n: Wezel, granica: Wezel): Wezel[] {
  const out: Wezel[] = [];
  for (let p: Wezel | null = n.parent; p && p !== granica; p = p.parent) out.push(p);
  return out;
}

/** Teksty w blokadzie ukryte przed VoiceOver albo przykryte warstwą absolutną. */
function sprawdzBlokade(b: Wezel) {
  const teksty = b.findAllByType(Text);
  const ukryte = teksty
    .filter((n) => przodkowie(n, b).some((p) => p.props.accessibilityElementsHidden === true || p.props.importantForAccessibility === 'no-hide-descendants'))
    .map(tekst);
  const warstwy = b.findAll(
    (n) => typeof n.type === 'string' && StyleSheet.flatten(n.props.style)?.position === 'absolute' && typeof n.props.onPress === 'function'
  ).length;
  const martwe = b.findAll((n) => typeof n.type === 'string' && n.props.pointerEvents === 'none').length;
  return { teksty: teksty.length, ukryte, warstwy, martwe };
}

/** Dotknięcie w treści blokady: system odpowiedzi RN (start → puszczenie) na obszarze treści. */
async function dotknijTresci(b: Wezel) {
  const obszar = b.findAll(
    (n) => typeof n.type === 'string' && n.props.pointerEvents === 'box-only' && typeof n.props.onResponderRelease === 'function'
  )[0];
  expect(obszar).toBeDefined();
  expect(obszar.props.onStartShouldSetResponder()).toBe(true);
  await act(async () => {
    obszar.props.onResponderRelease();
  });
}

const EKRANY: [string, () => React.ReactElement, string][] = [
  ['Plan wypieku', () => <HarmonogramScreen />, 'harmonogram'],
  ['Receptury', () => <RecepturyScreen />, 'kalkulator'],
  ['Zakwasy', () => <ZakwasyScreen />, 'zakwas'],
  ['Doktor', () => <DoktorScreen />, 'doktor'],
];

describe('108: blokada bez uprawnienia — treść czytelna, zablokowane tylko akcje', () => {
  beforeEach(async () => {
    _resetMemStore();
    bezUprawnienia();
    await initDatabase();
  });

  it.each(EKRANY)('%s: treść w drzewie dostępności, bez warstwy na treści; wiersz z kłódką i dotknięcie akcji otwierają ofertę', async (_n, el, funkcja) => {
    const tree = await render(el());
    const blokady = tree.root.findAllByType(BlokadaFunkcji).filter((b) => b.props.funkcja === funkcja);
    expect(blokady.length).toBeGreaterThan(0);
    for (const b of blokady) {
      expect(b.props.odblokowane).toBe(false);
      const wynik = sprawdzBlokade(b);
      expect(wynik.teksty).toBeGreaterThan(1);
      expect({ ukryte: wynik.ukryte, warstwy: wynik.warstwy, martwe: wynik.martwe }).toEqual({ ukryte: [], warstwy: 0, martwe: 0 });
      // Wiersz z kłódką: przycisk z widocznym tekstem „wymaga Piekarz Pro”, poza treścią
      const wiersz = b.findAll((n) => n.props.testID === `blokada-${funkcja}` && typeof n.props.onPress === 'function')[0];
      expect(wiersz.findAllByType(Text).map(tekst)).toContain(t('wymaga Piekarz Pro'));
      await act(async () => {
        wiersz.props.onPress();
      });
      expect(paywall(tree.root)).toBe(true);
      await act(async () => {
        tree.root.findByType(PaywallModal).props.onClose();
      });
      expect(paywall(tree.root)).toBe(false);
      await dotknijTresci(b);
      expect(paywall(tree.root)).toBe(true);
      await act(async () => {
        tree.root.findByType(PaywallModal).props.onClose();
      });
    }
    act(() => tree.unmount());
  });

  it('Dziennik: historia działa bez uprawnienia (BEZ_UPRAWNIENIA) — wpisy czytelne, bez kłódki i bez przechwytywania dotyku', async () => {
    await saveBakeLog({ id: 'bake_108', recipeName: 'Chleb z historii', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    const tree = await render(<DziennikScreen />);
    const [b] = tree.root.findAllByType(BlokadaFunkcji);
    expect(b.props.odblokowane).toBe(true);
    const wynik = sprawdzBlokade(b);
    expect({ ukryte: wynik.ukryte, warstwy: wynik.warstwy, martwe: wynik.martwe }).toEqual({ ukryte: [], warstwy: 0, martwe: 0 });
    expect(b.findAllByType(Text).map(tekst).join(' | ')).toContain('Chleb z historii');
    expect(b.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.startsWith('blokada-'))).toEqual([]);
    expect(b.findAll((n) => typeof n.type === 'string' && typeof n.props.onResponderRelease === 'function' && n.props.pointerEvents === 'box-only')).toEqual([]);
    act(() => tree.unmount());
  });
});
