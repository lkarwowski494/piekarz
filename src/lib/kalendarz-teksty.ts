// ============================================================================
// Piekarz — teksty kalendarza: zdanie „Następne” z „·”, „Zaległe”, opis zdarzenia i etykiety VoiceOver
// (BR-KAL-003, D-094; teksty roli 04: audit/M3-2026-10-22/role/04-a2/04-a2-opcje.md) [M3 D4a]
// Parametry i składnia przez t(); separator „·” według słów właściciela (D-094). Godzina i data przez Intl.
// ============================================================================

import type { ZdarzenieKalendarza } from '../core/kalendarz-zdarzenia';
import type { LiniaNastepne } from '../core/kalendarz-nastepne';
import { localDateKey } from '../core/dzien-lokalny';
import { t } from './i18n';
import { appLocale, formatDate, formatTime } from './format';
import { dzienSlownie } from './spirala-etykieta';

export interface OpcjeTekstu {
  /** Teraz (ms): dzień słownie względem dziś. */
  now: number;
  /** Trwa albo jest zaplanowany więcej niż jeden wypiek: krok z nazwą wypieku. */
  wieleWypiekow: boolean;
}

/** Separator pozycji zdania „Następne” (D-094); w etykiecie VoiceOver średnik, żeby czytnik robił pauzę. */
const SEPARATOR = ' · ';
const SEPARATOR_VO = '; ';

function opisBezDopisku(z: ZdarzenieKalendarza, o: OpcjeTekstu): string {
  switch (z.rodzaj) {
    case 'wypiek-krok': {
      const krok = t(z.krok?.nazwa ?? '');
      // Zaplanowany wypiek zawsze z nazwą: sam krok nie mówi, którego planu dotyczy
      return o.wieleWypiekow || z.zaplanowany ? t('{wypiek}, krok: {krok}', { wypiek: z.nazwa, krok }) : krok;
    }
    case 'wypiek-gotowe':
      return t('{wypiek}: gotowe', { wypiek: z.nazwa });
    case 'karmienie-nastepne':
      // Kolejne karmienie budzące z lodówki: z dopiskiem, bez „N z M” (RD-33, D-052) [M3 D5]
      return z.warunkowe
        ? t('karmienie zakwasu {zakwas}, jeśli zakwas nie podwoił objętości', { zakwas: z.nazwa })
        : t('karmienie zakwasu {zakwas}', { zakwas: z.nazwa });
    case 'karmienie-zrobione':
      return t('Dokarmiony {zakwas}', { zakwas: z.nazwa });
    case 'zakladanie':
      return z.stan === 'trwa'
        ? t('Zakładanie zakwasu: dzień {n}, do zrobienia', { n: z.dzienZakladania ?? 1 })
        : t('Zakładanie zakwasu: dzień {n} zapisany', { n: z.dzienZakladania ?? 1 });
    case 'wpis-dziennika':
      return z.ocena !== undefined ? t('{wypiek}: ocena {ocena} z 5', { wypiek: z.nazwa, ocena: z.ocena }) : z.nazwa;
    case 'piekarnik-zajety':
      // Wiersz kolizji w arkuszu dnia (tekst roli 04 a2 `piekarnik-2-arkusz-dnia`; BR-KAL-016) [M3 D6]
      return t('Piekarnik zajęty: {r1} i {r2} pieką się w tym samym czasie', { r1: z.nazwa, r2: z.piekarnik?.drugi ?? '' });
  }
}

/**
 * „Co” zdarzenia: krok, „{wypiek}: gotowe”, „karmienie zakwasu {zakwas}”, dzień zakładania, wpis Dziennika z oceną.
 * Zadanie opcjonalne ma ten sam krój i kolor, różni się tylko słowem „opcjonalne” (BR-KAL-003).
 */
export function opisZdarzenia(z: ZdarzenieKalendarza, o: OpcjeTekstu): string {
  const co = opisBezDopisku(z, o);
  return z.opcjonalne ? t('{co}, opcjonalne', { co }) : co;
}

