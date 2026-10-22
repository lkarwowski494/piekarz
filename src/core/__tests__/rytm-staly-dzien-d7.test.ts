/**
 * M3 D7: podpowiedź rytmu z historii (BR-KAL-014; recipe_id z D1, D-10) i stały dzień karmienia (BR-KAL-010:
 * dostępność ustawienia i decyzja po karmieniu w inny dzień; ZAK-ZAL-012, RD-31). Dzień wpisu w strefie urządzenia.
 */
import { dzienRytmu, przesuniecieRytmu, type WpisRytmu } from '../rytm-wypiekow';
import { dostepnoscStalegoDnia, stalyDzienPoDecyzji, type DecyzjaStalegoDnia, type DostepnoscStalegoDnia } from '../staly-dzien';
import { OKNO_RYTMU, PROG_RYTMU, STALY_DZIEN_OD_DNI, ZASIEG_DNI_PLANU } from '../kalendarz-config';
import type { PlanStarter } from '../notification-plan';
import { wStrefie } from './helpers/strefa';

const H = 3_600_000;
const lok = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();
/** Wpis zakończony danego dnia o 15:00 (start 8 h wcześniej). */
const wpis = (y: number, m: number, d: number, recipeId?: string, h = 15): WpisRytmu => ({ startedAt: lok(y, m, d, h) - 8 * H, finishedAt: lok(y, m, d, h), ...(recipeId ? { recipeId } : {}) });
const SOBOTA = 6;
const NIEDZIELA = 0;

describe('BR-KAL-014 podpowiedź rytmu z historii (Europe/Warsaw)', () => {
  wStrefie('Europe/Warsaw');

  it('BR-KAL-014 Zwykle w sobotę: ostatnie cztery wypieki zakończyły się w sobotę → sobota; w środę propozycja za 3 dni', () => {
    const wpisy = [wpis(2026, 10, 17), wpis(2026, 10, 10), wpis(2026, 10, 3), wpis(2026, 9, 26)];
    expect(dzienRytmu(wpisy)).toBe(SOBOTA);
    expect(przesuniecieRytmu(SOBOTA, lok(2026, 10, 21, 9))).toBe(3);
  });

  it('BR-KAL-014 próg: 3 z 4 ostatnich w sobotę → sobota; 2 z 4 → brak; mniej niż PROG_RYTMU wpisów → brak', () => {
    expect(OKNO_RYTMU).toBe(4);
    expect(PROG_RYTMU).toBe(3);
    expect(dzienRytmu([wpis(2026, 10, 17), wpis(2026, 10, 11), wpis(2026, 10, 3), wpis(2026, 9, 26)])).toBe(SOBOTA);
    expect(dzienRytmu([wpis(2026, 10, 17), wpis(2026, 10, 11), wpis(2026, 10, 4), wpis(2026, 9, 26)])).toBeNull();
    expect(dzienRytmu([wpis(2026, 10, 17), wpis(2026, 10, 10)])).toBeNull();
    expect(dzienRytmu([])).toBeNull();
  });

  it('BR-KAL-014 liczą się tylko OKNO_RYTMU najnowsze (kolejność wpisów dowolna): stare soboty nie przeważają nowych niedziel', () => {
    const niedziele = [wpis(2026, 10, 18), wpis(2026, 10, 11), wpis(2026, 10, 4), wpis(2026, 9, 27)];
    const stareSoboty = [wpis(2026, 6, 6), wpis(2026, 6, 13), wpis(2026, 6, 20), wpis(2026, 6, 27), wpis(2026, 7, 4)];
    expect(dzienRytmu([...stareSoboty, ...niedziele])).toBe(NIEDZIELA);
  });

  it('BR-KAL-014 recipe_id: przy co najmniej PROG_RYTMU wypiekach receptury liczy się jej rytm; mniej — wszystkie wypieki', () => {
    const pizza = [wpis(2026, 10, 16, 'pizza'), wpis(2026, 10, 9, 'pizza'), wpis(2026, 10, 2, 'pizza')]; // piątki
    const chleb = [wpis(2026, 10, 17, 'chleb'), wpis(2026, 10, 10, 'chleb'), wpis(2026, 10, 3, 'chleb'), wpis(2026, 9, 26, 'chleb')];
    expect(dzienRytmu([...pizza, ...chleb], 'pizza')).toBe(5);
    expect(dzienRytmu([...pizza, ...chleb], 'chleb')).toBe(SOBOTA);
    // Nowa receptura bez historii: rytm wszystkich (ostatnie 4: pt, sob, pt, sob → brak przewagi 3)
    expect(dzienRytmu([...pizza, ...chleb], 'nowa')).toBeNull();
    expect(dzienRytmu(chleb, null)).toBe(SOBOTA);
  });

  it('BR-KAL-014 dzień lokalny końca (RD-29): koniec w sobotę 23:30 to sobota; bez końca liczy się start; nieczytelny wpis pominięty', () => {
    const wpisy: WpisRytmu[] = [
      { startedAt: lok(2026, 10, 24, 15), finishedAt: lok(2026, 10, 24, 23, 30) },
      { startedAt: lok(2026, 10, 17, 9) },
      wpis(2026, 10, 10),
      { startedAt: Number.NaN, finishedAt: Number.NaN },
      wpis(2026, 10, 3),
    ];
    expect(dzienRytmu(wpisy)).toBe(SOBOTA);
  });

  it('przesunięcie: zawsze 1–7 dni (w zasięgu planu), w sam dzień rytmu — za tydzień', () => {
    expect(przesuniecieRytmu(SOBOTA, lok(2026, 10, 24, 9))).toBe(7);
    expect(przesuniecieRytmu(NIEDZIELA, lok(2026, 10, 24, 9))).toBe(1);
    expect(przesuniecieRytmu(5, lok(2026, 10, 24, 9))).toBe(6);
    expect(7).toBeLessThan(ZASIEG_DNI_PLANU);
  });
});

