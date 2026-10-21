/**
 * „Za późno” w planie pojawia się po zmianie godziny „gotowe”. accessibilityLiveRegion działa tylko na Androidzie,
 * więc na iOS VoiceOver nie mówił, że plan się nie mieści. Komponent ogłasza tytuł i treść przez
 * announceForAccessibility przy pojawieniu się i przy zmianie treści [audyt-niezalezny G-8].
 */
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { PlanZaPozno } from '../components/harmonogram/PlanZaPozno';

describe('G-8: „za późno” ogłaszane na iOS', () => {
  it('ogłoszenie przy pojawieniu się i przy zmianie treści, bez powtórki przy tym samym tekście', async () => {
    const spy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<PlanZaPozno tytul="Za późno" tresc="Najwcześniej 10:00" onUstawNajwczesniej={() => {}} />);
    });
    await act(async () => {
      tree.update(<PlanZaPozno tytul="Za późno" tresc="Najwcześniej 10:00" onUstawNajwczesniej={() => {}} />);
    });
    await act(async () => {
      tree.update(<PlanZaPozno tytul="Za późno" tresc="Najwcześniej 11:00" onUstawNajwczesniej={() => {}} />);
    });
    expect(spy.mock.calls).toEqual([['Za późno. Najwcześniej 10:00'], ['Za późno. Najwcześniej 11:00']]);
    spy.mockRestore();
  });
});
