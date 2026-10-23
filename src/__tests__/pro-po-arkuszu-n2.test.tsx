/**
 * N2 (weryfikacja poprawek W, M3 W-fix3; ta sama klasa co 04-studio-projektowe-005, D-117): ekran Pro nad otwartym
 * arkuszem zostawał w dwóch miejscach — „Rodzaj” zaczynu w arkuszu „Składniki” i import receptury z pliku ponad limitem
 * Basic (nad Ustawieniami i arkuszem importu), plus ten sam wzorzec w ImportRecipeModal (QR). Teraz jak w D-117: najpierw
 * zamknięcie arkusza (arkuszy), ekran Pro dopiero po zniknięciu ostatniego (onDismiss, iOS).
 * Po zakupie: wybrany zaczyn ustawia się sam (tylko stan ekranu, nic się nie zapisuje); import NIE zapisuje się sam
 * (arkusz z podglądem już zniknął, więc zapis byłby bez widocznego potwierdzenia) — plik importuje się ponownie.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
  };
});
jest.mock('expo-router', () => {
  const React = require('react');
  const nawigacja = { push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() };
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    get router() {
      return nawigacja;
    },
    useRouter: () => nawigacja,
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React, { useState } from 'react';
import { ActionSheetIOS, Alert, Modal, Platform } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import RecepturaScreen from '../../app/(tabs)/receptury/receptura';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { PaywallModal } from '../components/PaywallModal';
import { SettingsModal } from '../components/SettingsModal';
import { SkladnikiSheet } from '../components/receptury/SkladnikiSheet';
import { ImportZPlikuArkusz } from '../components/settings/ImportZPlikuArkusz';
import { ImportRecipeModal } from '../components/ImportRecipeModal';
import { initDatabase, _resetMemStore, saveRecipe, getRecipes } from '../data/sqlite-store';
import { encodeRecipeToShareUrl } from '../lib/recipe-sharing';
import { _resetStanu, odswiezDostep } from '../lib/platnosci/stan';
import { ustawEkranZakupu } from '../lib/platnosci/ekran';
import { PRODUKTY } from '../lib/platnosci/konfiguracja';
import { mockIap } from '../../tests/helpers/platnosci';
import type { StoredRecipe } from '../data/db';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const przycisk = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.onPress === 'function');
const ekranPro = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
const nacisnij = async (root: renderer.ReactTestInstance, testID: string) => {
  const p = przycisk(root, testID);
  expect({ testID, jest: p.length > 0 }).toEqual({ testID, jest: true });
  await act(async () => p[p.length - 1].props.onPress());
  await flush();
};
const kupPro = async () => {
  mockIap.entitlements = [{ id: 'tx_n2', transactionId: 'tx_n2', productId: PRODUKTY.yearly, purchaseState: 'purchased', transactionDate: 1, expirationDateIOS: Date.now() + 30 * 86400000 }];
  await act(async () => { await odswiezDostep(); });
  await flush();
};
const zniknal = async (m: renderer.ReactTestInstance) => {
  await act(async () => m.props.onDismiss?.());
  await flush();
};

const formula = { flours: [{ name: 'Mąka pszenna chlebowa typ 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 900 };
const wlasna = (n: number): StoredRecipe => ({ id: `recipe_${n}`, name: `Moja ${n}`, isBuiltIn: false, createdAt: n, targetDDT: 25, formula });
const piecWlasnych = async () => {
  for (let n = 1; n <= 5; n++) await saveRecipe(wlasna(n));
};
const ileWlasnych = async () => (await getRecipes()).filter((r) => !r.isBuiltIn).length;

let tree: renderer.ReactTestRenderer | null = null;
async function zamontuj(el: React.ReactElement) {
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree!.root;
}

let alertSpy: jest.SpyInstance;
beforeEach(async () => {
  jest.clearAllMocks();
  _resetMemStore();
  mockIap.reset(); // bez Pro
  _resetStanu();
  ustawEkranZakupu(false);
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await initDatabase();
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  alertSpy.mockRestore();
  ustawEkranZakupu(false);
});

describe('N2: ekran Pro dopiero po zamknięciu arkusza (wzorzec D-117)', () => {
  it('jest iOS (pageSheet i onDismiss)', () => {
    expect(Platform.OS).toBe('ios');
  });

  it('„Składniki” → „Rodzaj” → poolish bez Pro: arkusz się zamyka, ekran Pro po jego zniknięciu; po zakupie zaczyn ustawiony', async () => {
    const menu = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => {});
    const root = await zamontuj(<RecepturaScreen />);
    await nacisnij(root, 'edit-ingredients-btn');
    const arkusz = () => root.findByType(SkladnikiSheet).findByType(Modal);
    expect(arkusz().props.visible).toBe(true);
    await nacisnij(root, 'preferment-type-btn');
    const wybor = menu.mock.calls[menu.mock.calls.length - 1][1] as (i: number) => void;
    await act(async () => wybor(1)); // ZACZYNY_W_MENU[1] = poolish
    await flush();
    expect(arkusz().props.visible).toBe(false);
    expect(ekranPro(root)).toBe(false);
    expect(root.findByType(SkladnikiSheet).props.prefermentType).toBe('direct');
    await zniknal(arkusz());
    expect(ekranPro(root)).toBe(true);
    await kupPro();
    expect(ekranPro(root)).toBe(false);
    expect(root.findByType(SkladnikiSheet).props.prefermentType).toBe('poolish');
    menu.mockRestore();
  });

  it('„Składniki”: zniknięcie arkusza po „Gotowe” (bez funkcji Pro) nie otwiera ekranu Pro', async () => {
    const root = await zamontuj(<RecepturaScreen />);
    await nacisnij(root, 'edit-ingredients-btn');
    await nacisnij(root, 'ingredients-done-btn');
    await zniknal(root.findByType(SkladnikiSheet).findByType(Modal));
    expect(ekranPro(root)).toBe(false);
  });

  it('Ustawienia → „Importuj z pliku” ponad limitem: oba arkusze się zamykają, ekran Pro po zniknięciu Ustawień; po zakupie bez zapisu', async () => {
    await piecWlasnych();
    function Ustawienia() {
      const [widoczne, setWidoczne] = useState(true);
      return <SettingsModal visible={widoczne} onClose={() => setWidoczne(false)} />;
    }
    const root = await zamontuj(<Ustawienia />);
    const ustawienia = () => root.findByType(SettingsModal).findAllByType(Modal)[0];
    await nacisnij(root, 'import-file-btn');
    const pole = root.findAll((n) => n.props.testID === 'import-json-input' && typeof n.props.onChangeText === 'function')[0];
    await act(async () => pole.props.onChangeText(encodeRecipeToShareUrl({ ...wlasna(9), name: 'Z pliku' })));
    await flush();
    await nacisnij(root, 'confirm-import-btn');
    expect(root.findAllByType(ImportZPlikuArkusz)).toHaveLength(0);
    expect(ustawienia().props.visible).toBe(false);
    expect(ekranPro(root)).toBe(false);
    await zniknal(ustawienia());
    expect(ekranPro(root)).toBe(true);
    await kupPro();
    expect(ekranPro(root)).toBe(false);
    expect(await ileWlasnych()).toBe(5);
  });

  it('import z kodu QR (ImportRecipeModal) ponad limitem: okno się zamyka, ekran Pro po jego zniknięciu; po zakupie bez zapisu', async () => {
    await piecWlasnych();
    const onSuccess = jest.fn();
    const payload = encodeRecipeToShareUrl({ ...wlasna(9), name: 'Od sąsiada' });
    function Import() {
      const [widoczne, setWidoczne] = useState(true);
      return <ImportRecipeModal visible={widoczne} onClose={() => setWidoczne(false)} onImportSuccess={onSuccess} initialInput={payload} />;
    }
    const root = await zamontuj(<Import />);
    const okno = () => root.findByType(ImportRecipeModal).findByType(Modal);
    await nacisnij(root, 'confirm-import-btn');
    expect(okno().props.visible).toBe(false);
    expect(ekranPro(root)).toBe(false);
    await zniknal(okno());
    expect(ekranPro(root)).toBe(true);
    await kupPro();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(await ileWlasnych()).toBe(5);
  });
});
