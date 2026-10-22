/**
 * Powiadomienia wielu wypieków (M3 D2): identyfikatory per wypiek, nazwa wypieku w parametrach, start zaplanowanych,
 * limit 40 z priorytetem i stały dzień karmienia w lodówce. Czyste funkcje, czas jako argument [BR-KAL-009, BR-KAL-010, BR-KAL-016].
 */
import {
  planBakeNotification,
  planBakeStepNotifications,
  planPlannedStartNotifications,
  planNotifications,
  diffNotifications,
  notificationFingerprint,
  isLegacyBakeNotificationId,
  type PlanBakeSessionWithPlan,
  type PlanPlannedBake,
  type PlanStarter,
  type PlannedNotification,
} from '../notification-plan';
import { planFeedingNotifications, nextFixedFeeding } from '../notification-feeding';
import { MAX_PENDING_NOTIFICATIONS, notifBakePrefix } from '../notification-config';
import type { SessionStep } from '../bake-steps';
import { wStrefie } from './helpers/strefa';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DOBA = 24 * HOUR;
const T0 = Date.UTC(2026, 9, 21, 8, 0); // środa 21.10.2026 10:00 w Warszawie

/** Krok z planu: czas, który kończy się `koniecMin` minut po T0. */
const krok = (i: number, poczatekMin: number, koniecMin: number): SessionStep => ({
  id: `krok_${i}`,
  name: `Krok ${i}`,
  category: 'bulk_ferment',
  durationMin: koniecMin - poczatekMin,
  isPassive: true,
  instructions: '',
  plannedStart: T0 + poczatekMin * MIN,
  plannedEnd: T0 + koniecMin * MIN,
});

/** Wypiek z `ile` krokami co `odstepMin` minut, zaczynający się `przesuniecieMin` po T0; krok 0 trwa. */
function wypiek(id: string, recipeName: string, ile: number, odstepMin: number, przesuniecieMin = 0): PlanBakeSessionWithPlan {
  const steps = Array.from({ length: ile }, (_, i) => krok(i, przesuniecieMin + i * odstepMin, przesuniecieMin + (i + 1) * odstepMin));
  // Krok 1 trwa już teraz: bez powiadomienia o starcie przed godziną planu (D-5)
  steps[0] = { ...steps[0]!, plannedStart: T0 - MIN };
  return { id, recipeName, steps, stepIdx: 0, dutchOvenPhase: 'lid_on', timerEndsAt: steps[0]?.plannedEnd ?? null };
}

const ids = (l: readonly PlannedNotification[]) => l.map((p) => p.id);

describe('D2: identyfikatory powiadomień per wypiek', () => {
  it('BR-KAL-016: dwa wypieki mają rozłączne identyfikatory z id wypieku, bez starych piekarz.krok*', () => {
    const a = planBakeStepNotifications(wypiek('bake_a', 'Chleb', 4, 60), T0, true);
    const b = planBakeStepNotifications(wypiek('bake_b', 'Pizza', 4, 60), T0, true);
    expect(ids(a)).toEqual([
      `${notifBakePrefix('bake_a')}krok`,
      `${notifBakePrefix('bake_a')}krok.1`,
      `${notifBakePrefix('bake_a')}krok.2`,
      `${notifBakePrefix('bake_a')}krok.3`,
    ]);
    expect(new Set([...ids(a), ...ids(b)]).size).toBe(8);
    expect([...ids(a), ...ids(b)].some(isLegacyBakeNotificationId)).toBe(false);
    expect(ids(a)[0]).toBe('piekarz.wypiek.bake_a.krok');
  });

  it('powiadomienie zaplanowane przez wersję 1014 jest zastąpione, nie zdublowane (cancel starych, schedule nowych)', () => {
    const nowe = planBakeStepNotifications(wypiek('bake_a', 'Chleb', 3, 60), T0, false);
    const stare = ['piekarz.krok', 'piekarz.krok.1', 'piekarz.krok.2', 'piekarz.krok.5.pokrywka', 'piekarz.krok.start'];
    const pending = [
      ...stare.map((id) => ({ id, fingerprint: 'stary' })),
      { id: 'piekarz.karmienie.s1.1', fingerprint: null },
      { id: 'inna-aplikacja', fingerprint: null },
    ];
    expect(stare.every(isLegacyBakeNotificationId)).toBe(true);
    expect(isLegacyBakeNotificationId('piekarz.karmienie.s1.1')).toBe(false);
    expect(isLegacyBakeNotificationId('piekarz.wypiek.bake_a.krok')).toBe(false);
    const d = diffNotifications(pending, nowe);
    expect(d.cancel.sort()).toEqual([...stare, 'piekarz.karmienie.s1.1'].sort());
    expect(ids(d.schedule)).toEqual(ids(nowe));
  });

  it('krok planu wypieku ze zdjęciem pokrywki ma identyfikator .pokrywka pod identyfikatorem wypieku', () => {
    const garnek: SessionStep = { ...krok(1, 60, 120), id: 'bake', category: 'bake' };
    const s = wypiek('bake_g', 'Chleb', 2, 60);
    const plan = planBakeStepNotifications({ ...s, steps: [s.steps[0], garnek] }, T0, false);
    expect(ids(plan)).toContain(`${notifBakePrefix('bake_g')}krok.1.pokrywka`);
    expect(ids(plan)).toContain(`${notifBakePrefix('bake_g')}krok.1`);
  });
});

