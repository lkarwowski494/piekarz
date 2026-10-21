/**
 * Pasek „Cofnij” przy czytniku ekranu (VoiceOver): nie znika sam po PASEK_COFNIJ_MS, bo użytkownik czytnika potrzebuje
 * więcej czasu, żeby dojść do „Przywróć” (WCAG 2.2.1 Timing Adjustable) [audyt-niezalezny B-9]. Bez czytnika — jak dotąd.
 * Zdanie paska jest ogłaszane w obu przypadkach.
 */
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { PasekCofnij, PASEK_COFNIJ_MS } from '../PasekCofnij';

describe('PasekCofnij i czytnik ekranu (B-9)', () => {
  let sluchacz: ((v: boolean) => void) | null = null;
  beforeEach(() => {
    jest.useFakeTimers();
    sluchacz = null;
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((_e: string, fn: (v: boolean) => void) => {
      sluchacz = fn;
      return { remove: () => undefined };
    }) as unknown as typeof AccessibilityInfo.addEventListener);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  async function pokaz(czytnik: boolean) {
    jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(czytnik);
    const onUkryj = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<PasekCofnij tekst="Usunięto wpis" onPrzywroc={() => undefined} onUkryj={onUkryj} />);
    });
    return { onUkryj, tree };
  }

  it('z VoiceOver pasek zostaje dłużej niż PASEK_COFNIJ_MS i jest ogłoszony', async () => {
    const { onUkryj, tree } = await pokaz(true);
    act(() => {
      jest.advanceTimersByTime(PASEK_COFNIJ_MS * 20);
    });
    expect(onUkryj).not.toHaveBeenCalled();
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Usunięto wpis');
    act(() => tree.unmount());
  });

  it('bez czytnika pasek znika po PASEK_COFNIJ_MS; wyłączenie czytnika w trakcie wraca do odliczania', async () => {
    const { onUkryj, tree } = await pokaz(false);
    act(() => {
      jest.advanceTimersByTime(PASEK_COFNIJ_MS);
    });
    expect(onUkryj).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());

    const drugi = await pokaz(true);
    act(() => sluchacz?.(false));
    act(() => {
      jest.advanceTimersByTime(PASEK_COFNIJ_MS);
    });
    expect(drugi.onUkryj).toHaveBeenCalledTimes(1);
    act(() => drugi.tree.unmount());
  });
});
