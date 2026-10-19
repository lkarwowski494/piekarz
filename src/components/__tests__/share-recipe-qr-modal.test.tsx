// ============================================================================
// Piekarz (Crust) — ShareRecipeQrModal Component Tests
// Tests vector QR sharing modal, clipboard copying, and HIG accessibility.
// ============================================================================

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ShareRecipeQrModal } from '../ShareRecipeQrModal';
import { MASTER_RECIPES } from '../../recipes/presets';
import * as Clipboard from 'expo-clipboard';

describe('ShareRecipeQrModal', () => {
  const sampleRecipe = MASTER_RECIPES[0];
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

  it('renders nothing when visible is false', async () => {
    await act(async () => {
      tree = renderer.create(
        <ShareRecipeQrModal
          visible={false}
          onClose={jest.fn()}
          recipe={sampleRecipe}
        />
      );
    });

    expect(tree!.toJSON()).toBeNull();
  });

  it('renders recipe details, QR svg, and actions when visible', async () => {
    const handleClose = jest.fn();

    await act(async () => {
      tree = renderer.create(
        <ShareRecipeQrModal
          visible={true}
          onClose={handleClose}
          recipe={sampleRecipe}
        />
      );
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'share-recipe-qr-modal' })).toBeDefined();
    expect(root.findByProps({ testID: 'recipe-qr-svg' })).toBeDefined();

    // Copy deep link button
    const copyAppBtn = root.findByProps({ testID: 'copy-app-link-btn' });
    await act(async () => {
      copyAppBtn.props.onPress();
    });
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('piekarz://recipe?v=1&d=')
    );

    // No web link to a domain the studio does not control (M1-audytor-generalny-028)
    expect(root.findAll((n) => n.props.testID === 'copy-web-link-btn')).toHaveLength(0);

    // Close button
    const closeBtn = root.findByProps({ testID: 'close-share-qr-btn' });
    act(() => {
      closeBtn.props.onPress();
    });
    expect(handleClose).toHaveBeenCalled();
  });
});
