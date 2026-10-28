// ============================================================================
// Piekarz — plan wypieku bez kroków czynnych w nocy: godzina gotowości przy otwarciu planu
// [M1-audytor-generalny-129; 08-programista-501; DEC-18 a]. Czyste funkcje: czas, kroki i okno snu przychodzą z argumentów.
//   • krok czynny (isPassive === false) „zachodzi na okno snu”, gdy jego początek lub koniec jest w oknie (jak Sleep Guard
//     w reverse-scheduler) albo okno snu zaczyna się w jego trakcie;
//   • godzina: najbliższa ≥ najwcześniejszej możliwej, w kroku 5 min, w ograniczeniu 48 h; brak = null (ekran zostaje
//     przy najwcześniejszej i banerze nocy).
// ============================================================================

import { atLocalTime } from '../core/dzien-lokalny';
import { ZASIEG_DNI_PLANU } from '../core/kalendarz-config';

const MIN_MS = 60_000;

/** Krok szukania godziny (min). */
export const KROK_SZUKANIA_MIN = 5;
/** Ograniczenie szukania od najwcześniejszej godziny (h). */
export const LIMIT_SZUKANIA_H = 48;

export type KrokNocy = { isPassive: boolean; rekaNaStarcie?: boolean; plannedStart: number | null; plannedEnd: number | null };
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

/**
 * Czy krok bierny wymaga rąk na starcie, a jego początek wypada w oknie snu (dokarmienie, autoliza, rozgrzanie
 * piekarnika, włożenie chleba żytniego do pieca) [audyt-niezalezny D-6].
 */
export function startZRekamiWNocy(k: KrokNocy, okno: OknoSnu): boolean {
  return k.isPassive && !!k.rekaNaStarcie && k.plannedStart !== null && wOknieSnu(k.plannedStart, okno);
}

/** Czy któryś krok czynny planu (albo początek kroku z rękami na starcie) zachodzi na okno snu; kroki bez godzin są pomijane. */
export function krokCzynnyWNocy(kroki: readonly KrokNocy[], okno: OknoSnu): boolean {
  return kroki.some((k) => {
    if (startZRekamiWNocy(k, okno)) return true;
    if (k.isPassive || k.plannedStart === null || k.plannedEnd === null) return false;
    return wOknieSnu(k.plannedStart, okno) || wOknieSnu(k.plannedEnd, okno) || snZaczynaSieWKroku(k.plannedStart, k.plannedEnd, okno);
  });
}

/**
 * Kolizje ze snem z kroków planu (krok czynny z początkiem albo końcem w oknie snu, jak Sleep Guard w reverse-scheduler)
 * dla banera nocy, gdy kroki nie pochodzą 1:1 z harmonogramu (plan żytni) [M1-audytor-generalny-030; 03-zakres-501].
 */
export function kolizjeKrokow(
  kroki: readonly (KrokNocy & { name: string })[],
  okno: OknoSnu,
  godzina: (d: Date) => string,
): { stageNamePl: string; time: string }[] {
  return kroki.flatMap((k) =>
    k.plannedStart !== null &&
    (startZRekamiWNocy(k, okno) ||
      (!k.isPassive && k.plannedEnd !== null && (wOknieSnu(k.plannedStart, okno) || wOknieSnu(k.plannedEnd, okno))))
      ? [{ stageNamePl: k.name, time: godzina(new Date(k.plannedStart)) }]
      : [],
  );
}

/**
 * Najbliższa godzina gotowości (ms) ≥ `odMs`, dla której plan z `kroki(celMs)` nie ma kroku czynnego w oknie snu;
 * null, gdy w ciągu 48 h (i przed `przedMs`, gdy podane) nie ma takiej godziny.
 */
export function godzinaBezNocy(odMs: number, kroki: (celMs: number) => readonly KrokNocy[], okno: OknoSnu, przedMs = Infinity): number | null {
  const krok = KROK_SZUKANIA_MIN * MIN_MS;
  const koniec = odMs + (LIMIT_SZUKANIA_H * 60 * MIN_MS);
  for (let cel = odMs; cel <= koniec && cel < przedMs; cel += krok) {
    if (!krokCzynnyWNocy(kroki(cel), okno)) return cel;
  }
  return null;
}

/** Godzina „gotowe” w dniu założonym: nowa chwila, bez zmian albo dzień nieosiągalny. */
export type CelWDniu = { rodzaj: 'godzina'; celMs: number } | { rodzaj: 'bez-zmian' } | { rodzaj: 'nieosiagalny' };

/**
 * Dzień założony [odDniaMs, doDniaMs) — skrót arkusza dnia (BR-KAL-015) albo rytm Dziennika (BR-KAL-014) — nie
 * zmienia się po cichu [M3 TZ]: godzina domyślna zostaje, gdy zdąży i nie ma kroku czynnego w nocy; inaczej najbliższa
 * godzina bez nocy w tym dniu, a bez niej najwcześniejsza w tym dniu (baner nocy pokaże kolizję). Najwcześniejsza
 * możliwa godzina po końcu dnia = dzień nieosiągalny (decyzja należy do wołającego).
 */
