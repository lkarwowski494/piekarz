/**
 * Termin karmienia zakwasu w trakcie zakładania (M3 D4b, zgłoszenie z D4a, D-106 pkt 7): karta zakwasu, powiadomienie
 * i kalendarz pokazują ten sam termin według rytmu zakładania z D0b — dni 1–2 następne dokarmienie po 24 h
 * (ZAK-ZAL-002, ZAK-ZAL-003), od dnia 3 co 12 h (ZAK-ZAL-004); rola 06 potwierdziła ZAK-ZAL-002/003/004.
 * BR-KAL-002 „Ten sam termin co powiadomienie”. Chwile liczone po ustawieniu strefy.
 */
import { terminKarmienia, planFeedingNotifications } from '../notification-feeding';
import type { PlanStarter } from '../notification-plan';
import { zdarzeniaKalendarza, type DaneKalendarza } from '../kalendarz-zdarzenia';
import { nextSetupFeedingAtForStage, setupDay, setupStageForDay, SETUP_FEED_INTERVAL_EARLY_H, SETUP_FEED_INTERVAL_H } from '../starter-log';
import { stanKartyZakwasu } from '../../lib/zakwas-widok';
import type { StoredStarterEntry } from '../../data/db';
import { wStrefie } from './helpers/strefa';

const H = 3_600_000;
const lok = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const BRAK: DaneKalendarza = { wypieki: [], zaplanowane: [], zakwasy: [], wpisyZakwasow: [], dziennik: [], pominiecia: [], dostep: { terminyKarmienia: true, przyszleWypieki: true } };
const wpis = (at: number): StoredStarterEntry => ({ id: `f-${at}`, starterId: 'z', kind: 'feeding', occurredAt: at, signs: [], createdAt: at, updatedAt: at });

/** Ten sam termin w trzech miejscach: karta (stanKartyZakwasu), powiadomienie (planFeedingNotifications), kalendarz. */
function trzyTerminy(s: PlanStarter, now: number) {
  const karta = stanKartyZakwasu(s, [wpis(s.lastFedAt ?? 0)], now).nastepneAt;
  const powiadomienie = planFeedingNotifications([s], now)[0]?.triggerAt ?? null;
  const kalendarz = zdarzeniaKalendarza({ ...BRAK, zakwasy: [s] }, now).find((z) => z.rodzaj === 'karmienie-nastepne')?.at ?? null;
  return { karta, powiadomienie, kalendarz };
}

describe('termin karmienia w zakładaniu: karta = powiadomienie = kalendarz (Europe/Warsaw)', () => {
  wStrefie('Europe/Warsaw');

  it('BR-KAL-002 Ten sam termin co powiadomienie: dzień 1 zakładania — +24 h (ZAK-ZAL-002)', () => {
    const start = lok(2026, 10, 20, 21);
    const s: PlanStarter = { id: 'z', name: 'Nowy', storageState: 'ROOM_TEMP', lastFedAt: start, setupStartedAt: start };
    const now = lok(2026, 10, 20, 22);
    expect(setupDay(start, now)).toBe(1);
    const t = trzyTerminy(s, now);
    expect(t).toEqual({ karta: start + 24 * H, powiadomienie: start + 24 * H, kalendarz: start + 24 * H });
    expect(terminKarmienia(s, start, now)).toEqual({ at: start + SETUP_FEED_INTERVAL_EARLY_H * H, textKey: 'karmienie.blat' });
  });

  it('BR-KAL-002 Ten sam termin co powiadomienie: dzień 2 zakładania — +24 h (ZAK-ZAL-003)', () => {
    const start = lok(2026, 10, 20, 21);
    const fed = lok(2026, 10, 21, 20);
    const s: PlanStarter = { id: 'z', name: 'Nowy', storageState: 'ROOM_TEMP', lastFedAt: fed, setupStartedAt: start };
    const now = lok(2026, 10, 21, 21);
    expect(setupDay(start, now)).toBe(2);
    expect(trzyTerminy(s, now)).toEqual({ karta: fed + 24 * H, powiadomienie: fed + 24 * H, kalendarz: fed + 24 * H });
    expect(nextSetupFeedingAtForStage(setupStageForDay(2), [wpis(fed)])).toBe(fed + 24 * H);
  });

  it('BR-KAL-002 Ten sam termin co powiadomienie: od dnia 3 — +12 h (ZAK-ZAL-004)', () => {
    const start = lok(2026, 10, 20, 21);
    const fed = lok(2026, 10, 22, 8);
    const s: PlanStarter = { id: 'z', name: 'Nowy', storageState: 'ROOM_TEMP', lastFedAt: fed, setupStartedAt: start };
    const now = lok(2026, 10, 22, 9);
    expect(setupDay(start, now)).toBe(3);
    expect(trzyTerminy(s, now)).toEqual({ karta: fed + 12 * H, powiadomienie: fed + 12 * H, kalendarz: fed + 12 * H });
    expect(terminKarmienia(s, fed, now)?.at).toBe(fed + SETUP_FEED_INTERVAL_H * H);
  });

  it('zakwas po zakładaniu (koniec zapisany) na blacie: dalej 12 h jak przed zmianą', () => {
    const fed = lok(2026, 10, 22, 8);
    const s: PlanStarter = { id: 'z', name: 'Stary', storageState: 'ROOM_TEMP', lastFedAt: fed, setupStartedAt: lok(2026, 10, 1), setupCompletedAt: lok(2026, 10, 9) };
    expect(terminKarmienia(s, fed, lok(2026, 10, 22, 9))?.at).toBe(fed + 12 * H);
  });

  it('„Pomiń” w dniu 1 zakładania: termin od chwili pominięcia, w rytmie dnia (24 h, D-094)', () => {
    const start = lok(2026, 10, 20, 9);
    const pominieto = lok(2026, 10, 21, 10);
    const s: PlanStarter = { id: 'z', name: 'Nowy', storageState: 'ROOM_TEMP', lastFedAt: start, setupStartedAt: start, pominietoAt: pominieto };
    // dzień 2: od pominięcia +24 h
    expect(planFeedingNotifications([s], lok(2026, 10, 21, 11))[0]?.triggerAt).toBe(pominieto + 24 * H);
  });
});
