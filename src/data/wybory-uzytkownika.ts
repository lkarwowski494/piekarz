// ============================================================================
// Piekarz — wybory użytkownika w app_settings bez zmiany schematu (D-242, plan danych p9 §1) [M3 p9b]
// Z1 b: `wersje_receptur` = JSON {"<recipeId>":"drozdze"} (tylko odstępstwa od domyślnej wersji na zakwasie).
// Z4 a: `maszyna` = JSON dane maszyny z wersją formatu `v` (BR-MASZ-002, BR-MASZ-003, D-189).
// Odczyt z `unknown`: zły kształt = typowany błąd, brak = brak (prośba o dane, nie liczba domyślna). Oba klucze są
// na liście kopii (ustawienia-kopii.ts) dopiero po decyzji o teście G5 (STOP p9b-1).
// ============================================================================

import { getAppSetting, setAppSetting } from './settings-store';
import { isNum, isObj } from './row-parsers';
import { zachowajUszkodzony, zapisUszkodzonych } from './uszkodzone-wiersze';

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

/**
 * Wersja receptury przy otwarciu: zapamiętana albo domyślna „na zakwasie” (preferencja interfejsu). Nieczytelna mapa
 * też daje domyślną; jej surowa treść trafia do pliku ratunkowego przed nadpisaniem przy następnym wyborze.
 */
export async function wczytajWersjeReceptury(recipeId: string): Promise<WersjaWypieku> {
  const r = parseWersjeReceptur(await getAppSetting(KLUCZ_WERSJI_RECEPTUR));
  return r.ok ? r.value[recipeId] ?? 'zakwas' : 'zakwas';
}

/** Zapis wyboru: odstępstwo do mapy, „na zakwasie” usuwa wpis receptury; inne receptury bez zmian. */
export async function zapiszWersjeReceptury(recipeId: string, wersja: WersjaWypieku): Promise<void> {
  const surowe = await getAppSetting(KLUCZ_WERSJI_RECEPTUR);
  const r = parseWersjeReceptur(surowe);
  if (!r.ok && typeof surowe === 'string') {
    // Nieczytelna mapa przed nadpisaniem do pliku ratunkowego (121): bez cichej utraty zapisu
    zachowajUszkodzony({ tabela: 'app_settings', id: KLUCZ_WERSJI_RECEPTUR, surowe });
    await zapisUszkodzonych();
  }
  const mapa: Record<string, WersjaWypieku> = r.ok ? { ...r.value } : {};
  if (wersja === 'drozdze') mapa[recipeId] = 'drozdze';
  else delete mapa[recipeId];
  await setAppSetting(KLUCZ_WERSJI_RECEPTUR, JSON.stringify(mapa));
}

export async function wczytajMaszyne(): Promise<WynikWyboru<DaneMaszyny | null>> {
  return parseMaszyna(await getAppSetting(KLUCZ_MASZYNY));
}

export async function zapiszMaszyne(m: DaneMaszyny): Promise<void> {
  await setAppSetting(KLUCZ_MASZYNY, JSON.stringify(m));
}
