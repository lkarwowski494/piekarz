/**
 * Kontrola bezpieczeństwa zakwasu (biały kożuch, puszysty nalot, przebarwienia, zgniły zapach → wyrzuć; płyn hooch →
 * nie wyrzucaj) działa bez zakupu: ostrzeżenie o bezpieczeństwie żywności nie może być za paywallem
 * (RD-21-W1; docs/monetyzacja.md BR-DIAG-002 „ostrzeżenie RD-21 zawsze”). Wcześniej StarterSafetyCard była wewnątrz
 * BlokadaFunkcji('zakwas'), więc bez zakupu dotknięcie objawu otwierało ekran zakupu [audyt-niezalezny E-1].
 */
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
const mockNawigacja = { push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    get router() {
      return mockNawigacja;
    },
    useRouter: () => mockNawigacja,
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
    Stack: Object.assign(({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children), {
      Screen: () => null,
    }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { PaywallModal } from '../components/PaywallModal';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { bezUprawnienia } from '../../tests/helpers/platnosci';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

function tekst(n: renderer.ReactTestInstance): string {
  return n
    .findAll((x) => (x.type as unknown) === 'Text')
    .map((x) => (Array.isArray(x.props.children) ? x.props.children.join('') : String(x.props.children)))
    .join(' ');
}

/** Element leży w zablokowanej treści (BlokadaFunkcji: View z testID „blokada-…-tresc”). */
function wBlokadzie(n: renderer.ReactTestInstance | null): boolean {
  for (let p = n; p; p = p.parent) if (typeof p.props?.testID === 'string' && /^blokada-.*-tresc$/.test(p.props.testID)) return true;
  return false;
}

describe('kontrola bezpieczeństwa zakwasu bez zakupu (E-1)', () => {
  beforeEach(async () => {
    _resetMemStore();
    bezUprawnienia();
    await initDatabase();
  });

  it.each(['check-film', 'check-mold', 'check-colored', 'check-smell'])('%s: bez zakupu daje polecenie wyrzucenia, bez ekranu zakupu', async (id) => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <AppAccessProvider>
          <ZakwasScreen />
        </AppAccessProvider>
      );
    });
    await flush();
    const przycisk = tree!.root.findAll((n) => n.props?.testID === id && typeof n.props.onPress === 'function')[0];
    expect(przycisk).toBeDefined();
    expect(wBlokadzie(przycisk)).toBe(false);
    await act(async () => {
      przycisk.props.onPress();
    });
    await flush();
    expect(tree!.root.findAllByType(PaywallModal).some((p) => p.props.visible === true)).toBe(false);
    expect(tekst(tree!.root)).toContain('Wyrzuć zakwas');
    act(() => tree!.unmount());
  });

  it('granica zastosowania („Aplikacja nie ocenia bezpieczeństwa… W razie wątpliwości wyrzuć zakwas.”) widoczna bez zakupu poza blokadą', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <AppAccessProvider>
          <ZakwasScreen />
        </AppAccessProvider>
      );
    });
    await flush();
    const granica = tree!.root.findAll((n) => n.props?.testID === 'starter-safety-boundary')[0];
    expect(granica).toBeDefined();
    expect(wBlokadzie(granica)).toBe(false);
    act(() => tree!.unmount());
  });
});
