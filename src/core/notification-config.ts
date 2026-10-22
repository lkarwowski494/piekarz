// ============================================================================
// Piekarz — konfiguracja powiadomień lokalnych (ADR-006) [M1-audytor-generalny-006]
// Liczby karmienia z BRD (Z-041, BR-ZAKW-004 kryt. 1); ich zgodność z progiem 5 dni w sourdough-physics.ts
// i „>18h” w design-spec sprawdza rola 06 (znalezisko 05-architekt-fix-001).
// ============================================================================

const HOUR_MS = 60 * 60 * 1000;

export const NOTIF_PREFIX = 'piekarz.';
/**
 * Przedrostek identyfikatorów powiadomień jednego wypieku: id wypieku w środku, żeby dwa wypieki się nie nadpisywały
 * [M3 D2, BR-KAL-016]. Wersja 1014 planowała `piekarz.krok`, `piekarz.krok.<i>`, `piekarz.krok.<i>.pokrywka` i
 * `piekarz.krok.start` bez id wypieku; po aktualizacji rozpoznaje je isLegacyBakeNotificationId, a diffNotifications
 * kasuje (nowe identyfikatory zaczynają się od `piekarz.wypiek.`, więc nie zderzą się ze starymi).
 */
export const notifBakePrefix = (bakeId: string): string => `${NOTIF_PREFIX}wypiek.${bakeId}.`;
// Blat zostaje w ms (D-093): to odstęp CZASU w godzinach rzeczywistych, nie dzień kalendarza; zakwas rośnie tyle godzin,
// ile minęło, także przez zmianę czasu. Termin lodówki niżej to dni kalendarza.
/** Zakwas na blacie: przypomnienie 12 h po karmieniu (D-043 OP-38, zastępuje 24 h z BRD A3a Z-041) [M1-audytor-generalny-090]. */
export const FEED_ROOM_TEMP_AFTER_MS = 12 * HOUR_MS;
/**
 * Zakwas w lodówce: jedno powiadomienie na cykl, w terminie po 7 dniach (BRD B2 BR-ZAKW-004 kryt. 1; DEC-22 a
 * usuwa wcześniejsze przypomnienie po 6 dniach) [M1-audytor-generalny-179; 11-wzrost-503]. To 7 dni KALENDARZA
 * o tej samej godzinie lokalnej (addCalendarDays), nie 7 × 24 h: przy zmianie czasu 7 × 24 h przesuwa godzinę o 1 h
 * (D-093, ZAK-ZAL-012).
 */
export const FEED_FRIDGE_DUE_AFTER_DAYS = 7;
/**
 * Górna granica oczekujących powiadomień aplikacji: 40 przy dwóch wypiekach naraz (D-092, BR-KAL-009/-016); iOS trzyma
 * najbliższe 64 (OP-56: dokumentacja wycofanego API, S-74), więc zostaje zapas na powiadomienia innego pochodzenia.
 * Dalsze terminy uzupełnia uzgadnianie przy otwarciu aplikacji [M3 D2].
 */
export const MAX_PENDING_NOTIFICATIONS = 40;
/**
 * Kroki, których przegapienie psuje chleb w minutach: poziom Time Sensitive (DEC-02 a).
 * Wypiek w garnku: `step_8` ze starego zapisu (LEGACY_STEPS_V1) i etap planu `bake` [M1-audytor-generalny-030].
 */
export const TIME_SENSITIVE_STEPS: readonly string[] = ['step_8', 'bake'];
