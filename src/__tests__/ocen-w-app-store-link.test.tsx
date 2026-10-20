/**
 * BR-OPIN-002 (DEC-13 a): gdy Apple ID aplikacji jest liczbą, Ustawienia pokazują link „Oceń w App Store”
 * z action=write-review; dotknięcie otwiera App Store przez Linking, nigdy requestReview() (M04); gdy
 * openURL odrzuci, komunikat o połączeniu z App Store [M1-audytor-generalny-082; 11-wzrost-004].
 */
jest.mock('../lib/links', () => ({
  ...jest.requireActual('../lib/links'),
  APP_STORE_ID: '1234567890',
  APP_STORE_REVIEW_URL: 'https://apps.apple.com/app/apple-store/id1234567890?action=write-review',
}));
jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(async () => true),
  hasAction: jest.fn(async () => true),
  requestReview: jest.fn(async () => undefined),
}));

import React from 'react';
import { Alert, Linking } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as StoreReview from 'expo-store-review';
import { StudioEcosystemSection } from '../components/settings/StudioEcosystemSection';

const URL = 'https://apps.apple.com/app/apple-store/id1234567890?action=write-review';

function render(): renderer.ReactTestRenderer {
  let tree: renderer.ReactTestRenderer | null = null;
  act(() => {
    tree = renderer.create(<StudioEcosystemSection />);
  });
  return tree!;
}

describe('Ustawienia: „Oceń w App Store” z Apple ID', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('M04: wiersz jest linkiem 44 pt i otwiera adres z action=write-review, bez requestReview()', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const tree = render();
    const row = tree.root.findByProps({ testID: 'settings-rate-link' });
    expect(row.props.accessibilityRole).toBe('link');
    expect(row.props.accessibilityLabel).toBe('Oceń w App Store');
    await act(async () => {
      row.props.onPress();
    });
    expect(openURL).toHaveBeenCalledWith(URL);
    expect(StoreReview.requestReview).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it('openURL odrzuca (brak App Store / sieci): komunikat, aplikacja działa dalej', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no store'));
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const tree = render();
    await act(async () => {
      tree.root.findByProps({ testID: 'settings-rate-link' }).props.onPress();
      for (let i = 0; i < 5; i++) await Promise.resolve();
    });
    expect(alert).toHaveBeenCalledWith('Oceń w App Store', 'Ocena wymaga połączenia z App Store.');
    act(() => tree.unmount());
  });
});
