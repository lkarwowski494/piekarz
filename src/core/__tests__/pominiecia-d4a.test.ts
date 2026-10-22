/**
 * „Pomiń” przy zaległym karmieniu (BR-KAL-003, BR-KAL-007, D-094) [M3 D4a]: format zapisu z `unknown`, czyszczenie
 * wpisów starszych niż 14 dni, ostatnie pominięcie zakwasu; termin karmienia wspólny dla powiadomień i kalendarza.
 */
import { dodajPominiecie, idPominieciaKarmienia, oczyscPominiecia, parsujPominiecia, pominietoKarmienieAt } from '../pominiecia';
import { punktOdniesieniaKarmienia, terminKarmienia } from '../notification-feeding';
import { planFeedingNotifications, type PlanStarter } from '../notification-plan';
import { wStrefie } from './helpers/strefa';

const H = 3_600_000;
const lok = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();

describe('pominięcia (Europe/Warsaw)', () => {
  wStrefie('Europe/Warsaw');
  // Chwila liczona po ustawieniu strefy (beforeAll wStrefie), nie przy ładowaniu pliku: inny plik w tym samym procesie
  // mógł zostawić inną strefę (jak abbc726)
  let now = 0;
  beforeAll(() => {
    now = lok(2026, 10, 22, 8);
  });

  it('parsujPominiecia: JSON z app_settings jako unknown; złe wpisy i zły JSON pominięte', () => {
    expect(parsujPominiecia(JSON.stringify([{ zdarzenie: 'karmienie:a', at: 5 }, { zdarzenie: 1, at: 2 }, { zdarzenie: 'x', at: Number.NaN }, { zdarzenie: 'y' }, null]))).toEqual([{ zdarzenie: 'karmienie:a', at: 5 }]);
    expect(parsujPominiecia('{nie json')).toEqual([]);
    expect(parsujPominiecia(undefined)).toEqual([]);
    expect(parsujPominiecia('{"zdarzenie":"a","at":1}')).toEqual([]);
  });

  it('BR-KAL-007 czyszczenie wpisów starszych niż 14 dni (dni kalendarza, przez zmianę czasu 25.10)', () => {
    const granica = lok(2026, 10, 8, 8);
    const lista = [
      { zdarzenie: 'karmienie:a', at: granica },
      { zdarzenie: 'karmienie:b', at: granica - 60_000 },
      { zdarzenie: 'karmienie:c', at: lok(2026, 10, 21, 7) },
    ];
    expect(oczyscPominiecia(lista, now).map((p) => p.zdarzenie)).toEqual(['karmienie:a', 'karmienie:c']);
    // 14 dni kalendarza przez zmianę czasu: 2026-11-05 08:00 CET → granica 2026-10-22 08:00 CEST
    expect(oczyscPominiecia([{ zdarzenie: 'z', at: lok(2026, 10, 22, 8) }], lok(2026, 11, 5, 8))).toHaveLength(1);
  });

  it('dodajPominiecie: nowa decyzja zastępuje starszą tego samego zdarzenia i czyści stare wpisy', () => {
    const lista = [{ zdarzenie: 'karmienie:a', at: lok(2026, 10, 21, 7) }, { zdarzenie: 'karmienie:b', at: lok(2026, 10, 1, 7) }];
    expect(dodajPominiecie(lista, { zdarzenie: 'karmienie:a', at: now }, now)).toEqual([{ zdarzenie: 'karmienie:a', at: now }]);
    expect(pominietoKarmienieAt([{ zdarzenie: idPominieciaKarmienia('a'), at: 7 }, { zdarzenie: 'karmienie:b', at: 9 }], 'a')).toBe(7);
    expect(pominietoKarmienieAt([], 'a')).toBeUndefined();
  });

  it('BR-KAL-003 Pomiń karmienie: punkt odniesienia to późniejsze z dokarmienia i pominięcia (D-094); nieczytelne dokarmienie = brak', () => {
    expect(punktOdniesieniaKarmienia({ lastFedAt: 10, pominietoAt: 20 })).toBe(20);
    expect(punktOdniesieniaKarmienia({ lastFedAt: 30, pominietoAt: 20 })).toBe(30);
    expect(punktOdniesieniaKarmienia({ pominietoAt: 20 })).toBe(20);
    expect(punktOdniesieniaKarmienia({ lastFedAt: Number.NaN })).toBeUndefined();
    expect(punktOdniesieniaKarmienia({})).toBeUndefined();
  });

  it('terminKarmienia: blat +12 h, lodówka +7 dni kalendarza, stały dzień po punkcie odniesienia; bez punktu → null', () => {
    const blat: PlanStarter = { id: 'a', name: 'a', storageState: 'ROOM_TEMP' };
    expect(terminKarmienia(blat, lok(2026, 10, 22, 7, 30), now)).toEqual({ at: lok(2026, 10, 22, 19, 30), textKey: 'karmienie.blat' });
    expect(terminKarmienia({ ...blat, storageState: 'FRIDGE' }, lok(2026, 10, 20, 10), now)).toEqual({ at: lok(2026, 10, 27, 10), textKey: 'karmienie.lodowkaTermin' });
    const staly: PlanStarter = { ...blat, storageState: 'FRIDGE', lastFedAt: lok(2026, 10, 18, 10), fridgeFeedDay: { weekday: 7, minuteOfDay: 600 } };
    expect(terminKarmienia(staly, lok(2026, 10, 18, 10), now)).toEqual({ at: lok(2026, 10, 25, 10), textKey: 'karmienie.lodowkaDzien' });
    expect(terminKarmienia(blat, undefined, now)).toBeNull();
  });

  it('BR-KAL-003 Pomiń karmienie w powiadomieniu: termin od chwili pominięcia (RD-32-W7), tylko gdy pominięcie po dokarmieniu', () => {
    const z: PlanStarter = { id: 'a', name: 'a', storageState: 'ROOM_TEMP', lastFedAt: lok(2026, 10, 21, 19) };
    const t = lok(2026, 10, 22, 7, 30);
    expect(planFeedingNotifications([z], t)).toEqual([]);
    expect(planFeedingNotifications([{ ...z, pominietoAt: t }], t).map((p) => p.triggerAt)).toEqual([t + 12 * H]);
    expect(planFeedingNotifications([{ ...z, pominietoAt: lok(2026, 10, 21, 18) }], t)).toEqual([]);
  });
});
