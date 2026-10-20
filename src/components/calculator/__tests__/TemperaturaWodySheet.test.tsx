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
  const onWaterPctChange = jest.fn();
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
          waterPct={68}
          onWaterPctChange={onWaterPctChange}
        />
      );
    });
  };
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
  });

  it('shows the water temperature with steppers; DDT and hydration change by the same steps as before', async () => {
    await render(true);
    expect(tekst(tree!)).toContain('Temperatura wody');
    expect(tekst(tree!)).toContain('3,5°C');
    await act(async () => {
      tree!.root.findByProps({ testID: 'ddt-plus-btn' }).props.onPress();
    });
    expect(onTargetDdtChange).toHaveBeenCalledWith(25.5);
    await act(async () => {
      tree!.root.findByProps({ testID: 'water-pct-minus-btn' }).props.onPress();
    });
    expect(onWaterPctChange).toHaveBeenCalledWith(67);
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
