/**
 * Godzina „gotowe” na planie i czas kroku w prowadzeniu rosną z Dynamic Type najwyżej do tokenu AX5
 * (`czas` 56 → 99 pt), więc przy AX5 cyfry mieszczą się w jednym wierszu
 * [M1-audytor-generalny-201; 04-studio-projektowe-609].
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { TargetReadyCard } from '../components/harmonogram/TargetReadyCard';
import { StrefaKroku } from '../components/stolnica/StrefaKroku';
import type { SessionStep } from '../core/bake-steps';
import { typografia } from '../ui/tokeny';

const MNOZNIK = typografia.style.czas.ax5 / typografia.style.czas.pt;

function textyCzasu(tree: renderer.ReactTestRenderer) {
  return tree.root.findAll(
    (n) => typeof n.type === 'string' && StyleSheet.flatten(n.props.style)?.fontSize === typografia.style.czas.pt,
  );
}

describe('201: czas w kroju czasu z ograniczeniem skali', () => {
  it('plan: godzina gotowości ma maxFontSizeMultiplier = 99/56', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TargetReadyCard targetDayOffset={1} onTargetDayOffsetChange={() => {}} targetHour={9} targetMinute={45}
          onAdjustTargetTime={() => {}} formattedDayBadge="Jutro" ambientTemp={22} onAmbientTempChange={() => {}}
          unitSystem="metric" />,
      );
    });
    const czasy = textyCzasu(tree);
    expect(czasy.length).toBeGreaterThan(0);
    for (const c of czasy) expect(c.props.maxFontSizeMultiplier).toBeCloseTo(MNOZNIK, 5);
  });

  it('prowadzenie: czas kroku ma maxFontSizeMultiplier = 99/56', async () => {
    const krok: SessionStep = {
      id: 'bake', name: 'bake', category: 'bake', durationMin: 45, isPassive: false, instructions: '', plannedStart: null, plannedEnd: null,
    };
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <StrefaKroku step={krok} formattedTime="45:00" unitSystem="metric" dutchOvenPhase="lid_on" isCompleted={false}
          onSwitchPhase={() => undefined} onStartPhase2AfterSteamAlert={() => undefined} ostrzezenia={[]} />,
      );
    });
    const czasy = textyCzasu(tree);
    expect(czasy.length).toBeGreaterThan(0);
    for (const c of czasy) expect(c.props.maxFontSizeMultiplier).toBeCloseTo(MNOZNIK, 5);
  });
});

/** Jeden wiersz z dopasowaniem: en-US „9:45 AM” i „1:05:00” po 99 pt przy 320 pt nie mieszczą się w ok. 260 pt pola,
 *  więc tekst zmniejsza się do mieszczącego się rozmiaru zamiast łamać cyfry (reaudit-noc N-2). Najmniejszy rozmiar
 *  nie schodzi poniżej tokenu dużego tytułu. */
function jedenWierszZDopasowaniem(czasy: renderer.ReactTestInstance[]) {
  expect(czasy.length).toBeGreaterThan(0);
  for (const c of czasy) {
    expect(c.props.numberOfLines).toBe(1);
    expect(c.props.adjustsFontSizeToFit).toBe(true);
    expect(c.props.minimumFontScale).toBeGreaterThan(0);
    expect(c.props.minimumFontScale).toBeLessThan(1);
    expect(c.props.minimumFontScale * typografia.style.czas.ax5).toBeGreaterThanOrEqual(typografia.style.tytulDuzy.pt);
  }
}

describe('N-2: czas w jednym wierszu z dopasowaniem rozmiaru', () => {
  it('plan: godzina gotowości (en-US „9:45 AM”)', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TargetReadyCard targetDayOffset={1} onTargetDayOffsetChange={() => {}} targetHour={21} targetMinute={45}
          onAdjustTargetTime={() => {}} formattedDayBadge={`${'Tomorrow'}`} ambientTemp={22} onAmbientTempChange={() => {}}
          unitSystem="imperial" />,
      );
    });
    jedenWierszZDopasowaniem(textyCzasu(tree));
  });

  it('prowadzenie: czas kroku „1:05:00”', async () => {
    const krok: SessionStep = {
      id: 'bake', name: 'bake', category: 'bake', durationMin: 65, isPassive: false, instructions: '', plannedStart: null, plannedEnd: null,
    };
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <StrefaKroku step={krok} formattedTime="1:05:00" unitSystem="metric" dutchOvenPhase="lid_on" isCompleted={false}
          onSwitchPhase={() => undefined} onStartPhase2AfterSteamAlert={() => undefined} ostrzezenia={[]} />,
      );
    });
    jedenWierszZDopasowaniem(textyCzasu(tree));
  });
});
