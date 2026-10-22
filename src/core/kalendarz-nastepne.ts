// ============================================================================
// Piekarz — linia „Następne”, arkusz dnia i znaczniki dni z listy zdarzeń (BR-KAL-002…005, RD-32; D-094) [M3 D4a]
// Czyste funkcje nad wynikiem zdarzeniaKalendarza; „Zaległe” zawsze na początku i ponad limit, po jednym najbliższym
// zdarzeniu z każdego źródła (wypiek, zakwas), reszta pod „+N”. Nic nie znika po cichu (ER-66).
// ============================================================================

import { LIMIT_NASTEPNE, NAJBLIZSZE_DNI } from './kalendarz-config';
import { addCalendarDays, localDateKey, startOfLocalDay } from './dzien-lokalny';
import type { DaneKalendarza, RodzajZdarzenia, ZdarzenieKalendarza } from './kalendarz-zdarzenia';

export interface LiniaNastepne {
  /** Zaległe od najstarszego, wszystkie (bez limitu). */
  zalegle: ZdarzenieKalendarza[];
  /** Pozycje przyszłe pokazane w linii (najwyżej limit − liczba zaległych). */
  przyszle: ZdarzenieKalendarza[];
  /** „+N”: przyszłe najbliższe źródeł, których nie ma w linii. */
  wiecej: number;
  /** Najbliższe przyszłe zdarzenie każdego źródła bez zaległego, według czasu (pełna lista dla VoiceOver). */
  wszystkiePrzyszle: ZdarzenieKalendarza[];
}

/** Rodzaje, które są „czymś do zrobienia” w przyszłości (wpisy i dni zakładania to stan, nie zadanie). */
const DO_ZROBIENIA: readonly RodzajZdarzenia[] = ['wypiek-krok', 'wypiek-gotowe', 'karmienie-nastepne'];
const klucz = (z: ZdarzenieKalendarza) => `${z.zrodlo.typ}:${z.zrodlo.id}`;
const wgCzasu = (a: ZdarzenieKalendarza, b: ZdarzenieKalendarza) => a.at - b.at;
const przyszle = (z: ZdarzenieKalendarza, now: number) => !z.zalegle && z.stan === 'zaplanowane' && z.at > now && DO_ZROBIENIA.includes(z.rodzaj);
const zaleglePosortowane = (zd: readonly ZdarzenieKalendarza[]) => zd.filter((z) => z.zalegle).sort(wgCzasu);

/**
 * Linia „Następne” według RD-32: Z = zaległe (termin ≤ teraz, bez „Zrobione” i „Pomiń”), wszystkie od najstarszego;
 * P = po jednym najbliższym przyszłym zdarzeniu z każdego źródła bez zaległego; linia = Z, potem pierwsze
 * max(0, L − |Z|) z P; „+N” = |P| − pokazane.
 */
export function liniaNastepne(zdarzenia: readonly ZdarzenieKalendarza[], now: number, limit: number = LIMIT_NASTEPNE): LiniaNastepne {
  const zalegle = zaleglePosortowane(zdarzenia);
  const zZaleglym = new Set(zalegle.map(klucz));
  const najblizsze = new Map<string, ZdarzenieKalendarza>();
  for (const z of [...zdarzenia].sort(wgCzasu)) {
    const k = klucz(z);
    if (przyszle(z, now) && !zZaleglym.has(k) && !najblizsze.has(k)) najblizsze.set(k, z);
  }
  const wszystkiePrzyszle = [...najblizsze.values()];
  const miejsc = Math.max(0, limit - zalegle.length);
  return { zalegle, przyszle: wszystkiePrzyszle.slice(0, miejsc), wiecej: Math.max(0, wszystkiePrzyszle.length - miejsc), wszystkiePrzyszle };
}

