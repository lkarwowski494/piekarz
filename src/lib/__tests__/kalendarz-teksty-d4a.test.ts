/**
 * Teksty kalendarza (M3 D4a): zdanie „Następne” jednym zdaniem z „·” (D-094), „Zaległe” na początku, opcjonalne tak
 * samo widoczne (słowem), „+N” i etykieta VoiceOver z pełną listą (BR-KAL-003). Brzmienia z listy roli 04
 * (audit/M3-2026-10-22/role/04-a2/04-a2-opcje.md); EN w słowniku, 33 języki czekają na przebieg a5.
 */
import { setLang } from '../i18n';
import { EN } from '../i18n.en';
import { etykietyZaleglego, napisyZaleglego, opisZdarzenia, tekstyNastepne } from '../kalendarz-teksty';
import { zdarzeniaKalendarza, type DaneKalendarza, type KalendarzWypiek } from '../../core/kalendarz-zdarzenia';
import { liniaNastepne } from '../../core/kalendarz-nastepne';
import type { PlanStarter } from '../../core/notification-plan';
import { wStrefie } from '../../core/__tests__/helpers/strefa';

const H = 3_600_000;
const lok = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const BRAK: DaneKalendarza = { wypieki: [], zaplanowane: [], zakwasy: [], wpisyZakwasow: [], dziennik: [], pominiecia: [], dostep: { terminyKarmienia: true, przyszleWypieki: true } };
const krok = (name: string, start: number) => ({ id: name, name, plannedStart: start, plannedEnd: start + H });
const wypiek = (id: string, steps: KalendarzWypiek['steps'], extra: Partial<KalendarzWypiek> = {}): KalendarzWypiek => ({
  id, recipeName: id, steps, stepIdx: 0, timerEndsAt: null, pausedLeftSec: null, zaczetyZDostepem: true, ...extra,
});
const naBlacie = (name: string, termin: number): PlanStarter => ({ id: name, name, storageState: 'ROOM_TEMP', lastFedAt: termin - 12 * H });

const NOWE_KLUCZE = [
  'Następne: {lista}',
  'Zaległe: {co} ({h})',
  '{kiedy} {h} {co}',
  '{co}, opcjonalne',
  '+{n}',
  'Pokaż jeszcze {n} w arkuszu dnia',
  '{co} z {h}: zrobione',
  'Pomiń {co} z {h}',
  'Pomiń',
  '{wypiek}: gotowe',
  'karmienie zakwasu {zakwas}',
  'Dokarmiony {zakwas}',
  'Zakładanie zakwasu: dzień {n}, do zrobienia',
  'Zakładanie zakwasu: dzień {n} zapisany',
  '{wypiek}: ocena {ocena} z 5',
];

