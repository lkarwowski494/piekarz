import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ArtisanAccordionPro } from '../ArtisanAccordionPro';

// F-48 PÓŹNIEJ: sekcja ukryta w aplikacji (D-034, test wejscia-pozniej); tu sprawdzamy kod, który zostaje,
// z włączonym wejściem [M1-audytor-generalny-032].
jest.mock('../../../lib/wejscia-pozniej', () => ({ wejscieWidoczne: () => true }));

describe('ArtisanAccordionPro Component', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const mockOnToggle = jest.fn();
  const mockOnTargetDdtChange = jest.fn();
  const mockOnOpenBlendModal = jest.fn();
  const mockOnWaterPctChange = jest.fn();
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
          targetDdt={25.0}
          onTargetDdtChange={mockOnTargetDdtChange}
          waterTempTarget={18.5}
          ambientTemp={22.0}
          flourTemp={21.0}
          frictionFactor={2.0}
          flourBlend={[{ name: 'Mąka typ 750', percentage: 100 }]}
          onOpenBlendModal={mockOnOpenBlendModal}
          waterPct={68}
          onWaterPctChange={mockOnWaterPctChange}
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
          targetDdt={25.0}
          onTargetDdtChange={mockOnTargetDdtChange}
          waterTempTarget={3.5}
          iceGrams={45}
          ambientTemp={24.0}
          flourTemp={23.0}
          frictionFactor={3.0}
          flourBlend={[
            { name: 'Mąka typ 750', percentage: 80 },
            { name: 'Mąka żytnia typ 720', percentage: 20 },
          ]}
          onOpenBlendModal={mockOnOpenBlendModal}
          waterPct={68}
          onWaterPctChange={mockOnWaterPctChange}
          prefermentType="poolish"
          onPrefermentTypeChange={mockOnPrefermentTypeChange}
          bakeLossPercent={14}
          bakedTotalWeightGrams={730}
        />
      );
    });

    const fullText = extractCleanText(tree?.toJSON());
    expect(fullText).toContain('Temperatura wody');
    expect(fullText).toContain('3,5°C');
    expect(fullText).toContain('45 g lodu'); // Ice requirement alert
    expect(fullText).toContain('Mąka typ 750: 80%');
    expect(fullText).toContain('Strata Piecowa');
    expect(fullText).toContain('730 g');
  });

  it('steps DDT and hydration values', async () => {
    await act(async () => {
      tree = renderer.create(
        <ArtisanAccordionPro
          isOpen={true}
          onToggle={mockOnToggle}
          targetDdt={25.0}
          onTargetDdtChange={mockOnTargetDdtChange}
          waterTempTarget={18.0}
          ambientTemp={22.0}
          flourTemp={21.0}
          frictionFactor={2.0}
          flourBlend={[{ name: 'Mąka typ 750', percentage: 100 }]}
          onOpenBlendModal={mockOnOpenBlendModal}
          waterPct={68}
          onWaterPctChange={mockOnWaterPctChange}
          prefermentType="direct"
          onPrefermentTypeChange={mockOnPrefermentTypeChange}
          bakeLossPercent={14}
          bakedTotalWeightGrams={750}
        />
      );
    });

    const ddtPlusBtn = tree!.root.findByProps({ testID: 'ddt-plus-btn' });
    await act(async () => {
      ddtPlusBtn.props.onPress();
    });
    expect(mockOnTargetDdtChange).toHaveBeenCalledWith(25.5);

    const waterMinusBtn = tree!.root.findByProps({ testID: 'water-pct-minus-btn' });
    await act(async () => {
      waterMinusBtn.props.onPress();
    });
    expect(mockOnWaterPctChange).toHaveBeenCalledWith(67);
  });

  it('switches preferment type and opens blend modal', async () => {
    await act(async () => {
      tree = renderer.create(
        <ArtisanAccordionPro
          isOpen={true}
          onToggle={mockOnToggle}
          targetDdt={25.0}
          onTargetDdtChange={mockOnTargetDdtChange}
          waterTempTarget={18.0}
          ambientTemp={22.0}
          flourTemp={21.0}
          frictionFactor={2.0}
          flourBlend={[{ name: 'Mąka typ 750', percentage: 100 }]}
          onOpenBlendModal={mockOnOpenBlendModal}
          waterPct={68}
          onWaterPctChange={mockOnWaterPctChange}
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

    const editBlendBtn = tree!.root.findByProps({ testID: 'edit-blend-pro-btn' });
    await act(async () => {
      editBlendBtn.props.onPress();
    });
    expect(mockOnOpenBlendModal).toHaveBeenCalled();
  });
});
