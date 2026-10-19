// ============================================================================
// Piekarz — widoczność jedynego ekranu zakupu (ADR-002, MON-05) [M1-audytor-generalny-025;
// 02-monetyzacja-005, 05-architekt-008]. Jedna kopia na proces: strażnik na dowolnym ekranie otwiera
// ten sam ekran zakupu, który renderuje AppAccessProvider w app/_layout.tsx.
// ============================================================================

let widoczny = false;
const sluchacze = new Set<(widoczny: boolean) => void>();

export function czyEkranZakupu(): boolean {
  return widoczny;
}

export function ustawEkranZakupu(nowy: boolean): void {
  if (nowy === widoczny) return;
  widoczny = nowy;
  sluchacze.forEach((fn) => fn(nowy));
}

export function subskrybujEkranZakupu(fn: (widoczny: boolean) => void): () => void {
  sluchacze.add(fn);
  return () => {
    sluchacze.delete(fn);
  };
}

/** Tylko testy: nowy proces z zamkniętym ekranem zakupu. */
export function _resetEkranu(): void {
  widoczny = false;
  sluchacze.clear();
}
