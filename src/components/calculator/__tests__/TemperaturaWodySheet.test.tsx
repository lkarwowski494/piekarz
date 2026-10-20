// Arkusz „Temperatura wody” z akcji receptury (057): to, co sprawdzał dawny test DDT w akordeonie
// (ArtisanAccordionPro.test.tsx „steps DDT and hydration values”), teraz w arkuszu [M1-audytor-generalny-057]
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TemperaturaWodySheet } from '../TemperaturaWodySheet';

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const tekst = (t: renderer.ReactTestRenderer) =>
  t.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => (Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)))
    .join(' | ');

describe('TemperaturaWodySheet', () => {
  const onClose = jest.fn();
  const onTargetDdtChange = jest.fn();
  let tree: renderer.ReactTestRenderer | null = null;

  const render = async (visible: boolean) => {
    await act(async () => {
      tree = renderer.create(
        <TemperaturaWodySheet
          visible={visible}
          onClose={onClose}
          targetDdt={25.0}
          onTargetDdtChange={onTargetDdtChange}
          waterTempTarget={3.5}
        />
      );
    });
  };
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
  });

  // Arkusz liczy tylko temperaturę; procent wody jest w arkuszu „Składniki” (§11c 106) [M1-audytor-generalny-106]
  it('shows the water temperature with the DDT stepper and no hydration stepper', async () => {
    await render(true);
    expect(tekst(tree!)).toContain('Temperatura wody');
    expect(tekst(tree!)).toContain('3,5°C');
    await act(async () => {
      tree!.root.findByProps({ testID: 'ddt-plus-btn' }).props.onPress();
    });
    expect(onTargetDdtChange).toHaveBeenCalledWith(25.5);
    expect(tree!.root.findAllByProps({ testID: 'water-pct-minus-btn' })).toHaveLength(0);
    expect(tree!.root.findAllByProps({ testID: 'water-pct-plus-btn' })).toHaveLength(0);
    expect(tekst(tree!)).not.toContain('Hydratacja bazy');
  });

  it('"Close" closes the sheet; a hidden sheet renders nothing', async () => {
    await render(true);
    await act(async () => {
      tree!.root.findAll((n) => n.props.testID === 'close-modal' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
    await render(false);
    expect(tree!.root.findAllByProps({ testID: 'water-temp-sheet' })).toHaveLength(0);
  });
});
