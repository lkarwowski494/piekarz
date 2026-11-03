/**
 * Okno pełnoekranowe (Modal bez pageSheet/formSheet) ma własny bezpieczny obszar z metrykami okna [M3 E2E-basic].
 * E2E Basic (run 39924837386, flow 02 i 05): ekran Pro otwarty prosto z ekranu miał „Zamknij” pod paskiem stanu
 * (granice [327,8][386,52] zamiast [327,70][386,114]); stuknięcie trafiało w pasek stanu i ekran się nie zamykał.
 * Modal to osobne okno iOS: SafeAreaView bez własnego dostawcy dostaje przy pierwszym pokazaniu wcięcie 0.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { PaywallModal } from '../PaywallModal';
import { BezpiecznyObszarOkna } from '../BezpiecznyObszarOkna';

const root = path.join(__dirname, '..', '..', '..');

function plikiTsx(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : plikiTsx(p);
    return p.endsWith('.tsx') ? [p] : [];
  });
}

describe('okno pełnoekranowe: bezpieczny obszar od pierwszego pokazania', () => {
  it('każdy Modal pełnoekranowy z SafeAreaView ma BezpiecznyObszarOkna (dostawca z metrykami okna)', () => {
    const pelne = [...plikiTsx(path.join(root, 'src')), ...plikiTsx(path.join(root, 'app'))]
      .map((p) => ({ p: path.relative(root, p).replace(/\\/g, '/'), t: fs.readFileSync(p, 'utf8') }))
      .filter(({ t }) => /<Modal\b/.test(t) && !/presentationStyle=/.test(t) && /SafeAreaView/.test(t));
    expect(pelne.map((x) => x.p).sort()).toEqual(['src/components/PaywallModal.tsx', 'src/components/QrScannerModal.tsx', 'src/components/ShareRecipeQrModal.tsx']);
    expect(pelne.filter(({ t }) => !/<BezpiecznyObszarOkna>/.test(t)).map((x) => x.p)).toEqual([]);
  });

  it('BezpiecznyObszarOkna to SafeAreaProvider z initialWindowMetrics', () => {
    const t = fs.readFileSync(path.join(root, 'src/components/BezpiecznyObszarOkna.tsx'), 'utf8');
    expect(t).toMatch(/<SafeAreaProvider initialMetrics=\{initialWindowMetrics\}>/);
  });

  it('przy znanych metrykach okna (urządzenie) treść idzie przez SafeAreaProvider z tymi metrykami', () => {
    const metryki = { frame: { x: 0, y: 0, width: 393, height: 852 }, insets: { top: 59, left: 0, right: 0, bottom: 34 } };
    jest.isolateModules(() => {
      jest.doMock('react-native-safe-area-context', () => ({
        ...jest.requireActual('react-native-safe-area-context'),
        initialWindowMetrics: metryki,
        SafeAreaProvider: ({ children }: { children: React.ReactNode; initialMetrics?: unknown }) => children,
      }));
      const { BezpiecznyObszarOkna: Obszar } = require('../BezpiecznyObszarOkna');
      const { SafeAreaProvider } = require('react-native-safe-area-context');
      let tree: renderer.ReactTestRenderer | null = null;
      act(() => {
        tree = renderer.create(<Obszar>{null}</Obszar>);
      });
      const dostawca = tree!.root.findAllByType(SafeAreaProvider);
      expect(dostawca).toHaveLength(1);
      expect(dostawca[0].props.initialMetrics).toBe(metryki);
      act(() => tree!.unmount());
    });
  });

  it('ekran Pro: „Zamknij” (close-modal) leży wewnątrz BezpiecznyObszarOkna', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<PaywallModal visible onClose={jest.fn()} onSubscribe={jest.fn()} onRestore={jest.fn()} />);
    });
    const obszar = tree!.root.findAllByType(BezpiecznyObszarOkna);
    expect(obszar).toHaveLength(1);
    expect(obszar[0].findAll((n) => n.props.testID === 'close-modal' && typeof n.props.onPress === 'function').length).toBeGreaterThan(0);
    act(() => tree!.unmount());
  });
});
