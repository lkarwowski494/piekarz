// ============================================================================
// Piekarz — widok kalendarza na „Dziś”: poprzedni i następny tydzień, miesiąc (BR-KAL-008, BR-KAL-013; RD-30; D-110)
// [M3 D7]. Czyste funkcje: przesunięcie o dni KALENDARZA (tydzień = 7 dni kalendarza, nie 7 × 24 h; RD-30-W4),
// siatka miesiąca od pierwszego dnia tygodnia regionu, tytuł okresu przez Intl w języku aplikacji, kierunek gestu.
// ============================================================================

import { addCalendarDays, startOfLocalDay, weekStart, type FirstWeekday } from '../core/dzien-lokalny';
import { NAJBLIZSZE_DNI, PROG_GESTU_PT } from '../core/kalendarz-config';
import { dzienPaska, type DzienPaska } from './kalendarz-pasek';
import { appLocale, formatDate } from './format';

export type TrybWidoku = 'tydzien' | 'miesiac';

/** Co widać: tryb i kotwica (północ dnia w pokazanym tygodniu albo pierwszego dnia miesiąca). */
export interface Widok {
  tryb: TrybWidoku;
  kotwica: number;
}

/** Dzień siatki miesiąca: dni sąsiednich miesięcy uzupełniają pierwszy i ostatni tydzień. */
export interface DzienMiesiaca extends DzienPaska {
  wMiesiacu: boolean;
}

const pierwszyDzienMiesiaca = (ms: number, n = 0) => {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth() + n, 1).getTime();
};
const tenSamMiesiac = (a: number, b: number) => {
  const x = new Date(a);
  const y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth();
};

/** Widok z dzisiejszym dniem. */
export function widokDzis(tryb: TrybWidoku, now: number): Widok {
  return { tryb, kotwica: tryb === 'tydzien' ? startOfLocalDay(now) : pierwszyDzienMiesiaca(now) };
}

/** Poprzedni (n = −1) albo następny (n = 1) tydzień lub miesiąc; tydzień o 7·n dni kalendarza (RD-30). */
export function przesunWidok(w: Widok, n: number): Widok {
  return w.tryb === 'tydzien'
    ? { tryb: w.tryb, kotwica: addCalendarDays(startOfLocalDay(w.kotwica), 7 * n) }
    : { tryb: w.tryb, kotwica: pierwszyDzienMiesiaca(w.kotwica, n) };
}

/** Zmiana trybu: miesiąc z dziś → tydzień z dziś; inny miesiąc → jego pierwszy tydzień; tydzień → miesiąc kotwicy. */
export function zmienTryb(w: Widok, tryb: TrybWidoku, now: number): Widok {
  if (tryb === w.tryb) return w;
  if (tryb === 'miesiac') return { tryb, kotwica: pierwszyDzienMiesiaca(w.kotwica) };
  return { tryb, kotwica: tenSamMiesiac(w.kotwica, now) ? startOfLocalDay(now) : startOfLocalDay(w.kotwica) };
}

/** Czy pokazany okres zawiera dziś (wtedy „Dziś” nie jest potrzebne). */
export function czyBiezacy(w: Widok, now: number, first: FirstWeekday): boolean {
  return w.tryb === 'tydzien' ? weekStart(w.kotwica, first) === weekStart(now, first) : tenSamMiesiac(w.kotwica, now);
}

/** Tygodnie siatki miesiąca kotwicy (4–6 rzędów po 7 dni), od pierwszego dnia tygodnia regionu. */
export function dniMiesiaca(kotwica: number, first: FirstWeekday, now: number): DzienMiesiaca[][] {
  const pierwszy = pierwszyDzienMiesiaca(kotwica);
  const nastepny = pierwszyDzienMiesiaca(kotwica, 1);
  const tygodnie: DzienMiesiaca[][] = [];
  for (let start = weekStart(pierwszy, first); start < nastepny && tygodnie.length < 6; start = addCalendarDays(start, 7)) {
    tygodnie.push(Array.from({ length: 7 }, (_, i) => {
      const ms = addCalendarDays(start, i);
      return { ...dzienPaska(ms, now), wMiesiacu: tenSamMiesiac(ms, pierwszy) };
    }));
  }
  return tygodnie;
}

/** Zakres zdarzeń: pokazany okres i zawsze dziś + najbliższe dni (linia „Następne”, arkusz „+N”). */
export function zakresWidoku(w: Widok, first: FirstWeekday, now: number): { odMs: number; doMs: number } {
  let od: number;
  let doMs: number;
  if (w.tryb === 'tydzien') {
    od = weekStart(w.kotwica, first);
    doMs = addCalendarDays(od, 7);
  } else {
    const tyg = dniMiesiaca(w.kotwica, first, now);
    od = tyg[0]?.[0]?.ms ?? pierwszyDzienMiesiaca(w.kotwica);
    const ostatni = tyg[tyg.length - 1]?.[6]?.ms;
    doMs = ostatni === undefined ? pierwszyDzienMiesiaca(w.kotwica, 1) : addCalendarDays(ostatni, 1);
  }
  const dzis = startOfLocalDay(now);
  return { odMs: Math.min(od, dzis), doMs: Math.max(doMs, addCalendarDays(dzis, NAJBLIZSZE_DNI + 1)) };
}

/** Tytuł okresu: „12–18 października” (zakres dat przez Intl), „Październik 2026”. */
export function tytulWidoku(w: Widok, first: FirstWeekday): string {
  const jezyk = appLocale();
  if (w.tryb === 'miesiac') {
    const s = formatDate(w.kotwica, jezyk, { month: 'long', year: 'numeric' });
    return s.charAt(0).toLocaleUpperCase(jezyk) + s.slice(1);
  }
  const od = weekStart(w.kotwica, first);
  const doMs = addCalendarDays(od, 6);
  const opcje: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  const f = new Intl.DateTimeFormat(jezyk, opcje);
  // formatRange skraca wspólną część („12–18 października”); bez niego obie daty
  return typeof f.formatRange === 'function' ? f.formatRange(new Date(od), new Date(doMs)) : [f.format(new Date(od)), f.format(new Date(doMs))].join(' – ');
}

/** Gest w bok: palcem w lewo → następny (1), w prawo → poprzedni (−1); za krótki albo bardziej pionowy → 0. */
export function kierunekGestu(dx: number, dy: number): -1 | 0 | 1 {
  if (Math.abs(dx) < PROG_GESTU_PT || Math.abs(dx) <= Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
}

/** Nazwa dnia tygodnia ISO (1 = poniedziałek … 7 = niedziela) w języku aplikacji (19.10.2026 to poniedziałek). */
export function nazwaDniaTygodnia(iso: number, forma: 'long' | 'short' = 'long'): string {
  return formatDate(new Date(2026, 9, 18 + iso), appLocale(), { weekday: forma });
}

/** Dni ISO w kolejności tygodnia regionu (pierwszy dzień tygodnia z RD-30). */
export function dniTygodniaIso(first: FirstWeekday): number[] {
  return Array.from({ length: 7 }, (_, i) => ((first + i) % 7) || 7);
}
