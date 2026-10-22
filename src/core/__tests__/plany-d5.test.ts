/**
 * Plany na przyszłe dni (M3 D5; D-092, D-108): karmienia budzące zakwas z lodówki według RD-33 (wektory z
 * tests/wektory/brd.json, DST w Europe/Warsaw), kalendarz i powiadomienia z jednej reguły (bez dublowania), kolizja
 * planów, zaległy start planu w „Następne”, zasięg dnia „gotowe” i skrót „Zaplanuj wypiek na ten dzień”.
 * Chwile oczekiwane wpisane ręcznie z rachunku (UTC z tz database), nie liczone kodem testowanym.
 */
import * as fs from 'fs';
import * as path from 'path';
import { KOLEJNE_KARMIENIE_BUDZACE_H, karmienieBudzaceAt, kolejneKarmieniaBudzace, stanBudzenia, type StanBudzenia } from '../karmienia-budzace';
import { dniPlanu, kolizjePlanu, przesuniecieDnia, skrotZaplanuj, startNadszedl, startPlanuAt, type KrokKolizji, type SkrotZaplanuj } from '../plany-wypiekow';
import { zdarzeniaKalendarza, type DaneKalendarza, type KalendarzPlan } from '../kalendarz-zdarzenia';
import { liniaNastepne } from '../kalendarz-nastepne';
import { planNotifications, planPlannedStartNotifications, planWakeFeedingNotifications } from '../notification-plan';
import { FRIDGE_WAKE_STEP_ID, FRIDGE_WAKE_STEP_NAME } from '../fridge-wake';
import { ZASIEG_DNI_PLANU } from '../kalendarz-config';
import { MAX_ZAPLANOWANYCH_WYPIEKOW } from '../limity-wypiekow';
import { localDateKey } from '../dzien-lokalny';
import { opisZdarzenia } from '../../lib/kalendarz-teksty';
import { wStrefie } from './helpers/strefa';

const wektory = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../tests/wektory/brd.json'), 'utf8')) as Array<{ regula: string; id: string }>;

const H = 3_600_000;
const MIN = 60_000;
const lok = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const utc = (s: string) => Date.parse(s);

const BRAK: DaneKalendarza = {
  wypieki: [], zaplanowane: [], zakwasy: [], wpisyZakwasow: [], dziennik: [], pominiecia: [],
  dostep: { terminyKarmienia: true, przyszleWypieki: true },
};
const dane = (d: Partial<DaneKalendarza>): DaneKalendarza => ({ ...BRAK, ...d });

/** Plan chleba z zakwasem z lodówki: karmienie budzące 12 h przed mieszaniem, mieszanie, pieczenie, gotowe. */
function planZLodowki(id: string, mix: number, nazwa = 'Chleb'): KalendarzPlan & { starterId: string } {
  return {
    id, recipeName: nazwa, starterId: 'z',
    steps: [
      { id: FRIDGE_WAKE_STEP_ID, name: FRIDGE_WAKE_STEP_NAME, plannedStart: mix - 12 * H, plannedEnd: mix },
      { id: 'mix', name: 'Mieszanie ciasta', plannedStart: mix, plannedEnd: mix + 30 * MIN },
      { id: 'bake', name: 'Wypiek', plannedStart: mix + 5 * H, plannedEnd: mix + 6 * H },
    ],
  };
}
const ZAKWAS = { id: 'z', name: 'Żytni', storageState: 'FRIDGE' as const };

