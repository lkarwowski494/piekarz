/**
 * Jeden strażnik na każdym ekranie [M1-audytor-generalny-027; 02-monetyzacja-010, 02-monetyzacja-011, 02-monetyzacja-012,
 * 01-odkrywanie-009]. Decyzja właściciela 2026-10-19: bez subskrypcji, oferty wprowadzającej ani zakupu dożywotniego
 * działa tylko przegląd historii oraz odczyt, eksport i usunięcie własnych danych (lista: BEZ_UPRAWNIENIA);
 * każda inna funkcja otwiera ekran zakupu. Z uprawnieniem (także w czasie 14-dniowej oferty wprowadzającej) — wszystko.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('../lib/pdf-sheet-generator', () => ({
  exportStarterLabelAsPdf: jest.fn().mockResolvedValue('file:///mock/label.pdf'),
  printStarterLabelDirectly: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../lib/confirm', () => ({
  ...jest.requireActual('../lib/confirm'),
  confirmDeleteRecipe: (_n: string, ok: () => void) => ok(),
  confirmDeleteStarter: (_n: string, ok: () => void) => ok(),
  confirmResetStarter: (ok: () => void) => ok(),
  confirmDeleteBakeLog: (ok: () => void) => ok(),
  confirmDiscardBake: (ok: () => void) => ok(),
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import CalculatorScreen from '../../app/(tabs)/index';
import ZakwasScreen from '../../app/(tabs)/zakwas';
import StolnicaScreen from '../../app/(tabs)/stolnica';
import HarmonogramScreen from '../../app/(tabs)/harmonogram';
import DoctorScreen from '../../app/(tabs)/doktor';
import { PaywallModal } from '../components/PaywallModal';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { BlokadaFunkcji } from '../components/BlokadaFunkcji';
import { initDatabase, _resetMemStore, saveBakeLog, getBakeLogs } from '../data/sqlite-store';
import { BEZ_UPRAWNIENIA, Funkcja } from '../lib/platnosci/konfiguracja';
import { dozwolona } from '../lib/platnosci/dostep';
import { t } from '../lib/i18n';
import { zUprawnieniem, bezUprawnienia } from '../../tests/helpers/platnosci';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
const paywallShown = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
const locks = (root: renderer.ReactTestInstance) =>
  root.findAll((n) => typeof n.props?.testID === 'string' && n.props.testID.startsWith('blokada-') && typeof n.props.onPress === 'function');

// Ekran zakupu jest jeden dla aplikacji i renderuje go AppAccessProvider z app/_layout.tsx [M1-audytor-generalny-025].
async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree!;
}

async function press(tree: renderer.ReactTestRenderer, testID: string): Promise<void> {
  // Ostatni element z testID: przycisk poza zablokowanym obszarem (np. „start-bake-btn” jest też w karcie kalkulatora).
  const all = tree.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
  await act(async () => {
    all[all.length - 1].props.onPress();
  });
  await flush();
}

describe('The list of functions available without an entitlement is one configuration (027)', () => {
  it('today: only history and own data; everything else needs the App Store entitlement', () => {
    expect([...BEZ_UPRAWNIENIA]).toEqual(['historia', 'dane']);
    const platne: Funkcja[] = ['kalkulator', 'zakwas', 'stolnica', 'harmonogram', 'doktor', 'spizarnia', 'receptury', 'import', 'udostepnianie'];
    for (const f of platne) expect({ f, bez: dozwolona(f, false), z: dozwolona(f, true) }).toEqual({ f, bez: false, z: true });
    expect(dozwolona('historia', false)).toBe(true);
    expect(dozwolona('dane', false)).toBe(true);
    expect(dozwolona('kalkulator', false, ['kalkulator'])).toBe(true);
  });
});

describe('Without an entitlement every screen opens the purchase screen except history and own data (027)', () => {
  beforeEach(async () => {
    _resetMemStore();
    bezUprawnienia();
    await initDatabase();
  });

  it('Kalkulator: calculator, save, import, QR and pantry open the purchase screen; export and copy stay free', async () => {
    const tree = await render(<CalculatorScreen />);
    expect(locks(tree.root).map((n) => n.props.testID)).toContain('blokada-kalkulator');
    expect(locks(tree.root)[0].props.accessibilityLabel).toBe(t('Odblokuj pełny dostęp'));
    await act(async () => {
      locks(tree.root).find((n) => n.props.testID === 'blokada-kalkulator')!.props.onPress();
    });
    expect(paywallShown(tree.root)).toBe(true);
    for (const id of ['save-custom-recipe-btn', 'open-import-recipe-btn', 'open-scan-qr-btn', 'share-recipe-qr-btn', 'open-flour-inventory-btn', 'import-recipe-json-btn', 'open-volume-converter-btn', 'start-bake-btn']) {
      await act(async () => {
        tree.root.findByType(PaywallModal).props.onClose();
      });
      await press(tree, id);
      expect({ id, paywall: paywallShown(tree.root) }).toEqual({ id, paywall: true });
    }
    await act(async () => {
      tree.root.findByType(PaywallModal).props.onClose();
    });
    await press(tree, 'copy-recipe-btn');
    expect(paywallShown(tree.root)).toBe(false);
    act(() => tree.unmount());
  });

  it('Zakwas: feeding, calculator, safety check and adding a starter open the purchase screen; label PDF stays free', async () => {
    const tree = await render(<ZakwasScreen />);
    expect(locks(tree.root).map((n) => n.props.testID)).toContain('blokada-zakwas');
    await press(tree, 'blokada-zakwas');
    expect(paywallShown(tree.root)).toBe(true);
    await act(async () => {
      tree.root.findByType(PaywallModal).props.onClose();
    });
    await press(tree, 'add-starter-btn');
    expect(paywallShown(tree.root)).toBe(true);
    await act(async () => {
      tree.root.findByType(PaywallModal).props.onClose();
    });
    await press(tree, 'print-starter-label-btn');
    expect(paywallShown(tree.root)).toBe(false);
    act(() => tree.unmount());
  });

  it('Stolnica: starting a bake opens the purchase screen; history is readable and deletable', async () => {
    await saveBakeLog({ id: 'bake_h1', recipeName: 'Chleb z historii', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    const tree = await render(<StolnicaScreen />);
    expect(locks(tree.root).map((n) => n.props.testID)).toEqual(['blokada-stolnica']);
    expect(tree.root.findAllByProps({ testID: 'bake-log-card-bake_h1' }).length).toBeGreaterThan(0);
    await press(tree, 'blokada-stolnica');
    expect(paywallShown(tree.root)).toBe(true);
    await act(async () => {
      tree.root.findByType(PaywallModal).props.onClose();
    });
    await press(tree, 'delete-bake-log-bake_h1');
    expect(paywallShown(tree.root)).toBe(false);
    expect((await getBakeLogs()).some((b) => b.id === 'bake_h1')).toBe(false);
    act(() => tree.unmount());
  });

  it('Harmonogram: the whole planner opens the purchase screen', async () => {
    const tree = await render(<HarmonogramScreen />);
    await press(tree, 'blokada-harmonogram');
    expect(paywallShown(tree.root)).toBe(true);
    act(() => tree.unmount());
  });

  it('Doktor: diagnosis and the academy open the purchase screen', async () => {
    const tree = await render(<DoctorScreen />);
    await press(tree, 'blokada-doktor');
    expect(paywallShown(tree.root)).toBe(true);
    await act(async () => {
      tree.root.findByType(PaywallModal).props.onClose();
    });
    await press(tree, 'open-academy-btn');
    expect(paywallShown(tree.root)).toBe(true);
    act(() => tree.unmount());
  });
});

describe('With an entitlement (introductory offer, subscription or lifetime) nothing is locked (027)', () => {
  beforeEach(async () => {
    _resetMemStore();
    zUprawnieniem();
    await initDatabase();
  });

  it.each([
    ['Kalkulator', <CalculatorScreen key="k" />],
    ['Zakwas', <ZakwasScreen key="z" />],
    ['Stolnica', <StolnicaScreen key="s" />],
    ['Harmonogram', <HarmonogramScreen key="h" />],
    ['Doktor', <DoctorScreen key="d" />],
  ])('%s has no lock', async (_name, el) => {
    const tree = await render(el);
    expect(locks(tree.root)).toEqual([]);
    expect(paywallShown(tree.root)).toBe(false);
    act(() => tree.unmount());
  });

  it('BlokadaFunkcji renders the children as they are when unlocked', async () => {
    const tree = await render(
      <BlokadaFunkcji funkcja="kalkulator" odblokowane={true} onZablokowane={() => undefined}>
        <PaywallModal visible={false} onClose={() => undefined} onSubscribe={() => undefined} />
      </BlokadaFunkcji>
    );
    expect(locks(tree.root)).toEqual([]);
    act(() => tree.unmount());
  });
});