/** Godzina zaległego: dziś sama godzina, inny dzień — dzień i miesiąc z godziną (RD-32-W5: „22.10 08:00”). */
function godzinaZaleglego(at: number, now: number): string {
  return localDateKey(at) === localDateKey(now) ? formatTime(at) : formatDate(at, appLocale(), { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const pozycjaPrzyszla = (z: ZdarzenieKalendarza, o: OpcjeTekstu) =>
  t('{kiedy} {h} {co}', { kiedy: dzienSlownie(new Date(z.at), new Date(o.now)), h: formatTime(z.at), co: opisZdarzenia(z, o) });

const pozycjaZalegla = (z: ZdarzenieKalendarza, o: OpcjeTekstu) => t('Zaległe: {co} ({h})', { co: opisZdarzenia(z, o), h: godzinaZaleglego(z.at, o.now) });

export interface TekstyNastepne {
  /** „Zaległe: {co} ({h})” — każde osobno, na początku linii. */
  zalegle: string[];
  /** „Następne: {kiedy} {h} {co} · …” albo null, gdy brak przyszłych w linii. */
  nastepne: string | null;
  /** „+N” albo null. */
  plus: string | null;
  /** Etykieta VoiceOver linii: zaległe i pełna lista przyszłych (bez ukrywania pod „+N”). */
  etykieta: string;
  /** Etykieta VoiceOver przycisku „+N” albo null. */
  etykietaPlus: string | null;
}

/** Teksty linii „Następne” (D-094): zaległe, jedno zdanie z „·”, „+N” i etykiety VoiceOver (BR-KAL-003 Czytnik ekranu). */
export function tekstyNastepne(linia: LiniaNastepne, o: OpcjeTekstu): TekstyNastepne {
  const zalegle = linia.zalegle.map((z) => pozycjaZalegla(z, o));
  const nastepne = linia.przyszle.length > 0 ? t('Następne: {lista}', { lista: linia.przyszle.map((z) => pozycjaPrzyszla(z, o)).join(SEPARATOR) }) : null;
  const pelna = linia.wszystkiePrzyszle.length > 0 ? [t('Następne: {lista}', { lista: linia.wszystkiePrzyszle.map((z) => pozycjaPrzyszla(z, o)).join(SEPARATOR_VO) })] : [];
  return {
    zalegle,
    nastepne,
    plus: linia.wiecej > 0 ? t('+{n}', { n: linia.wiecej }) : null,
    etykieta: [...zalegle, ...pelna].join('. '),
    etykietaPlus: linia.wiecej > 0 ? t('Pokaż jeszcze {n} w arkuszu dnia', { n: linia.wiecej }) : null,
  };
}

/**
 * Zaległy krok wypieku: przycisk otwiera Stolnicę albo arkusz planu, kroku nie odhacza, więc mówi „Otwórz”
 * (04-studio-projektowe-007 opcja b, W-fix2); karmienie zakwasu „Zrobione” zapisuje dokarmienie.
 */
const otwiera = (z?: ZdarzenieKalendarza) => z?.zrodlo.typ === 'wypiek';

/** Etykiety VoiceOver przycisków przy zaległym: „{co} z {h}: zrobione” (wypiek: „{co} z {h}: otwórz”) i „Pomiń {co} z {h}”. */
export function etykietyZaleglego(z: ZdarzenieKalendarza, o: OpcjeTekstu): { zrobione: string; pomin: string } {
  const p = { co: opisZdarzenia(z, o), h: godzinaZaleglego(z.at, o.now) };
  return { zrobione: otwiera(z) ? t('{co} z {h}: otwórz', p) : t('{co} z {h}: zrobione', p), pomin: t('Pomiń {co} z {h}', p) };
}

/** Ile zdarzeń czyta etykieta dnia przed „i jeszcze N” (makieta roli 04 a2, tabela (g)). */
const ZDARZEN_W_ETYKIECIE_DNIA = 3;

/** Części dnia paska: data, najwyżej 3 zdarzenia (każde z własnym tekstem) i „i jeszcze N”; dzień pusty ma tekst „Nic w planach”. */
export interface CzesciDnia {
  data: string;
  pozycje: { z: ZdarzenieKalendarza; tekst: string }[];
  reszta: string | null;
  pusto: string | null;
}

/**
 * Części dnia (BR-KAL-001, tabela (g) roli 04): pełna data, „dziś” przy dzisiejszym, zdarzenia słowami w kolejności
 * godzin (zaległe ze słowem „Zaległe”, piekarnik zajęty na początku, makieta `piekarnik-3-kalendarz`, BR-KAL-016
 * [M3 D6]), ponad 3 — „i jeszcze N, szczegóły w arkuszu dnia”. Z tego składa się etykieta VoiceOver i wiersz dnia
 * przy dużym tekście (data jako nagłówek, zdarzenia w osobnych liniach, PRZ-08).
 */
export function czesciDnia(zdarzenia: readonly ZdarzenieKalendarza[], dzien: { ms: number; dzis: boolean }, o: OpcjeTekstu): CzesciDnia {
  const pelna = formatDate(dzien.ms, appLocale(), { weekday: 'long', day: 'numeric', month: 'long' });
  const data = dzien.dzis ? t('{data}, dziś', { data: pelna }) : pelna;
  if (zdarzenia.length === 0) return { data, pozycje: [], reszta: null, pusto: t('Nic w planach') };
  const piec = (z: ZdarzenieKalendarza) => (z.rodzaj === 'piekarnik-zajety' ? 0 : 1);
  const wszystkie = [...zdarzenia]
    .sort((a, b) => piec(a) - piec(b) || a.at - b.at)
    .map((z) => ({
      z,
      tekst: z.rodzaj === 'piekarnik-zajety'
        ? t('Piekarnik zajęty o {h}', { h: formatTime(z.at) })
        : z.zalegle ? pozycjaZalegla(z, o) : t('{h} {co}', { h: formatTime(z.at), co: opisZdarzenia(z, o) }),
    }));
  const reszta = wszystkie.length - ZDARZEN_W_ETYKIECIE_DNIA;
  return {
    data,
    pozycje: wszystkie.slice(0, ZDARZEN_W_ETYKIECIE_DNIA),
    reszta: reszta > 0 ? t('i jeszcze {n}, szczegóły w arkuszu dnia', { n: reszta }) : null,
    pusto: null,
  };
}

/** Etykieta VoiceOver dnia paska (BR-KAL-001 „Etykieta dla czytnika ekranu”): części dnia w jednym zdaniu. Glif nie jest czytany. */
export function etykietaDnia(zdarzenia: readonly ZdarzenieKalendarza[], dzien: { ms: number; dzis: boolean }, o: OpcjeTekstu): string {
  const c = czesciDnia(zdarzenia, dzien, o);
  if (c.pusto !== null) return `${c.data}. ${c.pusto}`;
  return [c.data, ...c.pozycje.map((p) => p.tekst), ...(c.reszta ? [c.reszta] : [])].join('. ');
}

/** Napisy przycisków przy zaległym (BR-KAL-003): „Zrobione” (krok wypieku: „Otwórz”, 007 b) i „Pomiń”. */
export function napisyZaleglego(z?: ZdarzenieKalendarza): { zrobione: string; pomin: string } {
  return { zrobione: otwiera(z) ? t('Otwórz') : t('Zrobione'), pomin: t('Pomiń') };
}
