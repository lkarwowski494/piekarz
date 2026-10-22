// ============================================================================
// Piekarz — Start „Co dziś robisz?” (BR-START-001, F-68, H-08; design-spec §6) [M1-audytor-generalny-101]
// Czysta logika: który stan Startu pokazać i dokąd prowadzi wybór czynności. Wybór otwiera pierwszy
// ekran przepływu bez ekranu Pro (D-047); ekran Pro pojawia się tylko przy stuknięciu funkcji Pro (D-112, D-113).
// ============================================================================

/**
 * Stany makiety docs/design/ekrany/start.html: „wybor” = `pierwsze-uruchomienie` (także powrót bez trwającego
 * wypieku), `trwa-wypiek` (powrót jednym dotknięciem, F-58). Stan `tylko-historia` (po próbie bez zakupu, F-67)
 * odpadł z kontraktem D-038: Basic działa zawsze (D-112, D-116).
 */
export type StanStartu = 'wybor' | 'trwa-wypiek';

/** Trzy czynności BR-START-001 w kolejności z makiety. */
export type CzynnoscStartu = 'zakladam-zakwas' | 'pieke-na-zakwasie' | 'pieke-na-drozdzach';
export const CZYNNOSCI_STARTU: readonly CzynnoscStartu[] = ['zakladam-zakwas', 'pieke-na-zakwasie', 'pieke-na-drozdzach'];

/** Filtr listy receptur bazowych (ListaReceptur) ustawiany wyborem czynności. */
export type RodzajReceptur = 'sourdough' | 'yeast';

export interface WejscieStartu {
  /** Zapisany trwający wypiek (active_bake_session) albo wypiek przekazany z receptury. */
  trwaWypiek: boolean;
}

/** Trwający wypiek ma pierwszeństwo (powrót bez szukania); inaczej wybór czynności, bez kłódek także bez Pro (D-112). */
export function stanStartu({ trwaWypiek }: WejscieStartu): StanStartu {
  return trwaWypiek ? 'trwa-wypiek' : 'wybor';
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
