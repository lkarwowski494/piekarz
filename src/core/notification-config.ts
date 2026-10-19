// ============================================================================
// Piekarz — konfiguracja powiadomień lokalnych (ADR-006) [M1-audytor-generalny-006]
// Liczby karmienia z BRD (Z-041, BR-ZAKW-004 kryt. 1); ich zgodność z progiem 5 dni w sourdough-physics.ts
// i „>18h” w design-spec sprawdza rola 06 (znalezisko 05-architekt-fix-001).
// ============================================================================

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const NOTIF_PREFIX = 'piekarz.';
export const NOTIF_ID_BAKE = 'piekarz.krok';
/** Zakwas na blacie: przypomnienie 24 h po karmieniu (BRD A3a Z-041). */
export const FEED_ROOM_TEMP_AFTER_MS = 24 * HOUR_MS;
/** Zakwas w lodówce: przypomnienie po 6 dniach i termin po 7 dniach (BRD B2 BR-ZAKW-004 kryt. 1). */
export const FEED_FRIDGE_REMIND_AFTER_MS = 6 * DAY_MS;
export const FEED_FRIDGE_DUE_AFTER_MS = 7 * DAY_MS;
/** Górna granica oczekujących powiadomień aplikacji (limit iOS: [DO USTALENIA], ADR-006). */
export const MAX_PENDING_NOTIFICATIONS = 20;
/** Kroki, których przegapienie psuje chleb w minutach: poziom Time Sensitive (DEC-02 a). */
export const TIME_SENSITIVE_STEPS: readonly string[] = ['step_8'];
