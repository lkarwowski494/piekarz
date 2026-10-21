// ============================================================================
// Piekarz — dokarmianie z masy zakwasu zostawionego w słoiku i proporcji (RD-14; BR-ZAKW-002)
// [M1-audytor-generalny-130; 01-odkrywanie-501]. Czysta funkcja: mąka = masa × p₁ / p₀, woda = masa × p₂ / p₀,
// hydratacja po dokarmieniu = (woda w zakwasie + woda) / (mąka w zakwasie + mąka) przy hydratacji zakwasu h.
// ============================================================================

export interface DokarmienieZeZostawionego {
  makaG: number;
  wodaG: number;
  /** Hydratacja zakwasu po dokarmieniu, % (całkowita). */
  hydratacjaPct: number;
}

/** null, gdy masa nie jest dodatnia albo proporcja nie ma części zakwasu. */
export function dokarmienieZeZostawionego(
  zostawiamG: number,
  proporcja: readonly [number, number, number],
  hydratacjaZakwasuPct: number,
): DokarmienieZeZostawionego | null {
  const [p0, p1, p2] = proporcja;
  if (!(zostawiamG > 0) || !(p0 > 0) || !(hydratacjaZakwasuPct >= 0)) return null;
  const makaG = Math.round((zostawiamG * p1) / p0 * 10) / 10;
  const wodaG = Math.round((zostawiamG * p2) / p0 * 10) / 10;
  const makaWZakwasie = (zostawiamG * 100) / (100 + hydratacjaZakwasuPct);
  const wodaWZakwasie = zostawiamG - makaWZakwasie;
  const hydratacjaPct = Math.round(((wodaWZakwasie + wodaG) / (makaWZakwasie + makaG)) * 100);
  return { makaG, wodaG, hydratacjaPct };
}
