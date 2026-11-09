/**
 * BR-KAL-001 Północ [M1-audytor-generalny-025; 08-programista-002]: pasek tygodnia na „Dziś” nie zostaje na starym
 * tygodniu po północy z niedzieli na poniedziałek — widok „bieżący”, dopóki użytkownik nie przesunie tygodnia.
 * Pierwszy dzień tygodnia poniedziałek (2) i niedziela (1) z `getCalendars` (systemFirstWeekday).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { getCalendars } from 'expo-localization';
import { useKalendarz, type StanKalendarza } from '../hooks/useKalendarz';
import { _resetMemStore, initDatabase } from '../data/sqlite-store';
import { localDateKey } from '../core/dzien-lokalny';

jest.mock('expo-localization', () => ({ getCalendars: jest.fn(), getLocales: () => [{ languageTag: 'pl-PL', languageCode: 'pl', regionCode: 'PL' }] }));
const kalendarze = jest.mocked(getCalendars);

let stan: StanKalendarza | null = null;
function Sonda() {
  stan = useKalendarz(0);
  return null;
}

const NIEDZIELA_2359 = new Date(2026, 10, 8, 23, 59).getTime(); // niedziela 8 listopada 2026
const PONIEDZIALEK = new Date(2026, 10, 9, 0, 1);

describe.each([2, 1])('M1-audytor-generalny-025: północ niedziela→poniedziałek (pierwszy dzień %i)', (firstWeekday) => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(NIEDZIELA_2359);
    kalendarze.mockReturnValue([{ firstWeekday }] as unknown as ReturnType<typeof getCalendars>);
    _resetMemStore();
    await initDatabase();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('po minucie zegara pasek pokazuje tydzień z poniedziałkiem jako dziś, bez przycisku „Dziś”', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<Sonda />);
    });
    expect(stan?.dni.find((d) => d.dzis)?.klucz).toBe(localDateKey(NIEDZIELA_2359));
    await act(async () => {
      jest.setSystemTime(PONIEDZIALEK);
      jest.advanceTimersByTime(60_000);
    });
    expect(stan?.dni.find((d) => d.dzis)?.klucz).toBe(localDateKey(PONIEDZIALEK.getTime()));
    expect(stan?.widok.biezacy).toBe(true);
    act(() => tree.unmount());
  });

  it('przesunięty tydzień zostaje przesunięty po północy', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<Sonda />);
    });
    act(() => stan?.widok.przesun(1));
    const przed = stan?.dni.map((d) => d.klucz);
    await act(async () => {
      jest.setSystemTime(PONIEDZIALEK);
      jest.advanceTimersByTime(60_000);
    });
    expect(stan?.dni.map((d) => d.klucz)).toEqual(przed);
    act(() => tree.unmount());
  });
});
