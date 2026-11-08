// ============================================================================
// Piekarz — dane ekranu „Licencje open source” (Z-08-1, FOR-15, D-291). Dane leżą w assets/licencje.generated.json
// (generuje scripts/licencje.mjs z package-lock.json; plik jest poza limitem 20 480 B dla .ts/.tsx, CLAUDE.md §1.2).
// Granica pliku: wczytajLicencje przyjmuje `unknown` i zwraca wynik albo błąd, bez `as` i bez zgadywania braków.
// ============================================================================

export interface WpisLicencji {
  nazwa: string;
  wersja: string;
  /** Wyrażenie SPDX, np. „MIT”, „(MIT OR Apache-2.0)”. */
  licencja: string;
  /** Notki o prawach autorskich z pliku licencji pakietu. */
  notki: string[];
  /** Treść pliku NOTICE pakietu (Apache-2.0 §4d), jeśli pakiet go ma. */
  notice?: string;
}

export interface DaneLicencji {
  pakiety: WpisLicencji[];
  czcionki: WpisLicencji[];
  natywne: WpisLicencji[];
  /** Treść licencji wg identyfikatora SPDX; `zrodlo` = pakiet, z którego plik pochodzi. */
  teksty: Record<string, { zrodlo: string; tekst: string }>;
  /** Identyfikatory SPDX bez treści w żadnym pakiecie (np. alternatywa „GPL-2.0” w „BSD-3-Clause OR GPL-2.0”). */
  bezTresci: string[];
}

export type WynikLicencji = { ok: true; wartosc: DaneLicencji } | { ok: false; blad: string };

const jestObiektem = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const tekstowa = (v: unknown): v is string => typeof v === 'string';
const listaTekstow = (v: unknown): v is string[] => Array.isArray(v) && v.every(tekstowa);

function wpis(v: unknown): WpisLicencji | null {
  if (!jestObiektem(v)) return null;
  const { nazwa, wersja, licencja, notki, notice } = v;
  if (!tekstowa(nazwa) || !tekstowa(wersja) || !tekstowa(licencja) || !listaTekstow(notki)) return null;
  if (notice !== undefined && !tekstowa(notice)) return null;
  return notice === undefined ? { nazwa, wersja, licencja, notki } : { nazwa, wersja, licencja, notki, notice };
}

function wpisy(v: unknown): WpisLicencji[] | null {
  if (!Array.isArray(v)) return null;
  const out: WpisLicencji[] = [];
  for (const el of v) {
    const w = wpis(el);
    if (!w) return null;
    out.push(w);
  }
  return out;
}

export function wczytajLicencje(raw: unknown): WynikLicencji {
  if (!jestObiektem(raw)) return { ok: false, blad: 'dane licencji: oczekiwano obiektu' };
  const pakiety = wpisy(raw.pakiety);
  if (!pakiety) return { ok: false, blad: 'dane licencji: pakiety' };
  const czcionki = wpisy(raw.czcionki);
  if (!czcionki) return { ok: false, blad: 'dane licencji: czcionki' };
  const natywne = wpisy(raw.natywne);
  if (!natywne) return { ok: false, blad: 'dane licencji: natywne' };
  if (!jestObiektem(raw.teksty)) return { ok: false, blad: 'dane licencji: teksty' };
  const teksty: DaneLicencji['teksty'] = {};
  for (const [id, t] of Object.entries(raw.teksty)) {
    if (!jestObiektem(t) || !tekstowa(t.zrodlo) || !tekstowa(t.tekst)) return { ok: false, blad: `dane licencji: tekst ${id}` };
    teksty[id] = { zrodlo: t.zrodlo, tekst: t.tekst };
  }
  if (!listaTekstow(raw.bezTresci)) return { ok: false, blad: 'dane licencji: bezTresci' };
  return { ok: true, wartosc: { pakiety, czcionki, natywne, teksty, bezTresci: raw.bezTresci } };
}

/** Identyfikatory SPDX z wyrażenia licencji: „(MIT OR Apache-2.0)” → [„MIT”, „Apache-2.0”]. */
export function identyfikatoryLicencji(wyrazenie: string): string[] {
  return wyrazenie
    .replace(/[()]/g, ' ')
    .split(/\s+/)
    .filter((x) => x !== '' && x !== 'OR' && x !== 'AND');
}
