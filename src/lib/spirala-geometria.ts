// ============================================================================
// Piekarz — geometria spirali koszyka (element firmowy, D-049; design-spec §2, §11b 058)
// Czyste funkcje bez telefonu: punkty spirali liczone raz na plan (ukladSpirali), stan kroków
// i „teraz” przy każdym odświeżeniu (rysunekSpirali). Wzór: docs/design/ekrany/wspolne.js, spirala().
// Kolory zwracane jako klucze tokenów; hex daje useMotyw() w komponencie. [M1-audytor-generalny-058]
// ============================================================================

import type { SessionStep } from '../core/bake-steps';
import { ruch } from '../ui/tokeny';

/** Warianty z §2: prowadzenie (pełna), start (mała 92 pt), plan przed startem, karta zakwasu, ekran startowy/ikona. */
export type WariantSpirali = 'pelna' | 'mala' | 'plan' | 'zakwas' | 'pusta';
export const WARIANTY_SPIRALI: readonly WariantSpirali[] = ['pelna', 'mala', 'plan', 'zakwas', 'pusta'];
export type StanKrokuSpirali = 'zrobiony' | 'biezacy' | 'przyszly';
/** Jedyne kolory spirali (§11b 058): pary w docs/design/kontrast.md, ≥ 3:1 we wszystkich wariantach. */
export type KolorSpirali = 'ratan' | 'ratanSzary' | 'nocDane' | 'tusz' | 'tlo';

/** Krok planu na rysunku: minuty z planu (null = krok bez czasu), krok bierny, noc w lodówce. */
export interface KrokSpirali {
  minuty: number | null;
  bierny: boolean;
  noc: boolean;
}

/** §2: kroki bierne dłuższe niż 3 h rysowane jak 3 h i oznaczone w legendzie („skrócona”). */
export const SPIRALA_MAKS_BIERNY_MIN = 180;
/** Krok bez czasu w planie (ZYT-ETA-900) dostaje krótki odcinek tylko na rysunku; czas nadal nieznany. */
export const SPIRALA_KROK_BEZ_CZASU_MIN = 10;
/** §2: zrobiony gruby 7, bieżący gruby 9, przyszły cienki 3. */
export const SPIRALA_GRUBOSC: Readonly<Record<StanKrokuSpirali, number>> = { zrobiony: 7, biezacy: 9, przyszly: 3 };
/** §2: wariant mały (92 pt) ma grubości ×1,4. */
export const SPIRALA_SKALA_MALEJ = 1.4;
/** Liczba zwojów: plan jak w makiecie; jeden cykl zakwasu niecałe 2 zwoje (§2). */
export const SPIRALA_ZWOJE = { plan: 8.3, zakwas: 1.6 } as const;
/** Ekran startowy i ikona: pusta spirala z przerwami, bez danych (makieta ikona.html). */
export const SPIRALA_PUSTA: readonly KrokSpirali[] = Array.from({ length: 5 }, () => ({ minuty: 60, bierny: false, noc: false }));

export interface PunktSpirali {
  x: number;
  y: number;
  /** Długość ścieżki od środka do tego punktu. */
  l: number;
}
/** Granice kroku jako ułamki długości ścieżki (0 = środek, 1 = „gotowe”). */
export interface GranicaKroku {
  od: number;
  do: number;
  skrocony: boolean;
}
export interface UkladSpirali {
  punkty: PunktSpirali[];
  dlugosc: number;
  granice: GranicaKroku[];
}
export interface OdcinekSpirali {
  indeks: number;
  d: string;
  stan: StanKrokuSpirali;
  kolor: KolorSpirali;
  grubosc: number;
  /** Wzór kropek nocy w lodówce (strokeDasharray); null = linia ciągła. */
  kreski: string | null;
  skrocony: boolean;
}
export interface RysunekSpirali {
  viewBox: string;
  odcinki: OdcinekSpirali[];
  /** Gruby `tusz` bieżącego kroku od jego początku do „teraz”. */
  postep: { d: string; grubosc: number } | null;
  /** Znacznik „teraz”: kółko z tłem `tlo` i obwódką `tusz`. */
  teraz: { x: number; y: number; r: number; obwodka: number } | null;
  /** Kropka końca = godzina „gotowe”. */
  koniec: { x: number; y: number; r: number };
}
export interface OpcjeRysunku {
  wariant: WariantSpirali;
  /** Indeks bieżącego kroku; null = plan przed startem. */
  biezacy: number | null;
  /** Postęp bieżącego kroku 0–1. */
  postepKroku: number;
}

const VIEWBOX = '-110 -110 220 220';
const T0 = 0.9 * Math.PI;
const KROK_KATA = 0.01;
const PRZERWA = 0.006; // przerwa między krokami (ułamek długości), jak w makiecie

function dlugoscRysowana(k: KrokSpirali): number {
  if (k.minuty === null || k.minuty <= 0) return SPIRALA_KROK_BEZ_CZASU_MIN;
  return k.bierny ? Math.min(k.minuty, SPIRALA_MAKS_BIERNY_MIN) : k.minuty;
}

