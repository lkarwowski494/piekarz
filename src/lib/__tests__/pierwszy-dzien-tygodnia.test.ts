/**
 * Pierwszy dzień tygodnia z ustawień telefonu z zapasem z regionu (D-090, RD-30, OP-53) [M3 D0]: cienka warstwa
 * nad resolveFirstWeekday; expo-localization podstawione.
 */
import { getCalendars, getLocales } from 'expo-localization';
import { systemFirstWeekday } from '../pierwszy-dzien-tygodnia';

jest.mock('expo-localization', () => ({ getCalendars: jest.fn(), getLocales: jest.fn() }));
const kalendarze = jest.mocked(getCalendars);
const jezyki = jest.mocked(getLocales);

describe('systemFirstWeekday', () => {
  it('ustawienie telefonu wygrywa z regionem (1 = niedziela w PL → niedziela)', () => {
    kalendarze.mockReturnValue([{ firstWeekday: 1 }] as unknown as ReturnType<typeof getCalendars>);
    jezyki.mockReturnValue([{ regionCode: 'PL' }] as unknown as ReturnType<typeof getLocales>);
    expect(systemFirstWeekday()).toBe(0);
  });

  it('puste ustawienie: region (PL poniedziałek, US niedziela)', () => {
    kalendarze.mockReturnValue([{ firstWeekday: null }] as unknown as ReturnType<typeof getCalendars>);
    jezyki.mockReturnValue([{ regionCode: 'PL' }] as unknown as ReturnType<typeof getLocales>);
    expect(systemFirstWeekday()).toBe(1);
    jezyki.mockReturnValue([{ regionCode: 'US' }] as unknown as ReturnType<typeof getLocales>);
    expect(systemFirstWeekday()).toBe(0);
  });

  it('błąd odczytu ustawienia: region; błąd obu odczytów albo brak regionu: poniedziałek', () => {
    kalendarze.mockImplementation(() => {
      throw new Error('brak modułu');
    });
    jezyki.mockReturnValue([{ regionCode: 'US' }] as unknown as ReturnType<typeof getLocales>);
    expect(systemFirstWeekday()).toBe(0);
    jezyki.mockImplementation(() => {
      throw new Error('brak modułu');
    });
    expect(systemFirstWeekday()).toBe(1);
    kalendarze.mockReturnValue([] as unknown as ReturnType<typeof getCalendars>);
    jezyki.mockReturnValue([] as unknown as ReturnType<typeof getLocales>);
    expect(systemFirstWeekday()).toBe(1);
  });
});