describe('D2: nazwa wypieku w powiadomieniu (BR-KAL-016 Który krok czyj)', () => {
  it('BR-KAL-016: przy dwóch trwających wypiekach każde powiadomienie kroku niesie recipeName swojego wypieku', () => {
    const plan = planNotifications(
      { sessions: [wypiek('bake_a', 'Chleb pszenny', 3, 60), wypiek('bake_b', 'Pizza', 3, 60)], starters: [] },
      T0
    );
    const zNazwa = (prefix: string) => plan.filter((p) => p.id.startsWith(prefix)).map((p) => p.params.recipeName);
    expect(zNazwa(notifBakePrefix('bake_a'))).toEqual(['Chleb pszenny', 'Chleb pszenny', 'Chleb pszenny']);
    expect(zNazwa(notifBakePrefix('bake_b'))).toEqual(['Pizza', 'Pizza', 'Pizza']);
  });

  it('jeden trwający wypiek: bez nazwy w parametrach (treść jak dotąd)', () => {
    const plan = planNotifications({ sessions: [wypiek('bake_a', 'Chleb', 3, 60)], starters: [] }, T0);
    expect(plan.every((p) => p.params.recipeName === undefined)).toBe(true);
    const one = planBakeNotification(wypiek('bake_a', 'Chleb', 3, 60), T0);
    expect(one?.params.recipeName).toBeUndefined();
    expect(one?.id).toBe('piekarz.wypiek.bake_a.krok');
  });

  it('nazwa zmienia odcisk, więc zmiana liczby wypieków przeplanowuje oczekujące z nazwą', () => {
    const jeden = planNotifications({ sessions: [wypiek('bake_a', 'Chleb', 3, 60)], starters: [] }, T0);
    const dwa = planNotifications({ sessions: [wypiek('bake_a', 'Chleb', 3, 60), wypiek('bake_b', 'Pizza', 2, 60)], starters: [] }, T0);
    const pending = jeden.map((p) => ({ id: p.id, fingerprint: notificationFingerprint(p) }));
    // Odcisk z planu jednego wypieku nie pasuje do planu z nazwą: wszystkie powiadomienia wypieku A do ponownego zaplanowania
    const d = diffNotifications(pending, dwa);
    expect(ids(d.schedule).filter((id) => id.startsWith(notifBakePrefix('bake_a'))).length).toBe(jeden.length);
    expect(d.cancel).toEqual([]);
  });
});

