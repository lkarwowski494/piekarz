/**
 * Pasek tygodnia na „Dziś” (M3 D4b, BR-KAL-001, BR-KAL-002): dni od pierwszego dnia tygodnia regionu, dziś,
 * glify różne kształtem (makieta roli 04 a2: spirala, trójkąt drugiego wypieku, bochenek, kropka, pierścień, słoik),
 * ciąg wypieku wielodniowego, etykieta VoiceOver dnia (pełna data, „dziś”, zdarzenia słowami, „i jeszcze N”).
 */
import { setLang } from '../i18n';
import { ciagDnia, dataSlownie, dniPaska, glifyDnia, MAKS_GLIFOW_DNIA, type GlifZdarzenia } from '../kalendarz-pasek';
import { etykietaDnia } from '../kalendarz-teksty';
import { zdarzeniaKalendarza, type DaneKalendarza, type KalendarzWypiek } from '../../core/kalendarz-zdarzenia';
import { znacznikiDni } from '../../core/kalendarz-nastepne';
import type { PlanStarter } from '../../core/notification-plan';
import { wStrefie } from '../../core/__tests__/helpers/strefa';

const H = 3_600_000;
const lok = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const BRAK: DaneKalendarza = { wypieki: [], zaplanowane: [], zakwasy: [], wpisyZakwasow: [], dziennik: [], pominiecia: [], dostep: { terminyKarmienia: true, przyszleWypieki: true } };
const krok = (name: string, start: number, koniec = start + H) => ({ id: name, name, plannedStart: start, plannedEnd: koniec });
const wypiek = (id: string, steps: KalendarzWypiek['steps'], extra: Partial<KalendarzWypiek> = {}): KalendarzWypiek => ({
  id, recipeName: id, steps, stepIdx: 0, timerEndsAt: null, pausedLeftSec: null, zaczetyZDostepem: true, ...extra,
});
const naBlacie = (name: string, termin: number): PlanStarter => ({ id: name, name, storageState: 'ROOM_TEMP', lastFedAt: termin - 12 * H });

