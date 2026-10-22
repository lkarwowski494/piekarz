/**
 * W-fix2, 04-studio-projektowe-007 opcja (b) wg rekomendacji (M1): przy zaległym kroku wypieku na „Dziś” przycisk
 * nie odhacza kroku, tylko otwiera Stolnicę (albo arkusz planu), więc mówi „Otwórz”, nie „Zrobione”; etykieta VoiceOver
 * też. Karmienie zakwasu bez zmian („Zrobione” zapisuje dokarmienie). Zachowanie przycisku bez zmian.
 */
import { setLang } from '../i18n';
import { EN } from '../i18n.en';
import { etykietyZaleglego, napisyZaleglego } from '../kalendarz-teksty';
import { zdarzeniaKalendarza, type DaneKalendarza, type KalendarzWypiek } from '../../core/kalendarz-zdarzenia';
import { liniaNastepne } from '../../core/kalendarz-nastepne';
import type { PlanStarter } from '../../core/notification-plan';
import { wStrefie } from '../../core/__tests__/helpers/strefa';

const H = 3_600_000;
const lok = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const BRAK: DaneKalendarza = { wypieki: [], zaplanowane: [], zakwasy: [], wpisyZakwasow: [], dziennik: [], pominiecia: [], dostep: { terminyKarmienia: true, przyszleWypieki: true } };
const wypiek = (id: string, steps: KalendarzWypiek['steps']): KalendarzWypiek => ({
  id, recipeName: id, steps, stepIdx: 0, timerEndsAt: null, pausedLeftSec: null, zaczetyZDostepem: true,
});
const naBlacie = (name: string, termin: number): PlanStarter => ({ id: name, name, storageState: 'ROOM_TEMP', lastFedAt: termin - 12 * H });

describe('007: „Otwórz” przy zaległym kroku wypieku', () => {
  wStrefie('Europe/Warsaw');
  afterEach(() => setLang('pl'));

  const now = lok(2026, 10, 23, 12);
  const d: DaneKalendarza = {
    ...BRAK,
    wypieki: [wypiek('chleb', [{ id: 'm', name: 'Mieszanie', plannedStart: lok(2026, 10, 23, 9), plannedEnd: lok(2026, 10, 23, 10) }])],
    zakwasy: [naBlacie('A', lok(2026, 10, 23, 8))],
  };
  const zalegle = () => liniaNastepne(zdarzeniaKalendarza(d, now), now).zalegle;
  const o = { now, wieleWypiekow: false };

  it('krok wypieku: napis „Otwórz” i etykieta „… z …: otwórz”; karmienie: „Zrobione” jak dotąd', () => {
    const krok = zalegle().find((z) => z.zrodlo.typ === 'wypiek')!;
    const karmienie = zalegle().find((z) => z.zrodlo.typ === 'zakwas')!;
    expect(napisyZaleglego(krok).zrobione).toBe('Otwórz');
    expect(etykietyZaleglego(krok, o).zrobione).toMatch(/ z .+: otwórz$/);
    expect(napisyZaleglego(karmienie).zrobione).toBe('Zrobione');
    expect(etykietyZaleglego(karmienie, o).zrobione).toMatch(/: zrobione$/);
  });

  it('EN: „Open” i „… at …: open”', () => {
    expect(EN['Otwórz']).toBe('Open');
    expect(EN['{co} z {h}: otwórz']).toBe('{co} at {h}: open');
  });
});