/** Punkty spirali Archimedesa i granice kroków; liczone raz na plan (długość łuku ∝ czas kroku). */
export function ukladSpirali(kroki: readonly KrokSpirali[], zwoje: number): UkladSpirali {
  const t1 = (0.9 + zwoje) * Math.PI;
  const punkty: PunktSpirali[] = [];
  let l = 0;
  const dodaj = (t: number) => {
    const r = 10 + (88 / t1) * t;
    const x = r * Math.cos(t - Math.PI / 2);
    const y = r * Math.sin(t - Math.PI / 2);
    const p = punkty[punkty.length - 1];
    if (p) l += Math.hypot(x - p.x, y - p.y);
    punkty.push({ x, y, l });
  };
  const n = Math.floor((t1 - T0) / KROK_KATA);
  for (let i = 0; i < n; i++) dodaj(T0 + i * KROK_KATA);
  dodaj(t1);
  const rys = kroki.map(dlugoscRysowana);
  const suma = rys.reduce((s, x) => s + x, 0);
  let narast = 0;
  const granice = kroki.map((k, i) => {
    const od = narast / suma;
    narast += rys[i];
    return { od, do: narast / suma, skrocony: k.bierny && k.minuty !== null && k.minuty > SPIRALA_MAKS_BIERNY_MIN };
  });
  return { punkty, dlugosc: l, granice };
}

/** Punkt na ścieżce w odległości `l` od środka (interpolacja liniowa, poza zakresem: koniec ścieżki). */
export function punktNaDlugosci(u: UkladSpirali, l: number): { x: number; y: number } {
  const P = u.punkty;
  if (l <= 0) return { x: P[0].x, y: P[0].y };
  if (l >= u.dlugosc) return { x: P[P.length - 1].x, y: P[P.length - 1].y };
  let lo = 0;
  let hi = P.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (P[m].l <= l) lo = m;
    else hi = m;
  }
  const a = P[lo];
  const b = P[hi];
  const f = (l - a.l) / (b.l - a.l);
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

const liczba = (v: number) => {
  const s = v.toFixed(1);
  return s === '-0.0' ? '0.0' : s;
};

const liczbaKreski = (v: number) => String(Math.round(v * 10) / 10);

function sciezka(u: UkladSpirali, od: number, doU: number): string {
  const la = od * u.dlugosc;
  const lb = Math.max(la, doU * u.dlugosc);
  const pkt = [punktNaDlugosci(u, la), ...u.punkty.filter((p) => p.l > la && p.l < lb), punktNaDlugosci(u, lb)];
  return pkt.map((p, i) => `${i ? 'L' : 'M'}${liczba(p.x)} ${liczba(p.y)}`).join(' ');
}

/** Stan kroków, grubości, kolory, wzór nocy i znacznik „teraz” dla wariantu (§2, §11b 058). */
export function rysunekSpirali(u: UkladSpirali, kroki: readonly KrokSpirali[], o: OpcjeRysunku): RysunekSpirali {
  const sk = o.wariant === 'mala' ? SPIRALA_SKALA_MALEJ : 1;
  const biezacy = o.wariant === 'plan' || o.wariant === 'pusta' ? null : o.biezacy;
  const postepKroku = Math.min(1, Math.max(0, o.postepKroku));
  let postep: RysunekSpirali['postep'] = null;
  let teraz: RysunekSpirali['teraz'] = null;
  const odcinki = kroki.map((k, i): OdcinekSpirali => {
    const g = u.granice[i];
    const przerwa = Math.min(PRZERWA, (g.do - g.od) / 4);
    const stan: StanKrokuSpirali = biezacy === null || i > biezacy ? 'przyszly' : i < biezacy ? 'zrobiony' : 'biezacy';
    if (stan === 'biezacy') {
      const tu = g.od + (g.do - g.od) * postepKroku;
      postep = { d: sciezka(u, g.od + przerwa, Math.max(g.od + przerwa, Math.min(tu, g.do - przerwa))), grubosc: SPIRALA_GRUBOSC.biezacy * sk };
      teraz = { ...punktNaDlugosci(u, tu * u.dlugosc), r: 7 * sk, obwodka: 3 * sk };
    }
    const nocPrzed = k.noc && stan !== 'zrobiony';
    return {
      indeks: i,
      d: sciezka(u, g.od + przerwa, g.do - przerwa),
      stan,
      kolor: stan === 'zrobiony' ? 'ratan' : nocPrzed ? 'nocDane' : 'ratanSzary',
      grubosc: SPIRALA_GRUBOSC[stan] * sk,
      kreski: nocPrzed ? `${liczbaKreski(2 * sk)} ${liczbaKreski(5 * sk)}` : null,
      skrocony: g.skrocony,
    };
  });
  return { viewBox: VIEWBOX, odcinki, postep, teraz, koniec: { ...punktNaDlugosci(u, u.dlugosc), r: 4 * sk } };
}

/**
 * Kroki sesji wypieku jako kroki spirali. Noc w lodówce = etap `final_proof` planu pszennego
 * („Garowanie chłodnicze w lodówce”, reverse-scheduler.ts); żytni rozrost w formie ma własne id.
 */
export function krokiSpiraliZSesji(steps: readonly SessionStep[]): KrokSpirali[] {
  return steps.map((s) => ({ minuty: s.durationMin, bierny: s.isPassive, noc: s.id === 'final_proof' }));
}

/** Karta zakwasu: jeden cykl dokarmienia o długości odstępu (OP-38: 12 h); cykl nie jest skracany. */
export function krokiSpiraliZakwasu(odstepMin: number): KrokSpirali[] {
  return [{ minuty: odstepMin, bierny: false, noc: false }];
}

/** Czas przejścia po „Zrobione” (ruch.zwoj: 300 ms, easeOut); „Ogranicz ruch”: bez przejścia. */
export function czasPrzejsciaSpirali(ograniczRuch: boolean): number {
  return ograniczRuch ? 0 : ruch.zwoj.ms;
}
