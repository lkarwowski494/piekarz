/**
 * Logika kalendarza 1.0 (M3 D4a): zdarzenia dnia lokalnego z istniejących danych, linia „Następne” (RD-32, D-094),
 * arkusz dnia, znaczniki dni, „Pomiń” od chwili pominięcia, dostęp (BR-KAL-006). Wektory RD-29…RD-32 z
 * tests/wektory/brd.json; chwile wpisane ręcznie z rachunku na tz database, nie liczone kodem testowanym.
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  czyOpcjonalne,
  zdarzeniaKalendarza,
  type DaneKalendarza,
  type KalendarzWypiek,
  type RodzajZdarzenia,
  type StanZdarzenia,
  type ZdarzenieKalendarza,
} from '../kalendarz-zdarzenia';
import { arkuszDnia, czyKalendarzPusty, liniaNastepne, najblizszeZdarzenia, znacznikiDni } from '../kalendarz-nastepne';
import { LIMIT_NASTEPNE, NAJBLIZSZE_DNI, POMINIECIA_TRZYMAJ_DNI } from '../kalendarz-config';
import { planFeedingNotifications, type PlanStarter } from '../notification-plan';
import { pytanieOStalyDzien, stalyDzienKarmienia } from '../notification-feeding';
import { daysOfWeek, localDateKey, resolveFirstWeekday } from '../dzien-lokalny';
import { setupDay } from '../starter-log';
import { stanKartyZakwasu } from '../../lib/zakwas-widok';
import { wStrefie } from './helpers/strefa';

const wektory = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../tests/wektory/brd.json'), 'utf8')) as Array<{ regula: string; id: string }>;

const H = 3_600_000;
const MIN = 60_000;
/** Chwila z lokalnych składników w bieżącej strefie procesu. */
const lok = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();

const BRAK: DaneKalendarza = {
  wypieki: [],
  zaplanowane: [],
  zakwasy: [],
  wpisyZakwasow: [],
  dziennik: [],
  pominiecia: [],
  dostep: { terminyKarmienia: true, przyszleWypieki: true },
};
const dane = (d: Partial<DaneKalendarza>): DaneKalendarza => ({ ...BRAK, ...d });
const krok = (name: string, start: number, koniec: number = start + H) => ({ id: name, name, plannedStart: start, plannedEnd: koniec });
const wypiek = (id: string, steps: KalendarzWypiek['steps'], extra: Partial<KalendarzWypiek> = {}): KalendarzWypiek => ({
  id, recipeName: id, steps, stepIdx: 0, timerEndsAt: null, pausedLeftSec: null, zaczetyZDostepem: true, ...extra,
});
/** Zakwas na blacie z terminem karmienia o `termin` (dokarmiony 12 h wcześniej, RD-25). */
const naBlacie = (id: string, termin: number, extra: Partial<PlanStarter> = {}): PlanStarter => ({ id, name: id, storageState: 'ROOM_TEMP', lastFedAt: termin - 12 * H, ...extra });
const nazwy = (l: readonly ZdarzenieKalendarza[]) => l.map((z) => `${z.krok ? z.krok.nazwa : z.nazwa} ${new Date(z.at).getHours()}:${String(new Date(z.at).getMinutes()).padStart(2, '0')}`);
const linia = (d: DaneKalendarza, now: number) => liniaNastepne(zdarzeniaKalendarza(d, now), now);

