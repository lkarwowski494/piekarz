// ============================================================================
// Piekarz — jedno źródło oferty (MON-12) [M1-audytor-generalny-008; 02-monetyzacja-001]
// Identyfikatory produktów App Store. Ceny i regiony ustawia właściciel w App Store Connect; aplikacja pokazuje je
// z produktu StoreKit (displayPrice), nigdy z kodu. Bez okresu próbnego i bez oferty wprowadzającej (D-112).
// Lista funkcji Basic i limity Basic: jedyne miejsce w kodzie (kontrakt docs/monetyzacja.md, „Basic i Pro według
// funkcji”, D-112, D-113, D-116).
// ============================================================================

/** Plan zakupu: subskrypcja miesięczna i roczna (jedna grupa) albo zakup dożywotni (Non-Consumable). */
export type Plan = 'monthly' | 'yearly' | 'lifetime';

export const PRODUKTY: Readonly<Record<Plan, string>> = {
  monthly: 'com.apps4brew.baker.pro.monthly',
  yearly: 'com.apps4brew.baker.pro.yearly',
  lifetime: 'com.apps4brew.baker.pro.lifetime',
};

/** Kolejność planów na ekranie zakupu. */
export const PLANY: readonly Plan[] = ['yearly', 'monthly', 'lifetime'];

/** Subskrypcje odnawiane automatycznie (jedna grupa w App Store Connect). */
export const SUBSKRYPCJE: readonly string[] = [PRODUKTY.monthly, PRODUKTY.yearly];

/** Produkty, które odblokowują Piekarz Pro. */
export const ODBLOKOWUJA: readonly string[] = [PRODUKTY.monthly, PRODUKTY.yearly, PRODUKTY.lifetime];

/**
 * Funkcje aplikacji, o których decyduje strażnik dostępu [M1-audytor-generalny-027]. Nazwy według tabeli
 * „Basic i Pro według funkcji” kontraktu (docs/monetyzacja.md); w komentarzu reguła BRD.
 */
export type Funkcja =
  // Basic
  | 'historia' // dziennik: przegląd, usunięcie, „Piecz ponownie” (BR-RECP-003)
  | 'dane' // odczyt, eksport i usunięcie własnych danych (BR-DANE-001…004)
  | 'import' // import kopii i receptury z pliku, bez limitu (BR-DANE-003, D-039 pkt 1)
  | 'kalkulator' // liczenie receptury (BR-KALK-001…005, -007, -009, -011, BR-UST-001)
  | 'harmonogram' // plan wypieku: przesunięcie kroku, „za późno”, start (BR-HARMO-004)
  | 'stolnica' // prowadzenie wypieku krok po kroku z sygnałem (BR-ETAP-001…006, BR-CZAS-002, -003, BR-REKA-001)
  | 'zakwas' // pierwszy zakwas: założenie, karta, zapis karmień, RD-21 (BR-ZAKW-005, -007, BR-DIAG-002)
  | 'doktor' // Doktor i protokoły (BR-DIAG-001, -003…005)
  | 'receptury' // receptury bazowe i do LIMITY_BASIC.wlasneReceptury własnych (BR-RECP-001, -002)
  | 'akademia' // Akademia: pierwszy poziom (BR-NAUK-001)
  // Pro
  | 'plan-wstecz' // „gotowe o…”, ochrona snu, czas fermentacji z temperatury (BR-HARMO-001…003)
  | 'plany-przyszle' // wypieki zaplanowane na przyszłe dni (BR-KAL-009, -015)
  | 'dwa-wypieki' // start drugiego trwającego wypieku (BR-KAL-016)
  | 'kalendarz-telefonu' // plan w kalendarzu telefonu, plik .ics (BR-KAL-011)
  | 'miesiac' // widok miesiąca (BR-KAL-013)
  | 'rytm' // podpowiedź dnia z rytmu Dziennika (BR-KAL-014)
  | 'staly-dzien' // stały dzień karmienia w lodówce (BR-KAL-010)
  | 'zaczyn' // poolish, biga, levain (BR-KALK-010)
  | 'lod' // masa lodu (BR-KALK-008); w 1.0 bez wejścia
  | 'przypomnienia-zakwasu' // przypomnienia o dokarmianiu poza zakładaniem (BR-ZAKW-004)
  | 'proporcje-zakwasu' // dokarmianie z proporcją (BR-ZAKW-002)
  | 'gotowosc-zakwasu' // gotowość i szczyt (BR-ZAKW-003)
  | 'budzenie-zakwasu' // kolejne karmienia budzące z lodówki (BR-ZAKW-006, RD-33)
  | 'kolejny-zakwas' // drugi i kolejne zakwasy ponad LIMITY_BASIC.zakwasy (BR-ZAKW-001)
  | 'receptury-ponad-limit' // własne receptury ponad LIMITY_BASIC.wlasneReceptury (BR-RECP-002)
  | 'porownanie' // porównanie i statystyki dziennika (BR-RECP-004)
  | 'druk' // druk receptury (BR-DRUK-001); w 1.0 bez wejścia
  | 'qr-wysylanie' // wysłanie receptury kodem QR (BR-WSP-003); w 1.0 bez wejścia
  | 'spizarnia' // spiżarnia mąk (BR-SPIZ-001); w 1.0 bez wejścia
  | 'akademia-dalej'; // Akademia: dalsze poziomy (BR-NAUK-001)

