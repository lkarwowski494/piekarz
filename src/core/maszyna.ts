// ============================================================================
// Piekarz — reguły trybu maszyny do chleba (F-72, D-138, D-153) jako czyste funkcje [M3 p9b2]:
// RD-37 ilości pod granice maszyny (BR-MASZ-002), RD-38 blokada opóźnionego startu (BR-MASZ-005), RD-39 podpowiedź
// programu (BR-MASZ-004, reguła Piekarza D-179), kolejność wkładania (BR-MASZ-003), godzina startu z godziny gotowości
// i jednego czasu programu wpisanego przez użytkownika (BR-MASZ-005, D-189, D-260). Czas jako argument, bez zegara.
// Brak danych zostaje brakiem: wynik z błędem, nie liczba domyślna.
// ============================================================================

import type { UkladMaszyny } from '../data/wybory-parsery';
import type { FlourItemInput } from './domain-rules';
import { WSP_SWIEZE_NA_SUCHE } from './domain-rules';
import { matchFlourProfile } from './flour-atlas';

/** Próg programu pełnoziarnistego: mąki pełnoziarniste + żytnie ≥ 50% mąki (MAS-042, S-106; reguła aplikacji D-179). */
export const PROG_PELNOZIARNISTY_PROC = 50;
/** Typ mąki od którego Piekarz liczy ją jako pełnoziarnistą (ta sama granica co `wholeGrainPercentage` w flour-atlas). */
const TYP_PELNOZIARNISTY = 1850;

/** Łatwo psujące się składniki z RD-38 (lista L: suma list instrukcji, D-175 z uzupełnieniem; MAS-072). */
export type SkladnikPsujacy = 'jajka' | 'mleko' | 'ser' | 'jogurt' | 'sok' | 'owoce' | 'warzywa';
const PSUJACE: readonly SkladnikPsujacy[] = ['jajka', 'mleko', 'ser', 'jogurt', 'sok', 'owoce', 'warzywa'];
/** Rodzaje składników receptury dla reguł maszyny; mleko w proszku nie należy do L (MAS-084, RD-38-W4). */
export type SkladnikMaszyny = 'maka' | 'woda' | 'sol' | 'drozdze' | 'mleko_w_proszku' | 'cukier' | 'tluszcz' | SkladnikPsujacy;
export type ProgramMaszyny = 'ciasto' | 'slodki' | 'pelnoziarnisty' | 'francuski' | 'podstawowy';

export interface GraniceMaszyny {
  /** Mmax: największa ilość mąki z instrukcji (wymagana); null = nie wpisano. */
  makaMaxG: number | null;
  /** Cmax: największa masa ciasta; null = instrukcja jej nie podaje (człon pominięty). */
  ciastoMaxG: number | null;
  /** Ymax: największa masa drożdży suchych; null = instrukcja jej nie podaje. */
  drozdzeSucheMaxG: number | null;
}
export type WynikMaki =
  | { ok: true; makaG: number; ograniczenie: 'maka' | 'ciasto' | 'drozdze' | null }
  | { ok: false; blad: 'brak-granicy-maki' | 'zle-dane' };

const dodatnia = (v: number) => Number.isFinite(v) && v > 0;
/** Zaokrąglenie w dół do 1 g (RD-37: nie przekroczyć granicy); 1e-9 chroni przed błędem zapisu ułamka (619,99999…). */
const wDol = (v: number) => Math.floor(v + 1e-9);

/**
 * RD-37: M = min(Mwyb, Mmax, Cmax / (1 + Σp), Ymax / (py × k)), w dół do 1 g. `sumaProcentow` = Σp jako ułamek masy
 * mąki; `drozdzeSwiezeUlamek` = py (null = receptura bez drożdży, człon pominięty); k = WSP_SWIEZE_NA_SUCHE (RD-19).
 */
export function makaMaszyny(makaWybranaG: number, sumaProcentow: number, drozdzeSwiezeUlamek: number | null, g: GraniceMaszyny): WynikMaki {
  if (g.makaMaxG === null) return { ok: false, blad: 'brak-granicy-maki' };
  const granice = [g.makaMaxG, g.ciastoMaxG, g.drozdzeSucheMaxG].filter((x): x is number => x !== null);
  if (!dodatnia(makaWybranaG) || !granice.every(dodatnia) || !Number.isFinite(sumaProcentow) || sumaProcentow < 0) return { ok: false, blad: 'zle-dane' };
  let m = makaWybranaG;
  let ograniczenie: 'maka' | 'ciasto' | 'drozdze' | null = null;
  const przytnij = (granica: number, co: 'maka' | 'ciasto' | 'drozdze') => {
    if (granica < m) {
      m = granica;
      ograniczenie = co;
    }
  };
  przytnij(g.makaMaxG, 'maka');
  if (g.ciastoMaxG !== null) przytnij(g.ciastoMaxG / (1 + sumaProcentow), 'ciasto');
  if (g.drozdzeSucheMaxG !== null && drozdzeSwiezeUlamek !== null && drozdzeSwiezeUlamek > 0) {
    przytnij(g.drozdzeSucheMaxG / (drozdzeSwiezeUlamek * WSP_SWIEZE_NA_SUCHE), 'drozdze');
  }
  return { ok: true, makaG: wDol(m), ograniczenie };
}

