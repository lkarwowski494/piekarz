import React from 'react';
import { TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { NumInput } from '../NumInput';

describe('NumInput Component Specification (NFR-INT-003 & RD-ENG-01)', () => {
  it('renders with initial numeric value and allows comma typing', () => {
    const onChangeText = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <NumInput value={12} onChangeText={onChangeText} testID="test-num-input" />
      );
    });

    const textInput = tree.root.findByType(TextInput);
    expect(textInput.props.value).toBe('12');

    act(() => {
      textInput.props.onChangeText('12,5');
    });

    expect(onChangeText).toHaveBeenCalledWith('12,5');
    expect(textInput.props.value).toBe('12,5');
  });

  it('converts comma to dot and calls onChangeNumber upon blur', () => {
    const onChangeNumber = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <NumInput value={10} onChangeNumber={onChangeNumber} testID="test-num-input" />
      );
    });

    const textInput = tree.root.findByType(TextInput);

    act(() => {
      textInput.props.onChangeText('12,5');
    });

    act(() => {
      textInput.props.onBlur({} as any);
    });

    expect(onChangeNumber).toHaveBeenCalledWith(12.5);
  });

  it('preserves stored base value via wInKeep without rounding drift', () => {
    const onChangeNumber = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <NumInput
          value={135}
          stored={61.23}
          unit="lb"
          onChangeNumber={onChangeNumber}
          testID="test-num-input"
        />
      );
    });

    const textInput = tree.root.findByType(TextInput);

    act(() => {
      textInput.props.onChangeText('135,0');
    });

    act(() => {
      textInput.props.onBlur({} as any);
    });

    // wInKeep("135,0", "lb", 61.23) === 61.23 (zero drift)
    expect(onChangeNumber).toHaveBeenCalledWith(61.23);
  });

  it('enforces min and max bounds when specified', () => {
    const onChangeNumber = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <NumInput
          value={50}
          min={10}
          max={100}
          onChangeNumber={onChangeNumber}
          testID="test-num-input"
        />
      );
    });

    const textInput = tree.root.findByType(TextInput);

    act(() => {
      textInput.props.onChangeText('5');
    });
    act(() => {
      textInput.props.onBlur({} as any);
    });
    expect(onChangeNumber).toHaveBeenCalledWith(10); // clamped to min

    act(() => {
      textInput.props.onChangeText('150');
    });
    act(() => {
      textInput.props.onBlur({} as any);
    });
    expect(onChangeNumber).toHaveBeenCalledWith(100); // clamped to max
  });

  it('provides a touch target meeting RD-ENG-03 (>= 44pt)', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<NumInput value={1} testID="test-num-input" />);
    });
    const textInput = tree.root.findByType(TextInput);
    const flatStyle = Array.isArray(textInput.props.style)
      ? Object.assign({}, ...textInput.props.style)
      : textInput.props.style;
    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);
  });
});
