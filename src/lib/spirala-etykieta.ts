// ============================================================================
// Piekarz — etykieta VoiceOver spirali koszyka (design-spec §2, §11b 058) [M1-audytor-generalny-058]
// Jedna etykieta z danych planu użytkownika; liczby i godziny przez formatery i18n projektu,
// liczba mnoga przez tPlural. Brak czasu kroku albo godziny „gotowe” zostaje brakiem: zdanie
// z tą wartością znika, nic nie jest zgadywane.
// ============================================================================

import { t, tPlural } from './i18n';
import { appLocale, formatDate, formatTime } from './format';

const GODZINY = { one: '{n} godzina', few: '{n} godziny', many: '{n} godzin', other: '{n} godziny' };
const MINUTY = { one: '{n} minuta', few: '{n} minuty', many: '{n} minut', other: '{n} minuty' };
const KROKI_PLANU = {
  one: 'Plan wypieku: {n} krok.',
  few: 'Plan wypieku: {n} kroki.',
  many: 'Plan wypieku: {n} kroków.',
  other: 'Plan wypieku: {n} kroku.',
};
const DOBA_MS = 24 * 60 * 60 * 1000;

/** Czas słownie do etykiety: „1 godzina 20 minut” / “1 hour 20 minutes”. */
export function czasSlownie(min: number): string {
  const calosc = Math.max(0, Math.round(min));
  const h = Math.floor(calosc / 60);
  const m = calosc % 60;
  if (h > 0 && m > 0) return t('{godziny} {minuty}', { godziny: tPlural(h, GODZINY), minuty: tPlural(m, MINUTY) });
  return h > 0 ? tPlural(h, GODZINY) : tPlural(m, MINUTY);
}

/** Dzień godziny „gotowe” względem teraz: dziś, jutro, pojutrze, dalej data dnia i miesiąca według języka. */
export function dzienSlownie(gotowe: Date, teraz: Date): string {
  const dzien = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const roznica = Math.round((dzien(gotowe) - dzien(teraz)) / DOBA_MS);
  if (roznica === 0) return t('dziś');
  if (roznica === 1) return t('jutro');
  if (roznica === 2) return t('pojutrze');
  return formatDate(gotowe, appLocale(), { day: 'numeric', month: 'numeric' });
}

function zdanieGotowe(gotowe: Date | null, teraz: Date): string | null {
  if (!gotowe) return null;
  return t('Gotowe {dzien} o {godzina}.', { dzien: dzienSlownie(gotowe, teraz), godzina: formatTime(gotowe) });
}

const zdania = (...z: (string | null)[]) => z.filter((x): x is string => !!x).join(' ');

/** Prowadzenie i „Dziś” z trwającym wypiekiem: „Plan wypieku, krok {n} z {N}: {nazwa}, zostało {czas}. Gotowe {dzień} o {godzina}.” */
export function etykietaPlanuWypieku(d: {
  krok: number;
  liczbaKrokow: number;
  nazwa: string;
  pozostaloMin: number | null;
  gotowe: Date | null;
  teraz: Date;
}): string {
  const p = { n: d.krok, N: d.liczbaKrokow, nazwa: d.nazwa };
  const krok =
    d.pozostaloMin === null
      ? t('Plan wypieku, krok {n} z {N}: {nazwa}.', p)
      : t('Plan wypieku, krok {n} z {N}: {nazwa}, zostało {czas}.', { ...p, czas: czasSlownie(d.pozostaloMin) });
  return zdania(krok, zdanieGotowe(d.gotowe, d.teraz));
}

/** Plan przed startem: „Plan wypieku: {N} kroków. Gotowe {dzień} o {godzina}.” */
export function etykietaPlanuPrzedStartem(d: { liczbaKrokow: number; gotowe: Date | null; teraz: Date }): string {
  return zdania(tPlural(d.liczbaKrokow, KROKI_PLANU), zdanieGotowe(d.gotowe, d.teraz));
}

/** Karta zakwasu: „Od dokarmienia minęło {czas} z {odstęp}.” (odstęp OP-38: 12 h). */
export function etykietaZakwasu(d: { mineloMin: number; odstepMin: number }): string {
  return t('Od dokarmienia minęło {czas} z {odstep}.', { czas: czasSlownie(d.mineloMin), odstep: czasSlownie(d.odstepMin) });
}
