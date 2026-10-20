// ============================================================================
// Piekarz — Start „Co dziś robisz?” (BR-START-001, F-68, H-08; design-spec §6) [M1-audytor-generalny-101]
// Czysta logika: który stan Startu pokazać i dokąd prowadzi wybór czynności. Wybór otwiera pierwszy
// ekran przepływu bez oferty (D-047); oferta pojawia się dopiero przy akcji, która liczy, planuje albo zapisuje.
// ============================================================================

/**
 * Stany makiety docs/design/ekrany/start.html: „wybor” = `pierwsze-uruchomienie` (także powrót bez trwającego
 * wypieku), `trwa-wypiek` (powrót jednym dotknięciem, F-58), `tylko-historia` (po próbie bez zakupu, F-67).
 */
export type StanStartu = 'wybor' | 'trwa-wypiek' | 'tylko-historia';

/** Trzy czynności BR-START-001 w kolejności z makiety. */
export type CzynnoscStartu = 'zakladam-zakwas' | 'pieke-na-zakwasie' | 'pieke-na-drozdzach';
export const CZYNNOSCI_STARTU: readonly CzynnoscStartu[] = ['zakladam-zakwas', 'pieke-na-zakwasie', 'pieke-na-drozdzach'];

/** Filtr listy receptur bazowych (FormulaPresetSelector) ustawiany wyborem czynności. */
export type RodzajReceptur = 'sourdough' | 'yeast';

export interface WejscieStartu {
  /** Zapisany trwający wypiek (active_bake_session) albo wypiek przekazany z receptury. */
  trwaWypiek: boolean;
  /** Uprawnienie App Store (subskrypcja, oferta wprowadzająca, zakup dożywotni). */
  dostep: boolean;
  /** Użytkownik ma własne dane: wpis dziennika, zakwas albo recepturę własną. */
  maDane: boolean;
}

/**
 * Trwający wypiek ma pierwszeństwo (powrót bez szukania); bez uprawnienia i z własnymi danymi — „tylko historia”
 * (aplikacja nie liczy dni próby, więc brak dostępu przy istniejących danych oznacza koniec próby albo
 * subskrypcji); w pozostałych przypadkach wybór czynności. Pierwsze uruchomienie nie ma danych i nie ma kłódek.
 */
export function stanStartu({ trwaWypiek, dostep, maDane }: WejscieStartu): StanStartu {
  if (trwaWypiek) return 'trwa-wypiek';
  if (!dostep && maDane) return 'tylko-historia';
  return 'wybor';
}

/** Cel czynności: „zakładam zakwas” → Zakwasy (PR-11); pieczenie → Receptury z filtrem rodzaju (PR-01, PR-17). */
export function celCzynnosci(c: CzynnoscStartu): { trasa: '/zakwasy' | '/receptury'; rodzaj: RodzajReceptur | null } {
  if (c === 'zakladam-zakwas') return { trasa: '/zakwasy', rodzaj: null };
  return { trasa: '/receptury', rodzaj: c === 'pieke-na-zakwasie' ? 'sourdough' : 'yeast' };
}

// Rodzaj receptur wybrany na Starcie, przekazany do zakładki Receptury (ta sama zasada co oczekująca receptura
// w recipe-navigation.ts: ekran może być już zamontowany, więc odbiera przez subskrypcję).
let oczekujacy: RodzajReceptur | null = null;
const sluchacze = new Set<(r: RodzajReceptur) => void>();

/** Zapamiętuje rodzaj i powiadamia zamontowaną zakładkę Receptury; ta odbiera go i czyści. */
export function ustawRodzajReceptur(r: RodzajReceptur): void {
  oczekujacy = r;
  for (const s of sluchacze) s(r);
  if (sluchacze.size > 0) oczekujacy = null;
}

/** Odbiera oczekujący rodzaj (raz) albo null. */
export function odbierzRodzajReceptur(): RodzajReceptur | null {
  const r = oczekujacy;
  oczekujacy = null;
  return r;
}

/** Nasłuch kolejnych wyborów, gdy zakładka Receptury już jest zamontowana. */
export function subskrybujRodzajReceptur(s: (r: RodzajReceptur) => void): () => void {
  sluchacze.add(s);
  return () => {
    sluchacze.delete(s);
  };
}
