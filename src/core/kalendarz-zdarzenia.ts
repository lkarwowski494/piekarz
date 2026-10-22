// ============================================================================
// Piekarz — zdarzenia kalendarza 1.0 z danych, które już są (BR-KAL-002, BR-KAL-006, RD-29, RD-31; D-090) [M3 D4a]
// Czysta funkcja: trwające i zaplanowane wypieki (kroki z planu), wpisy i terminy karmień zakwasu (ta sama logika co
// powiadomienia, src/core/notification-feeding.ts), dni zakładania (setupDay) i wpisy Dziennika. Czas jako argument,
// dzień według strefy urządzenia (src/core/dzien-lokalny.ts). Kalendarz niczego nie zapisuje (BR-KAL-007).
// ============================================================================

import type { SessionStep } from './bake-steps';
import type { PlanStarter } from './notification-plan';
import { nextFixedFeeding, punktOdniesieniaKarmienia, stalyDzienKarmienia, terminKarmienia, type TekstKarmienia } from './notification-feeding';
import { pominietoKarmienieAt, type Pominiecie } from './pominiecia';
import { addCalendarDays, localDateKey, startOfLocalDay } from './dzien-lokalny';
import { setupDay } from './starter-log';

export type RodzajZdarzenia = 'wypiek-krok' | 'wypiek-gotowe' | 'karmienie-zrobione' | 'karmienie-nastepne' | 'zakladanie' | 'wpis-dziennika';
/** Stan zdarzenia: zrobione (przeszłość), trwa (bieżący krok, dzień zakładania dziś), zaplanowane (przyszłe albo zaległe). */
export type StanZdarzenia = 'zrobione' | 'trwa' | 'zaplanowane';
export type ZrodloZdarzenia = { typ: 'wypiek' | 'zakwas' | 'dziennik'; id: string };

export interface ZdarzenieKalendarza {
  /** Stały identyfikator (klucz listy, VoiceOver). */
  id: string;
  rodzaj: RodzajZdarzenia;
  /** Chwila zdarzenia (ms UTC). */
  at: number;
  /** Dzień lokalny „RRRR-MM-DD” (RD-29). */
  dzien: string;
  zrodlo: ZrodloZdarzenia;
  /** Nazwa źródła: receptura wypieku albo nazwa zakwasu. */
  nazwa: string;
  stan: StanZdarzenia;
  /** Termin minął bez „Zrobione” i bez „Pomiń” (termin = teraz też, RD-32). */
  zalegle: boolean;
  /** Zadanie opcjonalne: tak samo widoczne, różni się tylko słowem (BR-KAL-003). */
  opcjonalne: boolean;
  /** Krok wypieku: indeks w sesji, nazwa z planu, liczba kroków. */
  krok?: { idx: number; nazwa: string; z: number };
  /** Wypiek zaplanowany, jeszcze niezaczęty (wiersz `planned`). */
  zaplanowany?: boolean;
  /** Ocena wpisu Dziennika (gwiazdki 1–5). */
  ocena?: number;
  /** Numer dnia zakładania zakwasu (RD-31, ta sama funkcja co karta). */
  dzienZakladania?: number;
  /** Rodzaj terminu karmienia (blat, lodówka co 7 dni, stały dzień). */
  karmienie?: TekstKarmienia;
}

type KrokPlanu = Pick<SessionStep, 'id' | 'name' | 'plannedStart' | 'plannedEnd'>;

/** Trwający wypiek (wiersz `active`). */
export interface KalendarzWypiek {
  id: string;
  recipeName: string;
  steps: readonly KrokPlanu[];
  stepIdx: number;
  timerEndsAt: number | null;
  pausedLeftSec: number | null;
  /** Wypiek zaczęty z dostępem prowadzi się do końca (D-039 pkt 3, zaczetyZDostepem). */
  zaczetyZDostepem: boolean;
}

/** Wypiek zaplanowany (wiersz `planned`). */
export interface KalendarzPlan {
  id: string;
  recipeName: string;
  steps: readonly KrokPlanu[];
}