export function celWDniu(a: {
  najwczesniejMs: number;
  domyslnyMs: number;
  odDniaMs: number;
  doDniaMs: number;
  kroki: (celMs: number) => readonly KrokNocy[];
  okno: OknoSnu;
}): CelWDniu {
  if (a.najwczesniejMs >= a.doDniaMs) return { rodzaj: 'nieosiagalny' };
  const zaPozno = a.domyslnyMs < a.najwczesniejMs;
  if (!zaPozno && !krokCzynnyWNocy(a.kroki(a.domyslnyMs), a.okno)) return { rodzaj: 'bez-zmian' };
  const bezNocy = godzinaBezNocy(Math.max(a.najwczesniejMs, a.odDniaMs), a.kroki, a.okno, a.doDniaMs);
  if (bezNocy !== null) return { rodzaj: 'godzina', celMs: bezNocy };
  return zaPozno ? { rodzaj: 'godzina', celMs: a.najwczesniejMs } : { rodzaj: 'bez-zmian' };
}

/**
 * Pierwszy osiągalny dzień z `dni` (przesunięcia od dziś: skrót albo rytm i rytm + 7) z godziną z `celWDniu`; null, gdy
 * żaden nie jest osiągalny. Godzina domyślna `hour:minute` w czasie lokalnym (D-093) [M3 TZ].
 */
export function dzienZalozony(a: {
  dni: readonly number[];
  terazMs: number;
  najwczesniejMs: number;
  hour: number;
  minute: number;
  kroki: (celMs: number) => readonly KrokNocy[];
  okno: OknoSnu;
}): { dzien: number; cel: CelWDniu } | null {
  for (const dzien of a.dni) {
    const cel = celWDniu({
      najwczesniejMs: a.najwczesniejMs,
      domyslnyMs: atLocalTime(a.terazMs, dzien, a.hour, a.minute).ms,
      odDniaMs: atLocalTime(a.terazMs, dzien, 0, 0).ms,
      doDniaMs: atLocalTime(a.terazMs, dzien + 1, 0, 0).ms,
      kroki: a.kroki,
      okno: a.okno,
    });
    if (cel.rodzaj !== 'nieosiagalny') return { dzien, cel };
  }
  return null;
}

/**
 * Zmiana pola „gotowe” przy otwarciu planu (ekran planu, póki użytkownik nie zmienił dnia ani godziny) [DEC-18 a; M3 D5,
 * D7, TZ]: `celMs` = nowa chwila, `dzien` = sam dzień, `rytmPoza` = rytm bez osiągalnego dnia (bez propozycji i zdania).
 * Dzień ze skrótu (BR-KAL-015) albo rytmu (BR-KAL-014) nie zmienia się po cichu (`dzienZalozony`); rytm nieosiągalny:
 * ten sam dzień tygodnia tydzień później w zasięgu D-108; skrót nieosiągalny: dzień zostaje, „Nie zdążysz” podaje
 * najwcześniejszą godzinę. Bez dnia założonego: najbliższa godzina bez nocy ≥ najwcześniejszej (48 h), inaczej
 * najwcześniejsza przy „za późno”.
 */
export function godzinaPrzyOtwarciu(a: {
  terazMs: number;
  najwczesniejMs: number | null;
  zaPozno: boolean;
  krokiNaEkranie: readonly KrokNocy[];
  kroki: (celMs: number) => readonly KrokNocy[];
  okno: OknoSnu;
  skrot: number | null;
  rytm: number | null;
  hour: number;
  minute: number;
}): { celMs?: number; dzien?: number; rytmPoza?: true } {
  const najw = a.najwczesniejMs;
  if (najw === null) return {};
  const dni = a.skrot !== null ? [a.skrot] : a.rytm !== null ? [a.rytm, a.rytm + 7].filter((d) => d <= ZASIEG_DNI_PLANU) : [];
  if (dni.length > 0) {
    const w = dzienZalozony({ dni, terazMs: a.terazMs, najwczesniejMs: najw, hour: a.hour, minute: a.minute, kroki: a.kroki, okno: a.okno });
    if (w !== null) return w.cel.rodzaj === 'godzina' ? { celMs: w.cel.celMs } : { dzien: w.dzien };
    if (a.skrot !== null) return {};
  }
  const poza: { rytmPoza?: true } = dni.length > 0 ? { rytmPoza: true } : {};
  if (!(a.zaPozno || krokCzynnyWNocy(a.krokiNaEkranie, a.okno))) return poza;
  const bezNocy = godzinaBezNocy(najw, a.kroki, a.okno);
  if (bezNocy !== null) return { ...poza, celMs: bezNocy };
  return a.zaPozno ? { ...poza, celMs: najw } : poza;
}
