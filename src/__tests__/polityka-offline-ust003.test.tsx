/**
 * BR-UST-003, scenariusz „Brak sieci” (07-jakosc-001, D-131 a, D-132): w Ustawieniach obok linku
 * „Polityka prywatności” widać krótkie streszczenie i adres strony jako zwykły tekst, bez żadnego
 * połączenia. Treść streszczenia to dosłownie sekcja „W skrócie” polityki (apps4brew-www @ fb85d20,
 * piekarz/privacy.html); nie dopisujemy własnych twierdzeń.
 */
jest.mock('expo-mail-composer', () => ({
  isAvailableAsync: jest.fn(async () => true),
  composeAsync: jest.fn(async () => ({ status: 'sent' })),
}));

import React from 'react';
import { Linking } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { StudioEcosystemSection } from '../components/settings/StudioEcosystemSection';
import { PRIVACY_URL } from '../lib/links';
import { t } from '../lib/i18n';

const STRESZCZENIE_PL =
  'Aplikacja Piekarz nie zbiera żadnych danych. Wszystko, co wpisujesz, zostaje na Twoim iPhonie. Aplikacja nie łączy się z internetem, nie ma konta, reklam, analityki ani śledzenia.';

const teksty = (tree: renderer.ReactTestRenderer): string[] =>
  tree.root.findAll((n) => (n.type as unknown) === 'Text').map((n) => [n.props.children].flat().join(''));

describe('BR-UST-003 Brak sieci: streszczenie i adres polityki w aplikacji', () => {
  let otworz: jest.SpyInstance;
  let fetchSpy: jest.Mock;
  beforeEach(() => {
    // Brak sieci: iOS otwiera Safari, które nie ma czego pokazać; aplikacja nie woła fetch wcale.
    otworz = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);
    fetchSpy = jest.fn();
    (globalThis as { fetch?: unknown }).fetch = fetchSpy;
  });
  afterEach(() => {
    otworz.mockRestore();
    delete (globalThis as { fetch?: unknown }).fetch;
  });

  const render = () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StudioEcosystemSection />);
    });
    return tree;
  };

  it('streszczenie (3 zdania z polityki) i adres są widoczne bez sieci, link zostaje', async () => {
    const tree = render();
    const widoczne = teksty(tree);
    expect(widoczne).toContain(t(STRESZCZENIE_PL));
    expect(t(STRESZCZENIE_PL)).toBe(STRESZCZENIE_PL);
    expect(widoczne).toContain(PRIVACY_URL);
    expect(tree.root.findByProps({ testID: 'settings-privacy-link' }).props.accessibilityRole).toBe('link');
    // Naciśnięcie linku bez sieci nie zabiera treści z ekranu.
    await act(async () => {
      tree.root.findByProps({ testID: 'settings-privacy-link' }).props.onPress();
    });
    expect(otworz).toHaveBeenCalledWith(PRIVACY_URL);
    expect(teksty(tree)).toEqual(expect.arrayContaining([STRESZCZENIE_PL, PRIVACY_URL]));
    expect(fetchSpy).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it('adres da się zaznaczyć, a streszczenie ma 3 zdania', () => {
    const tree = render();
    const adres = tree.root.findByProps({ testID: 'settings-privacy-url' });
    expect(adres.props.selectable).toBe(true);
    expect(STRESZCZENIE_PL.split(/(?<=\.)\s/)).toHaveLength(3);
    act(() => tree.unmount());
  });
});