describe('teksty kalendarza (Europe/Warsaw, PL)', () => {
  wStrefie('Europe/Warsaw');
  afterEach(() => setLang('pl'));

  it('BR-KAL-003 Czytnik ekranu: zaległe na początku, zdanie z „·”, „+2” i etykieta VoiceOver z pełną listą (RD-32-W5)', () => {
    const now = lok(2026, 10, 23, 9);
    const d: DaneKalendarza = {
      ...BRAK,
      wypieki: [wypiek('chleb', [krok('Mieszanie', lok(2026, 10, 23, 10))])],
      zakwasy: [naBlacie('A', lok(2026, 10, 22, 8)), naBlacie('B', lok(2026, 10, 23, 7)), naBlacie('C', lok(2026, 10, 23, 11)), naBlacie('D', lok(2026, 10, 24, 12))],
    };
    const tx = tekstyNastepne(liniaNastepne(zdarzeniaKalendarza(d, now), now), { now, wieleWypiekow: false });
    expect(tx.zalegle).toEqual(['Zaległe: karmienie zakwasu A (22.10, 08:00)', 'Zaległe: karmienie zakwasu B (07:00)']);
    expect(tx.nastepne).toBe('Następne: dziś 10:00 Mieszanie');
    expect(tx.plus).toBe('+2');
    expect(tx.etykietaPlus).toBe('Pokaż jeszcze 2 w arkuszu dnia');
    expect(tx.etykieta).toBe(
      'Zaległe: karmienie zakwasu A (22.10, 08:00). Zaległe: karmienie zakwasu B (07:00). Następne: dziś 10:00 Mieszanie; dziś 11:00 karmienie zakwasu C; jutro 12:00 karmienie zakwasu D'
    );
    const [a] = liniaNastepne(zdarzeniaKalendarza(d, now), now).zalegle;
    expect(etykietyZaleglego(a, { now, wieleWypiekow: false })).toEqual({
      zrobione: 'karmienie zakwasu A z 22.10, 08:00: zrobione',
      pomin: 'Pomiń karmienie zakwasu A z 22.10, 08:00',
    });
    expect(napisyZaleglego()).toEqual({ zrobione: 'Zrobione', pomin: 'Pomiń' });
  });

  it('BR-KAL-003 Wypiek i karmienie w tym samym czasie: jedno zdanie z obydwoma, separator „·”, bez „+N” (RD-32-W1)', () => {
    const now = lok(2026, 10, 22, 8);
    const d: DaneKalendarza = {
      ...BRAK,
      wypieki: [wypiek('chleb', [krok('Formowanie', lok(2026, 10, 22, 7)), krok('Pieczenie', lok(2026, 10, 22, 10))], { timerEndsAt: lok(2026, 10, 22, 10) })],
      zakwasy: [naBlacie('Żytni', lok(2026, 10, 22, 10, 30))],
    };
    const tx = tekstyNastepne(liniaNastepne(zdarzeniaKalendarza(d, now), now), { now, wieleWypiekow: false });
    expect(tx).toEqual({
      zalegle: [],
      nastepne: 'Następne: dziś 10:00 Pieczenie · dziś 10:30 karmienie zakwasu Żytni',
      plus: null,
      etykieta: 'Następne: dziś 10:00 Pieczenie; dziś 10:30 karmienie zakwasu Żytni',
      etykietaPlus: null,
    });
  });

  it('BR-KAL-003 Zadanie opcjonalne wygląda jak obowiązkowe: różnica tylko słowem „opcjonalne”', () => {
    const now = lok(2026, 10, 22, 8);
    const lod: PlanStarter = { id: 'p', name: 'Pszenny', storageState: 'FRIDGE', lastFedAt: lok(2026, 10, 16, 9) };
    const tx = tekstyNastepne(liniaNastepne(zdarzeniaKalendarza({ ...BRAK, zakwasy: [lod] }, now), now), { now, wieleWypiekow: false });
    expect(tx.nastepne).toBe('Następne: jutro 09:00 karmienie zakwasu Pszenny, opcjonalne');
  });

  it('opis zdarzeń: krok z nazwą wypieku przy dwóch, gotowe, dokarmiony, dzień zakładania, Dziennik z oceną', () => {
    const now = lok(2026, 10, 22, 9);
    const start = lok(2026, 10, 20, 21);
    const d: DaneKalendarza = {
      ...BRAK,
      wypieki: [wypiek('Chleb', [krok('Mieszanie', lok(2026, 10, 22, 10))])],
      zaplanowane: [{ id: 'p', recipeName: 'Pizza', steps: [krok('Mieszanie', lok(2026, 10, 24, 8))] }],
      zakwasy: [{ id: 'z', name: 'Żytni', storageState: 'ROOM_TEMP', lastFedAt: start, setupStartedAt: start }],
      wpisyZakwasow: [{ id: 'w', starterId: 'z', kind: 'feeding', occurredAt: start }],
      dziennik: [
        { id: 'd1', recipeName: 'Wiejski', startedAt: lok(2026, 10, 19, 7), finishedAt: lok(2026, 10, 19, 18), ratingStars: 4 },
        { id: 'd2', recipeName: 'Bagietka', startedAt: lok(2026, 10, 18, 7), finishedAt: lok(2026, 10, 18, 18) },
      ],
    };
    const o = { now, wieleWypiekow: true };
    const opisy = zdarzeniaKalendarza(d, now).map((z) => opisZdarzenia(z, o));
    expect(opisy).toEqual(
      expect.arrayContaining([
        'Chleb, krok: Mieszanie',
        'Chleb: gotowe',
        'Pizza, krok: Mieszanie',
        'Dokarmiony Żytni',
        'Zakładanie zakwasu: dzień 1 zapisany',
        'Zakładanie zakwasu: dzień 3, do zrobienia',
        'Wiejski: ocena 4 z 5',
        'Bagietka',
      ])
    );
    // przy jednym wypieku krok bez nazwy wypieku; zaplanowany zawsze z nazwą
    const jeden = zdarzeniaKalendarza(d, now).map((z) => opisZdarzenia(z, { now, wieleWypiekow: false }));
    expect(jeden).toEqual(expect.arrayContaining(['Mieszanie', 'Pizza, krok: Mieszanie']));
  });

  it('nowe klucze mają wpis EN; po angielsku zdanie z kluczy EN', () => {
    for (const k of NOWE_KLUCZE) expect([k, typeof EN[k]]).toEqual([k, 'string']);
    setLang('en');
    const now = lok(2026, 10, 22, 8);
    const tx = tekstyNastepne(liniaNastepne(zdarzeniaKalendarza({ ...BRAK, zakwasy: [naBlacie('Rye', lok(2026, 10, 22, 8))] }, now), now), { now, wieleWypiekow: false });
    expect(tx.zalegle[0]).toMatch(/^Overdue: /);
  });
});
