/**
 * Blokada funkcji Pro bez zakupu: nic nie jest zasłonięte warstwą ani ukryte przed VoiceOver; wiersz z nazwą funkcji
 * i słowem „Pro” stoi nad treścią, nie na niej [M1-audytor-generalny-108; 04-studio-projektowe-026]. Test dla każdej
 * blokady funkcji Pro (kontrakt Basic/Pro, D-112, D-113, D-116; wcześniej blokady całych ekranów z D-038). Od M3 P-b
 * (D-117) treść funkcji Pro bez Pro jest pokazywana tylko jako podgląd obszaru z częścią Basic (plan od teraz); dane
 * użytkownika (dziennik, receptury, zakwasy) są w Basic i nie stoją za blokadą.
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
import DoktorZakwasuScreen from '../../app/(tabs)/zakwasy/doktor-zakwasu';
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

// Przepisane z kontraktu D-038 (blokady całych ekranów) na Basic/Pro [M3 P-a]: blokady funkcji Pro w Basic (plan
// wstecz, gotowość zakwasu, stały dzień, proporcje dokarmiania); Receptury, Doktor i Doktor zakwasu są w Basic bez blokady.
// Zmienione w M3 P-b (D-117, kontrakt „Reguły dostępu”: funkcja Pro widoczna z oznaczeniem „Pro”; przegląd P-a P2-4):
// zamiast kłódki wiersz z nazwą i „Pro”; treść funkcji Pro bez Pro nie jest pokazywana, bo zdradza wynik bez zakupu
// (gotowość, proporcje, stały dzień); podgląd do odczytu zostaje tam, gdzie obszar pokazuje też plan Basic (plan wstecz).
const EKRANY: [string, () => React.ReactElement, string, string, boolean][] = [
  ['Plan wypieku: „gotowe o…”', () => <HarmonogramScreen />, 'plan-wstecz', 'Plan wstecz od godziny „gotowe”', true],
  ['Zakwasy: gotowość i szczyt', () => <ZakwasyScreen />, 'gotowosc-zakwasu', 'Gotowość i szczyt zakwasu', false],
  ['Zakwasy: stały dzień karmienia', () => <ZakwasyScreen />, 'staly-dzien', 'Stały dzień karmienia', false],
  ['Zakwasy: proporcje dokarmiania', () => <ZakwasyScreen />, 'proporcje-zakwasu', 'Proporcje dokarmiania', false],
];

describe('108: Basic — ekrany Receptury, Doktor i Doktor zakwasu bez zablokowanej treści (D-112, D-113)', () => {
  beforeEach(async () => {
    _resetMemStore();
    bezUprawnienia();
    await initDatabase();
  });

  it.each([
    ['Receptury', () => <RecepturyScreen />],
    ['Doktor', () => <DoktorScreen />],
    ['Doktor zakwasu', () => <DoktorZakwasuScreen />],
  ])('%s: każda BlokadaFunkcji odblokowana', async (_n, el) => {
    const tree = await render(el());
    expect(tree.root.findAllByType(BlokadaFunkcji).filter((b) => b.props.odblokowane === false).map((b) => b.props.funkcja)).toEqual([]);
    act(() => tree.unmount());
  });
});

describe('108: blokada funkcji Pro bez uprawnienia — nazwa z „Pro”, bez warstwy na treści; podgląd tylko przy części Basic', () => {
  beforeEach(async () => {
    _resetMemStore();
    bezUprawnienia();
    await initDatabase();
  });

  it.each(EKRANY)('%s: wiersz z nazwą i „Pro” (VoiceOver „{funkcja}, Pro”) otwiera ekran Pro; treść tylko jako podgląd bez warstwy', async (_n, el, funkcja, nazwa, podglad) => {
    const tree = await render(el());
    const blokady = tree.root.findAllByType(BlokadaFunkcji).filter((b) => b.props.funkcja === funkcja);
    expect(blokady.length).toBeGreaterThan(0);
    for (const b of blokady) {
      expect(b.props.odblokowane).toBe(false);
      const wynik = sprawdzBlokade(b);
      expect({ ukryte: wynik.ukryte, warstwy: wynik.warstwy, martwe: wynik.martwe }).toEqual({ ukryte: [], warstwy: 0, martwe: 0 });
      // Wiersz: przycisk z widoczną nazwą funkcji i słowem „Pro”, poza treścią; bez kłódki
      const wiersz = b.findAll((n) => n.props.testID === `blokada-${funkcja}` && typeof n.props.onPress === 'function')[0];
      expect(wiersz.findAllByType(Text).map(tekst)).toEqual([t(nazwa), t('Pro')]);
      expect(wiersz.props.accessibilityLabel).toBe(t('{funkcja}, Pro', { funkcja: t(nazwa) }));
      expect(wiersz.props.accessibilityHint).toBe(t('wymaga Piekarz Pro'));
      await act(async () => {
        wiersz.props.onPress();
      });
      expect(paywall(tree.root)).toBe(true);
      await act(async () => {
        tree.root.findByType(PaywallModal).props.onClose();
      });
      expect(paywall(tree.root)).toBe(false);
      const tresc = b.findAll((n) => typeof n.type === 'string' && n.props.testID === `blokada-${funkcja}-tresc`);
      expect(tresc.length > 0).toBe(podglad);
      if (podglad) {
        expect(wynik.teksty).toBeGreaterThan(2);
        await dotknijTresci(b);
        expect(paywall(tree.root)).toBe(true);
        await act(async () => {
          tree.root.findByType(PaywallModal).props.onClose();
        });
      } else {
        expect(wynik.teksty).toBe(2);
      }
    }
    act(() => tree.unmount());
  });

  // Dziennik w Basic; tylko karta statystyk (porównanie, BR-RECP-004) za blokadą Pro [M3 P-a]
  it('Dziennik: historia działa bez uprawnienia (Basic) — wpisy czytelne, kłódka tylko na statystykach', async () => {
    await saveBakeLog({ id: 'bake_108', recipeName: 'Chleb z historii', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    const tree = await render(<DziennikScreen />);
    const [b] = tree.root.findAllByType(BlokadaFunkcji).filter((x) => x.props.funkcja === 'historia');
    expect(b.props.odblokowane).toBe(true);
    const wynik = sprawdzBlokade(b);
    expect({ ukryte: wynik.ukryte, warstwy: wynik.warstwy, martwe: wynik.martwe }).toEqual({ ukryte: [], warstwy: 0, martwe: 0 });
    expect(b.findAllByType(Text).map(tekst).join(' | ')).toContain('Chleb z historii');
    const zamki = b.findAll((n) => typeof n.type === 'string' && typeof n.props.testID === 'string' && /^blokada-(?!.*-tresc$)/.test(n.props.testID));
    expect(zamki.map((n) => n.props.testID)).toEqual(['blokada-porownanie']);
    const [staty] = tree.root.findAllByType(BlokadaFunkcji).filter((x) => x.props.funkcja === 'porownanie');
    expect(staty.props.odblokowane).toBe(false);
    act(() => tree.unmount());
  });
});
