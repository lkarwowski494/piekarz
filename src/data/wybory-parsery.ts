// ============================================================================
// Piekarz — parsery wyborów użytkownika z app_settings (D-242 Z1 b, Z4 a), bez zależności od bazy: używa ich też
// import kopii (ustawienia-kopii.ts) bez cyklu importów; zapis i odczyt w wybory-uzytkownika.ts [M3 p9b]
// ============================================================================

import { isNum, isObj } from './row-parsers';

export const KLUCZ_WERSJI_RECEPTUR = 'wersje_receptur';
export const KLUCZ_MASZYNY = 'maszyna';

export type WersjaWypieku = 'zakwas' | 'drozdze';
export type UkladMaszyny = 'plyny_najpierw' | 'drozdze_najpierw';
export interface DaneMaszyny {
  v: 1;
  /** Największa masa mąki z instrukcji maszyny, g (wymagana). */
  makaMaxG: number;
  /** Największa masa ciasta, g; null = nie podano. */
  ciastoMaxG: number | null;
  /** Największa masa drożdży suchych, g; null = nie podano. */
  drozdzeSucheMaxG: number | null;
  /** Kolejność składników z instrukcji; null = zapytać (BR-MASZ-003). */
  uklad: UkladMaszyny | null;
  /** Czas programu z instrukcji, min; null = nie podano (jeden czas czy na rodzaj: otwarte dla roli 04, D-242). */
  czasProgramuMin: number | null;
}
export type BladWyboru = { kind: 'storage'; key: string; got: unknown };
export type WynikWyboru<T> = { ok: true; value: T } | { ok: false; error: BladWyboru };

const blad = (key: string, got: unknown): { ok: false; error: BladWyboru } => ({ ok: false, error: { kind: 'storage', key, got } });

function json(raw: string): { ok: true; v: unknown } | { ok: false } {
  try {
    return { ok: true, v: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
}

/** Mapa wersji receptur z wartości klucza; brak klucza = pusta mapa. */
export function parseWersjeReceptur(raw: unknown): WynikWyboru<Record<string, WersjaWypieku>> {
  if (raw === undefined || raw === null) return { ok: true, value: {} };
  const p = typeof raw === 'string' ? json(raw) : { ok: false as const };
  if (!p.ok || !isObj(p.v)) return blad(KLUCZ_WERSJI_RECEPTUR, raw);
  const out: Record<string, WersjaWypieku> = {};
  for (const [id, w] of Object.entries(p.v)) {
    if (w !== 'zakwas' && w !== 'drozdze') return blad(KLUCZ_WERSJI_RECEPTUR, raw);
    out[id] = w;
  }
  return { ok: true, value: out };
}

const dodatniaLubNull = (v: unknown): v is number | null | undefined => v === undefined || v === null || (isNum(v) && v > 0);

/** Dane maszyny z wartości klucza; brak klucza = null (ekran prosi o dane). */
export function parseMaszyna(raw: unknown): WynikWyboru<DaneMaszyny | null> {
  if (raw === undefined || raw === null) return { ok: true, value: null };
  const p = typeof raw === 'string' ? json(raw) : { ok: false as const };
  if (!p.ok || !isObj(p.v)) return blad(KLUCZ_MASZYNY, raw);
  const { v, makaMaxG, ciastoMaxG, drozdzeSucheMaxG, uklad, czasProgramuMin } = p.v;
  if (v !== 1 || !isNum(makaMaxG) || makaMaxG <= 0) return blad(KLUCZ_MASZYNY, raw);
  if (!dodatniaLubNull(ciastoMaxG) || !dodatniaLubNull(drozdzeSucheMaxG) || !dodatniaLubNull(czasProgramuMin)) return blad(KLUCZ_MASZYNY, raw);
  if (uklad !== undefined && uklad !== null && uklad !== 'plyny_najpierw' && uklad !== 'drozdze_najpierw') return blad(KLUCZ_MASZYNY, raw);
  return {
    ok: true,
    value: {
      v: 1,
      makaMaxG,
      ciastoMaxG: ciastoMaxG ?? null,
      drozdzeSucheMaxG: drozdzeSucheMaxG ?? null,
      uklad: uklad ?? null,
      czasProgramuMin: czasProgramuMin ?? null,
    },
  };
}