describe('kalendarz D4a w Europe/Warsaw', () => {
  wStrefie('Europe/Warsaw');

  describe('RD-32: linia „Następne” (BR-KAL-003)', () => {
    it('wektory RD-32-W1…W8 są w tests/wektory/brd.json', () => {
      expect(wektory.filter((w) => w.regula === 'RD-32').map((w) => w.id)).toEqual(['RD-32-W1', 'RD-32-W2', 'RD-32-W3', 'RD-32-W4', 'RD-32-W5', 'RD-32-W6', 'RD-32-W7', 'RD-32-W8']);
    });

    // Chwile liczone po ustawieniu strefy (beforeAll wStrefie), nie przy ładowaniu pliku (jak abbc726)
    let teraz = 0;
    beforeAll(() => {
      teraz = lok(2026, 10, 22, 8);
    });

    it('BR-KAL-003 Wypiek i karmienie w tym samym czasie: oba w kolejności czasu, żadne schowane (RD-32-W1)', () => {
      const w = wypiek('chleb', [krok('Formowanie', lok(2026, 10, 22, 7), lok(2026, 10, 22, 10)), krok('Pieczenie', lok(2026, 10, 22, 10))], { timerEndsAt: lok(2026, 10, 22, 10) });
      const l = linia(dane({ wypieki: [w], zakwasy: [naBlacie('Żytni', lok(2026, 10, 22, 10, 30))] }), teraz);
      expect(l.zalegle).toEqual([]);
      expect(nazwy(l.przyszle)).toEqual(['Pieczenie 10:00', 'Żytni 10:30']);
      expect(l.wiecej).toBe(0);
    });

    it('BR-KAL-003 Termin minął bez potwierdzenia: termin = teraz to już „Zaległe” (RD-32-W2)', () => {
      const l = linia(dane({ zakwasy: [naBlacie('Żytni', teraz)] }), teraz);
      expect(nazwy(l.zalegle)).toEqual(['Żytni 8:00']);
      expect(l.zalegle[0].rodzaj).toBe('karmienie-nastepne');
      expect(l.przyszle).toEqual([]);
      expect(l.wiecej).toBe(0);
    });

    it('termin minutę po teraz: jeszcze nie zaległe (RD-32-W3)', () => {
      const l = linia(dane({ zakwasy: [naBlacie('Żytni', teraz + MIN)] }), teraz);
      expect(l.zalegle).toEqual([]);
      expect(nazwy(l.przyszle)).toEqual(['Żytni 8:01']);
    });

    it('BR-KAL-003 Więcej źródeł niż miejsc: trzy najbliższe i „+1” (RD-32-W4)', () => {
      const w = wypiek('chleb', [krok('Mieszanie', lok(2026, 10, 22, 9)), krok('Składanie', lok(2026, 10, 22, 10))]);
      const z = ['A', 'B', 'C'].map((n, i) => naBlacie(n, lok(2026, 10, 22, 10 + i)));
      const l = linia(dane({ wypieki: [w], zakwasy: z }), teraz);
      expect(nazwy(l.przyszle)).toEqual(['Mieszanie 9:00', 'A 10:00', 'B 11:00']);
      expect(l.wiecej).toBe(1);
      expect(nazwy(l.wszystkiePrzyszle)).toEqual(['Mieszanie 9:00', 'A 10:00', 'B 11:00', 'C 12:00']);
    });

    it('dwa zaległe na początku, miejsce na jedno przyszłe, „+2” (RD-32-W5)', () => {
      const now = lok(2026, 10, 23, 9);
      const w = wypiek('chleb', [krok('Mieszanie', lok(2026, 10, 23, 10))]);
      const z = [naBlacie('A', lok(2026, 10, 22, 8)), naBlacie('B', lok(2026, 10, 23, 7)), naBlacie('C', lok(2026, 10, 23, 11)), naBlacie('D', lok(2026, 10, 23, 12))];
      const l = linia(dane({ wypieki: [w], zakwasy: z }), now);
      expect(nazwy(l.zalegle)).toEqual(['A 8:00', 'B 7:00']);
      expect(l.zalegle[0].dzien).toBe('2026-10-22');
      expect(nazwy(l.przyszle)).toEqual(['Mieszanie 10:00']);
      expect(l.wiecej).toBe(2);
    });

    it('BR-KAL-003 Po jednym zdarzeniu z każdego źródła: krok 10:00 i karmienie 13:00, dalsze kroki tylko w arkuszu (RD-32-W6)', () => {
      const kroki = [krok('Mieszanie', lok(2026, 10, 22, 10)), krok('Składanie', lok(2026, 10, 22, 11)), krok('Formowanie', lok(2026, 10, 22, 12))];
      const d = dane({ wypieki: [wypiek('chleb', kroki, { timerEndsAt: lok(2026, 10, 22, 11) })], zakwasy: [naBlacie('Żytni', lok(2026, 10, 22, 13))] });
      const l = linia(d, teraz);
      expect(nazwy(l.przyszle)).toEqual(['Mieszanie 10:00', 'Żytni 13:00']);
      expect(l.wiecej).toBe(0);
      // BR-KAL-004 Wszystkie zdarzenia źródła: arkusz dnia ma wszystkie trzy kroki
      const a = arkuszDnia(zdarzeniaKalendarza(d, teraz), '2026-10-22', teraz);
      expect(nazwy(a.zdarzenia.filter((z) => z.rodzaj === 'wypiek-krok'))).toEqual(['Mieszanie 10:00', 'Składanie 11:00', 'Formowanie 12:00']);
    });

    it('BR-KAL-003 Pomiń karmienie: o 07:30 pominięte karmienie z 07:00 → następne 19:30, jak powiadomienie (RD-32-W7, D-094)', () => {
      const now = lok(2026, 10, 22, 7, 30);
      const z = naBlacie('blat', lok(2026, 10, 22, 7));
      const przed = linia(dane({ zakwasy: [z] }), now);
      expect(nazwy(przed.zalegle)).toEqual(['blat 7:00']);
      const po = linia(dane({ zakwasy: [z], pominiecia: [{ zdarzenie: 'karmienie:blat', at: now }] }), now);
      expect(po.zalegle).toEqual([]);
      expect(nazwy(po.przyszle)).toEqual(['blat 19:30']);
      const powiadomienie = planFeedingNotifications([{ ...z, pominietoAt: now }], now);
      expect(powiadomienie.map((p) => p.triggerAt)).toEqual([po.przyszle[0].at]);
    });

    it('pominięcie sprzed ostatniego dokarmienia nie przesuwa terminu (Zrobione po Pomiń)', () => {
      const now = lok(2026, 10, 22, 9);
      const z = naBlacie('blat', lok(2026, 10, 22, 20)); // dokarmiony 08:00
      const l = linia(dane({ zakwasy: [z], pominiecia: [{ zdarzenie: 'karmienie:blat', at: lok(2026, 10, 22, 7, 30) }] }), now);
      expect(nazwy(l.przyszle)).toEqual(['blat 20:00']);
      expect(planFeedingNotifications([{ ...z, pominietoAt: lok(2026, 10, 22, 7, 30) }], now).map((p) => p.triggerAt)).toEqual([lok(2026, 10, 22, 20)]);
    });

    it('zdarzenie bez czytelnego terminu pominięte, reszta bez zmian (RD-32-W8, RD-29-W6)', () => {
      const l = linia(dane({ zakwasy: [{ id: 'A', name: 'A', storageState: 'ROOM_TEMP', lastFedAt: Number.NaN }, naBlacie('B', lok(2026, 10, 22, 9))] }), teraz);
      expect(nazwy(l.przyszle)).toEqual(['B 9:00']);
      expect(l.zalegle).toEqual([]);
    });

    it('BR-KAL-003 Zaległe zostaje do decyzji: następnego dnia i po ponownym liczeniu (restart) nadal na początku, limit go nie ukrywa', () => {
      const d = dane({
        zakwasy: [naBlacie('Żytni', lok(2026, 10, 22, 8)), ...['A', 'B', 'C'].map((n, i) => naBlacie(n, lok(2026, 10, 23, 12 + i)))],
      });
      const nazajutrz = lok(2026, 10, 23, 9);
      const l = liniaNastepne(zdarzeniaKalendarza(JSON.parse(JSON.stringify(d)) as DaneKalendarza, nazajutrz), nazajutrz);
      expect(nazwy(l.zalegle)).toEqual(['Żytni 8:00']);
      expect(nazwy(l.przyszle)).toEqual(['A 12:00', 'B 13:00']);
      expect(l.wiecej).toBe(1);
    });

    it('BR-KAL-003 Zrobione: dokarmienie teraz zdejmuje „Zaległe”, następny termin od tego dokarmienia (RD-25)', () => {
      const now = lok(2026, 10, 22, 8, 20);
      const z = naBlacie('Żytni', lok(2026, 10, 22, 8));
      expect(linia(dane({ zakwasy: [z] }), now).zalegle).toHaveLength(1);
      const po = linia(dane({ zakwasy: [{ ...z, lastFedAt: now }], wpisyZakwasow: [{ id: 'w1', starterId: 'Żytni', kind: 'feeding', occurredAt: now }] }), now);
      expect(po.zalegle).toEqual([]);
      expect(po.przyszle.map((x) => x.at)).toEqual([now + 12 * H]);
    });

    it('BR-KAL-003 Pomiń krok wypieku: zaległy krok niesie id wypieku i indeks kroku dla ścieżki „wybierz krok”; po przejściu znika', () => {
      const kroki = [krok('Składanie', lok(2026, 10, 22, 6), lok(2026, 10, 22, 7)), krok('Formowanie', lok(2026, 10, 22, 7)), krok('Pieczenie', lok(2026, 10, 22, 9))];
      const przed = linia(dane({ wypieki: [wypiek('chleb', kroki, { timerEndsAt: lok(2026, 10, 22, 7) })] }), teraz);
      expect(przed.zalegle.map((z) => [z.zrodlo, z.krok?.idx, z.at])).toEqual([[{ typ: 'wypiek', id: 'chleb' }, 1, lok(2026, 10, 22, 7)]]);
      // źródło z zaległym nie dokłada przyszłego (RD-32)
      expect(przed.przyszle).toEqual([]);
      const po = linia(dane({ wypieki: [wypiek('chleb', kroki, { stepIdx: 1, timerEndsAt: lok(2026, 10, 22, 9) })] }), teraz);
      expect(po.zalegle).toEqual([]);
      expect(nazwy(po.przyszle)).toEqual(['Pieczenie 9:00']);
    });

    it('wstrzymany zegar kroku nie robi zaległego', () => {
      const kroki = [krok('Składanie', lok(2026, 10, 22, 6), lok(2026, 10, 22, 7)), krok('Formowanie', lok(2026, 10, 22, 7))];
      const l = linia(dane({ wypieki: [wypiek('chleb', kroki, { pausedLeftSec: 600 })] }), teraz);
      expect(l.zalegle).toEqual([]);
    });

    it('BR-KAL-003 Zadanie opcjonalne wygląda jak obowiązkowe: karmienie z lodówki jest w linii obok kroku, z flagą opcjonalne', () => {
      const lod: PlanStarter = { id: 'pszenny', name: 'pszenny', storageState: 'FRIDGE', lastFedAt: lok(2026, 10, 15, 9) };
      const w = wypiek('chleb', [krok('Mieszanie', lok(2026, 10, 22, 11))]);
      const l = linia(dane({ wypieki: [w], zakwasy: [lod] }), teraz);
      expect(nazwy(l.przyszle)).toEqual(['pszenny 9:00', 'Mieszanie 11:00']);
      expect(l.przyszle.map((z) => z.opcjonalne)).toEqual([true, false]);
    });

    it('BR-KAL-003 Brak przyszłych zdarzeń: linia pusta', () => {
      const l = linia(dane({ dziennik: [{ id: 'd', recipeName: 'Chleb', startedAt: lok(2026, 10, 20, 8), finishedAt: lok(2026, 10, 20, 18), ratingStars: 4 }] }), teraz);
      expect(l).toEqual({ zalegle: [], przyszle: [], wiecej: 0, wszystkiePrzyszle: [] });
    });

    it('zaplanowany wypiek jest osobnym źródłem z najbliższym krokiem', () => {
      const d = dane({ zaplanowane: [{ id: 'sobota', recipeName: 'Chleb', steps: [krok('Mieszanie', lok(2026, 10, 24, 8)), krok('Pieczenie', lok(2026, 10, 24, 14))] }] });
      const l = linia(d, teraz);
      expect(nazwy(l.przyszle)).toEqual(['Mieszanie 8:00']);
      expect(l.przyszle[0].zaplanowany).toBe(true);
    });
  });

  describe('BR-KAL-002: znaczniki dnia z istniejących danych', () => {
    it('BR-KAL-002 Trwający wypiek przez noc: znacznik w środę i czwartek, arkusz dnia tylko z krokami zaczynającymi się w nim', () => {
      const kroki = [krok('Mieszanie', lok(2026, 10, 21, 21)), krok('Składanie', lok(2026, 10, 21, 22)), krok('Garowanie', lok(2026, 10, 22, 6), lok(2026, 10, 22, 9)), krok('Pieczenie', lok(2026, 10, 22, 9), lok(2026, 10, 22, 10))];
      const now = lok(2026, 10, 21, 20);
      const zd = zdarzeniaKalendarza(dane({ wypieki: [wypiek('chleb', kroki, { timerEndsAt: lok(2026, 10, 21, 22) })] }), now);
      const zn = znacznikiDni(zd, ['2026-10-21', '2026-10-22', '2026-10-23']);
      expect(zn['2026-10-21'].rodzaje).toContain('wypiek-krok');
      expect(zn['2026-10-22'].rodzaje).toContain('wypiek-krok');
      expect(zn['2026-10-23'].rodzaje).toEqual([]);
      expect(nazwy(arkuszDnia(zd, '2026-10-21', now).zdarzenia)).toEqual(['Mieszanie 21:00', 'Składanie 22:00']);
      const czw = arkuszDnia(zd, '2026-10-22', now).zdarzenia;
      expect(czw.map((z) => z.rodzaj)).toEqual(['wypiek-krok', 'wypiek-krok', 'wypiek-gotowe']);
      expect(czw[2].at).toBe(lok(2026, 10, 22, 10));
    });

    it('wypiek wielodniowy jako ciąg: dzień bez kroku między pierwszym i ostatnim zdarzeniem ma znacznik ciągu', () => {
      const kroki = [krok('Mieszanie', lok(2026, 10, 19, 20), lok(2026, 10, 19, 21)), krok('Lodówka', lok(2026, 10, 19, 21), lok(2026, 10, 21, 8)), krok('Pieczenie', lok(2026, 10, 21, 8))];
      const zd = zdarzeniaKalendarza(dane({ wypieki: [wypiek('chleb', kroki, { stepIdx: 1, timerEndsAt: lok(2026, 10, 21, 8) })] }), lok(2026, 10, 20, 12));
      const zn = znacznikiDni(zd, ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22']);
      expect([zn['2026-10-19'].wypiekWToku, zn['2026-10-20'].wypiekWToku, zn['2026-10-21'].wypiekWToku, zn['2026-10-22'].wypiekWToku]).toEqual([true, true, true, false]);
      expect(zn['2026-10-20'].rodzaje).toEqual([]);
    });

    it('BR-KAL-002 Karmienie zrobione i następne: sobota 20:00 → sobota zrobione, niedziela następne o 07:00 CET (RD-29-W4, RD-25)', () => {
      const fed = lok(2026, 10, 24, 20);
      const zd = zdarzeniaKalendarza(
        dane({ zakwasy: [{ id: 'z', name: 'Żytni', storageState: 'ROOM_TEMP', lastFedAt: fed }], wpisyZakwasow: [{ id: 'w', starterId: 'z', kind: 'feeding', occurredAt: fed }] }),
        lok(2026, 10, 24, 21)
      );
      const zn = znacznikiDni(zd, ['2026-10-24', '2026-10-25']);
      expect(zn['2026-10-24'].rodzaje).toEqual(['karmienie-zrobione']);
      expect(zn['2026-10-25'].rodzaje).toEqual(['karmienie-nastepne']);
      const nast = zd.find((z) => z.rodzaj === 'karmienie-nastepne');
      expect(nast?.at).toBe(Date.UTC(2026, 9, 25, 6, 0));
      expect(nast?.dzien).toBe('2026-10-25');
    });

    // Chwile w tabeli jako funkcje: liczone w teście, po ustawieniu strefy, nie przy ładowaniu pliku
    it.each([
      ['na blacie', 'ROOM_TEMP' as const, () => [lok(2026, 10, 24, 20), Date.UTC(2026, 9, 25, 6, 0)]],
      ['w lodówce przez zmianę czasu (7 dni kalendarza)', 'FRIDGE' as const, () => [lok(2026, 10, 20, 10), lok(2026, 10, 27, 10)]],
    ])('BR-KAL-002 Ten sam termin co powiadomienie: zakwas %s — pasek, karta i powiadomienie', (_n, storageState, chwile) => {
      const [fed, oczekiwany] = chwile();
      const now = fed + H;
      const s: PlanStarter = { id: 'z', name: 'Żytni', storageState, lastFedAt: fed };
      const pasek = zdarzeniaKalendarza(dane({ zakwasy: [s] }), now).find((z) => z.rodzaj === 'karmienie-nastepne')?.at;
      const powiadomienie = planFeedingNotifications([s], now)[0]?.triggerAt;
      const karta = stanKartyZakwasu({ storageState }, [{ id: 'w', starterId: 'z', kind: 'feeding', occurredAt: fed, signs: [], createdAt: fed, updatedAt: fed }], now).nastepneAt;
      expect([pasek, powiadomienie, karta]).toEqual([oczekiwany, oczekiwany, oczekiwany]);
    });

    it('BR-KAL-010 Karmienie w niedziele: stały dzień — pasek i powiadomienie ten sam termin, niedziele w zakresie co 7 dni', () => {
      const now = lok(2026, 10, 22, 9);
      const s: PlanStarter = { id: 'z', name: 'Żytni', storageState: 'FRIDGE', lastFedAt: lok(2026, 10, 18, 10), fridgeFeedDay: { weekday: 7, minuteOfDay: 600 } };
      const zd = zdarzeniaKalendarza(dane({ zakwasy: [s] }), now, { odMs: lok(2026, 10, 19), doMs: lok(2026, 11, 2) });
      const terminy = zd.filter((z) => z.rodzaj === 'karmienie-nastepne');
      expect(terminy.map((z) => z.dzien)).toEqual(['2026-10-25', '2026-11-01']);
      expect(terminy[0].at).toBe(planFeedingNotifications([s], now)[0].triggerAt);
      expect(terminy.map((z) => z.karmienie)).toEqual(['karmienie.lodowkaDzien', 'karmienie.lodowkaDzien']);
    });

    it('BR-KAL-002 Zakładanie zakwasu: dziś znacznik z tym samym numerem dnia co karta (RD-31), dni wcześniejsze zrobione', () => {
      const start = lok(2026, 10, 20, 21);
      const now = lok(2026, 10, 22, 9);
      const s: PlanStarter = { id: 'z', name: 'Nowy', storageState: 'ROOM_TEMP', lastFedAt: start, setupStartedAt: start };
      const zak = zdarzeniaKalendarza(dane({ zakwasy: [s] }), now).filter((z) => z.rodzaj === 'zakladanie');
      expect(zak.map((z) => [z.dzien, z.dzienZakladania, z.stan])).toEqual([
        ['2026-10-20', 1, 'zrobione'],
        ['2026-10-21', 2, 'zrobione'],
        ['2026-10-22', 3, 'trwa'],
      ]);
      const karta = stanKartyZakwasu(s, [], now).dzien;
      expect([karta, setupDay(start, now)]).toEqual([3, 3]);
    });

    it('BR-KAL-002 Wypiek w dzienniku: poniedziałek z oceną 4★ w arkuszu dnia z przejściem do wpisu', () => {
      const now = lok(2026, 10, 22, 9);
      const zd = zdarzeniaKalendarza(dane({ dziennik: [{ id: 'wpis-1', recipeName: 'Wiejski', startedAt: lok(2026, 10, 19, 7), finishedAt: lok(2026, 10, 19, 18), ratingStars: 4 }] }), now);
      const a = arkuszDnia(zd, '2026-10-19', now).zdarzenia;
      expect(a.map((z) => [z.rodzaj, z.ocena, z.zrodlo, z.stan])).toEqual([['wpis-dziennika', 4, { typ: 'dziennik', id: 'wpis-1' }, 'zrobione']]);
    });

    it('BR-KAL-002 Uszkodzony wpis: nieczytelna data pominięta, pozostałe znaczniki są, dane bez zmian', () => {
      const now = lok(2026, 10, 22, 9);
      const d = dane({
        zakwasy: [{ id: 'z', name: 'Żytni', storageState: 'ROOM_TEMP', lastFedAt: lok(2026, 10, 22, 8) }],
        wpisyZakwasow: [
          { id: 'zly', starterId: 'z', kind: 'feeding', occurredAt: Number.NaN },
          { id: 'dobry', starterId: 'z', kind: 'feeding', occurredAt: lok(2026, 10, 22, 8) },
        ],
        dziennik: [{ id: 'zly-wpis', recipeName: 'X', startedAt: Number.NaN }],
      });
      const przed = JSON.stringify(d);
      const zd = zdarzeniaKalendarza(d, now);
      expect(zd.map((z) => z.id).some((id) => id.includes('zly'))).toBe(false);
      expect(zd.filter((z) => z.rodzaj === 'karmienie-zrobione')).toHaveLength(1);
      expect(zd.filter((z) => z.rodzaj === 'karmienie-nastepne')).toHaveLength(1);
      expect(JSON.stringify(d)).toBe(przed);
    });
  });

  describe('BR-KAL-004: arkusz dnia', () => {
    let now = 0;
    beforeAll(() => {
      now = lok(2026, 10, 22, 6);
    });

    it('BR-KAL-004 Dzień ze zdarzeniami: karmienie 07:00 i dwa kroki w kolejności godzin; Dzień bez zdarzeń: pusto', () => {
      const d = dane({
        wypieki: [wypiek('chleb', [krok('Mieszanie', lok(2026, 10, 22, 9)), krok('Składanie', lok(2026, 10, 22, 8))].reverse())],
        zakwasy: [naBlacie('Żytni', lok(2026, 10, 22, 7))],
      });
      const zd = zdarzeniaKalendarza(d, now);
      expect(nazwy(arkuszDnia(zd, '2026-10-22', now).zdarzenia).slice(0, 3)).toEqual(['Żytni 7:00', 'Składanie 8:00', 'Mieszanie 9:00']);
      expect(arkuszDnia(zd, '2026-10-23', now)).toEqual({ zalegle: [], zdarzenia: [] });
    });

    it('BR-KAL-004 Zaległe w arkuszu dzisiejszego dnia: zaległe karmienie i zaległy krok na górze; w innym dniu bez nich', () => {
      const teraz = lok(2026, 10, 22, 10);
      const kroki = [krok('Składanie', lok(2026, 10, 22, 8), lok(2026, 10, 22, 9)), krok('Formowanie', lok(2026, 10, 22, 9))];
      const zd = zdarzeniaKalendarza(dane({ wypieki: [wypiek('chleb', kroki, { timerEndsAt: lok(2026, 10, 22, 9) })], zakwasy: [naBlacie('Żytni', lok(2026, 10, 21, 20))] }), teraz);
      const a = arkuszDnia(zd, '2026-10-22', teraz);
      expect(nazwy(a.zalegle)).toEqual(['Żytni 20:00', 'Formowanie 9:00']);
      expect(arkuszDnia(zd, '2026-10-21', teraz).zalegle).toEqual([]);
    });

    it('BR-KAL-004 Arkusz najbliższych z „+N”: wszystkie zdarzenia źródeł z 7 dni (dziś + 6), po dniach, z pozycją spoza linii (RD-32-W4)', () => {
      const teraz = lok(2026, 10, 22, 8);
      const w = wypiek('chleb', [krok('Mieszanie', lok(2026, 10, 22, 9))]);
      const z = [naBlacie('A', lok(2026, 10, 22, 10)), naBlacie('B', lok(2026, 10, 22, 11)), naBlacie('C', lok(2026, 10, 23, 12))];
      // lodówka: termin 2026-10-29 07:00, ósmy dzień — poza arkuszem
      const lod: PlanStarter = { id: 'L', name: 'L', storageState: 'FRIDGE', lastFedAt: lok(2026, 10, 22, 7) };
      const zd = zdarzeniaKalendarza(dane({ wypieki: [w], zakwasy: [...z, lod] }), teraz);
      const n = najblizszeZdarzenia(zd, teraz);
      expect(n.dni.map((d) => [d.dzien, nazwy(d.zdarzenia)])).toEqual([
        ['2026-10-22', ['Mieszanie 9:00', 'chleb 10:00', 'A 10:00', 'B 11:00']],
        ['2026-10-23', ['C 12:00']],
      ]);
      expect(n.zalegle).toEqual([]);
      // pozycja C nie mieści się w linii (limit 3), ale jest w arkuszu najbliższych
      expect(nazwy(liniaNastepne(zd, teraz).przyszle)).not.toContain('C 12:00');
    });
  });

  describe('BR-KAL-005, BR-KAL-001', () => {
    it('BR-KAL-005 Pierwsze uruchomienie: kalendarz bez danych jest pusty; jeden zakwas albo wpis — nie', () => {
      expect(czyKalendarzPusty(BRAK)).toBe(true);
      expect(czyKalendarzPusty(dane({ zakwasy: [naBlacie('z', lok(2026, 10, 22, 8))] }))).toBe(false);
      expect(czyKalendarzPusty(dane({ dziennik: [{ id: 'd', recipeName: 'X', startedAt: 1 }] }))).toBe(false);
      expect(czyKalendarzPusty(dane({ zaplanowane: [{ id: 'p', recipeName: 'X', steps: [] }] }))).toBe(false);
    });

    it('BR-KAL-001 Tydzień w Polsce i w USA: pierwszy dzień z regionu, dziś w tygodniu (RD-30-W1, RD-30-W2); Północ (RD-29-W2)', () => {
      const dzis = lok(2026, 10, 22, 12);
      expect(daysOfWeek(dzis, resolveFirstWeekday(null, 'PL')).map(localDateKey)).toEqual(['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']);
      expect(daysOfWeek(dzis, resolveFirstWeekday(null, 'US')).map(localDateKey)).toEqual(['2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24']);
      expect([localDateKey(Date.UTC(2026, 9, 21, 21, 59)), localDateKey(Date.UTC(2026, 9, 21, 22, 0))]).toEqual(['2026-10-21', '2026-10-22']);
    });
  });

  describe('BR-KAL-006: kalendarz bez Piekarz Pro', () => {
    let now = 0;
    beforeAll(() => {
      now = lok(2026, 10, 22, 9);
    });
    const bezDostepu = { terminyKarmienia: false, przyszleWypieki: false };
    const d = (wypieki: KalendarzWypiek[]) => {
      const fed = lok(2026, 10, 21, 20);
      return dane({
        dostep: bezDostepu,
        wypieki,
        zaplanowane: [{ id: 'plan', recipeName: 'Pizza', steps: [krok('Mieszanie', lok(2026, 10, 24, 8))] }],
        zakwasy: [{ id: 'z', name: 'Żytni', storageState: 'ROOM_TEMP', lastFedAt: fed }],
        wpisyZakwasow: [{ id: 'w', starterId: 'z', kind: 'feeding', occurredAt: fed }],
        dziennik: [{ id: 'd', recipeName: 'Chleb', startedAt: lok(2026, 10, 19, 7), finishedAt: lok(2026, 10, 19, 18), ratingStars: 5 }],
      });
    };
    const kroki = () => [krok('Mieszanie', lok(2026, 10, 22, 7), lok(2026, 10, 22, 10)), krok('Pieczenie', lok(2026, 10, 22, 12))];

    it('BR-KAL-006 Przeszłość zawsze i Bez terminów karmienia: wypieki z dziennika i karmienia z przeszłości, bez następnego karmienia', () => {
      const zd = zdarzeniaKalendarza(d([]), now);
      expect(zd.map((z) => z.rodzaj).sort()).toEqual(['karmienie-zrobione', 'wpis-dziennika']);
      expect(liniaNastepne(zd, now)).toEqual({ zalegle: [], przyszle: [], wiecej: 0, wszystkiePrzyszle: [] });
    });

    it('BR-KAL-006 Wypiek rozpoczęty z dostępem: przyszłe kroki jak przed końcem próby; zaczęty bez dostępu — tylko przeszłość', () => {
      const z = zdarzeniaKalendarza(d([wypiek('zDostepem', kroki(), { timerEndsAt: lok(2026, 10, 22, 10) })]), now);
      expect(nazwy(liniaNastepne(z, now).przyszle)).toEqual(['Pieczenie 10:00']);
      const bez = zdarzeniaKalendarza(d([wypiek('bez', kroki(), { timerEndsAt: lok(2026, 10, 22, 10), zaczetyZDostepem: false })]), now);
      expect(bez.filter((x) => x.zrodlo.typ === 'wypiek').map((x) => [x.krok?.nazwa, x.stan])).toEqual([['Mieszanie', 'trwa']]);
      expect(liniaNastepne(bez, now).przyszle).toEqual([]);
    });
  });

  describe('konfiguracja i reguły pomocnicze', () => {
    it('liczby z jednego modułu: limit 3 (D-094), arkusz najbliższych 7 dni, pominięcia 14 dni', () => {
      expect([LIMIT_NASTEPNE, NAJBLIZSZE_DNI, POMINIECIA_TRZYMAJ_DNI]).toEqual([3, 7, 14]);
    });

    it('rodzaje i stany zdarzeń: wszystkie występują w danych przykładowych', () => {
      const now = lok(2026, 10, 22, 9);
      const start = lok(2026, 10, 21, 8);
      const zd = zdarzeniaKalendarza(
        dane({
          wypieki: [wypiek('chleb', [krok('Mieszanie', lok(2026, 10, 22, 7)), krok('Składanie', lok(2026, 10, 22, 8)), krok('Pieczenie', lok(2026, 10, 22, 11))], { stepIdx: 1, timerEndsAt: lok(2026, 10, 22, 11) })],
          zakwasy: [{ id: 'z', name: 'Z', storageState: 'ROOM_TEMP', lastFedAt: start, setupStartedAt: start }],
          wpisyZakwasow: [{ id: 'w', starterId: 'z', kind: 'feeding', occurredAt: start }],
          dziennik: [{ id: 'd', recipeName: 'X', startedAt: lok(2026, 10, 20, 8) }],
        }),
        now
      );
      const rodzaje: RodzajZdarzenia[] = ['wypiek-krok', 'wypiek-gotowe', 'karmienie-zrobione', 'karmienie-nastepne', 'zakladanie', 'wpis-dziennika'];
      const stany: StanZdarzenia[] = ['zrobione', 'trwa', 'zaplanowane'];
      expect(new Set(zd.map((z) => z.rodzaj))).toEqual(new Set(rodzaje));
      expect(new Set(zd.map((z) => z.stan))).toEqual(new Set(stany));
    });

    it('czyOpcjonalne: karmienie z lodówki (7 dni, stały dzień) opcjonalne, na blacie nie [DO USTALENIA role 06/03]', () => {
      expect([czyOpcjonalne('karmienie.blat'), czyOpcjonalne('karmienie.lodowkaTermin'), czyOpcjonalne('karmienie.lodowkaDzien')]).toEqual([false, true, true]);
    });

    it('stalyDzienKarmienia: tylko lodówka poza zakładaniem (BR-KAL-010, RD-31)', () => {
      const day = { weekday: 7, minuteOfDay: 600 };
      const s: PlanStarter = { id: 'z', name: 'Z', storageState: 'FRIDGE', fridgeFeedDay: day };
      expect(stalyDzienKarmienia(s)).toEqual(day);
      expect(stalyDzienKarmienia({ ...s, storageState: 'ROOM_TEMP' })).toBeNull();
      expect(stalyDzienKarmienia({ ...s, setupStartedAt: 1 })).toBeNull();
      expect(stalyDzienKarmienia({ ...s, setupStartedAt: 1, setupCompletedAt: 2 })).toEqual(day);
      expect(stalyDzienKarmienia({ ...s, fridgeFeedDay: null })).toBeNull();
    });
  });

  describe('BR-KAL-010: dane do pytania o stały dzień (UI w D7)', () => {
    const s: PlanStarter = { id: 'z', name: 'Żytni', storageState: 'FRIDGE', fridgeFeedDay: { weekday: 7, minuteOfDay: 600 } };
    it('BR-KAL-010 Karmienie w inny dzień: dokarmienie w piątek przy niedzieli → pytanie (niedziela, piątek); w niedzielę — bez pytania', () => {
      expect(pytanieOStalyDzien(s, lok(2026, 10, 23, 18))).toEqual({ stalyDzien: 7, dzienKarmienia: 5 });
      expect(pytanieOStalyDzien(s, lok(2026, 10, 25, 10))).toBeNull();
      expect(pytanieOStalyDzien({ ...s, fridgeFeedDay: null }, lok(2026, 10, 23, 18))).toBeNull();
      expect(pytanieOStalyDzien({ ...s, setupStartedAt: lok(2026, 10, 20) }, lok(2026, 10, 23, 18))).toBeNull();
      expect(pytanieOStalyDzien({ ...s, storageState: 'ROOM_TEMP' }, lok(2026, 10, 23, 18))).toBeNull();
    });
  });
});

describe.each([
  {
    strefa: 'Europe/Warsaw',
    // RD-29-W5: ta sama chwila w Warszawie to już 23 października
    dzienW5: '2026-10-23',
    // blat przez zmianę czasu: 2026-10-24 20:00 CEST + 12 h = 2026-10-25 07:00 CET (06:00 UTC)
    fed: Date.UTC(2026, 9, 24, 18, 0),
    termin: Date.UTC(2026, 9, 25, 6, 0),
    dzienTerminu: '2026-10-25',
    // lodówka 7 dni kalendarza: 2026-10-20 10:00 CEST (08:00 UTC) → 2026-10-27 10:00 CET (09:00 UTC)
    lodFed: Date.UTC(2026, 9, 20, 8, 0),
    lodTermin: Date.UTC(2026, 9, 27, 9, 0),
  },
  {
    strefa: 'America/New_York',
    dzienW5: '2026-10-22',
    // 2026-10-31 20:00 EDT (00:00 UTC 1.11) + 12 h = 2026-11-01 07:00 EST (12:00 UTC)
    fed: Date.UTC(2026, 10, 1, 0, 0),
    termin: Date.UTC(2026, 10, 1, 12, 0),
    dzienTerminu: '2026-11-01',
    // 2026-10-28 10:00 EDT (14:00 UTC) → 2026-11-04 10:00 EST (15:00 UTC)
    lodFed: Date.UTC(2026, 9, 28, 14, 0),
    lodTermin: Date.UTC(2026, 10, 4, 15, 0),
  },
])('kalendarz D4a: dzień lokalny i zmiana czasu w $strefa (NFR-KAL-003)', ({ strefa, dzienW5, fed, termin, dzienTerminu, lodFed, lodTermin }) => {
  wStrefie(strefa);

  it('RD-29-W5: wpis Dziennika 2026-10-22 22:30 UTC należy do dnia lokalnego strefy', () => {
    const at = Date.UTC(2026, 9, 22, 22, 30);
    const zd = zdarzeniaKalendarza(dane({ dziennik: [{ id: 'd', recipeName: 'X', startedAt: at - H, finishedAt: at }] }), at + H);
    expect(zd.map((z) => z.dzien)).toEqual([dzienW5]);
  });

  it('karmienie na blacie przez noc zmiany czasu: +12 h rzeczywistych, dzień lokalny terminu', () => {
    const zd = zdarzeniaKalendarza(dane({ zakwasy: [{ id: 'z', name: 'Z', storageState: 'ROOM_TEMP', lastFedAt: fed }] }), fed + H);
    expect(zd.map((z) => [z.at, z.dzien])).toEqual([[termin, dzienTerminu]]);
  });

  it('karmienie w lodówce: 7 dni kalendarza o tej samej godzinie ściennej, nie 7 × 24 h (D-093)', () => {
    const zd = zdarzeniaKalendarza(dane({ zakwasy: [{ id: 'z', name: 'Z', storageState: 'FRIDGE', lastFedAt: lodFed }] }), lodFed + H);
    expect(zd.map((z) => z.at)).toEqual([lodTermin]);
  });
});
