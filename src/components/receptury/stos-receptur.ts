// ============================================================================
// Piekarz — zakładka „Receptury” w dwóch poziomach (design-spec §11c „106”): lista receptur → ekran receptury.
// Lista otwiera ekran receptury, gdy przychodzi receptura do wczytania (wybór wiersza, „Piecz ponownie”,
// import w Ustawieniach), chyba że ekran receptury jest już otwarty — wtedy wczytuje ją on sam
// (usePendingRecipeLoader). Ekran receptury po zapisie „Zapisz jako moją” odświeża listę. Menu systemowe
// (arkusz działań iOS z „Anuluj”) dla wyborów z arkusza „Składniki”. [M1-audytor-generalny-106]
// ============================================================================

import { ActionSheetIOS, Alert, Platform } from 'react-native';
import { t } from '../../lib/i18n';

let otwarteEkranyReceptury = 0;

/** Ekran receptury zgłasza otwarcie; zwraca zgłoszenie zamknięcia (przy odmontowaniu). */
export function zglosEkranReceptury(): () => void {
  otwarteEkranyReceptury += 1;
  return () => {
    otwarteEkranyReceptury = Math.max(0, otwarteEkranyReceptury - 1);
  };
}

export function ekranRecepturyOtwarty(): boolean {
  return otwarteEkranyReceptury > 0;
}

const sluchaczeZmian = new Set<() => void>();

/** Lista receptur słucha zmian własnych receptur (zapis na ekranie receptury). */
export function subskrybujZmianyReceptur(f: () => void): () => void {
  sluchaczeZmian.add(f);
  return () => {
    sluchaczeZmian.delete(f);
  };
}

export function powiadomOZmianieReceptur(): void {
  sluchaczeZmian.forEach((f) => f());
}

/** Menu systemowe z pozycjami i „Anuluj” (zamknięcie bez zmian); poza iOS alert z tymi samymi pozycjami. */
export function pokazMenuWyboru(tytul: string, pozycje: string[], wybor: (i: number) => void): void {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      { title: tytul, options: [...pozycje, t('Anuluj')], cancelButtonIndex: pozycje.length },
      (i) => {
        if (i >= 0 && i < pozycje.length) wybor(i);
      }
    );
    return;
  }
  Alert.alert(tytul, undefined, [
    ...pozycje.map((p, i) => ({ text: p, onPress: () => wybor(i) })),
    { text: t('Anuluj'), style: 'cancel' as const },
  ]);
}