describe('D2: start zaplanowanych wypieków (BR-KAL-009)', () => {
  const plan = (id: string, nazwa: string, startMin: number): PlanPlannedBake => ({
    id,
    recipeName: nazwa,
    plannedStartAt: T0 + startMin * MIN,
    steps: [krok(0, startMin, startMin + 30), krok(1, startMin + 30, startMin + 90)],
  });

  it('BR-KAL-009: zaplanowany wypiek ma powiadomienie o starcie pierwszego kroku z nazwą receptury i końcem kroku', () => {
    const [p] = planPlannedStartNotifications([plan('plan_sob', 'Chleb na sobotę', 3 * 24 * 60)], T0);
    expect(p).toEqual({
      id: 'piekarz.wypiek.plan_sob.start',
      kind: 'krok',
      triggerAt: T0 + 3 * 24 * 60 * MIN,
      level: 'active',
      textKey: 'krok.start',
      params: { stepId: 'krok_0', stepName: 'Krok 0', stepEnd: String(T0 + 3 * 24 * 60 * MIN + 30 * MIN), recipeName: 'Chleb na sobotę' },
      route: '/stolnica',
    });
  });

  it('start minął albo plan bez kroków: bez powiadomienia; bez godziny kroku 1 bierze plannedStartAt', () => {
    expect(planPlannedStartNotifications([plan('stary', 'Stary', -5)], T0)).toEqual([]);
    const bezKrokow: PlanPlannedBake = { id: 'pusty', recipeName: 'Pusty', plannedStartAt: T0 + HOUR, steps: [] };
    expect(planPlannedStartNotifications([bezKrokow], T0)).toEqual([]);
    const bezGodzin: PlanPlannedBake = { ...plan('bg', 'Bez godzin', 600), steps: [{ ...krok(0, 0, 30), plannedStart: null, plannedEnd: null }] };
    const [p] = planPlannedStartNotifications([bezGodzin], T0);
    expect(p?.triggerAt).toBe(T0 + 600 * MIN);
    expect(p?.params.stepEnd).toBeUndefined();
  });

  it('planNotifications dodaje starty zaplanowanych do powiadomień trwających wypieków', () => {
    const l = planNotifications(
      { sessions: [wypiek('bake_a', 'Chleb', 2, 60)], planned: [plan('plan_1', 'Pizza', 24 * 60), plan('plan_2', 'Bagietki', 48 * 60)], starters: [] },
      T0
    );
    expect(ids(l)).toEqual([
      'piekarz.wypiek.bake_a.krok',
      'piekarz.wypiek.bake_a.krok.1',
      'piekarz.wypiek.plan_1.start',
      'piekarz.wypiek.plan_2.start',
    ]);
  });
});

describe('D2: limit oczekujących 40 z priorytetem', () => {
  const zakwasy = (n: number, storageState: 'ROOM_TEMP' | 'FRIDGE', lastFedAt: number): PlanStarter[] =>
    Array.from({ length: n }, (_, i) => ({ id: `z${i}`, name: `Z${i}`, storageState, lastFedAt: lastFedAt - i * MIN }));

  it('limit to 40 (iOS trzyma 64)', () => {
    expect(MAX_PENDING_NOTIFICATIONS).toBe(40);
  });

  it('dwa wypieki po ok. 15 powiadomień i 3 zakwasy: najwyżej 40, nic z najbliższych 24 h nie wypada', () => {
    const a = wypiek('bake_a', 'Chleb', 15, 60);
    const b = wypiek('bake_b', 'Pizza', 15, 60, 30);
    const starters = zakwasy(3, 'ROOM_TEMP', T0);
    const wszystko = [...planBakeStepNotifications(a, T0, true), ...planBakeStepNotifications(b, T0, true), ...planFeedingNotifications(starters, T0)];
    const plan = planNotifications({ sessions: [a, b], starters }, T0);
    expect(plan.length).toBeLessThanOrEqual(MAX_PENDING_NOTIFICATIONS);
    const bliskie = wszystko.filter((p) => p.triggerAt <= T0 + DOBA).map((p) => p.id).sort();
    expect(bliskie.length).toBeGreaterThanOrEqual(30);
    expect(plan.map((p) => p.id).filter((id) => bliskie.includes(id)).sort()).toEqual(bliskie);
  });

  it('nadmiar: najbliższe kroki obu wypieków przed startami zaplanowanych i karmieniami; wynik uporządkowany po czasie', () => {
    // Dwa wypieki po 25 kroków co 4 h (ok. 100 h), 5 startów zaplanowanych za 3 dni, 10 zakwasów w lodówce (termin za 7 dni)
    const a = wypiek('bake_a', 'Chleb', 25, 240);
    const b = wypiek('bake_b', 'Pizza', 25, 240, 120);
    const planned = Array.from({ length: 5 }, (_, i): PlanPlannedBake => ({
      id: `plan_${i}`, recipeName: `P${i}`, plannedStartAt: T0 + (72 + i) * HOUR, steps: [krok(0, (72 + i) * 60, (72 + i) * 60 + 30)],
    }));
    const starters = zakwasy(10, 'FRIDGE', T0);
    const plan = planNotifications({ sessions: [a, b], planned, starters }, T0);
    expect(plan).toHaveLength(MAX_PENDING_NOTIFICATIONS);
    expect(plan.map((p) => p.triggerAt)).toEqual([...plan.map((p) => p.triggerAt)].sort((x, y) => x - y));
    // Bliskie 24 h obu wypieków są wszystkie (6 + 6 kroków z oknem 24 h)
    const krokiBliskie = [...planBakeStepNotifications(a, T0, true), ...planBakeStepNotifications(b, T0, true)].filter((p) => p.triggerAt <= T0 + DOBA);
    for (const p of krokiBliskie) expect(ids(plan)).toContain(p.id);
    // Kroki wypieków (50) wypełniają limit w całości: starty zaplanowanych i karmienia nie mieszczą się
    expect(plan.every((p) => p.kind === 'krok' && !p.id.endsWith('.start'))).toBe(true);
  });

  it('gdy kroków jest mało: najpierw starty zaplanowanych, potem najbliższe karmienia do limitu', () => {
    const a = wypiek('bake_a', 'Chleb', 12, 240);
    const b = wypiek('bake_b', 'Pizza', 12, 240, 120);
    const planned = Array.from({ length: 5 }, (_, i): PlanPlannedBake => ({
      id: `plan_${i}`, recipeName: `P${i}`, plannedStartAt: T0 + (72 + i) * HOUR, steps: [krok(0, (72 + i) * 60, (72 + i) * 60 + 30)],
    }));
    const starters = zakwasy(15, 'FRIDGE', T0);
    const plan = planNotifications({ sessions: [a, b], planned, starters }, T0);
    const kroki = [...planBakeStepNotifications(a, T0, true), ...planBakeStepNotifications(b, T0, true)];
    expect(plan).toHaveLength(MAX_PENDING_NOTIFICATIONS);
    expect(plan.filter((p) => p.id.endsWith('.start'))).toHaveLength(5);
    expect(plan.filter((p) => p.kind === 'krok' && !p.id.endsWith('.start'))).toHaveLength(kroki.length);
    const karmienia = plan.filter((p) => p.kind === 'karmienie');
    expect(karmienia).toHaveLength(MAX_PENDING_NOTIFICATIONS - 5 - kroki.length);
    // Z karmień zostają te o najwcześniejszym terminie (zakwas z0 karmiony najpóźniej ma termin najpóźniejszy: z9 najwcześniejszy)
    const wszystkie = planFeedingNotifications(starters, T0).sort((x, y) => x.triggerAt - y.triggerAt);
    expect(ids(karmienia)).toEqual(ids(wszystkie.slice(0, karmienia.length)));
  });
});

