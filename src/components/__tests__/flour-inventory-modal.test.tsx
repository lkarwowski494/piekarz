import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { FlourInventoryModal } from '../FlourInventoryModal';
import { zUprawnieniem } from '../../../tests/helpers/platnosci';
import {
  initDatabase,
  getFlourInventory,
  saveFlourInventoryItem,
  _resetMemStore,
} from '../../data/sqlite-store';

describe('FlourInventoryModal Component (src/components/FlourInventoryModal.tsx)', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const mockOnClose = jest.fn();
  const mockOnInventoryUpdated = jest.fn();

  beforeEach(async () => {
    zUprawnieniem(); // dostęp z App Store (009): dawniej lokalny okres próbny
    jest.clearAllMocks();
    _resetMemStore();
    await initDatabase();
  });

  afterEach(() => {
    if (tree) {
      act(() => {
        tree?.unmount();
      });
      tree = null;
    }
  });

  it('renders pantry flour inventory with default items', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourInventoryModal
          visible={true}
          onClose={mockOnClose}
          onInventoryUpdated={mockOnInventoryUpdated}
        />
      );
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'flour-inventory-modal' })).toBeDefined();

    const fullText = JSON.stringify(tree!.toJSON());
    expect(fullText).toContain('Spi\u017carnia m\u0105k (Magazyn)');
    expect(fullText).toContain('M\u0105ka pszenna chlebowa typ 750');
    expect(fullText).toContain('M\u0105ka \u017cytnia razowa typ 2000');
  });

  it('displays success banner when recipe flours are fully available in stock', async () => {
    const recipeFlours = [
      { name: 'Mąka pszenna chlebowa typ 750', weightGrams: 500 },
      { name: 'Mąka żytnia razowa typ 2000', weightGrams: 200 },
    ];

    await act(async () => {
      tree = renderer.create(
        <FlourInventoryModal
          visible={true}
          onClose={mockOnClose}
          recipeFlours={recipeFlours}
        />
      );
    });

    const banner = tree!.root.findByProps({ testID: 'stock-check-banner' });
    expect(banner).toBeDefined();

    const fullText = JSON.stringify(tree!.toJSON());
    expect(fullText).toContain('Wszystkie m\u0105ki s\u0105 dost\u0119pne w spi\u017carni!');
  });

  it('displays shortage warning banner and substitute suggestion when recipe exceeds stock', async () => {
    const recipeFlours = [
      { name: 'Mąka pszenna chlebowa typ 750', weightGrams: 3000 }, // default stock is 2000g -> deficit 1000g
    ];

    await act(async () => {
      tree = renderer.create(
        <FlourInventoryModal
          visible={true}
          onClose={mockOnClose}
          recipeFlours={recipeFlours}
        />
      );
    });

    const banner = tree!.root.findByProps({ testID: 'stock-check-banner' });
    expect(banner).toBeDefined();

    const fullText = JSON.stringify(tree!.toJSON());
    expect(fullText).toContain('brakuje 1000g m\u0105ki');
    expect(fullText).toContain('Manitoba'); // Suggested substitute from inventory
  });

  it('allows adjusting stock with +500g and -250g buttons', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourInventoryModal
          visible={true}
          onClose={mockOnClose}
          onInventoryUpdated={mockOnInventoryUpdated}
        />
      );
    });

    const root = tree!.root;
    const plus500 = root.findByProps({ testID: 'adjust-plus-500-flour_inv_wheat_750' });
    expect(plus500).toBeDefined();

    await act(async () => {
      plus500.props.onPress();
    });

    const inventory = await getFlourInventory();
    const wheat = inventory.find((i) => i.id === 'flour_inv_wheat_750');
    expect(wheat?.stockGrams).toBe(2500); // 2000 + 500
    expect(mockOnInventoryUpdated).toHaveBeenCalled();
  });

  it('allows adding a new flour item to the pantry inventory', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourInventoryModal
          visible={true}
          onClose={mockOnClose}
          onInventoryUpdated={mockOnInventoryUpdated}
        />
      );
    });

    const root = tree!.root;

    // Open add flour form
    const openAddBtn = root.findByProps({ testID: 'open-add-flour-btn' });
    await act(async () => {
      openAddBtn.props.onPress();
    });

    const nameInput = root.findByProps({ testID: 'new-flour-name-input' });
    const stockInput = root.findByProps({ testID: 'new-flour-stock-input' });

    await act(async () => {
      nameInput.props.onChangeText('Mąka orkiszowa typ 630');
      stockInput.props.onChangeText('1500');
    });

    const confirmBtn = root.findByProps({ testID: 'confirm-add-flour-btn' });
    await act(async () => {
      confirmBtn.props.onPress();
    });

    const inventory = await getFlourInventory();
    const added = inventory.find((i) => i.name === 'Mąka orkiszowa typ 630');
    expect(added).toBeDefined();
    expect(added?.stockGrams).toBe(1500);
  });

  it('deducts recipe flour stocks when deduct button is pressed', async () => {
    const recipeFlours = [
      { name: 'Mąka pszenna chlebowa typ 750', weightGrams: 500 },
    ];

    await act(async () => {
      tree = renderer.create(
        <FlourInventoryModal
          visible={true}
          onClose={mockOnClose}
          recipeFlours={recipeFlours}
          onInventoryUpdated={mockOnInventoryUpdated}
        />
      );
    });

    const root = tree!.root;
    const deductBtn = root.findByProps({ testID: 'deduct-stocks-btn' });
    expect(deductBtn).toBeDefined();

    await act(async () => {
      deductBtn.props.onPress();
    });

    const inventory = await getFlourInventory();
    const wheat = inventory.find((i) => i.id === 'flour_inv_wheat_750');
    expect(wheat?.stockGrams).toBe(1500); // 2000 - 500
  });

  it('calls onClose when close button is pressed', async () => {
    await act(async () => {
      tree = renderer.create(
        <FlourInventoryModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const closeBtn = root.findByProps({ testID: 'close-inventory-btn' });
    await act(async () => {
      closeBtn.props.onPress();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
