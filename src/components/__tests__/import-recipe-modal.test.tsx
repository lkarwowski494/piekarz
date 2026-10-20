// ============================================================================
// Piekarz (Crust) — Import Recipe Modal Tests
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ImportRecipeModal } from '../ImportRecipeModal';
import * as sqliteStore from '../../data/sqlite-store';

describe('ImportRecipeModal Component', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const mockOnClose = jest.fn();
  const mockOnImportSuccess = jest.fn();

  beforeEach(() => {
    sqliteStore._resetMemStore();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (tree) {
      act(() => {
        tree?.unmount();
      });
      tree = null;
    }
  });

  it('renders correctly with empty hint state', () => {
    act(() => {
      tree = renderer.create(
        <ImportRecipeModal
          visible={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'import-recipe-modal' })).toBeDefined();

    const fullText = JSON.stringify(tree!.toJSON());
    expect(fullText).toContain('Importuj receptur');
    expect(root.findByProps({ testID: 'confirm-import-btn' })).toBeDefined();
  });

  it('shows error banner when invalid JSON is entered', () => {
    act(() => {
      tree = renderer.create(
        <ImportRecipeModal
          visible={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );
    });

    const root = tree!.root;
    const input = root.findByProps({ testID: 'recipe-json-input' });

    act(() => {
      input.props.onChangeText('{ corrupted json');
    });

    expect(root.findByProps({ testID: 'import-error-box' })).toBeDefined();
    const fullText = JSON.stringify(tree!.toJSON());
    expect(fullText).toContain('B\u0142\u0105d sk\u0142adni JSON');
  });

  it('shows preview card and enables import button for valid recipe JSON', async () => {
    const validJson = JSON.stringify({
      schema: 'piekarz/recipe/v1',
      recipe: {
        name: 'Chleb z importu',
        targetDDT: 24.5,
        formula: {
          flours: [
            { name: 'Mąka orkiszowa T630', percentage: 70 },
            { name: 'Mąka żytnia T720', percentage: 30 },
          ],
          waterPercentage: 74,
          saltPercentage: 2,
          starterPercentage: 20,
        },
      },
    });

    act(() => {
      tree = renderer.create(
        <ImportRecipeModal
          visible={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );
    });

    const root = tree!.root;
    const input = root.findByProps({ testID: 'recipe-json-input' });

    act(() => {
      input.props.onChangeText(validJson);
    });

    expect(root.findByProps({ testID: 'import-preview-card' })).toBeDefined();
    const fullText = JSON.stringify(tree!.toJSON());
    expect(fullText).toContain('Chleb z importu');
    expect(fullText).toContain('M\u0105ka orkiszowa T630');
    expect(fullText).toContain('M\u0105ka \u017cytnia T720');

    const confirmBtn = root.findByProps({ testID: 'confirm-import-btn' });
    await act(async () => {
      await confirmBtn.props.onPress();
    });

    expect(mockOnImportSuccess).toHaveBeenCalledTimes(1);
    expect(mockOnImportSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Chleb z importu',
        targetDDT: 24.5,
      })
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close or cancel button is pressed', () => {
    act(() => {
      tree = renderer.create(
        <ImportRecipeModal
          visible={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );
    });

    const root = tree!.root;
    const closeBtn = root.findByProps({ testID: 'close-import-btn' });
    act(() => {
      closeBtn.props.onPress();
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const cancelBtn = root.findByProps({ testID: 'cancel-import-btn' });
    act(() => {
      cancelBtn.props.onPress();
    });
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