describe('D2: stały dzień karmienia w lodówce (BR-KAL-010, RD-33)', () => {
  wStrefie('Europe/Warsaw');
  const lokalnie = (r: number, m: number, d: number, h: number, min = 0) => new Date(r, m - 1, d, h, min).getTime();
  const niedziela10 = { weekday: 7, minuteOfDay: 10 * 60 };
  const lodowka = (extra: Partial<PlanStarter> = {}): PlanStarter => ({
    id: 'z1', name: 'Ania', storageState: 'FRIDGE', lastFedAt: lokalnie(2026, 10, 14, 10), fridgeFeedDay: niedziela10, ...extra,
  });

  it('BR-KAL-010: karmienie w niedziele o 10:00: najbliższa niedziela po „teraz”, tekst stałego dnia', () => {
    const teraz = lokalnie(2026, 10, 21, 12); // środa
    const [p] = planFeedingNotifications([lodowka()], teraz);
    expect(p).toEqual(
      expect.objectContaining({ id: 'piekarz.karmienie.z1.1', triggerAt: lokalnie(2026, 10, 25, 10), textKey: 'karmienie.lodowkaDzien', route: '/zakwasy' })
    );
    expect(p?.params).toEqual({ starterName: 'Ania' });
  });

  it('w niedzielę przed 10:00 przypomnienie jest dziś, po 10:00 za tydzień (nie 7 dni od ostatniego karmienia)', () => {
    expect(nextFixedFeeding(niedziela10, null, lokalnie(2026, 10, 25, 9, 59))).toBe(lokalnie(2026, 10, 25, 10));
    expect(nextFixedFeeding(niedziela10, null, lokalnie(2026, 10, 25, 10, 0))).toBe(lokalnie(2026, 11, 1, 10));
    expect(nextFixedFeeding(niedziela10, null, lokalnie(2026, 10, 25, 10, 1))).toBe(lokalnie(2026, 11, 1, 10));
    // ostatnie karmienie dawno temu nie zmienia dnia: zamiast terminu +7 dni od ostatniego
    const [p] = planFeedingNotifications([lodowka({ lastFedAt: lokalnie(2026, 10, 1, 8) })], lokalnie(2026, 10, 21, 12));
    expect(p?.triggerAt).toBe(lokalnie(2026, 10, 25, 10));
  });

  it('karmienie dokładnie w ustawiony dzień (przed godziną przypomnienia) pomija tę niedzielę', () => {
    const teraz = lokalnie(2026, 10, 25, 9, 30);
    expect(nextFixedFeeding(niedziela10, lokalnie(2026, 10, 25, 9, 10), teraz)).toBe(lokalnie(2026, 11, 1, 10));
    expect(nextFixedFeeding(niedziela10, lokalnie(2026, 10, 24, 20), teraz)).toBe(lokalnie(2026, 10, 25, 10));
  });

  it('godzina ścienna zostaje przez jesienną zmianę czasu (25.10.2026) i wiosenną (29.03.2026)', () => {
    expect(nextFixedFeeding(niedziela10, null, Date.UTC(2026, 9, 21, 10, 0))).toBe(Date.UTC(2026, 9, 25, 9, 0)); // 10:00 CET
    expect(nextFixedFeeding(niedziela10, null, Date.UTC(2026, 2, 25, 10, 0))).toBe(Date.UTC(2026, 2, 29, 8, 0)); // 10:00 CEST
    // 02:30 w dniu wiosennej zmiany czasu nie istnieje: przypomnienie o 03:30 (jak D-13)
    const dwaTrzydziesci = { weekday: 7, minuteOfDay: 2 * 60 + 30 };
    expect(nextFixedFeeding(dwaTrzydziesci, null, Date.UTC(2026, 2, 25, 10, 0))).toBe(Date.UTC(2026, 2, 29, 1, 30));
  });

  it('zakwas w trakcie zakładania nie dostaje stałego dnia (RD-31): termin jak dotąd +7 dni; blat bez zmian', () => {
    const teraz = lokalnie(2026, 10, 21, 12);
    const wZakladaniu = lodowka({ setupStartedAt: lokalnie(2026, 10, 18, 9), lastFedAt: lokalnie(2026, 10, 20, 9) });
    const [p] = planFeedingNotifications([wZakladaniu], teraz);
    expect(p).toEqual(expect.objectContaining({ textKey: 'karmienie.lodowkaTermin', triggerAt: lokalnie(2026, 10, 27, 9) }));
    const gotowy = lodowka({ setupStartedAt: lokalnie(2026, 10, 1, 9), setupCompletedAt: lokalnie(2026, 10, 9, 9) });
    expect(planFeedingNotifications([gotowy], teraz)[0]?.textKey).toBe('karmienie.lodowkaDzien');
    const blat = lodowka({ storageState: 'ROOM_TEMP', lastFedAt: teraz });
    expect(planFeedingNotifications([blat], teraz)[0]).toEqual(
      expect.objectContaining({ textKey: 'karmienie.blat', triggerAt: teraz + 12 * HOUR })
    );
  });

  it('bez stałego dnia (null albo brak pola) lodówka działa jak dotąd; ze stałym dniem karmienie nie jest wymagane do przypomnienia', () => {
    const teraz = lokalnie(2026, 10, 21, 12);
    for (const dzien of [null, undefined]) {
      const [p] = planFeedingNotifications([lodowka({ fridgeFeedDay: dzien, lastFedAt: lokalnie(2026, 10, 18, 10) })], teraz);
      expect(p).toEqual(expect.objectContaining({ textKey: 'karmienie.lodowkaTermin', triggerAt: lokalnie(2026, 10, 25, 10) }));
    }
    const bezKarmien = lodowka({ lastFedAt: undefined });
    expect(planFeedingNotifications([bezKarmien], teraz)[0]?.triggerAt).toBe(lokalnie(2026, 10, 25, 10));
  });

  it('niepoprawny dzień (poza 1–7 albo minuta poza dobą) jest pominięty: lodówka wraca do terminu +7 dni', () => {
    const teraz = lokalnie(2026, 10, 21, 12);
    expect(nextFixedFeeding({ weekday: 0, minuteOfDay: 600 }, null, teraz)).toBeNull();
    expect(nextFixedFeeding({ weekday: 8, minuteOfDay: 600 }, null, teraz)).toBeNull();
    expect(nextFixedFeeding({ weekday: 7, minuteOfDay: 1440 }, null, teraz)).toBeNull();
    expect(nextFixedFeeding({ weekday: 7.5, minuteOfDay: 600 }, null, teraz)).toBeNull();
    const [p] = planFeedingNotifications([lodowka({ fridgeFeedDay: { weekday: 9, minuteOfDay: 0 }, lastFedAt: lokalnie(2026, 10, 18, 10) })], teraz);
    expect(p?.textKey).toBe('karmienie.lodowkaTermin');
  });
});
