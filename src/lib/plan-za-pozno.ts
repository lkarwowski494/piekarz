// ============================================================================
// Piekarz — plan wypieku: stan „za późno” (design-spec §11c „107”, makieta docs/design/ekrany/inne.html stan
// `plan-za-pozno`) [M1-audytor-generalny-107; 04-studio-projektowe-024]. Czyste funkcje: „teraz” przychodzi z argumentu.
//   • stan: początek pierwszego kroku planu (po dokarmieniu z lodówki, D-052) wcześniej niż teraz, z dokładnością do minuty;
//   • najwcześniejsza godzina gotowości: teraz (pełna minuta) + długość planu, w górę do pełnych 5 minut;
//   • dzień w środku zdania małą literą: wczoraj, dziś, jutro, pojutrze, dalej „{dzień tygodnia}, {d} {miesiąc}”.
// Plan bez godzin zostaje bez stanu (brak zostaje brakiem).
// ============================================================================

import { t } from './i18n';
import { appLocale, formatDate, formatTime } from './format';

const MIN_MS = 60_000;
const DOBA_MS = 24 * 60 * MIN_MS;

/** Najwcześniejsza godzina gotowości w górę do pełnych 5 minut (design-spec §11c „107”). */
export const ZAOKRAGLENIE_NAJWCZESNIEJ_MIN = 5;

export interface StanZaPozno {
  zaPozno: boolean;
  /** Początek pierwszego kroku planu (ms); null, gdy plan nie ma godzin. */
  startMs: number | null;
  /** Najwcześniejsza godzina gotowości (ms); null, gdy plan nie ma godzin. */
  najwczesniejMs: number | null;
}

type KrokPlanu = { plannedStart: number | null; plannedEnd: number | null };

export function stanZaPozno(steps: readonly KrokPlanu[], teraz: number): StanZaPozno {
  const startMs = steps[0]?.plannedStart ?? null;
  const koniecMs = steps[steps.length - 1]?.plannedEnd ?? null;
  if (startMs === null || koniecMs === null) return { zaPozno: false, startMs: null, najwczesniejMs: null };
  const terazMin = Math.floor(teraz / MIN_MS);
  const krok = ZAOKRAGLENIE_NAJWCZESNIEJ_MIN * MIN_MS;
  const najwczesniejMs = Math.ceil((terazMin * MIN_MS + (koniecMs - startMs)) / krok) * krok;
  return { zaPozno: Math.floor(startMs / MIN_MS) < terazMin, startMs, najwczesniejMs };
}

const dzienKalendarza = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const roznicaDni = (d: Date, teraz: Date) => Math.round((dzienKalendarza(d) - dzienKalendarza(teraz)) / DOBA_MS);

/** Dzień w środku zdania: „wczoraj”, „dziś”, „jutro”, „pojutrze”, dalej „sobota, 24 października” / “Saturday, October 24”. */
export function dzienWZdaniu(d: Date, teraz: Date): string {
  const r = roznicaDni(d, teraz);
  if (r === -1) return t('wczoraj');
  if (r === 0) return t('dziś');
  if (r === 1) return t('jutro');
  if (r === 2) return t('pojutrze');
  return formatDate(d, appLocale(), { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Tytuł i treść stanu „za późno”; null, gdy stanu nie ma. */
export function tekstZaPozno(stan: StanZaPozno, teraz: number): { tytul: string; tresc: string } | null {
  if (!stan.zaPozno || stan.startMs === null || stan.najwczesniejMs === null) return null;
  const terazD = new Date(teraz);
  return {
    tytul: t('Nie zdążysz na tę godzinę'),
    tresc: t('Plan musiałby się zacząć {dzienStartu} o {godzinaStartu}. Najwcześniej chleb będzie gotowy {dzienGotowe} o {godzinaGotowe}.', {
      dzienStartu: dzienWZdaniu(new Date(stan.startMs), terazD),
      godzinaStartu: formatTime(stan.startMs),
      dzienGotowe: dzienWZdaniu(new Date(stan.najwczesniejMs), terazD),
      godzinaGotowe: formatTime(stan.najwczesniejMs),
    }),
  };
}

/** Godzina gotowości jako pole planu: dzień względem dziś, godzina, minuta. */
export function celGotowosci(ms: number, teraz: number): { dayOffset: number; hour: number; minute: number } {
  const d = new Date(ms);
  return { dayOffset: roznicaDni(d, new Date(teraz)), hour: d.getHours(), minute: d.getMinutes() };
}
