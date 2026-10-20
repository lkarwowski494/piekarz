import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ArtisanAccordionPro } from '../ArtisanAccordionPro';

// F-48 PÓŹNIEJ: sekcja ukryta w aplikacji (D-034, test wejscia-pozniej); tu sprawdzamy kod, który zostaje,
// z włączonym wejściem [M1-audytor-generalny-032].
jest.mock('../../../lib/wejscia-pozniej', () => ({ wejscieWidoczne: () => true }));

describe('ArtisanAccordionPro Component', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const mockOnToggle = jest.fn();
  const mockOnPrefermentTypeChange = jest.fn();

  afterEach(() => {
    if (tree) {
      act(() => {
        tree?.unmount();
      });
      tree = null;
    }
  });

  function extractCleanText(node: any): string {
    function walk(n: any): string {
      if (typeof n === 'string' || typeof n === 'number') return String(n);
      if (!n) return '';
      if (Array.isArray(n)) return n.map(walk).join('');
      if (n.children) return walk(n.children);
      if (n.props && n.props.children) return walk(n.props.children);
      return '';
    }
    return walk(node).replace(/\s+/g, ' ').trim();
  }

  it('renders collapsed state by default and toggles on press', async () => {
    await act(async () => {
      tree = renderer.create(
        <ArtisanAccordionPro
          isOpen={false}
          onToggle={mockOnToggle}
          flourBlend={[{ name: 'Mąka typ 750', percentage: 100 }]}
          prefermentType="direct"
          onPrefermentTypeChange={mockOnPrefermentTypeChange}
          bakeLossPercent={14}
          bakedTotalWeightGrams={750}
        />
      );
    });

    const toggleBtn = tree!.root.findByProps({ testID: 'artisan-accordion-toggle-btn' });
    await act(async () => {
      toggleBtn.props.onPress();
    });

    expect(mockOnToggle).toHaveBeenCalled();
    expect(tree!.root.findAllByProps({ testID: 'artisan-accordion-body' })).toHaveLength(0);
  });

  it('renders expanded parameters when isOpen is true', async () => {
    await act(async () => {
      tree = renderer.create(
        <ArtisanAccordionPro
          isOpen={true}
          onToggle={mockOnToggle}
          flourBlend={[
            { name: 'Mąka typ 750', percentage: 80 },
            { name: 'Mąka żytnia typ 720', percentage: 20 },
          ]}
          prefermentType="poolish"
          onPrefermentTypeChange={mockOnPrefermentTypeChange}
          bakeLossPercent={14}
          bakedTotalWeightGrams={730}
        />
      );
    });

    const fullText = extractCleanText(tree?.toJSON());
    // 057: temperatura wody ma własną akcję receptury i arkusz (TemperaturaWodySheet), nie jest w akordeonie
    expect(fullText).not.toContain('Docelowa temp. wody');
    expect(tree!.root.findAllByProps({ testID: 'ddt-plus-btn' })).toHaveLength(0);
    expect(fullText).toContain('Mieszanka mąk, zaczyny, strata piecowa');
    expect(fullText).not.toContain('lodu'); // F-53 NIE: bez masy lodu [M1-audytor-generalny-099]
    expect(fullText).toContain('Mąka typ 750: 80%');
    expect(fullText).toContain('Strata Piecowa');
    expect(fullText).toContain('730 g');
  });

  it('switches preferment type; blend editing is the recipe action "Change Ingredients", not a button here (057)', async () => {
    await act(async () => {
      tree = renderer.create(
        <ArtisanAccordionPro
          isOpen={true}
          onToggle={mockOnToggle}
          flourBlend={[{ name: 'Mąka typ 750', percentage: 100 }]}
          prefermentType="direct"
          onPrefermentTypeChange={mockOnPrefermentTypeChange}
          bakeLossPercent={14}
          bakedTotalWeightGrams={750}
        />
      );
    });

    const bigaBtn = tree!.root.findByProps({ testID: 'pref-type-biga' });
    await act(async () => {
      bigaBtn.props.onPress();
    });
    expect(mockOnPrefermentTypeChange).toHaveBeenCalledWith('biga');

    for (const id of ['edit-blend-pro-btn', 'open-blend-builder-btn']) {
      expect({ id, n: tree!.root.findAllByProps({ testID: id }).length }).toEqual({ id, n: 0 });
    }
  });
});