describe('BR-KAL-014 dzień lokalny w America/New_York', () => {
  wStrefie('America/New_York');

  it('BR-KAL-014 ta sama chwila UTC to piątek wieczorem w Nowym Jorku (w Warszawie już sobota) → piątek', () => {
    // 2026-10-17 00:30 UTC = piątek 16.10 20:30 EDT
    const wpisy = [0, 7, 14, 21].map((d) => ({ startedAt: Date.UTC(2026, 9, 17 - d, 0, 30) - 8 * H, finishedAt: Date.UTC(2026, 9, 17 - d, 0, 30) }));
    expect(dzienRytmu(wpisy)).toBe(5);
  });
});

describe('BR-KAL-010 stały dzień karmienia: dostępność i decyzja (Europe/Warsaw)', () => {
  wStrefie('Europe/Warsaw');
  const zakwas = (x: Partial<PlanStarter> = {}): PlanStarter => ({ id: 'z', name: 'Żytni', storageState: 'FRIDGE', ...x });
  const now = lok(2026, 10, 23, 12);

  it('BR-KAL-010 Zakwas w trakcie zakładania (5. dzień, RD-31): ustawienie niedostępne — zakładanie', () => {
    expect(dostepnoscStalegoDnia(zakwas({ setupStartedAt: lok(2026, 10, 19, 9) }), now)).toBe('zakladanie');
  });

  it(`BR-KAL-010 zakładanie skończone, ale od założenia mniej niż ${STALY_DZIEN_OD_DNI} dni → za wcześnie; od ${STALY_DZIEN_OD_DNI} dni kalendarza → dostępny`, () => {
    const start = lok(2026, 10, 16, 21);
    const gotowy = { setupStartedAt: start, setupCompletedAt: lok(2026, 10, 22, 9) };
    expect(dostepnoscStalegoDnia(zakwas(gotowy), lok(2026, 10, 22, 23, 59))).toBe('za-wczesnie');
    expect(dostepnoscStalegoDnia(zakwas(gotowy), lok(2026, 10, 23, 0, 0))).toBe('dostepny');
  });

  it('BR-KAL-010 zakwas dodany jako gotowy (bez zakładania w aplikacji) w lodówce → dostępny; na blacie → nie-lodówka', () => {
    expect(dostepnoscStalegoDnia(zakwas(), now)).toBe('dostepny');
    expect(dostepnoscStalegoDnia(zakwas({ storageState: 'ROOM_TEMP' }), now)).toBe('nie-lodowka');
    expect(dostepnoscStalegoDnia(zakwas({ setupStartedAt: Number.NaN }), now)).toBe('dostepny');
  });

  it('BR-KAL-010 Karmienie w inny dzień: „zostaw” — niedziela 10:00; „licz od” — piątek 10:00; bez stałego dnia — null', () => {
    const niedziela = { weekday: 7, minuteOfDay: 600 };
    const piatek = lok(2026, 10, 23, 18);
    expect(stalyDzienPoDecyzji(zakwas({ fridgeFeedDay: niedziela }), piatek, 'zostaw')).toEqual(niedziela);
    expect(stalyDzienPoDecyzji(zakwas({ fridgeFeedDay: niedziela }), piatek, 'licz-od')).toEqual({ weekday: 5, minuteOfDay: 600 });
    expect(stalyDzienPoDecyzji(zakwas(), piatek, 'licz-od')).toBeNull();
    expect(stalyDzienPoDecyzji(zakwas({ fridgeFeedDay: niedziela }), lok(2026, 10, 25, 9), 'licz-od')).toEqual({ weekday: 7, minuteOfDay: 600 });
  });

  it('BR-KAL-010 wszystkie stany dostępności i obie decyzje są osiągalne (DostepnoscStalegoDnia, DecyzjaStalegoDnia)', () => {
    const stany: DostepnoscStalegoDnia[] = [
      dostepnoscStalegoDnia(zakwas(), now),
      dostepnoscStalegoDnia(zakwas({ storageState: 'ROOM_TEMP' }), now),
      dostepnoscStalegoDnia(zakwas({ setupStartedAt: lok(2026, 10, 20) }), now),
      dostepnoscStalegoDnia(zakwas({ setupStartedAt: lok(2026, 10, 20), setupCompletedAt: lok(2026, 10, 22) }), now),
    ];
    expect(stany).toEqual(['dostepny', 'nie-lodowka', 'zakladanie', 'za-wczesnie']);
    const decyzje: DecyzjaStalegoDnia[] = ['zostaw', 'licz-od'];
    const s = zakwas({ fridgeFeedDay: { weekday: 1, minuteOfDay: 480 } });
    expect(decyzje.map((d) => stalyDzienPoDecyzji(s, lok(2026, 10, 23, 18), d)?.weekday)).toEqual([1, 5]);
  });
});
