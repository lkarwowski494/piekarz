// ============================================================================
// Piekarz — plan wypieku bez kroków czynnych w nocy: godzina gotowości przy otwarciu planu
// [M1-audytor-generalny-129; 08-programista-501; DEC-18 a]. Czyste funkcje: czas, kroki i okno snu przychodzą z argumentów.
//   • krok czynny (isPassive === false) „zachodzi na okno snu”, gdy jego początek lub koniec jest w oknie (jak Sleep Guard
//     w reverse-scheduler) albo okno snu zaczyna się w jego trakcie;
//   • godzina: najbliższa ≥ najwcześniejszej możliwej, w kroku 5 min, w ograniczeniu 48 h; brak = null (ekran zostaje
//     przy najwcześniejszej i banerze nocy).
// ============================================================================

const MIN_MS = 60_000;

/** Krok szukania godziny (min). */
export const KROK_SZUKANIA_MIN = 5;
/** Ograniczenie szukania od najwcześniejszej godziny (h). */
export const LIMIT_SZUKANIA_H = 48;

export type KrokNocy = { isPassive: boolean; plannedStart: number | null; plannedEnd: number | null };
export interface OknoSnu {
  /** Godzina rozpoczęcia snu, np. 23 (23:00). */
  startH: number;
  /** Godzina końca snu, np. 6.5 (06:30). */
  koniecH: number;
}

const godzinaDnia = (ms: number) => {
  const d = new Date(ms);
  return d.getHours() + d.getMinutes() / 60;
};

/** Czy chwila jest w oknie snu (początek włącznie, koniec wyłącznie; okno może przechodzić przez północ). */
export function wOknieSnu(ms: number, okno: OknoSnu): boolean {
  const h = godzinaDnia(ms);
  return okno.startH > okno.koniecH ? h >= okno.startH || h < okno.koniecH : h >= okno.startH && h < okno.koniecH;
}

/** Czy okno snu zaczyna się wewnątrz kroku (krok dłuższy niż dzień sprawdzany co 5 min). */
function snZaczynaSieWKroku(start: number, koniec: number, okno: OknoSnu): boolean {
  for (let t = start; t < koniec; t += KROK_SZUKANIA_MIN * MIN_MS) if (wOknieSnu(t, okno)) return true;
  return false;
}

/** Czy któryś krok czynny planu zachodzi na okno snu; kroki bez godzin są pomijane. */
export function krokCzynnyWNocy(kroki: readonly KrokNocy[], okno: OknoSnu): boolean {
  return kroki.some((k) => {
    if (k.isPassive || k.plannedStart === null || k.plannedEnd === null) return false;
    return wOknieSnu(k.plannedStart, okno) || wOknieSnu(k.plannedEnd, okno) || snZaczynaSieWKroku(k.plannedStart, k.plannedEnd, okno);
  });
}

/**
 * Najbliższa godzina gotowości (ms) ≥ `odMs`, dla której plan z `kroki(celMs)` nie ma kroku czynnego w oknie snu;
 * null, gdy w ciągu 48 h nie ma takiej godziny.
 */
export function godzinaBezNocy(odMs: number, kroki: (celMs: number) => readonly KrokNocy[], okno: OknoSnu): number | null {
  const krok = KROK_SZUKANIA_MIN * MIN_MS;
  const koniec = odMs + (LIMIT_SZUKANIA_H * 60 * MIN_MS);
  for (let cel = odMs; cel <= koniec; cel += krok) {
    if (!krokCzynnyWNocy(kroki(cel), okno)) return cel;
  }
  return null;
}