export type WynikOpoznienia =
  | { ok: true; dostepny: true }
  | { ok: true; dostepny: false; psujace: SkladnikPsujacy[] }
  | { ok: false; blad: 'brak-skladnikow' };

/** RD-38: opóźniony start niedostępny, gdy receptura (cała, OP-73) ma składnik z listy L; pusta lista = błąd danych. */
export function opoznionyStart(skladniki: readonly SkladnikMaszyny[] | null): WynikOpoznienia {
  if (skladniki === null || skladniki.length === 0) return { ok: false, blad: 'brak-skladnikow' };
  const psujace = PSUJACE.filter((p) => skladniki.includes(p));
  const wKolejnosci = skladniki.filter((s): s is SkladnikPsujacy => psujace.some((p) => p === s));
  const bezPowtorzen = wKolejnosci.filter((s, i) => wKolejnosci.indexOf(s) === i);
  return bezPowtorzen.length === 0 ? { ok: true, dostepny: true } : { ok: true, dostepny: false, psujace: bezPowtorzen };
}

export interface CechyProgramu {
  /** Wypiek kształtowany i pieczony poza formą maszyny. */
  pozaForma: boolean;
  kategoria: 'sourdough' | 'rye' | 'yeast' | 'pizza' | 'sweet';
  /** Upż: (mąki pełnoziarniste + żytnie) / M × 100; null = brak masy mąki. */
  upzProc: number | null;
  /** Czy receptura ma cukier / tłuszcz; null = nie wiadomo (wtedy nie „francuski”). */
  maCukier: boolean | null;
  maTluszcz: boolean | null;
}

/** RD-39: pierwsza pasująca reguła; bez masy mąki (krok 3) brak podpowiedzi, tylko błąd danych (RD-39-W8). */
export function podpowiedzProgramu(c: CechyProgramu): { ok: true; program: ProgramMaszyny } | { ok: false; blad: 'brak-maki' } {
  if (c.pozaForma) return { ok: true, program: 'ciasto' };
  if (c.kategoria === 'sweet') return { ok: true, program: 'slodki' };
  if (c.upzProc === null) return { ok: false, blad: 'brak-maki' };
  if (c.upzProc >= PROG_PELNOZIARNISTY_PROC) return { ok: true, program: 'pelnoziarnisty' };
  if (c.maCukier === false && c.maTluszcz === false) return { ok: true, program: 'francuski' };
  return { ok: true, program: 'podstawowy' };
}

/** Upż receptury z mąk (procenty normalizowane do sumy); mąka żytnia pełnoziarnista liczona raz. Brak mąk = null. */
export function udzialPelnoziarnistychIZytnich(maki: readonly FlourItemInput[]): number | null {
  const suma = maki.reduce((a, f) => a + f.percentage, 0);
  if (maki.length === 0 || !(suma > 0)) return null;
  const pz = maki.reduce((a, f) => {
    const p = matchFlourProfile(f.name);
    return p.grain === 'rye' || p.ashTyp >= TYP_PELNOZIARNISTY ? a + f.percentage : a;
  }, 0);
  return Math.round((pz / suma) * 1000) / 10;
}

const KOLEJNOSC: Record<UkladMaszyny, readonly ('plyn' | 'sucha' | 'drozdze')[]> = {
  plyny_najpierw: ['plyn', 'sucha', 'drozdze'], // MAS-005, MAS-020, MAS-040, MAS-050
  drozdze_najpierw: ['drozdze', 'sucha', 'plyn'], // MAS-031
};

/** BR-MASZ-003: kolejność w wybranym układzie (stabilna w grupie); bez układu null = ekran prosi o wybór. */
export function kolejnoscWkladania<T extends { rodzaj: 'plyn' | 'sucha' | 'drozdze' }>(lista: readonly T[], uklad: UkladMaszyny | null): T[] | null {
  if (uklad === null) return null;
  return KOLEJNOSC[uklad].flatMap((r) => lista.filter((x) => x.rodzaj === r));
}

export type WynikStartu =
  | { ok: true; startMs: number; doGotowosciMin: number }
  | { ok: false; blad: 'za-wczesnie'; najwczesniejGotoweMs: number }
  | { ok: false; blad: 'zly-czas-programu' };

/**
 * BR-MASZ-005: start programu = gotowość − czas programu (jeden czas z instrukcji, D-189, D-260). Gotowość, przy której
 * start wypadłby przed teraz, daje najwcześniejszą możliwą. Jak wpisać opóźnienie w maszynie: OP-65, poza tą funkcją.
 */
export function startProgramu(gotoweMs: number, czasProgramuMin: number, nowMs: number): WynikStartu {
  if (!dodatnia(czasProgramuMin)) return { ok: false, blad: 'zly-czas-programu' };
  const startMs = gotoweMs - czasProgramuMin * 60_000;
  if (startMs < nowMs) return { ok: false, blad: 'za-wczesnie', najwczesniejGotoweMs: nowMs + czasProgramuMin * 60_000 };
  return { ok: true, startMs, doGotowosciMin: Math.round((gotoweMs - nowMs) / 60_000) };
}