describe('pasek tygodnia (Europe/Warsaw, PL)', () => {
  wStrefie('Europe/Warsaw');
  afterEach(() => setLang('pl'));

  it('BR-KAL-001 Tydzień w Polsce: pon. 19 – niedz. 25, dziś czwartek 22', () => {
    const dni = dniPaska(lok(2026, 10, 22, 10), 1);
    expect(dni.map((d) => d.numer)).toEqual(['19', '20', '21', '22', '23', '24', '25']);
    expect(dni.filter((d) => d.dzis).map((d) => d.klucz)).toEqual(['2026-10-22']);
    expect(dni[0].skrot).toBe('pon.');
    expect(dni[3].skrot).toBe('czw.');
  });

  it('BR-KAL-001 Tydzień w USA: niedz. 18 – sob. 24', () => {
    expect(dniPaska(lok(2026, 10, 22, 10), 0).map((d) => d.klucz)).toEqual([
      '2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24',
    ]);
  });

  it('BR-KAL-001 Północ: po 23:59 środy dziś to czwartek', () => {
    expect(dniPaska(lok(2026, 10, 21, 23, 59), 1).find((d) => d.dzis)?.klucz).toBe('2026-10-21');
    expect(dniPaska(lok(2026, 10, 22, 0, 0), 1).find((d) => d.dzis)?.klucz).toBe('2026-10-22');
  });

  it('data na pasie: dzień tygodnia wielką literą, dzień i miesiąc słownie', () => {
    expect(dataSlownie(lok(2026, 10, 22, 10))).toBe('Czwartek, 22 października');
    setLang('en');
    expect(dataSlownie(lok(2026, 10, 22, 10))).toMatch(/^Thursday/);
  });

  it('BR-KAL-002 Znaczniki dnia: glify różne kształtem, drugi wypiek trójkątem, zaległe osobno, najwyżej 3', () => {
    const now = lok(2026, 10, 22, 12);
    const d: DaneKalendarza = {
      ...BRAK,
      wypieki: [
        wypiek('chleb', [krok('Mieszanie', lok(2026, 10, 22, 6)), krok('Pieczenie', lok(2026, 10, 23, 9))], { timerEndsAt: lok(2026, 10, 23, 9) }),
        wypiek('pizza', [krok('Kulki', lok(2026, 10, 22, 10)), krok('Pieczenie', lok(2026, 10, 22, 18))], { timerEndsAt: lok(2026, 10, 22, 18) }),
      ],
      zakwasy: [naBlacie('Żytni', lok(2026, 10, 22, 8))],
      wpisyZakwasow: [{ id: 'w', starterId: 'Żytni', kind: 'feeding', occurredAt: lok(2026, 10, 21, 20) }],
      dziennik: [{ id: 'd', recipeName: 'Wiejski', startedAt: lok(2026, 10, 19, 7), finishedAt: lok(2026, 10, 19, 18), ratingStars: 4 }],
    };
    const zd = zdarzeniaKalendarza(d, now);
    const kolejnosc = ['chleb', 'pizza'];
    const czw = glifyDnia(zd, '2026-10-22', kolejnosc);
    expect(czw.zalegle).toBe(true); // karmienie z 8:00 minęło
    expect(czw.glify.length).toBeLessThanOrEqual(MAKS_GLIFOW_DNIA);
    expect(czw.glify.slice(0, 2)).toEqual<GlifZdarzenia[]>(['wypiek', 'wypiek2']);
    expect(glifyDnia(zd, '2026-10-21', kolejnosc)).toEqual({ glify: ['karmienie'], zalegle: false });
    expect(glifyDnia(zd, '2026-10-19', kolejnosc)).toEqual({ glify: ['dziennik'], zalegle: false });
    expect(glifyDnia(zd, '2026-10-24', kolejnosc)).toEqual({ glify: [], zalegle: false });
    const wszystkie: GlifZdarzenia[] = ['wypiek', 'wypiek2', 'gotowe', 'dziennik', 'karmienie', 'karmienie-nastepne', 'zakladanie'];
    expect(new Set(wszystkie).size).toBe(7);
  });

  it('wypiek wielodniowy jako ciągła linia: od pierwszego do ostatniego dnia, połówki na końcach', () => {
    const now = lok(2026, 10, 21, 9);
    const w = wypiek('zytni', [krok('Mieszanie', lok(2026, 10, 21, 14)), krok('Studzenie', lok(2026, 10, 22, 20), lok(2026, 10, 23, 20))]);
    const dni = dniPaska(now, 1).map((x) => x.klucz);
    const c = ciagDnia(znacznikiDni(zdarzeniaKalendarza({ ...BRAK, wypieki: [w] }, now), dni), dni);
    expect(c['2026-10-20']).toEqual({ lewa: false, prawa: false });
    expect(c['2026-10-21']).toEqual({ lewa: false, prawa: true });
    expect(c['2026-10-22']).toEqual({ lewa: true, prawa: true });
    expect(c['2026-10-23']).toEqual({ lewa: true, prawa: false });
  });

  it('BR-KAL-001 Etykieta dla czytnika ekranu: pełna data, „dziś”, zdarzenia słowami; dzień pusty „Nic w planach”', () => {
    const now = lok(2026, 10, 22, 9);
    const d: DaneKalendarza = {
      ...BRAK,
      wypieki: [wypiek('chleb', [krok('Mieszanie', lok(2026, 10, 22, 6)), krok('Składanie', lok(2026, 10, 22, 10)), krok('Formowanie', lok(2026, 10, 22, 11)), krok('Pieczenie', lok(2026, 10, 22, 12))], { stepIdx: 0, timerEndsAt: lok(2026, 10, 22, 10) })],
      zakwasy: [naBlacie('Żytni', lok(2026, 10, 22, 8))],
    };
    const zd = zdarzeniaKalendarza(d, now);
    const o = { now, wieleWypiekow: false };
    const dzis = etykietaDnia(zd.filter((z) => z.dzien === '2026-10-22'), { ms: lok(2026, 10, 22), dzis: true }, o);
    expect(dzis.startsWith('czwartek, 22 października, dziś. ')).toBe(true);
    expect(dzis).toContain('Zaległe: karmienie zakwasu Żytni (08:00)');
    expect(dzis).toContain('06:00 Mieszanie');
    expect(dzis).toMatch(/i jeszcze \d+, szczegóły w arkuszu dnia$/);
    expect(etykietaDnia([], { ms: lok(2026, 10, 24), dzis: false }, o)).toBe('sobota, 24 października. Nic w planach');
  });
});
