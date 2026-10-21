/**
 * Po „Zrobione” (albo „Cofnij poprzedni”) ekran prowadzenia pokazuje nowy krok, ale VoiceOver zostawał na przycisku
 * i nie mówił, co jest teraz do zrobienia. Strefa kroku ogłasza nazwę nowego kroku przy każdej zmianie kroku
 * (bez ogłoszenia przy pierwszym wejściu na ekran, gdy fokus i tak czyta tytuł) [audyt-niezalezny G-1].
 */
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { StrefaKroku } from '../components/stolnica/StrefaKroku';
import type { SessionStep } from '../core/bake-steps';
import { t } from '../lib/i18n';

const krok = (id: string, name: string): SessionStep => ({
  id, name, category: 'autolyse', durationMin: 30, isPassive: true, instructions: '', plannedStart: null, plannedEnd: null,
});

function strefa(step: SessionStep) {
  return (
    <StrefaKroku step={step} formattedTime="30:00" unitSystem="metric" dutchOvenPhase="lid_on" isCompleted={false}
      onSwitchPhase={() => undefined} onStartPhase2AfterSteamAlert={() => undefined} ostrzezenia={[]} />
  );
}

describe('G-1: ogłoszenie nowego kroku w prowadzeniu', () => {
  it('pierwsze wejście bez ogłoszenia; zmiana kroku ogłasza „Teraz: {nazwa}” raz', async () => {
    const spy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(strefa(krok('a', 'Autoliza')));
    });
    expect(spy).not.toHaveBeenCalled();
    await act(async () => {
      tree.update(strefa(krok('b', 'Składanie')));
    });
    await act(async () => {
      tree.update(strefa(krok('b', 'Składanie')));
    });
    expect(spy.mock.calls).toEqual([['Teraz: Składanie']]);
    expect(spy.mock.calls[0][0]).toBe(t('Teraz: {nazwa}', { nazwa: 'Składanie' }));
    spy.mockRestore();
  });
});
