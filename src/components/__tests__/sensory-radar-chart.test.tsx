// ============================================================================
// Piekarz (Crust) — SensoryRadarChart Component Tests
// Tests 5-axis bread sensory radar SVG rendering and interactive steppers.
// ============================================================================

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import {
  SensoryRadarChart,
  BreadSensoryProfile,
  DEFAULT_BREAD_SENSORY_PROFILE,
} from '../SensoryRadarChart';

describe('SensoryRadarChart', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  afterEach(() => {
    if (tree) {
      act(() => {
        tree?.unmount();
      });
      tree = null;
    }
    jest.clearAllMocks();
  });

  it('renders SVG chart with 5 axes correctly', async () => {
    await act(async () => {
      tree = renderer.create(
        <SensoryRadarChart
          profile={DEFAULT_BREAD_SENSORY_PROFILE}
          size={200}
          testID="bread-radar"
        />
      );
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'bread-radar' })).toBeDefined();
    expect(root.findByProps({ testID: 'bread-sensory-radar-svg' })).toBeDefined();
  });

  it('renders interactive controls and adjusts profile when requested', async () => {
    const handleChangeProfile = jest.fn();
    const customProfile: BreadSensoryProfile = {
      crustCrispness: 3,
      crumbElasticity: 3,
      acidity: 2,
      openCrumb: 4,
      caramelization: 3,
    };

    await act(async () => {
      tree = renderer.create(
        <SensoryRadarChart
          profile={customProfile}
          size={220}
          interactive={true}
          onChangeProfile={handleChangeProfile}
        />
      );
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'radar-interactive-controls' })).toBeDefined();

    // Step crustCrispness up
    const plusCrustBtn = root.findByProps({ testID: 'plus-radar-crustCrispness' });
    await act(async () => {
      plusCrustBtn.props.onPress();
    });

    expect(handleChangeProfile).toHaveBeenCalledWith({
      ...customProfile,
      crustCrispness: 4,
    });

    // Step acidity down
    const minusAcidityBtn = root.findByProps({ testID: 'minus-radar-acidity' });
    await act(async () => {
      minusAcidityBtn.props.onPress();
    });

    expect(handleChangeProfile).toHaveBeenCalledWith({
      ...customProfile,
      acidity: 1,
    });
  });

  it('clamps values between 1 and 5', async () => {
    const handleChangeProfile = jest.fn();
    const edgeProfile: BreadSensoryProfile = {
      crustCrispness: 5,
      crumbElasticity: 1,
      acidity: 5,
      openCrumb: 1,
      caramelization: 5,
    };

    await act(async () => {
      tree = renderer.create(
        <SensoryRadarChart
          profile={edgeProfile}
          size={220}
          interactive={true}
          onChangeProfile={handleChangeProfile}
        />
      );
    });

    const root = tree!.root;
    const plusBtn = root.findByProps({ testID: 'plus-radar-crustCrispness' });
    expect(plusBtn.props.disabled).toBe(true);

    const minusBtn = root.findByProps({ testID: 'minus-radar-crumbElasticity' });
    expect(minusBtn.props.disabled).toBe(true);
  });
});
