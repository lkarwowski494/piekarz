// ============================================================================
// Piekarz — piekarnik zajęty przy kilku wypiekach (BR-KAL-016 „Jeden piekarnik”, RD-34; D-092) [M3 D6]
// Czyste funkcje. Okno piekarnika wypieku = [start kroku nagrzewania, koniec kroku pieczenia) — nagrzewanie zajmuje
// piekarnik (rejestr roli 06, M0: PIE-ZAJ-001, PIE-ZAJ-003, KRO-POC-011); czas nagrzewania z planu (garnek ok. 30 min,
// kamień ok. 60 min). Kolizja: dwa okna nachodzą na siebie (koniec jednego = start drugiego to nie kolizja, RD-34-W2).
// Propozycja: start drugiego wypieku później o najmniejszy czas usuwający kolizję — nagrzewanie drugiego zaczyna się
// o końcu pieczenia innego, pełne, bez stałej przerwy (PIE-ZAJ-900: źródła nie podają liczby przerwy).
// ============================================================================

import type { SessionStep } from './bake-steps';

/** Krok w rachunku piekarnika: kategoria z planu i planowany czas; brak kategorii = stary zapis, krok poza piekarnikiem. */
export type KrokPiekarnika = Pick<SessionStep, 'plannedStart' | 'plannedEnd'> & { category?: SessionStep['category'] };

/** Okno zajęcia piekarnika [od, do) w ms. */
export interface OknoPiekarnika {
  od: number;
  do: number;
}

/**
 * Okno wypieku albo powód, dla którego go nie ma: `bez-pieczenia` — wypiek nie używa piekarnika; `brak-nagrzewania` —
 * jest pieczenie, ale plan nie ma kroku nagrzewania (RD-34-W6: kolizji nie liczy się); `bez-czasu` — kroki bez planu.
 */
export type WynikOkna = { ok: true; okno: OknoPiekarnika } | { ok: false; powod: 'brak-nagrzewania' | 'bez-pieczenia' | 'bez-czasu' };

const czas = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Okno piekarnika: od startu pierwszego kroku nagrzewania do końca ostatniego kroku pieczenia (RD-34). */
export function oknoPiekarnika(kroki: readonly KrokPiekarnika[]): WynikOkna {
  const pieczenie = [...kroki].reverse().find((k) => k.category === 'bake');
  if (!pieczenie) return { ok: false, powod: 'bez-pieczenia' };
  const nagrzewanie = kroki.find((k) => k.category === 'preheat_oven');
  if (!nagrzewanie) return { ok: false, powod: 'brak-nagrzewania' };
  const od = nagrzewanie.plannedStart;
  const koniec = pieczenie.plannedEnd;
  if (!czas(od) || !czas(koniec) || koniec <= od) return { ok: false, powod: 'bez-czasu' };
  return { ok: true, okno: { od, do: koniec } };
}

/** Okna nachodzą na siebie; styk (koniec jednego = start drugiego) to nie kolizja (RD-34-W2, RD-34-W5). */
export function oknaKoliduja(a: OknoPiekarnika, b: OknoPiekarnika): boolean {
  return a.od < b.do && b.od < a.do;
}

/** Kolizja z innym wypiekiem: jego nazwa, jego okno i część wspólna [od, do). */
export interface KolizjaPiekarnika {
  wypiek: string;
  okno: OknoPiekarnika;
  od: number;
  do: number;
}

export type SprawdzeniePiekarnika =
  | { stan: 'wolny' }
  | { stan: 'brak-nagrzewania' }
  | { stan: 'zajety'; okno: OknoPiekarnika; kolizje: KolizjaPiekarnika[]; przesuniecieMs: number };

export interface InnyWypiek {
  nazwa: string;
  kroki: readonly KrokPiekarnika[];
}

