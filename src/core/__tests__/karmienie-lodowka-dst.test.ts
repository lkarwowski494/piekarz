/**
 * Karmienie zakwasu w lodówce przy zmianie czasu (D-093, BR-ZAKW-004 kryt. 1, ZAK-ZAL-012) [M3 D0]: termin „7 dni” to
 * 7 dni KALENDARZA o tej samej godzinie lokalnej, nie 7 × 24 h (te dałyby godzinę przesunięcia). Dotyczy planu
 * powiadomień i karty zakwasu. Blat (12 h) zostaje w godzinach: to odstęp czasu, nie dzień.
 */
import { planFeedingNotifications } from '../notification-plan';
import { FEED_ROOM_TEMP_AFTER_MS } from '../notification-config';
import { stanKartyZakwasu } from '../../lib/zakwas-widok';
import type { StoredStarterEntry } from '../../data/db';
import { wStrefie } from './helpers/strefa';

const H = 3_600_000;
const lok = (y: number, m: number, d: number, h: number, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const sciana = (ms: number) => {
  const d = new Date(ms);
  return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];
};
const wpis = (at: number): StoredStarterEntry => ({ id: 'f', starterId: 's', kind: 'feeding', occurredAt: at, signs: [], createdAt: at, updatedAt: at });

describe.each([
  {
    strefa: 'Europe/Warsaw',
    // [karmienie, oczekiwany termin (ściana), różnica rzeczywista w godzinach]
    przypadki: [
      { fed: [2027, 3, 25, 10], ma: [2027, 4, 1, 10, 0], godz: 7 * 24 - 1 }, // wiosna 2027-03-28
      { fed: [2027, 10, 28, 10], ma: [2027, 11, 4, 10, 0], godz: 7 * 24 + 1 }, // jesień 2027-10-31
      { fed: [2027, 5, 10, 10], ma: [2027, 5, 17, 10, 0], godz: 7 * 24 }, // bez zmiany czasu
    ],
  },
  {
    strefa: 'America/New_York',
    przypadki: [
      { fed: [2027, 3, 11, 10], ma: [2027, 3, 18, 10, 0], godz: 7 * 24 - 1 }, // wiosna 2027-03-14
      { fed: [2027, 11, 4, 10], ma: [2027, 11, 11, 10, 0], godz: 7 * 24 + 1 }, // jesień 2027-11-07
      { fed: [2027, 5, 10, 10], ma: [2027, 5, 17, 10, 0], godz: 7 * 24 },
    ],
  },
])('lodówka 7 dni kalendarza w $strefa', ({ strefa, przypadki }) => {
  wStrefie(strefa);

  it.each(przypadki)('plan powiadomień: karmienie $fed → termin o tej samej godzinie ściennej (rzeczywiście $godz h)', ({ fed, ma, godz }) => {
    const lastFedAt = lok(fed[0], fed[1], fed[2], fed[3]);
    const plan = planFeedingNotifications([{ id: 'b', name: 'B', storageState: 'FRIDGE', lastFedAt }], lastFedAt - H);
    expect(plan).toHaveLength(1);
    expect(sciana(plan[0].triggerAt)).toEqual(ma);
    expect(plan[0].triggerAt - lastFedAt).toBe(godz * H);
  });

  it.each(przypadki)('karta zakwasu: karmienie $fed → następne o tej samej godzinie ściennej, odstęp i postęp z faktycznego czasu', ({ fed, ma, godz }) => {
    const dokarmiono = lok(fed[0], fed[1], fed[2], fed[3]);
    const stan = stanKartyZakwasu({ storageState: 'FRIDGE' }, [wpis(dokarmiono)], dokarmiono + 8 * H);
    expect(sciana(stan.nastepneAt ?? 0)).toEqual(ma);
    expect(stan.odstepMin).toBe(godz * 60);
    expect(stan.postep).toBeCloseTo(8 / godz, 10);
  });

  it('blat zostaje w godzinach: 12 h to czas, nie dzień (także przez zmianę czasu)', () => {
    const lastFedAt = lok(przypadki[0].fed[0], przypadki[0].fed[1], przypadki[0].fed[2], 23);
    const plan = planFeedingNotifications([{ id: 'a', name: 'A', storageState: 'ROOM_TEMP', lastFedAt }], lastFedAt - H);
    expect(plan[0].triggerAt - lastFedAt).toBe(FEED_ROOM_TEMP_AFTER_MS);
    expect(FEED_ROOM_TEMP_AFTER_MS).toBe(12 * H);
  });
});
