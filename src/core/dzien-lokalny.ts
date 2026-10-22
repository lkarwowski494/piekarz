// ============================================================================
// Piekarz — dzień lokalny i tydzień jako czyste funkcje (D-090, RD-29, RD-30; D-093) [M3 D0]
// Zdarzenie należy do daty lokalnej w bieżącej strefie urządzenia; dni przesuwamy o dni KALENDARZA, nie o N × 24 h
// (przy zmianie czasu doba ma 23 albo 25 h). Czas zawsze argumentem (ms UTC), strefa to strefa procesu.
// Dlaczego: pasek kalendarza, karta zakwasu i powiadomienie muszą pokazywać ten sam dzień (RYZ-22, RYZ-23).
// ============================================================================

/** Dzień tygodnia jak `Date.getDay()`: 0 = niedziela … 6 = sobota. */
export type FirstWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Północ lokalna dnia, do którego należy chwila. */
export function startOfLocalDay(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Data lokalna chwili jako „RRRR-MM-DD” w bieżącej strefie (RD-29). */
export function localDateKey(ms: number): string {
  const d = new Date(ms);
  const dwa = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dwa(d.getMonth() + 1)}-${dwa(d.getDate())}`;
}

/**
 * Ta sama godzina ścienna n dni kalendarza później (n może być ujemne). Godzina, której w tym dniu nie ma (luka
 * wiosennej zmiany czasu), przechodzi na pierwszą istniejącą chwilę po luce (02:30 → 03:30).
 */
export function addCalendarDays(ms: number, n: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()).getTime();
}

/** Liczba dni kalendarza od dnia `fromMs` do dnia `toMs` (godzina nie gra roli; ujemna, gdy `toMs` wcześniej). */
export function calendarDayDiff(fromMs: number, toMs: number): number {
  const a = new Date(fromMs);
  const b = new Date(toMs);
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000);
}

/** Północ pierwszego dnia tygodnia, w którym leży chwila (RD-30); `first`: 0 = niedziela, 1 = poniedziałek … */
export function weekStart(ms: number, first: FirstWeekday): number {
  const dzien = startOfLocalDay(ms);
  const cofnij = (new Date(dzien).getDay() - first + 7) % 7;
  return addCalendarDays(dzien, -cofnij);
}

/** Północe siedmiu dni tygodnia, w którym leży chwila, od pierwszego dnia tygodnia (RD-30). */
export function daysOfWeek(ms: number, first: FirstWeekday): number[] {
  const poczatek = weekStart(ms, first);
  return Array.from({ length: 7 }, (_, i) => addCalendarDays(poczatek, i));
}

/**
 * Chwila „dzień bazowy + offset dni, godzina:minuta” w czasie lokalnym. `shifted`: godziny w tym dniu nie ma (luka
 * zmiany czasu), więc chwila wypada później niż zażądano (02:30 → 03:30) i interfejs ma to powiedzieć (D-13, D-093).
 */
export function atLocalTime(baseMs: number, dayOffset: number, hour: number, minute: number): { ms: number; shifted: boolean } {
  const b = new Date(baseMs);
  const d = new Date(b.getFullYear(), b.getMonth(), b.getDate() + dayOffset, hour, minute, 0, 0);
  return { ms: d.getTime(), shifted: d.getHours() !== hour || d.getMinutes() !== minute };
}

// CLDR 48 supplemental weekData.firstDay (S-66; odczyt 2026-10-22): regiony z innym pierwszym dniem niż poniedziałek
// ("001" = poniedziałek). Wariant "GB-alt-variant" pominięty.
const SUN = new Set(
  ('AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN IS JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW').split(' ')
);
const SAT = new Set('AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'.split(' '));
const FRI = new Set(['MV']);

/**
 * Pierwszy dzień tygodnia paska (D-090, RD-30): ustawienie telefonu (`getCalendars().firstWeekday` z expo-localization,
 * 1 = niedziela … 7 = sobota, może być puste), a bez niego region według CLDR; bez regionu poniedziałek (RD-30-W7).
 */
export function resolveFirstWeekday(setting: number | null | undefined, region: string | null | undefined): FirstWeekday {
  if (typeof setting === 'number' && Number.isInteger(setting) && setting >= 1 && setting <= 7) return ((setting - 1) % 7) as FirstWeekday;
  const r = (region ?? '').toUpperCase();
  if (SUN.has(r)) return 0;
  if (SAT.has(r)) return 6;
  if (FRI.has(r)) return 5;
  return 1;
}
