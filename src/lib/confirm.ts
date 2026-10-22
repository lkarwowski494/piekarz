import { Alert } from 'react-native';
import { t } from './i18n';

export type CancelBtn = { text: string; style: 'cancel'; onPress?: () => void };

/**
 * Wzorzec potwierdzania akcji (Apps4Brew / HIG Alerts).
 * Zasada: przycisk rezygnacji w alertach ma ZAWSZE jedno słowo: „Anuluj”.
 * Jedyny wyjątek: „Wróć do edycji” przy odrzucaniu szkicu (aby słowo „Anuluj” nie myliło).
 * Zakaz używania słów „Nie” lub „Wróć” jako przycisków rezygnacji.
 */
export const cancelButton = (onPress?: () => void): CancelBtn => ({
  text: t('Anuluj'),
  style: 'cancel',
  ...(onPress ? { onPress } : {}),
});

export const backToEditButton = (): CancelBtn => ({
  text: t('Wróć do edycji'),
  style: 'cancel',
});

export const okButton = (): CancelBtn => ({
  text: t('OK'),
  style: 'cancel',
});

export interface ConfirmParams {
  title: string;
  message?: string;
  action: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function confirm({
  title,
  message,
  action,
  destructive,
  onConfirm,
  onCancel,
}: ConfirmParams) {
  Alert.alert(title, message, [
    cancelButton(onCancel),
    {
      text: action,
      ...(destructive ? { style: 'destructive' as const } : {}),
      onPress: onConfirm,
    },
  ]);
}

/**
 * Potwierdzenie przerwania trwającego wypieku: [Wróć do wypieku] [Przerwij]
 * (słownik interakcji, docs/design/design-spec.md §5; wyjątek od „Anuluj”, bo rezygnacja wraca do wypieku) [M1-audytor-generalny-089].
 */
export function confirmDiscardBake(onConfirm: () => void) {
  Alert.alert(t('Przerwać wypiek?'), t('Powiadomienia o kolejnych krokach znikną.'), [
    { text: t('Wróć do wypieku'), style: 'cancel' },
    { text: t('Przerwij'), style: 'destructive', onPress: onConfirm },
  ]);
}

/** Trwający wypiek w pytaniu przy starcie: id i nazwa (null = stary zapis bez nazwy). */
export interface WypiekWPytaniu {
  id: string;
  nazwa: string | null;
  /** Klucz tekstu bieżącego kroku: treść pytania „{wypiek}: {krok}, trwa” (przegląd roli 04 z D3a) [M3 D4b]. */
  krok?: string;
}

/** „Wróć do: {nazwa}” (forma z dwukropkiem przekłada się na 34 języki, makieta 04-a2); bez nazwy „Wróć do wypieku”. */
const wrocDo = (w: WypiekWPytaniu, onWroc: (id: string) => void) => ({
  text: w.nazwa ? t('Wróć do: {nazwa}', { nazwa: w.nazwa }) : t('Wróć do wypieku'),
  onPress: () => onWroc(w.id),
});

/**
 * „Zacznij wypiek” przy jednym trwającym wypieku: [Prowadź oba] (domyślne) [Wróć do: {nazwa}] [Anuluj]. Kilka wypieków
 * naraz od D-092; pytanie a1b z przerwaniem zastąpione (D-104). Nic nie znika: przerwanie tylko na Stolnicy [M3 D3a].
 */
export function confirmStartPrzyTrwajacym(trwa: WypiekWPytaniu, onOba: () => void, onWroc: (id: string) => void) {
  // Treść z nazwą i krokiem, nie sam tytuł (tekst z listy roli 04 a2 „{r}: {krok}, trwa”); stary zapis bez nazwy — bez treści
  const tresc = trwa.nazwa && trwa.krok ? t('{wypiek}: {krok}, trwa', { wypiek: trwa.nazwa, krok: t(trwa.krok) }) : undefined;
  Alert.alert(t('Trwa już inny wypiek'), tresc, [
    { text: t('Prowadź oba'), isPreferred: true, onPress: onOba },
    wrocDo(trwa, onWroc),
    cancelButton(),
  ]);
}

/**
 * „Zacznij wypiek”, gdy trwa już tyle wypieków, ile pozwala limit (2, D-092, src/core/limity-wypiekow.ts): powrót do
 * jednego z nich albo [Anuluj]; bez przerwania w tym pytaniu (przerwanie na Stolnicy) [M3 D3a, D-104].
 */
export function confirmLimitWypiekow(trwajace: readonly WypiekWPytaniu[], onWroc: (id: string) => void) {
  Alert.alert(t('Prowadzisz już 2 wypieki'), undefined, [...trwajace.map((w) => wrocDo(w, onWroc)), cancelButton()]);
}

/**
 * „Zaplanuj” przy limicie zaplanowanych (5, D-092, src/core/limity-wypiekow.ts): przejście do listy planów na „Dziś”
 * albo [Anuluj]; nic nie zapisane (BR-KAL-009) [M3 D5].
 */
export function confirmLimitPlanow(onPokaz: () => void) {
  Alert.alert(t('Masz już 5 planów'), t('Zacznij albo usuń jeden z nich, żeby dodać kolejny.'), [{ text: t('Pokaż plany'), onPress: onPokaz }, cancelButton()]);
}

/**
 * Kolizja kroków czynnych nowego planu z innym planem albo trwającym wypiekiem (BR-KAL-009 „Kolizja planów”): każda
 * kolizja z nazwą kroku i godziną; plan zapisuje się dopiero po „Zaplanuj mimo to” [M3 D5].
 */
export function confirmKolizjaPlanow(linie: readonly string[], onZapisz: () => void) {
  Alert.alert(t('Kroki nachodzą na siebie'), linie.join('\n'), [cancelButton(), { text: t('Zaplanuj mimo to'), onPress: onZapisz }]);
}

/** Kolizja piekarnika w pytaniu: godziny już sformatowane, nazwy wypieków, przesunięcie w minutach. */
export interface PiekarnikWPytaniu {
  /** Początek części wspólnej okien (tytuł). */
  godzina: string;
  pierwszy: string;
  /** Okno pierwszego: start nagrzewania i koniec pieczenia. */
  od: string;
  do: string;
  drugi: string;
  minuty: number;
  /** Po przesunięciu: start pieczenia i „gotowe” drugiego. */
  pieczenie: string;
  gotowe: string;
}

/** Druga akcja pytania: „Zapisz bez zmiany” przy planie, „Zacznij wypiek” albo „Prowadź oba” przy starcie. */
export interface AkcjaPytania {
  tekst: string;
  onPress: () => void;
}

/**
 * Piekarnik zajęty (BR-KAL-016 „Jeden piekarnik”, RD-34; teksty roli 04 a2 `piekarnik-1-uklad-planu`): [Przesuń start]
 * (domyślne) [bez zmiany] [Anuluj]. Mocniejszy przypadek niż „Kroki nachodzą na siebie” (D5): jedno pytanie [M3 D6].
 */
export function confirmPiekarnikZajety(p: PiekarnikWPytaniu, a: { przesun: () => void; bezZmiany: AkcjaPytania }) {
  Alert.alert(
    t('Piekarnik zajęty o {h}', { h: p.godzina }),
    t('{r1} piecze się od {od} do {do}. Przesuń start: {r2} o {m} min, pieczenie od {pieczenie}, gotowe o {gotowe}.', {
      r1: p.pierwszy, od: p.od, do: p.do, r2: p.drugi, m: p.minuty, pieczenie: p.pieczenie, gotowe: p.gotowe,
    }),
    [
      { text: t('Przesuń start: {r} o {m} min', { r: p.drugi, m: p.minuty }), isPreferred: true, onPress: a.przesun },
      { text: a.bezZmiany.tekst, onPress: a.bezZmiany.onPress },
      cancelButton(),
    ]
  );
}

/**
 * Plan bez kroku nagrzewania przy innym wypieku z piekarnikiem (RD-34-W6): kolizji nie liczy się, pytanie prosi
 * o krok nagrzewania; zapis albo start dopiero po decyzji [M3 D6].
 */
export function confirmPiekarnikBezNagrzewania(dalej: AkcjaPytania) {
  Alert.alert(t('Plan nie ma kroku nagrzewania'), t('Bez nagrzewania nie wiadomo, od kiedy ten wypiek zajmie piekarnik. Sprawdź godziny pieczenia drugiego wypieku.'), [
    cancelButton(),
    { text: dalej.tekst, onPress: dalej.onPress },
  ]);
}

/**
 * Potwierdzenie zresetowania profilu zakwasu.
 */
export function confirmResetStarter(onConfirm: () => void) {
  confirm({
    title: t('Zacząć profil zakwasu od nowa?'),
    message: t('Dotychczasowy cykl dokarmiania zostanie wyzerowany.'),
    action: t('Zacznij od nowa'),
    destructive: true,
    onConfirm,
  });
}

/**
 * Potwierdzenie usunięcia wpisu z historii wypieków.
 */
export function confirmDeleteBakeLog(onConfirm: () => void) {
  confirm({
    title: t('Usunąć wpis z historii?'),
    message: t('Wpis z historii wypieku zostanie trwale usunięty.'),
    action: t('Usuń wpis'),
    destructive: true,
    onConfirm,
  });
}

/**
 * Potwierdzenie usunięcia profilu zakwasu.
 */
export function confirmDeleteStarter(name: string, onConfirm: () => void) {
  confirm({
    title: t('Usunąć profil zakwasu?'),
    message: `${t('Profil zakwasu')} „${name}” ${t('zostanie trwale usunięty wraz z całą historią dokarmiania.')}`,
    action: t('Usuń zakwas'),
    destructive: true,
    onConfirm,
  });
}

/**
 * Potwierdzenie usunięcia autorskiej receptury.
 */
export function confirmDeleteRecipe(name: string, onConfirm: () => void) {
  confirm({
    title: t('Usunąć recepturę?'),
    message: `${t('Receptura')} „${name}” ${t('zostanie trwale usunięta z bazy.')}`,
    action: t('Usuń recepturę'),
    destructive: true,
    onConfirm,
  });
}

