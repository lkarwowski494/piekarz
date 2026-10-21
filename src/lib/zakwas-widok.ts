// ============================================================================
// Piekarz — stan karty zakwasu i opis wpisu dziennika jako czyste funkcje (design-spec §2 wariant zakwasu, §5;
// BR-ZAKW-005, BR-ZAKW-007) [M1-audytor-generalny-104]. Czas zawsze argumentem. Liczby: odstępy z
// src/core/starter-log.ts (ZAK-ZAL-002…004, ZAK-ZAL-007; OP-38: 12 h dla zakwasu dojrzałego).
// ============================================================================

import type { StoredStarter, StoredStarterEntry } from '../data/db';
import {
  SETUP_FEED_INTERVAL_EARLY_H,
  SETUP_FEED_INTERVAL_H,
  isReadyAfterFeeding,
  lastFeeding,
  setupDay,
  type StarterSign,
} from '../core/starter-log';
import { FEED_FRIDGE_DUE_AFTER_MS } from '../core/notification-config';
import { t } from './i18n';
import { appLocale, formatDate, formatTime } from './format';

const MIN_MS = 60_000;

/** Zakwas w trakcie zakładania: start zakładania zapisany, koniec nie. */
export function wZakladaniu(s: Pick<StoredStarter, 'setupStartedAt' | 'setupCompletedAt'>): boolean {
  return s.setupStartedAt !== undefined && s.setupCompletedAt === undefined;
}

export interface StanKartyZakwasu {
  /** Ostatnie dokarmienie; null = brak wpisu dokarmienia (nic nie jest zgadywane). */
  dokarmionoAt: number | null;
  mineloMin: number | null;
  /** Długość jednego cyklu: 24 h w dniach 1–2 zakładania, inaczej 12 h. */
  odstepMin: number;
  nastepneAt: number | null;
  /** Postęp cyklu 0–1 dla spirali. */
  postep: number;
  /** „Podwoił objętość” najwyżej 8 h po ostatnim dokarmieniu (ZAK-ZAL-007). */
  gotowy: boolean;
  /** Dzień N zakładania; null = zakwas dojrzały. */
  dzien: number | null;
}

export function stanKartyZakwasu(
  starter: Partial<Pick<StoredStarter, 'setupStartedAt' | 'setupCompletedAt' | 'storageState'>>,
  entries: readonly StoredStarterEntry[],
  now: number
): StanKartyZakwasu {
  const dzien = wZakladaniu(starter) && starter.setupStartedAt !== undefined ? setupDay(starter.setupStartedAt, now) : null;
  const odstepH = dzien !== null && dzien < 3 ? SETUP_FEED_INTERVAL_EARLY_H : SETUP_FEED_INTERVAL_H;
  // Dojrzały zakwas w lodówce: raz w tygodniu (ZAK-ZAL-012), ten sam termin co powiadomienie [M1-audytor-generalny-188]
  const odstepMin = dzien === null && starter.storageState === 'FRIDGE' ? FEED_FRIDGE_DUE_AFTER_MS / MIN_MS : odstepH * 60;
  const feed = lastFeeding(entries);
  if (!feed) return { dokarmionoAt: null, mineloMin: null, odstepMin, nastepneAt: null, postep: 0, gotowy: false, dzien };
  const mineloMin = Math.max(0, Math.floor((now - feed.occurredAt) / MIN_MS));
  return {
    dokarmionoAt: feed.occurredAt,
    mineloMin,
    odstepMin,
    nastepneAt: feed.occurredAt + odstepMin * MIN_MS,
    postep: Math.min(1, mineloMin / odstepMin),
    gotowy: isReadyAfterFeeding(entries),
    dzien,
  };
}

/** Nazwy obserwacji (makieta zakwas.html, design-spec §5); klucze PL dla t(). */
export const NAZWY_OBJAWOW: Readonly<Record<StarterSign, string>> = {
  bubbles: 'Bąbelki',
  rose: 'Urósł od kreski',
  doubled: 'Podwoił objętość',
  no_activity: 'Nic się nie dzieje',
  mold_signs: 'Kolorowe plamy albo puszysty nalot',
};

const dzienKalendarza = (ms: number) => {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

/** Dzień wpisu: „Dziś”, „Wczoraj”, dalej data dnia i miesiąca według języka. */
export function dzienWpisu(at: number, now: number): string {
  const roznica = Math.round((dzienKalendarza(now) - dzienKalendarza(at)) / (24 * 60 * MIN_MS));
  if (roznica === 0) return t('Dziś');
  if (roznica === 1) return t('Wczoraj');
  return formatDate(new Date(at), appLocale(), { day: 'numeric', month: 'numeric' });
}

/** Wiersz listy „Ostatnie wpisy”: „Dziś 08:00: Dokarmienie 1:2:2” albo „Wczoraj 20:10: Obserwacja: Bąbelki”. */
export function opisWpisu(e: Pick<StoredStarterEntry, 'kind' | 'occurredAt' | 'feedRatio' | 'signs'>, now: number): string {
  const opis =
    e.kind === 'feeding'
      ? e.feedRatio
        ? t('Dokarmienie {proporcja}', { proporcja: e.feedRatio })
        : t('Dokarmienie')
      : t('Obserwacja: {objawy}', { objawy: e.signs.map((s) => t(NAZWY_OBJAWOW[s])).join(', ') });
  return t('{dzien} {godzina}: {opis}', { dzien: dzienWpisu(e.occurredAt, now), godzina: formatTime(e.occurredAt), opis });
}

/** Ta sama chwila z poprawioną godziną i minutą (czas lokalny, ten sam dzień); zła wartość → null. */
export function zmienGodzine(at: number, godzina: number, minuta: number): number | null {
  if (!Number.isInteger(godzina) || !Number.isInteger(minuta) || godzina < 0 || godzina > 23 || minuta < 0 || minuta > 59) return null;
  const d = new Date(at);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), godzina, minuta).getTime();
}
