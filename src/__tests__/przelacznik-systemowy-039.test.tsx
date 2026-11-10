/**
 * Przełącznik „Przypomnienia o karmieniu” to systemowy Switch z React Native (kolor akcentu, animacja i kontrast
 * systemu), a cały wiersz dalej stuka [M1-audytor-generalny-039; 04-studio-projektowe-006, opcja A].
 */
import React from 'react';
import { Switch } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { PrzypomnieniaKarmieniaSection } from '../components/settings/PrzypomnieniaKarmieniaSection';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { _resetPrzypomnieniaKarmienia, czyPrzypomnieniaKarmienia } from '../lib/przypomnienia-karmienia';
import { theme } from '../ui/theme';

describe('039: systemowy przełącznik przypomnień', () => {
  beforeEach(async () => {
    _resetMemStore();
    _resetPrzypomnieniaKarmienia();
    await initDatabase();
  });

  it('wiersz zawiera Switch z value, etykietą i kolorem akcentu; Switch i wiersz zmieniają ustawienie', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => { tree = renderer.create(<PrzypomnieniaKarmieniaSection />); });
    const sw = tree.root.findByType(Switch);
    const przed = await czyPrzypomnieniaKarmienia();
    expect(sw.props.value).toBe(przed);
    expect(sw.props.accessibilityLabel).toBe('Przypomnienia o karmieniu');
    expect(sw.props.trackColor?.true).toBe(theme.colors.akcent);
    await act(async () => { sw.props.onValueChange(!przed); for (let i = 0; i < 10; i++) await Promise.resolve(); });
    expect(await czyPrzypomnieniaKarmienia()).toBe(!przed);
    expect(tree.root.findByType(Switch).props.value).toBe(!przed);
    await act(async () => { tree.root.findByProps({ testID: 'feeding-reminders-switch' }).props.onPress(); for (let i = 0; i < 10; i++) await Promise.resolve(); });
    expect(await czyPrzypomnieniaKarmienia()).toBe(przed);
    act(() => tree.unmount());
  });
});
