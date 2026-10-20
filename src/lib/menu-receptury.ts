// ============================================================================
// Piekarz — menu „Więcej” receptury (design-spec §11b „057”, stan `receptura-wiecej`, DEC-09 a)
// Przycisk jest w pasku nawigacji (app/(tabs)/receptury/_layout.tsx), akcje ma ekran receptury: ekran
// rejestruje dostawcę pozycji, przycisk otwiera menu systemowe iOS z tymi pozycjami. QR (F-08) i druk
// (F-50) wracają tu, gdy ich wejście będzie widoczne (wejscia-pozniej.ts). [M1-audytor-generalny-057]
// ============================================================================

import { ActionSheetIOS, Alert, Platform } from 'react-native';
import { t } from './i18n';
import { wejscieWidoczne } from './wejscia-pozniej';

export type IdPozycjiMenuReceptury = 'copy-recipe-btn' | 'export-recipe-json-btn' | 'share-recipe-qr-btn' | 'print-menu-btn';

export interface PozycjaMenuReceptury {
  id: IdPozycjiMenuReceptury;
  etykieta: string;
  akcja: () => void;
}

export interface AkcjeMenuReceptury {
  kopiuj: () => void;
  udostepnijPlik: () => void;
  udostepnijQr: () => void;
  drukuj: () => void;
}

/** Pozycje w kolejności §11b: Kopiuj jako tekst, Udostępnij plik receptury; dalej tylko wejścia widoczne. */
export function pozycjeMenuReceptury(a: AkcjeMenuReceptury): PozycjaMenuReceptury[] {
  const pozycje: PozycjaMenuReceptury[] = [
    { id: 'copy-recipe-btn', etykieta: t('Kopiuj jako tekst'), akcja: a.kopiuj },
    { id: 'export-recipe-json-btn', etykieta: t('Udostępnij plik receptury'), akcja: a.udostepnijPlik },
  ];
  if (wejscieWidoczne('qr')) pozycje.push({ id: 'share-recipe-qr-btn', etykieta: t('Udostępnij kod QR'), akcja: a.udostepnijQr });
  if (wejscieWidoczne('druk')) pozycje.push({ id: 'print-menu-btn', etykieta: t('Drukuj'), akcja: a.drukuj });
  return pozycje;
}

let dostawca: (() => PozycjaMenuReceptury[]) | null = null;

/** Ekran receptury podaje pozycje z bieżącą recepturą; zwraca wyrejestrowanie (przy odmontowaniu). */
export function zarejestrujMenuReceptury(d: () => PozycjaMenuReceptury[]): () => void {
  dostawca = d;
  return () => {
    if (dostawca === d) dostawca = null;
  };
}

/** Pozycje menu dla bieżącego ekranu receptury; bez ekranu — brak pozycji. */
export function biezaceMenuReceptury(): PozycjaMenuReceptury[] {
  return dostawca ? dostawca() : [];
}

/** Menu systemowe: arkusz działań iOS z „Anuluj” (zamknięcie bez zmian); poza iOS alert z tymi samymi pozycjami. */
export function pokazMenuReceptury(): void {
  const pozycje = biezaceMenuReceptury();
  if (pozycje.length === 0) return;
  const etykiety = pozycje.map((p) => p.etykieta);
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: [...etykiety, t('Anuluj')], cancelButtonIndex: etykiety.length },
      (i) => pozycje[i]?.akcja()
    );
    return;
  }
  Alert.alert(t('Więcej działań: receptura'), undefined, [
    ...pozycje.map((p) => ({ text: p.etykieta, onPress: p.akcja })),
    { text: t('Anuluj'), style: 'cancel' as const },
  ]);
}
