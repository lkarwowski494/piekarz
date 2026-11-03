// ============================================================================
// Piekarz — „Po co ten krok” w prowadzeniu wypieku (BR-NAUK-001, F-44; design-spec §5) [M1-audytor-generalny-100]
// Teksty dosłownie z docs/tresci/pl/po-co-ten-krok.md (EN: docs/tresci/en/po-co-ten-krok.md → słownik i18n),
// każde zdanie z ID twierdzenia z docs/tresci/rejestr.json (RYZ-21). Klucz = rodzaj kroku z kodu (jak nagłówek
// sekcji pliku treści). Etapy żytnie bez źródła celu (KRO-POC-900) nie mają wyjaśnienia: przycisk jest nieaktywny.
// ============================================================================

import type { SessionStep } from './bake-steps';
import type { DutchOvenBakePhase } from './baking-phases';
import { stepKindOf } from './step-warnings';

export interface ZdaniePoCo {
  /** Tekst PL (klucz dla t()). */
  tekst: string;
  /** ID twierdzenia w rejestrze treści. */
  id: string;
}

const z = (tekst: string, id: string): ZdaniePoCo => ({ tekst, id });

const DOKARMIANIE: readonly ZdaniePoCo[] = [
  z('Drożdże i bakterie w zakwasie trzeba regularnie dokarmiać świeżą mąką i wodą, żeby przetrwały i się namnażały.', 'KRO-POC-001'),
  z('Zakwas jest gotowy do pieczenia, gdy po dokarmieniu podwaja objętość w ciągu 6–8 godzin i jest pełen pęcherzyków.', 'KRO-POC-002'),
];
const STUDZENIE = z('Chleb oddaje wilgoć, gdy stygnie, a miękisz potrzebuje tego czasu, żeby się ustalić.', 'KRO-POC-015');

/** Rodzaj kroku → zdania „po co ten krok” (sekcje pliku treści; rye_starter jak starter_feed). */
export const PO_CO_TEN_KROK: Readonly<Record<string, readonly ZdaniePoCo[]>> = {
  starter_feed: DOKARMIANIE,
  rye_starter: DOKARMIANIE,
  autolyse: [z('Gdy mąka z wodą odpocznie przed dodaniem soli, mąka wchłania wodę, zaczyna się tworzyć gluten, a ciasto łatwiej się wyrabia.', 'KRO-POC-003')],
  mix: [z('Wyrabianie rozwija gluten, dzięki czemu ciasto zatrzymuje gaz z drożdży i rośnie.', 'KRO-POC-004')],
  bulk_ferment: [
    z('W czasie fermentacji powstają kwasy, które dają ciastu smak i siłę, oraz dwutlenek węgla, który daje mu objętość i lekkość.', 'KRO-POC-005'),
    z('Składanie pomaga rozwinąć sieć glutenową i wzmacnia ciasto.', 'KRO-POC-006'),
  ],
  pre_shape: [z('Formowanie wstępne nadaje ciastu ogólny kształt bochenka, jeszcze bez wykańczania.', 'KRO-POC-007')],
  bench_rest: [z('Każde dotknięcie ciasta napina gluten, a odpoczynek go rozluźnia, więc potem łatwiej uformujesz bochenek.', 'KRO-POC-008')],
  final_shape: [z('Koszyk podtrzymuje rosnący bochenek i nadaje mu kształt.', 'KRO-POC-009')],
  final_proof: [
    z('To ostatnie rośnięcie ciasta przed pieczeniem.', 'KRO-POC-010'),
    z('Chłód lodówki spowalnia fermentację, a wolniejsza fermentacja daje głębszy smak.', 'KRO-POC-010'),
  ],
  preheat_oven: [z('Garnek nagrzewasz pusty, żeby po włożeniu ciasta zrobiła się w nim para.', 'KRO-POC-011')],
  bake: [z('Nacięcie wyznacza miejsce, w którym bochenek się rozejdzie, więc chleb trzyma kształt i nie pęka z boku.', 'KRO-POC-012')],
  lid_on: [z('Para pod pokrywką dłużej trzyma skórkę miękką, więc bochenek może jeszcze rosnąć na początku pieczenia.', 'KRO-POC-013')],
  lid_off: [z('Bez pokrywki chleb piecze się dalej, aż porządnie się zrumieni.', 'KRO-POC-014')],
  cool: [STUDZENIE, z('Pokrojony za wcześnie może być gumowaty.', 'KRO-POC-015')],
  rye_cool: [STUDZENIE, z('Wilgotnym, zwartym chlebom z dużym udziałem żyta często służy studzenie nawet do 24 godzin.', 'KRO-POC-016')],
};

/** [DO USTALENIA] KRO-POC-900: etapy żytnie bez źródła celu — bez wyjaśnienia (RYZ-21). */
export const PO_CO_BEZ_ZRODLA: readonly string[] = ['rye_mix', 'rye_rest', 'rye_shape', 'rye_proof', 'rye_bake'];

/**
 * Zdania „po co ten krok” dla kroku sesji; krok w garnku: nacięcie (bake) i zdanie bieżącej fazy pokrywki.
 * Krok bez sekcji w pliku treści albo z KRO-POC-900 → null (przycisk nieaktywny, bez zmyślonej treści).
 */
export function poCoTenKrok(step: Pick<SessionStep, 'id' | 'category'>, phase?: DutchOvenBakePhase): readonly ZdaniePoCo[] | null {
  const rodzaj = stepKindOf(step);
  if (PO_CO_BEZ_ZRODLA.includes(rodzaj) || !Object.prototype.hasOwnProperty.call(PO_CO_TEN_KROK, rodzaj)) return null;
  const faza = rodzaj === 'bake' && phase ? PO_CO_TEN_KROK[phase] : [];
  return [...PO_CO_TEN_KROK[rodzaj], ...faza];
}