export interface KalendarzWpisZakwasu {
  id: string;
  starterId: string;
  kind: 'feeding' | 'observation';
  occurredAt: number;
}

export interface KalendarzWpisDziennika {
  id: string;
  recipeName: string;
  startedAt: number;
  finishedAt?: number;
  ratingStars?: number;
}

/**
 * Dostęp (BR-KAL-006, D-038, D-039): `terminyKarmienia` — jak plan powiadomień (dostęp i przełącznik przypomnień), więc
 * pasek i powiadomienie pokazują ten sam termin; `przyszleWypieki` — dostęp do nowych wypieków (bez niego przyszłość
 * tylko wypieku zaczętego z dostępem).
 */
export interface DostepKalendarza {
  terminyKarmienia: boolean;
  przyszleWypieki: boolean;
}

export interface DaneKalendarza {
  wypieki: readonly KalendarzWypiek[];
  zaplanowane: readonly KalendarzPlan[];
  zakwasy: readonly PlanStarter[];
  wpisyZakwasow: readonly KalendarzWpisZakwasu[];
  dziennik: readonly KalendarzWpisDziennika[];
  pominiecia: readonly Pominiecie[];
  dostep: DostepKalendarza;
}

/** Zakres chwil [odMs, doMs) — dni zakładania i kolejne stałe dni karmienia tylko w nim. */
export interface ZakresKalendarza {
  odMs: number;
  doMs: number;
}

const czytelna = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Zdarzenie z dniem lokalnym chwili (RD-29) i domyślnymi flagami. */
function zd(z: Omit<ZdarzenieKalendarza, 'dzien' | 'zalegle' | 'opcjonalne'> & Partial<Pick<ZdarzenieKalendarza, 'zalegle' | 'opcjonalne'>>): ZdarzenieKalendarza {
  return { zalegle: false, opcjonalne: false, ...z, dzien: localDateKey(z.at) };
}

/**
 * Karmienie opcjonalne: zakwas w lodówce (termin 7 dni albo stały dzień) — przykład z makiety roli 04 (a2, „opcjonalne”);
 * które zdarzenia są opcjonalne, rozstrzygają role 06 i 03 [DO USTALENIA]. Jedno miejsce reguły.
 */
export function czyOpcjonalne(karmienie: TekstKarmienia): boolean {
  return karmienie !== 'karmienie.blat';
}

/**
 * Kroki trwającego wypieku: przeszłe (zrobione), bieżący (trwa; krok 1 przed godziną startu — zaplanowany), następny
 * w chwili przejścia (koniec zegara, a bez zegara planowany koniec kroku; zegar wstrzymany nie ma terminu), dalsze z planu
 * i „gotowe” na końcu ostatniego kroku. Zaległe może być tylko przejście: krok, który powinien się już zacząć, albo
 * „gotowe” po ostatnim kroku — reszta planu przesunie się przy potwierdzeniu kroku. Bez dostępu i bez zaczęcia z dostępem
 * tylko przeszłość i bieżący krok (BR-KAL-006, D-039 pkt 3).
 */