describe('D5 w Europe/Warsaw', () => {
  wStrefie('Europe/Warsaw');

  describe('RD-33: karmienie budzące zakwas z lodówki', () => {
    it('wektory RD-33-W1…W6 są w tests/wektory/brd.json', () => {
      expect(wektory.filter((w) => w.regula === 'RD-33').map((w) => w.id)).toEqual(['RD-33-W1', 'RD-33-W2', 'RD-33-W3', 'RD-33-W4', 'RD-33-W5', 'RD-33-W6']);
    });

    it('RD-33-W1: mieszanie 2026-10-24 08:00 → karmienie 2026-10-23 20:00, bez obserwacji brak kolejnego', () => {
      const karmienie = karmienieBudzaceAt(utc('2026-10-24T06:00:00Z'));
      expect(karmienie).toBe(utc('2026-10-23T18:00:00Z'));
      expect(stanBudzenia(utc('2026-10-23T18:00:00Z'), null, utc('2026-10-23T18:00:00Z')).kind).toBe('czeka');
    });

    it('RD-33-W2: podwojenie dokładnie 8 h po karmieniu (granica włączna) → gotowy, bez kolejnego', () => {
      const k = utc('2026-10-23T18:00:00Z');
      expect(stanBudzenia(k, k + 8 * H, k + 10 * H)).toEqual({ kind: 'gotowy' });
    });

    it('RD-33-W3: podwojenie po 7 h 59 min → gotowy', () => {
      const k = utc('2026-10-23T18:00:00Z');
      expect(stanBudzenia(k, k + 8 * H - MIN, k + 10 * H)).toEqual({ kind: 'gotowy' });
    });

    it('RD-33-W4: brak podwojenia do 8 h 1 min → kolejne karmienie 2026-10-24 08:00 i propozycja przesunięcia', () => {
      const k = utc('2026-10-23T18:00:00Z');
      expect(stanBudzenia(k, null, k + 8 * H + MIN)).toEqual({ kind: 'kolejne', at: utc('2026-10-24T06:00:00Z'), propozycjaPrzesuniecia: true });
      // przed upływem 8 h jeszcze nic nie wiadomo (czeka), a nie „kolejne”
      expect(stanBudzenia(k, null, k + 8 * H)).toEqual({ kind: 'czeka', sprawdzDo: k + 8 * H });
    });

    it('RD-33-W5 (DST): mieszanie 2026-10-25 08:00 CET → karmienie 2026-10-24 21:00 CEST (12 h czasu upływu)', () => {
      const mix = lok(2026, 10, 25, 8, 0);
      expect(mix).toBe(utc('2026-10-25T07:00:00Z'));
      const k = karmienieBudzaceAt(mix);
      expect(k).toBe(utc('2026-10-24T19:00:00Z'));
      expect(new Date(k ?? 0).getHours()).toBe(21);
    });

    it('RD-33-W6: plan bez godziny mieszania nie ma karmienia budzącego', () => {
      expect(karmienieBudzaceAt(null)).toBeNull();
    });

    it('RD-33: kolejne karmienie co 12 h (D-052, ZAK-LOD-002), stan jako typ wyniku', () => {
      expect(KOLEJNE_KARMIENIE_BUDZACE_H).toBe(12);
      const k = utc('2026-10-23T18:00:00Z');
      const stany: StanBudzenia['kind'][] = [stanBudzenia(k, k + H, k + 2 * H).kind, stanBudzenia(k, null, k + H).kind, stanBudzenia(k, null, k + 9 * H).kind];
      expect(stany).toEqual(['gotowy', 'czeka', 'kolejne']);
    });

    it('powiadomienie kolejnego karmienia budzącego: termin, który minął, pominięty; identyfikator per wypiek', () => {
      const k = { wypiekId: 'sob', recipeName: 'Chleb', starterId: 'z', starterName: 'Żytni', at: utc('2026-10-24T06:00:00Z'), propozycjaPrzesuniecia: true as const };
      expect(planWakeFeedingNotifications([k], k.at)).toEqual([]);
      expect(planWakeFeedingNotifications([k], k.at - MIN)).toEqual([expect.objectContaining({ id: 'piekarz.wypiek.sob.budzenie', route: '/zakwasy' })]);
    });
  });

  describe('BR-KAL-009: plan z zakwasem z lodówki w kalendarzu i powiadomieniach', () => {
    it('BR-KAL-009 Wypiek na sobotę z zakwasem z lodówki: jedno karmienie budzące w piątek 20:00, kroki ciasta i znacznik w sobotę', () => {
      const now = lok(2026, 10, 21, 12); // środa
      const mix = lok(2026, 10, 24, 8);
      const plan = planZLodowki('sob', mix);
      const zd = zdarzeniaKalendarza(dane({ zaplanowane: [plan], zakwasy: [ZAKWAS] }), now);
      const budzace = zd.filter((z) => z.krok?.nazwa === FRIDGE_WAKE_STEP_NAME);
      expect(budzace).toHaveLength(1);
      expect(budzace[0].at).toBe(lok(2026, 10, 23, 20));
      expect(localDateKey(budzace[0].at)).toBe('2026-10-23');
      expect(zd.filter((z) => z.zrodlo.id === 'sob' && z.rodzaj === 'wypiek-krok' && z.dzien === '2026-10-24').map((z) => z.krok?.nazwa)).toEqual(['Mieszanie ciasta', 'Wypiek']);
      expect(zd.some((z) => z.zrodlo.id === 'sob' && z.rodzaj === 'wypiek-gotowe' && z.dzien === '2026-10-24')).toBe(true);
      // bez obserwacji nie ma drugiego (warunkowego) karmienia
      expect(zd.filter((z) => z.warunkowe)).toHaveLength(0);
      // powiadomienie: start planu = to samo karmienie budzące (D2), bez osobnego powiadomienia karmienia
      const start = planPlannedStartNotifications([{ ...plan, plannedStartAt: plan.steps[0].plannedStart ?? 0 }], now);
      expect(start).toEqual([expect.objectContaining({ triggerAt: lok(2026, 10, 23, 20), params: expect.objectContaining({ stepName: FRIDGE_WAKE_STEP_NAME, recipeName: 'Chleb' }) })]);
    });

    it('BR-KAL-009 Zakwas gotowy w 8 h: podwojenie o 04:00 po karmieniu o 20:00 — plan bez zmian, bez kolejnego karmienia', () => {
      const mix = lok(2026, 10, 24, 8);
      const plan = planZLodowki('sob', mix);
      const wpisy = [
        { id: 'f', starterId: 'z', kind: 'feeding' as const, occurredAt: lok(2026, 10, 23, 20) },
        { id: 'o', starterId: 'z', kind: 'observation' as const, occurredAt: lok(2026, 10, 24, 4), signs: ['doubled'] },
      ];
      const now = lok(2026, 10, 24, 6);
      expect(kolejneKarmieniaBudzace([plan], [ZAKWAS], wpisy, now)).toEqual([]);
      const zd = zdarzeniaKalendarza(dane({ zaplanowane: [plan], zakwasy: [ZAKWAS], wpisyZakwasow: wpisy }), now);
      expect(zd.filter((z) => z.warunkowe)).toHaveLength(0);
    });

    // M3 P-a-fix P2-3 (kontrakt: wypiek rozpoczęty z planem Pro prowadzi się do końca): bez Pro kolejne karmienie budzące
    // zostaje dla wypieku trwającego; dla planu niezaczętego to Pro (nowy wypiek na przyszłość)
    it('bez Pro (karmieniePro false): kolejne karmienie budzące trwającego wypieku zostaje, planu niezaczętego nie', () => {
      const mix = lok(2026, 10, 24, 8);
      const plan = planZLodowki('sob', mix);
      const wpisy = [
        { id: 'f', starterId: 'z', kind: 'feeding' as const, occurredAt: lok(2026, 10, 23, 20) },
        { id: 'o', starterId: 'z', kind: 'observation' as const, occurredAt: lok(2026, 10, 24, 4, 1), signs: ['bubbles'] },
      ];
      const now = lok(2026, 10, 24, 4, 1);
      const trwa = { ...plan, stepIdx: 0, timerEndsAt: null, pausedLeftSec: null, zaczetyZDostepem: true };
      const bezPro = { terminyKarmienia: true, przyszleWypieki: true, karmieniePro: false };
      expect(zdarzeniaKalendarza(dane({ wypieki: [trwa], zakwasy: [ZAKWAS], wpisyZakwasow: wpisy, dostep: bezPro }), now).filter((z) => z.warunkowe)).toHaveLength(1);
      expect(zdarzeniaKalendarza(dane({ zaplanowane: [plan], zakwasy: [ZAKWAS], wpisyZakwasow: wpisy, dostep: bezPro }), now).filter((z) => z.warunkowe)).toHaveLength(0);
    });

    it('BR-KAL-009 Zakwas niegotowy: bez podwojenia do 04:01 — kolejne karmienie w sobotę 08:00 z dopiskiem, bez „N z M”, i powiadomienie', () => {
      const mix = lok(2026, 10, 24, 8);
      const plan = planZLodowki('sob', mix);
      const wpisy = [
        { id: 'f', starterId: 'z', kind: 'feeding' as const, occurredAt: lok(2026, 10, 23, 20) },
        { id: 'o', starterId: 'z', kind: 'observation' as const, occurredAt: lok(2026, 10, 24, 4, 1), signs: ['bubbles'] },
      ];
      const now = lok(2026, 10, 24, 4, 1);
      const kolejne = kolejneKarmieniaBudzace([plan], [ZAKWAS], wpisy, now);
      expect(kolejne).toEqual([{ wypiekId: 'sob', recipeName: 'Chleb', starterId: 'z', starterName: 'Żytni', at: lok(2026, 10, 24, 8), propozycjaPrzesuniecia: true }]);
      const zd = zdarzeniaKalendarza(dane({ zaplanowane: [plan], zakwasy: [ZAKWAS], wpisyZakwasow: wpisy }), now);
      const war = zd.filter((z) => z.warunkowe);
      expect(war).toHaveLength(1);
      expect(war[0]).toEqual(expect.objectContaining({ rodzaj: 'karmienie-nastepne', at: lok(2026, 10, 24, 8), zrodlo: { typ: 'zakwas', id: 'z' } }));
      const opis = opisZdarzenia(war[0], { now, wieleWypiekow: false });
      expect(opis).toBe('karmienie zakwasu Żytni, jeśli zakwas nie podwoił objętości');
      expect(opis).not.toMatch(/\d+ z \d+/);
      // powiadomienie z tej samej reguły: jedno, o 08:00, z nazwą zakwasu i wypieku
      const pow = planNotifications({ sessions: [], planned: [], starters: [], budzace: kolejne }, now);
      expect(pow).toEqual([expect.objectContaining({ kind: 'karmienie', textKey: 'karmienie.budzace', triggerAt: lok(2026, 10, 24, 8), params: expect.objectContaining({ starterName: 'Żytni', recipeName: 'Chleb' }) })]);
    });

    it('BR-KAL-009 Zakwas niegotowy: po zmianie kroku trwającego wypieku na mieszanie kolejnego karmienia już nie ma', () => {
      const mix = lok(2026, 10, 24, 8);
      const plan = planZLodowki('sob', mix);
      const wpisy = [{ id: 'f', starterId: 'z', kind: 'feeding' as const, occurredAt: lok(2026, 10, 23, 20) }];
      const now = lok(2026, 10, 24, 5);
      expect(kolejneKarmieniaBudzace([{ ...plan, stepIdx: 0 }], [ZAKWAS], wpisy, now)).toHaveLength(1);
      expect(kolejneKarmieniaBudzace([{ ...plan, stepIdx: 1 }], [ZAKWAS], wpisy, now)).toEqual([]);
      // karmienie sprzed okna planu (np. tydzień wcześniej) nie jest karmieniem budzącym
      expect(kolejneKarmieniaBudzace([plan], [ZAKWAS], [{ ...wpisy[0], occurredAt: lok(2026, 10, 16, 20) }], now)).toEqual([]);
    });

    it('BR-KAL-009 Dwa plany: oba plany są w kalendarzu (sobota i piątek)', () => {
      const now = lok(2026, 10, 21, 12);
      const sob = planZLodowki('sob', lok(2026, 10, 24, 8));
      const pizza: KalendarzPlan = { id: 'pt', recipeName: 'Pizza', steps: [{ id: 'mix', name: 'Mieszanie ciasta', plannedStart: lok(2026, 10, 23, 10), plannedEnd: lok(2026, 10, 23, 18) }] };
      const zd = zdarzeniaKalendarza(dane({ zaplanowane: [sob, pizza] }), now);
      expect(new Set(zd.filter((z) => z.rodzaj === 'wypiek-gotowe').map((z) => z.zrodlo.id))).toEqual(new Set(['sob', 'pt']));
    });

    it('BR-KAL-009 Kolizja planów: kroki czynne w tej samej godzinie — nazwa kroku i godzina; kroki bierne nie kolidują', () => {
      const k = (name: string, od: number, doo: number, isPassive = false): KrokKolizji => ({ name, isPassive, plannedStart: od, plannedEnd: doo });
      const nowy = [k('Mieszanie ciasta', lok(2026, 10, 24, 8), lok(2026, 10, 24, 8, 30)), k('Fermentacja', lok(2026, 10, 24, 8, 30), lok(2026, 10, 24, 12), true)];
      const inne = [
        { nazwa: 'Pizza', kroki: [k('Formowanie', lok(2026, 10, 24, 8, 15), lok(2026, 10, 24, 8, 45)), k('Garowanie', lok(2026, 10, 24, 9), lok(2026, 10, 24, 11), true)] },
        { nazwa: 'Bagietka', kroki: [k('Mieszanie ciasta', lok(2026, 10, 24, 8, 30), lok(2026, 10, 24, 9))] },
      ];
      expect(kolizjePlanu(nowy, inne)).toEqual([{ krok: 'Mieszanie ciasta', wypiek: 'Pizza', krokInny: 'Formowanie', at: lok(2026, 10, 24, 8, 15) }]);
      expect(kolizjePlanu(nowy, [])).toEqual([]);
    });
  });

  describe('D5: zaległy start zaplanowanego wypieku (znalezisko D4a)', () => {
    it('BR-KAL-009 plan po minionym starcie: krok 1 zaległy w „Następne”, dalsze kroki nie', () => {
      const plan = planZLodowki('sob', lok(2026, 10, 24, 8));
      const now = lok(2026, 10, 23, 20, 30);
      expect(startNadszedl({ plannedStartAt: lok(2026, 10, 23, 20), steps: plan.steps }, now)).toBe(true);
      expect(startNadszedl({ plannedStartAt: lok(2026, 10, 23, 20), steps: plan.steps }, lok(2026, 10, 23, 19, 59))).toBe(false);
      // start = krok 1 planu, a bez godziny kroku — zapisany start planu
      expect(startPlanuAt({ plannedStartAt: 1, steps: plan.steps })).toBe(lok(2026, 10, 23, 20));
      expect(startPlanuAt({ plannedStartAt: 7, steps: [{ plannedStart: null }] })).toBe(7);
      const zd = zdarzeniaKalendarza(dane({ zaplanowane: [plan] }), now);
      const l = liniaNastepne(zd, now);
      expect(l.zalegle.map((z) => z.id)).toEqual(['wypiek:sob:krok:0']);
      expect(zd.filter((z) => z.zalegle)).toHaveLength(1);
    });
  });

  describe('D-108: zasięg dnia „gotowe” i skrót z arkusza dnia (BR-KAL-015)', () => {
    const czwartek = lok(2026, 10, 22, 10);
    it('zasięg: dziś i 14 kolejnych dni (D-108), liczba z modułu konfiguracji', () => {
      expect(ZASIEG_DNI_PLANU).toBe(14);
      expect(dniPlanu()).toEqual(Array.from({ length: 15 }, (_, i) => i));
      expect(przesuniecieDnia(lok(2026, 10, 24), czwartek)).toBe(2);
      expect(przesuniecieDnia(lok(2026, 11, 5), czwartek)).toBe(14);
      expect(przesuniecieDnia(lok(2026, 11, 6), czwartek)).toBeNull();
      expect(przesuniecieDnia(lok(2026, 10, 20), czwartek)).toBeNull();
    });

    it('BR-KAL-015 Pojutrze bez trwającego wypieku: sobota ma skrót', () => {
      expect(skrotZaplanuj(lok(2026, 10, 24), czwartek, 0)).toBe('pokaz');
    });
    it('BR-KAL-015 Dzień poza zasięgiem planu: dzień po zasięgu 14 dni nie ma skrótu (D-108 zmienia zasięg „pojutrze”)', () => {
      expect(skrotZaplanuj(lok(2026, 10, 25), czwartek, 0)).toBe('pokaz');
      expect(skrotZaplanuj(lok(2026, 11, 6), czwartek, 0)).toBe('poza-zasiegiem');
    });
    it('BR-KAL-015 Trwa wypiek: po D-092 trwający wypiek NIE blokuje skrótu (D-108; BRD do synchronizacji)', () => {
      // skrót nie dostaje informacji o trwających wypiekach: blokuje tylko limit planów i dzień miniony
      expect(skrotZaplanuj(lok(2026, 10, 23), czwartek, 0)).toBe('pokaz');
    });
    it('BR-KAL-015 Dzień miniony: wtorek bez skrótu', () => {
      expect(skrotZaplanuj(lok(2026, 10, 20), czwartek, 0)).toBe('miniony');
      expect(skrotZaplanuj(lok(2026, 10, 22), czwartek, 0)).toBe('pokaz');
    });
    it('BR-KAL-015 limit 5 planów blokuje skrót', () => {
      const wynik: SkrotZaplanuj = skrotZaplanuj(lok(2026, 10, 24), czwartek, MAX_ZAPLANOWANYCH_WYPIEKOW);
      expect(wynik).toBe('limit');
      expect(skrotZaplanuj(lok(2026, 10, 24), czwartek, MAX_ZAPLANOWANYCH_WYPIEKOW - 1)).toBe('pokaz');
    });
  });
});
