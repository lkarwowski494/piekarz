// ============================================================================
// Piekarz (Crust) — QrScannerModal Component Tests
// Tests offline camera barcode scanning, viewfinder overlay, and permissions.
// ============================================================================

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { QrScannerModal } from '../QrScannerModal';
import { MASTER_RECIPES } from '../../recipes/presets';
import { encodeRecipeToShareUrl, decodeRecipeFromShareUrl } from '../../lib/recipe-sharing';

describe('QrScannerModal', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    if (tree) {
      act(() => {
        jest.runOnlyPendingTimers();
        tree?.unmount();
      });
      tree = null;
    }
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('returns null when visible is false', async () => {
    await act(async () => {
      tree = renderer.create(
        <QrScannerModal
          visible={false}
          onClose={jest.fn()}
          onScanRecipe={jest.fn()}
        />
      );
    });

    expect(tree!.toJSON()).toBeNull();
  });

  it('renders camera view and viewfinder when permission is granted', async () => {
    const handleClose = jest.fn();
    const handleScanRecipe = jest.fn();

    await act(async () => {
      tree = renderer.create(
        <QrScannerModal
          visible={true}
          onClose={handleClose}
          onScanRecipe={handleScanRecipe}
        />
      );
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'qr-scanner-modal' })).toBeDefined();
    expect(root.findByProps({ testID: 'camera-view' })).toBeDefined();
    expect(root.findByProps({ testID: 'camera-viewfinder' })).toBeDefined();

    // Trigger barcode scanned on CameraView
    const cameraView = root.findByProps({ testID: 'camera-view' });
    act(() => {
      cameraView.props.onBarcodeScanned({ data: 'piekarz://recipe?v=1&d=test_payload' });
    });

    expect(handleScanRecipe).toHaveBeenCalledWith('piekarz://recipe?v=1&d=test_payload');

    // Close button
    const closeBtn = root.findByProps({ testID: 'close-scanner-btn' });
    act(() => {
      closeBtn.props.onPress();
    });
    expect(handleClose).toHaveBeenCalled();
  });

  it('imports a scanned recipe payload without URL scheme (M1-audytor-generalny-029)', async () => {
    const handleScanRecipe = jest.fn();
    const recipe = MASTER_RECIPES[0];
    const payload = encodeRecipeToShareUrl(recipe);
    expect(payload).not.toContain('://');

    await act(async () => {
      tree = renderer.create(
        <QrScannerModal visible onClose={jest.fn()} onScanRecipe={handleScanRecipe} />
      );
    });
    act(() => {
      tree!.root.findByProps({ testID: 'camera-view' }).props.onBarcodeScanned({ data: `  ${payload}\n` });
    });

    expect(handleScanRecipe).toHaveBeenCalledWith(payload);
    const imported = decodeRecipeFromShareUrl(handleScanRecipe.mock.calls[0][0]);
    expect(imported.success).toBe(true);
    if (imported.success) {
      expect(imported.recipe.name).toBe(recipe.namePl);
    }
  });
});