function zdarzeniaWypieku(w: KalendarzWypiek, now: number, przyszleWypieki: boolean): ZdarzenieKalendarza[] {
  const { steps } = w;
  const n = steps.length;
  const i = w.stepIdx;
  const cur = steps[i];
  if (!cur || !Number.isInteger(i)) return [];
  const zrodlo: ZrodloZdarzenia = { typ: 'wypiek', id: w.id };
  const out: ZdarzenieKalendarza[] = [];
  const dodajKrok = (j: number, at: number | null, stan: StanZdarzenia, zalegle = false) => {
    const k = steps[j];
    if (k && czytelna(at)) out.push(zd({ id: `wypiek:${w.id}:krok:${j}`, rodzaj: 'wypiek-krok', at, zrodlo, nazwa: w.recipeName, stan, zalegle, krok: { idx: j, nazwa: k.name, z: n } }));
  };
  for (let j = 0; j < i; j++) dodajKrok(j, steps[j]?.plannedStart ?? null, 'zrobione');
  const czeka = i === 0 && czytelna(cur.plannedStart) && cur.plannedStart > now;
  dodajKrok(i, cur.plannedStart, czeka ? 'zaplanowane' : 'trwa');
  const wstrzymany = w.timerEndsAt === null && w.pausedLeftSec !== null;
  const przejscie = wstrzymany ? null : czytelna(w.timerEndsAt) ? w.timerEndsAt : czytelna(cur.plannedEnd) ? cur.plannedEnd : null;
  const zal = przejscie !== null && przejscie <= now;
  dodajKrok(i + 1, przejscie ?? steps[i + 1]?.plannedStart ?? null, 'zaplanowane', zal);
  for (let j = i + 2; j < n; j++) dodajKrok(j, steps[j]?.plannedStart ?? null, 'zaplanowane');
  const gotoweAt = i === n - 1 ? (przejscie ?? cur.plannedEnd) : (steps[n - 1]?.plannedEnd ?? null);
  if (czytelna(gotoweAt)) {
    out.push(zd({ id: `wypiek:${w.id}:gotowe`, rodzaj: 'wypiek-gotowe', at: gotoweAt, zrodlo, nazwa: w.recipeName, stan: 'zaplanowane', zalegle: i === n - 1 && zal }));
  }
  return przyszleWypieki || w.zaczetyZDostepem ? out : out.filter((z) => z.stan !== 'zaplanowane');
}

/** Wypiek zaplanowany: kroki planu i „gotowe”; to przyszłość, więc bez dostępu go nie ma (BR-KAL-006). */
function zdarzeniaPlanu(p: KalendarzPlan): ZdarzenieKalendarza[] {
  const zrodlo: ZrodloZdarzenia = { typ: 'wypiek', id: p.id };
  const n = p.steps.length;
  const out: ZdarzenieKalendarza[] = [];
  p.steps.forEach((k, j) => {
    if (czytelna(k.plannedStart)) {
      out.push(zd({ id: `wypiek:${p.id}:krok:${j}`, rodzaj: 'wypiek-krok', at: k.plannedStart, zrodlo, nazwa: p.recipeName, stan: 'zaplanowane', krok: { idx: j, nazwa: k.name, z: n }, zaplanowany: true }));
    }
  });
  const koniec = p.steps[n - 1]?.plannedEnd;
  if (czytelna(koniec)) out.push(zd({ id: `wypiek:${p.id}:gotowe`, rodzaj: 'wypiek-gotowe', at: koniec, zrodlo, nazwa: p.recipeName, stan: 'zaplanowane', zaplanowany: true }));
  return out;
}

/** Najwyżej tyle dni zakładania (około 10 lat): zabezpieczenie przed pętlą przy zepsutej dacie. */
const MAX_DNI_ZAKLADANIA = 3660;

/** Dni zakładania od dnia startu do dziś albo do dnia „gotowy”; numer z setupDay (RD-31, D-093). */
function dniZakladania(s: PlanStarter, now: number, zakres?: ZakresKalendarza): ZdarzenieKalendarza[] {
  const start = s.setupStartedAt;
  if (!czytelna(start)) return [];
  const trwa = !czytelna(s.setupCompletedAt);
  const koniec = startOfLocalDay(trwa ? now : Math.min(s.setupCompletedAt ?? now, now));
  const dzis = localDateKey(now);
  const out: ZdarzenieKalendarza[] = [];
  for (let d = startOfLocalDay(start), k = 0; d <= koniec && k < MAX_DNI_ZAKLADANIA; d = addCalendarDays(d, 1), k++) {
    if (zakres && (d < startOfLocalDay(zakres.odMs) || d >= zakres.doMs)) continue;
    const at = Math.max(start, d);
    const dzien = localDateKey(d);
    out.push(zd({
      id: `zakwas:${s.id}:zakladanie:${dzien}`, rodzaj: 'zakladanie', at, zrodlo: { typ: 'zakwas', id: s.id }, nazwa: s.name,
      stan: trwa && dzien === dzis ? 'trwa' : 'zrobione', dzienZakladania: setupDay(start, at),
    }));
  }
  return out;
}

