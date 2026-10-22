/**
 * Poprzedni i następny tydzień, widok miesiąca (M3 D7; BR-KAL-008, BR-KAL-013; RD-30; makieta roli 04 a2
 * `101-przewijanie` i `12-miesiac`). Wektory RD-30 z BRD; chwile z lokalnych składników w strefie bloku (DST).
 */
import { setLang } from '../i18n';
import { dniPaska, dzienPaska } from '../kalendarz-pasek';
import {
  czyBiezacy,
  dniMiesiaca,
  dniTygodniaIso,
  kierunekGestu,
  nazwaDniaTygodnia,
  przesunWidok,
  tytulWidoku,
  widokDzis,
  zakresWidoku,
  zmienTryb,
  type TrybWidoku,
} from '../kalendarz-widok';
import { PROG_GESTU_PT, NAJBLIZSZE_DNI } from '../../core/kalendarz-config';
import { wStrefie } from '../../core/__tests__/helpers/strefa';

const lok = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const klucze = (now: number, w: { kotwica: number }, first: 0 | 1) => dniPaska(now, first, w.kotwica).map((d) => d.klucz);
const tydzien = (...dni: string[]) => dni;

describe('BR-KAL-008 poprzedni i następny tydzień (Europe/Warsaw, PL)', () => {
  wStrefie('Europe/Warsaw');
  afterEach(() => setLang('pl'));

  it('BR-KAL-008 Następny tydzień przy zmianie czasu: od tygodnia 19.10 → pon. 26.10 – niedz. 1.11 (RD-30-W4, dni kalendarza)', () => {
    const now = lok(2026, 10, 22, 10);
    const w = przesunWidok(widokDzis('tydzien', now), 1);
    expect(klucze(now, w, 1)).toEqual(tydzien('2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'));
    // Pierwszy dzień to północ lokalna, nie 2026-10-25 23:00 (7 × 24 h po zmianie czasu)
    expect(new Date(dniPaska(now, 1, w.kotwica)[0].ms).getHours()).toBe(0);
    expect(dniPaska(now, 1, w.kotwica).some((d) => d.dzis)).toBe(false);
  });

  it('RD-30-W5 ostatni dzień tygodnia (25.10, doba 25 h): tydzień 19–25, poprzedni 12–18, następny 26.10–1.11', () => {
    const now = lok(2026, 10, 25, 23, 30);
    expect(klucze(now, widokDzis('tydzien', now), 1)[0]).toBe('2026-10-19');
    expect(klucze(now, przesunWidok(widokDzis('tydzien', now), -1), 1)).toEqual(
      tydzien('2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18')
    );
    expect(klucze(now, przesunWidok(widokDzis('tydzien', now), 1), 1)[0]).toBe('2026-10-26');
  });

  it('RD-30-W3 dziś = pierwszy dzień tygodnia; cztery tygodnie wstecz i z powrotem bez dryfu godzin', () => {
    const now = lok(2026, 10, 19, 8);
    let w = widokDzis('tydzien', now);
    for (let i = 0; i < 4; i++) w = przesunWidok(w, -1);
    expect(klucze(now, w, 1)[0]).toBe('2026-09-21');
    for (let i = 0; i < 4; i++) w = przesunWidok(w, 1);
    expect(klucze(now, w, 1)[0]).toBe('2026-10-19');
  });

  it('BR-KAL-008 Powrót do dziś: tydzień sprzed miesiąca → widokDzis wyróżnia dziś; czyBiezacy tylko dla tygodnia z dziś', () => {
    const now = lok(2026, 10, 22, 10);
    let w = widokDzis('tydzien', now);
    for (let i = 0; i < 5; i++) w = przesunWidok(w, -1);
    expect(czyBiezacy(w, now, 1)).toBe(false);
    expect(dniPaska(now, 1, w.kotwica).some((d) => d.dzis)).toBe(false);
    const powrot = widokDzis(w.tryb, now);
    expect(czyBiezacy(powrot, now, 1)).toBe(true);
    expect(dniPaska(now, 1, powrot.kotwica).find((d) => d.dzis)?.klucz).toBe('2026-10-22');
  });

  it('tytuł tygodnia przez Intl: „12–18 października”, przez granicę miesiąca obie daty; en „October 12 – 18”', () => {
    const now = lok(2026, 10, 22, 10);
    expect(tytulWidoku(przesunWidok(widokDzis('tydzien', now), -1), 1)).toBe('12–18 października');
    // Intl wstawia wąskie spacje wokół półpauzy
    expect(tytulWidoku(przesunWidok(widokDzis('tydzien', now), 1), 1)).toMatch(/^26 października\s–\s1 listopada$/);
    setLang('en');
    expect(tytulWidoku(przesunWidok(widokDzis('tydzien', now), -1), 1)).toMatch(/^October 12\s–\s18$/);
  });

  it('zakres zdarzeń: tydzień sprzed miesiąca razem z dziś i 7 dniami naprzód (linia „Następne” bez zmian)', () => {
    const now = lok(2026, 10, 22, 10);
    let w = widokDzis('tydzien', now);
    for (let i = 0; i < 4; i++) w = przesunWidok(w, -1);
    const z = zakresWidoku(w, 1, now);
    expect(z.odMs).toBe(lok(2026, 9, 21));
    expect(z.doMs).toBeGreaterThanOrEqual(lok(2026, 10, 22 + NAJBLIZSZE_DNI + 1));
    const nast = zakresWidoku(przesunWidok(widokDzis('tydzien', now), 1), 1, now);
    // Następny tydzień i dziś (22.10) z 7 dniami naprzód: od dziś do końca następnego tygodnia
    expect(nast.odMs).toBe(lok(2026, 10, 22));
    expect(nast.doMs).toBe(lok(2026, 11, 2));
  });
});

