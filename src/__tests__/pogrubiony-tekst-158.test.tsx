/**
 * Własny krój tytułów reaguje na „Pogrubiony tekst” iOS: tytuł kroku i czas w prowadzeniu mają cięższą odmianę,
 * gdy ustawienie jest włączone, także po zmianie w trakcie (zdarzenie boldTextChanged)
 * [M1-audytor-generalny-158; 04-studio-projektowe-503].
 */
import React from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { StrefaKroku } from '../components/stolnica/StrefaKroku';
import type { SessionStep } from '../core/bake-steps';

const krok: SessionStep = {
  id: 'bake', name: 'bake', category: 'bake', durationMin: 45, isPassive: false, instructions: '', plannedStart: null, plannedEnd: null,
};

async function strefa() {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <StrefaKroku step={krok} formattedTime="45:00" unitSystem="metric" dutchOvenPhase="lid_on" isCompleted={false}
        onSwitchPhase={() => undefined} onStartPhase2AfterSteamAlert={() => undefined} ostrzezenia={[]} />,
    );
  });
  const waga = (id: string) => StyleSheet.flatten(tree.root.findByProps({ testID: id }).props.style).fontWeight;
  return { tree, waga };
}

describe('158: „Pogrubiony tekst” w kroju tytułów', () => {
  afterEach(() => jest.restoreAllMocks());

  it('wyłączony: tytuł kroku i czas w odmianie 700', async () => {
    jest.spyOn(AccessibilityInfo, 'isBoldTextEnabled').mockResolvedValue(false);
    const { tree, waga } = await strefa();
    expect([waga('step-title'), waga('step-time')]).toEqual(['700', '700']);
    act(() => tree.unmount());
  });

  it('włączony: tytuł kroku i czas w odmianie 900', async () => {
    jest.spyOn(AccessibilityInfo, 'isBoldTextEnabled').mockResolvedValue(true);
    const { tree, waga } = await strefa();
    expect([waga('step-title'), waga('step-time')]).toEqual(['900', '900']);
    act(() => tree.unmount());
  });

  it('zmiana w trakcie (boldTextChanged) przełącza odmianę', async () => {
    jest.spyOn(AccessibilityInfo, 'isBoldTextEnabled').mockResolvedValue(false);
    let sluchacz: ((v: boolean) => void) | null = null;
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((nazwa: string, f: (v: boolean) => void) => {
      if (nazwa === 'boldTextChanged') sluchacz = f;
      return { remove: () => undefined };
    }) as never);
    const { tree, waga } = await strefa();
    expect(sluchacz).not.toBeNull();
    await act(async () => sluchacz!(true));
    expect([waga('step-title'), waga('step-time')]).toEqual(['900', '900']);
    act(() => tree.unmount());
  });
});