/**
 * Następny termin karmienia: ta sama reguła co powiadomienie (terminKarmienia), od dokarmienia albo od „Pomiń” (D-094);
 * termin ≤ teraz to „Zaległe” (RD-32). Stały dzień: w zakresie także kolejne dni co tydzień (BR-KAL-010).
 */
function terminyZakwasu(s: PlanStarter, pominiecia: DaneKalendarza['pominiecia'], now: number, zakres?: ZakresKalendarza): ZdarzenieKalendarza[] {
  const sp: PlanStarter = { ...s, pominietoAt: pominietoKarmienieAt(pominiecia, s.id) };
  const t = terminKarmienia(sp, punktOdniesieniaKarmienia(sp), now);
  if (!t || !czytelna(t.at)) return [];
  const zrodlo: ZrodloZdarzenia = { typ: 'zakwas', id: s.id };
  const termin = (at: number, zalegle: boolean) =>
    zd({ id: `zakwas:${s.id}:karmienie:${at}`, rodzaj: 'karmienie-nastepne', at, zrodlo, nazwa: s.name, stan: 'zaplanowane', zalegle, opcjonalne: czyOpcjonalne(t.textKey), karmienie: t.textKey });
  const out = [termin(t.at, t.at <= now)];
  const staly = stalyDzienKarmienia(s);
  if (staly && zakres && t.textKey === 'karmienie.lodowkaDzien') {
    for (let at = nextFixedFeeding(staly, null, t.at); at !== null && at < zakres.doMs; at = nextFixedFeeding(staly, null, at)) {
      if (at >= zakres.odMs) out.push(termin(at, false));
    }
  }
  return out;
}

/** Wszystkie zdarzenia kalendarza w kolejności czasu. Wpis bez czytelnej chwili jest pomijany (RD-29-W6). */
export function zdarzeniaKalendarza(dane: DaneKalendarza, now: number, zakres?: ZakresKalendarza): ZdarzenieKalendarza[] {
  const { dostep } = dane;
  const out: ZdarzenieKalendarza[] = [
    ...dane.wypieki.flatMap((w) => zdarzeniaWypieku(w, now, dostep.przyszleWypieki)),
    ...(dostep.przyszleWypieki ? dane.zaplanowane.flatMap(zdarzeniaPlanu) : []),
  ];
  const zakwasy = new Map(dane.zakwasy.map((s) => [s.id, s]));
  for (const s of dane.zakwasy) {
    out.push(...dniZakladania(s, now, zakres));
    // Bez terminów karmienia, gdy przypomnienia są wyłączone albo nie ma dostępu (BR-KAL-006, jak plan powiadomień)
    if (dostep.terminyKarmienia) out.push(...terminyZakwasu(s, dane.pominiecia, now, zakres));
  }
  for (const e of dane.wpisyZakwasow) {
    const s = zakwasy.get(e.starterId);
    if (e.kind !== 'feeding' || !s || !czytelna(e.occurredAt)) continue;
    out.push(zd({ id: `wpis:${e.id}`, rodzaj: 'karmienie-zrobione', at: e.occurredAt, zrodlo: { typ: 'zakwas', id: s.id }, nazwa: s.name, stan: 'zrobione' }));
  }
  for (const b of dane.dziennik) {
    const at = czytelna(b.finishedAt) ? b.finishedAt : b.startedAt;
    if (!czytelna(at)) continue;
    const ocena = czytelna(b.ratingStars) && b.ratingStars >= 1 && b.ratingStars <= 5 ? { ocena: b.ratingStars } : {};
    out.push(zd({ id: `dziennik:${b.id}`, rodzaj: 'wpis-dziennika', at, zrodlo: { typ: 'dziennik', id: b.id }, nazwa: b.recipeName, stan: 'zrobione', ...ocena }));
  }
  // Sortowanie stabilne: przy tej samej chwili kolejność źródeł (wypieki, plany, zakwasy, wpisy, Dziennik)
  return out.sort((a, b) => a.at - b.at);
}