/**
 * Czy piekarnik jest wolny dla nowego wypieku (`kroki`) wobec innych wypieków. Inny wypiek bez okna (bez pieczenia,
 * bez nagrzewania, bez planu) nie daje kolizji. Propozycja: najmniejsze przesunięcie ≥ 0 na koniec okna innego wypieku,
 * po którym nowe okno nie nachodzi na żadne inne (RD-34-W3: start nagrzewania = koniec pieczenia pierwszego).
 */
export function sprawdzPiekarnik(kroki: readonly KrokPiekarnika[], inne: readonly InnyWypiek[]): SprawdzeniePiekarnika {
  const wlasne = oknoPiekarnika(kroki);
  if (!wlasne.ok) return wlasne.powod === 'brak-nagrzewania' ? { stan: 'brak-nagrzewania' } : { stan: 'wolny' };
  const okno = wlasne.okno;
  const okna: { nazwa: string; okno: OknoPiekarnika }[] = [];
  for (const w of inne) {
    const r = oknoPiekarnika(w.kroki);
    if (r.ok) okna.push({ nazwa: w.nazwa, okno: r.okno });
  }
  const kolizje = okna
    .filter((w) => oknaKoliduja(okno, w.okno))
    .map((w) => ({ wypiek: w.nazwa, okno: w.okno, od: Math.max(okno.od, w.okno.od), do: Math.min(okno.do, w.okno.do) }))
    .sort((a, b) => a.od - b.od);
  if (kolizje.length === 0) return { stan: 'wolny' };
  const wolne = (d: number) => okna.every((w) => !oknaKoliduja({ od: okno.od + d, do: okno.do + d }, w.okno));
  const kandydaci = okna.map((w) => w.okno.do - okno.od).filter((d) => d > 0).sort((a, b) => a - b);
  // Koniec najpóźniejszego okna zawsze usuwa kolizję, więc `find` coś zwraca; zapas to ten sam koniec.
  const przesuniecieMs = kandydaci.find(wolne) ?? Math.max(...kandydaci);
  return { stan: 'zajety', okno, kolizje, przesuniecieMs };
}

/** Kroki przesunięte o `ms` (każdy krok tej samej długości, pełne nagrzewanie); krok bez planu zostaje bez planu. */
export function przesunKroki<T extends KrokPiekarnika>(kroki: readonly T[], ms: number): T[] {
  return kroki.map((k) => ({
    ...k,
    plannedStart: czas(k.plannedStart) ? k.plannedStart + ms : k.plannedStart,
    plannedEnd: czas(k.plannedEnd) ? k.plannedEnd + ms : k.plannedEnd,
  }));
}

/** Para wypieków z kolizją piekarnika (kalendarz, arkusz dnia): pierwszy = okno zaczyna się wcześniej. */
export interface ParaPiekarnika {
  pierwszy: { id: string; nazwa: string };
  drugi: { id: string; nazwa: string };
  od: number;
  do: number;
}

/** Wszystkie pary wypieków, których okna piekarnika nachodzą na siebie, w kolejności początku części wspólnej. */
export function kolizjePiekarnika(wypieki: readonly { id: string; nazwa: string; kroki: readonly KrokPiekarnika[] }[]): ParaPiekarnika[] {
  const okna: { id: string; nazwa: string; okno: OknoPiekarnika }[] = [];
  for (const w of wypieki) {
    const r = oknoPiekarnika(w.kroki);
    if (r.ok) okna.push({ id: w.id, nazwa: w.nazwa, okno: r.okno });
  }
  okna.sort((a, b) => a.okno.od - b.okno.od);
  const out: ParaPiekarnika[] = [];
  okna.forEach((a, i) => {
    for (const b of okna.slice(i + 1)) {
      if (oknaKoliduja(a.okno, b.okno)) {
        out.push({ pierwszy: { id: a.id, nazwa: a.nazwa }, drugi: { id: b.id, nazwa: b.nazwa }, od: Math.max(a.okno.od, b.okno.od), do: Math.min(a.okno.do, b.okno.do) });
      }
    }
  });
  return out.sort((x, y) => x.od - y.od);
}