/** Arkusz dnia: zdarzenia dnia w kolejności godzin; w dniu dzisiejszym „Zaległe” osobno na górze (BR-KAL-004). */
export function arkuszDnia(zdarzenia: readonly ZdarzenieKalendarza[], dzien: string, now: number): { zalegle: ZdarzenieKalendarza[]; zdarzenia: ZdarzenieKalendarza[] } {
  const dzis = localDateKey(now) === dzien;
  return {
    zalegle: dzis ? zaleglePosortowane(zdarzenia) : [],
    zdarzenia: zdarzenia.filter((z) => z.dzien === dzien && !(dzis && z.zalegle)).sort(wgCzasu),
  };
}

/** Arkusz najbliższych z „+N”: zaległe i przyszłe zdarzenia wszystkich źródeł z najbliższych dni, po dniach (BR-KAL-004). */
export function najblizszeZdarzenia(
  zdarzenia: readonly ZdarzenieKalendarza[],
  now: number,
  dni: number = NAJBLIZSZE_DNI
): { zalegle: ZdarzenieKalendarza[]; dni: { dzien: string; zdarzenia: ZdarzenieKalendarza[] }[] } {
  const koniec = addCalendarDays(startOfLocalDay(now), dni);
  const grupy: { dzien: string; zdarzenia: ZdarzenieKalendarza[] }[] = [];
  for (const z of zdarzenia.filter((x) => przyszle(x, now) && x.at < koniec).sort(wgCzasu)) {
    const ostatnia = grupy[grupy.length - 1];
    if (ostatnia && ostatnia.dzien === z.dzien) ostatnia.zdarzenia.push(z);
    else grupy.push({ dzien: z.dzien, zdarzenia: [z] });
  }
  return { zalegle: zaleglePosortowane(zdarzenia), dni: grupy };
}

export interface ZnacznikDnia {
  /** Rodzaje zdarzeń dnia bez powtórzeń, w kolejności pierwszego wystąpienia. */
  rodzaje: RodzajZdarzenia[];
  /** Dzień ma zaległe zdarzenie (glif ostrzeżenia). */
  zalegle: boolean;
  /** Dzień leży w ciągu wypieku wielodniowego (od pierwszego do ostatniego zdarzenia wypieku). */
  wypiekWToku: boolean;
}

/**
 * Znaczniki dni paska (BR-KAL-002): dla każdego klucza dnia rodzaje zdarzeń, zaległe i ciąg wypieku. Wypiek przez noc
 * ma znacznik w każdym dniu, w którym zaczyna się któryś krok (RD-29); dzień w środku wypieku wielodniowego — ciąg.
 */
export function znacznikiDni(zdarzenia: readonly ZdarzenieKalendarza[], dni: readonly string[]): Record<string, ZnacznikDnia> {
  const ciagi = new Map<string, { od: string; do: string }>();
  for (const z of zdarzenia) {
    if (z.zrodlo.typ !== 'wypiek') continue;
    const c = ciagi.get(z.zrodlo.id);
    ciagi.set(z.zrodlo.id, c ? { od: z.dzien < c.od ? z.dzien : c.od, do: z.dzien > c.do ? z.dzien : c.do } : { od: z.dzien, do: z.dzien });
  }
  const posortowane = [...zdarzenia].sort(wgCzasu);
  return Object.fromEntries(
    dni.map((d) => {
      const dnia = posortowane.filter((z) => z.dzien === d);
      return [d, {
        rodzaje: [...new Set(dnia.map((z) => z.rodzaj))],
        zalegle: dnia.some((z) => z.zalegle),
        wypiekWToku: [...ciagi.values()].some((c) => c.od <= d && d <= c.do),
      }];
    })
  );
}

/** Kalendarz bez danych (BR-KAL-005): brak wypieków, planów, zakwasów i wpisów Dziennika. */
export function czyKalendarzPusty(dane: Pick<DaneKalendarza, 'wypieki' | 'zaplanowane' | 'zakwasy' | 'dziennik'>): boolean {
  return dane.wypieki.length === 0 && dane.zaplanowane.length === 0 && dane.zakwasy.length === 0 && dane.dziennik.length === 0;
}