/**
 * Funkcje Basic: działają bez Piekarz Pro, na zawsze (D-112, D-113). Lista może tylko rosnąć, a limity tylko rosnąć:
 * test porównuje je z plikiem poprzedniego wydania (docs/monetyzacja/basic-1.0.json, „Basic tylko rośnie”).
 */
export const BASIC: readonly Funkcja[] = [
  'historia',
  'dane',
  'import',
  'kalkulator',
  'harmonogram',
  'stolnica',
  'zakwas',
  'doktor',
  'receptury',
  'akademia',
];

/**
 * Szczegóły Basic bez własnej nazwy Funkcja, rozstrzygnięte przez właściciela (przez M1, 2026-10-22: „Wg rekomendacji”,
 * D-116); pilnowane jak BASIC (plik wydania i testy ekranowe w src/__tests__/basic-pro-pafix.test.tsx).
 */
export const BASIC_SZCZEGOLY: readonly string[] = [
  'plan-pierwsze-karmienie-budzace', // krok fridge_wake_feed w planie; kolejne karmienia budzące w Pro (BR-ZAKW-006)
  'akademia-biblioteka-technik', // zakładka technik Akademii; dalsze poziomy szkoły w Pro
  'limit-receptur-przywroc-i-kopia-poza-limitem', // „Przywróć” i import kopii nie liczą się; import receptury się liczy
  'plan-ustawienia-nocy-i-lodowki', // godziny snu i czas w lodówce w planie od teraz
  'dziennik-filtr-smaku', // filtr profilu smaku; porównanie i statystyki w Pro (BR-RECP-004)
];

/** Limity pojemności Basic, liczone z bazy przy dodawaniu; zapisane ponad limitem działają w całości (kontrakt). */
export const LIMITY_BASIC = {
  /** Własne receptury (receptury bazowe się nie liczą; BR-RECP-002 „do 5 własnych”). */
  wlasneReceptury: 5,
  /** Zakwasy (pierwszy zakwas w Basic, kolejne w Pro; BR-ZAKW-001). */
  zakwasy: 1,
  /** Poziomy Akademii dostępne w Basic (BR-NAUK-001 „pierwszy poziom”). */
  poziomyAkademii: 1,
} as const;

export type Pojemnosc = 'wlasneReceptury' | 'zakwasy';

/** Klucz w app_settings: pamięć ostatniego udanego odczytu sklepu (nie jest w kopii zapasowej). */
export const KLUCZ_PAMIECI = 'platnosci_pamiec';

export function planProduktu(id: string): Plan | null {
  const plan = (Object.keys(PRODUKTY) as Plan[]).find((p) => PRODUKTY[p] === id);
  return plan ?? null;
}