describe('BR-KAL-008 tydzień w USA (America/New_York)', () => {
  wStrefie('America/New_York');

  it('RD-30-W6 niedziela 1.11 ze zmianą czasu w USA: tydzień 1–7.11; z poprzedniego tygodnia (25–31.10) następny to 1–7.11', () => {
    const now = lok(2026, 11, 1, 12);
    expect(klucze(now, widokDzis('tydzien', now), 0)).toEqual(
      tydzien('2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07')
    );
    const wczesniej = lok(2026, 10, 28, 12);
    expect(klucze(wczesniej, przesunWidok(widokDzis('tydzien', wczesniej), 1), 0)[0]).toBe('2026-11-01');
  });
});

describe('BR-KAL-013 widok miesiąca (Europe/Warsaw)', () => {
  wStrefie('Europe/Warsaw');
  afterEach(() => setLang('pl'));

  it('BR-KAL-013 październik 2026, PL: 5 tygodni od pon. 28.09 do niedz. 1.11; dni spoza miesiąca oznaczone, dziś 22', () => {
    const now = lok(2026, 10, 22, 10);
    const tyg = dniMiesiaca(widokDzis('miesiac', now).kotwica, 1, now);
    expect(tyg).toHaveLength(5);
    expect(tyg.every((r) => r.length === 7)).toBe(true);
    expect(tyg[0][0].klucz).toBe('2026-09-28');
    expect(tyg[4][6].klucz).toBe('2026-11-01');
    const plaskie = tyg.flat();
    expect(plaskie.filter((d) => d.wMiesiacu)).toHaveLength(31);
    expect(plaskie.find((d) => d.klucz === '2026-09-30')?.wMiesiacu).toBe(false);
    expect(plaskie.filter((d) => d.dzis).map((d) => d.klucz)).toEqual(['2026-10-22']);
    // Każdy dzień to północ lokalna także w tygodniu ze zmianą czasu (25.10)
    expect(plaskie.every((d) => new Date(d.ms).getHours() === 0)).toBe(true);
  });

  it('BR-KAL-013 miesiąc w USA zaczyna tydzień od niedzieli; następny i poprzedni miesiąc; tytuł „Listopad 2026”', () => {
    const now = lok(2026, 10, 22, 10);
    const w = widokDzis('miesiac', now);
    expect(dniMiesiaca(w.kotwica, 0, now)[0][0].klucz).toBe('2026-09-27');
    const listopad = przesunWidok(w, 1);
    expect(tytulWidoku(listopad, 1)).toBe('Listopad 2026');
    expect(dniMiesiaca(listopad.kotwica, 1, now)[0][0].klucz).toBe('2026-10-26');
    expect(tytulWidoku(przesunWidok(przesunWidok(w, -1), -9), 1)).toBe('Grudzień 2025');
    expect(czyBiezacy(w, now, 1)).toBe(true);
    expect(czyBiezacy(listopad, now, 1)).toBe(false);
    setLang('en');
    expect(tytulWidoku(w, 1)).toBe('October 2026');
  });

  it('zmiana trybu: miesiąc → tydzień pokazuje tydzień z dziś w bieżącym miesiącu, a w innym — pierwszy tydzień miesiąca', () => {
    const now = lok(2026, 10, 22, 10);
    const tydz = zmienTryb(widokDzis('miesiac', now), 'tydzien', now);
    expect(dniPaska(now, 1, tydz.kotwica).some((d) => d.dzis)).toBe(true);
    const grudzien = zmienTryb(przesunWidok(widokDzis('miesiac', now), 2), 'tydzien', now);
    expect(dniPaska(now, 1, grudzien.kotwica).map((d) => d.klucz)).toContain('2026-12-01');
    const zTygodnia = zmienTryb(przesunWidok(widokDzis('tydzien', now), 2), 'miesiac', now);
    expect(tytulWidoku(zTygodnia, 1)).toBe('Listopad 2026');
  });

  it('oba tryby (TrybWidoku): widokDzis zawiera dziś, przejście tam i z powrotem wraca do tego samego okresu', () => {
    const now = lok(2026, 10, 22, 10);
    const tryby: TrybWidoku[] = ['tydzien', 'miesiac'];
    for (const t of tryby) {
      const w = widokDzis(t, now);
      expect(w.tryb).toBe(t);
      expect(czyBiezacy(w, now, 1)).toBe(true);
      expect(przesunWidok(przesunWidok(w, 1), -1)).toEqual(w);
    }
  });

  it('dzienPaska: klucz i północ dnia, „dziś” tylko dla dnia z now, skrót i numer przez Intl', () => {
    const now = lok(2026, 10, 22, 10);
    expect(dzienPaska(lok(2026, 10, 22), now)).toEqual({ klucz: '2026-10-22', ms: lok(2026, 10, 22), dzis: true, skrot: 'czw.', numer: '22' });
    expect(dzienPaska(lok(2026, 10, 25), now).dzis).toBe(false);
  });

  it('zakres miesiąca obejmuje całą siatkę (28.09 – 2.11) i najbliższe dni od dziś', () => {
    const now = lok(2026, 10, 22, 10);
    const z = zakresWidoku(widokDzis('miesiac', now), 1, now);
    expect(z).toEqual({ odMs: lok(2026, 9, 28), doMs: lok(2026, 11, 2) });
  });

  it('nazwy dni ISO przez Intl i kolejność tygodnia regionu', () => {
    expect(nazwaDniaTygodnia(7)).toBe('niedziela');
    expect(nazwaDniaTygodnia(6)).toBe('sobota');
    expect(nazwaDniaTygodnia(1, 'short')).toBe('pon.');
    expect(dniTygodniaIso(1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(dniTygodniaIso(0)).toEqual([7, 1, 2, 3, 4, 5, 6]);
    expect(dniTygodniaIso(6)).toEqual([6, 7, 1, 2, 3, 4, 5]);
  });
});

describe('BR-KAL-008 gest w bok', () => {
  it('w lewo o próg → następny, w prawo → poprzedni; za mało albo bardziej w pionie → nic', () => {
    expect(kierunekGestu(-PROG_GESTU_PT, 0)).toBe(1);
    expect(kierunekGestu(PROG_GESTU_PT, 5)).toBe(-1);
    expect(kierunekGestu(PROG_GESTU_PT - 1, 0)).toBe(0);
    expect(kierunekGestu(-60, 70)).toBe(0);
  });
});
