// ============================================================================
// Piekarz (Crust) — QrCodeSvg Unit Tests
// Tests vector QR matrix generation and SVG rendering offline.
// ============================================================================

import React from 'react';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';
import { QrCodeSvg, generateQrMatrix } from '../QrCodeSvg';

describe('QrCodeSvg: etykieta VoiceOver [audyt-niezalezny G-4]', () => {
  it('kod jest jednym obrazem z etykietą z propsa', () => {
    let t!: renderer.ReactTestRenderer;
    act(() => {
      t = renderer.create(<QrCodeSvg value="piekarz://recipe?v=1&d=x" accessibilityLabel="Kod QR Receptury" testID="qr" />);
    });
    const obraz = t.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'image');
    expect(obraz.map((n) => [n.props.accessible, n.props.accessibilityLabel])).toEqual([[true, 'Kod QR Receptury']]);
  });
});

describe('QrCodeSvg', () => {
  it('generates a valid 2D boolean matrix of QR modules', () => {
    const { size, modules } = generateQrMatrix('piekarz://recipe?v=1&d=test');
    expect(size).toBeGreaterThanOrEqual(21);
    expect(modules.length).toBe(size);
    expect(modules[0].length).toBe(size);

    // Top-left finder pattern corner must be true
    expect(modules[0][0]).toBe(true);
  });

  it('renders vector SVG container without crashing', async () => {
    let tree: renderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = renderer.create(
        <QrCodeSvg value="piekarz://recipe?v=1&d=sample" size={200} testID="test-qr" />
      );
    });

    expect(tree).toBeDefined();
    const root = tree!.root;
    const view = root.findByProps({ testID: 'test-qr' });
    expect(view).toBeDefined();
  });

  it('renders with fallback when value is empty', async () => {
    let tree: renderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = renderer.create(<QrCodeSvg value="" size={180} testID="empty-qr" />);
    });

    expect(tree).toBeDefined();
    const root = tree!.root;
    const view = root.findByProps({ testID: 'empty-qr' });
    expect(view).toBeDefined();
  });
});
