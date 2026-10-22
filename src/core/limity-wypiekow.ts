// ============================================================================
// Piekarz — limity wypieków naraz (D-092, BR-ETAP-006, BR-KAL-009; zgoda właściciela przez M1 2026-10-22) [M3 D1]
// Jedno miejsce tych liczb: zapis listy sesji (src/data/bake-sessions-store.ts) i ekrany biorą je stąd.
// ============================================================================

/** Najwyżej tyle wypieków trwa jednocześnie (prowadzenie na Stolnicy). */
export const MAX_TRWAJACYCH_WYPIEKOW = 2;

/** Najwyżej tyle wypieków czeka zaplanowanych na później. */
export const MAX_ZAPLANOWANYCH_WYPIEKOW = 5;
