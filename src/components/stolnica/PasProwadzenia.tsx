// ============================================================================
// Piekarz — pas prowadzenia (O3a, D-194; 005 opcja A, D-318), wydzielony z ProwadzenieWypieku.tsx (limit 20 480 B):
// wstecz · „Doktor” i „Plan wypieku” (D-051 2a, §11b „056”, BR-DIAG-003); tytuł kroku (nagłówek VoiceOver), „Krok n z m”,
// czas i „potem …”. Niski ekran (token uklad.niskiEkran, karty/README.md §7b): pas zwarty — „Krok n z m” w rzędzie
// nawigacji, tytuł 20 pt, czas 28 pt z „potem …” obok — żeby karta kroku z ostrzeżeniem była nad „Zrobione”
// (rola 04 p4b) [M1-audytor-generalny-005].
// ============================================================================
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { PasZakladki } from '../nawigacja/PasZakladki';
import { t } from '../../lib/i18n';
import { theme } from '../../ui/theme';
import { typografia } from '../../ui/tokeny';
import { useNiskiEkran } from '../../ui/niski-ekran';
import type { SessionStep } from '../../core/bake-steps';
import { CzasKrokuNaPasie } from './StrefaKroku';
import { PrzyciskiProwadzenia } from './PrzyciskiProwadzenia';

export function PasProwadzenia({ gora, krok, numer, czas, czasEtykieta, potem, onLayout, onWstecz, onPlan, onDoktor }: {
  gora: number;
  /** Bieżący krok trwającego wypieku; brak = Stolnica bez wypieku (sam tytuł i skrót do Doktora). */
  krok: SessionStep | undefined;
  numer: { n: number; m: number };
  czas: string;
  czasEtykieta?: string;
  potem: string | null;
  onLayout: (wysokosc: number) => void;
  onWstecz: () => void;
  onPlan: () => void;
  onDoktor: () => void;
}) {
  const zwarty = useNiskiEkran();
  const aktywny = krok !== undefined;
  const numerKroku = aktywny ? t('Krok {n} z {m}', numer) : undefined;
  return (
    <PasZakladki gora={gora} tytul={aktywny ? t(krok.name) : t('Stolnica')} tytulTestID={aktywny ? 'step-title' : undefined}
      podtytul={zwarty ? undefined : numerKroku} podtytulTestID="step-number" zwarty={zwarty}
      srodek={zwarty && numerKroku ? <Text testID="step-number" style={styles.numer}>{numerKroku}</Text> : undefined}
      wstecz={{ etykieta: t('Wstecz'), onPress: onWstecz }} onLayout={onLayout}
      akcje={<PrzyciskiProwadzenia naPasie aktywny={aktywny} onPlan={onPlan} onDoktor={onDoktor} />}>
      {aktywny && <CzasKrokuNaPasie step={krok} formattedTime={czas} czasEtykieta={czasEtykieta} potem={potem} zwarty={zwarty} />}
    </PasZakladki>
  );
}

const styles = StyleSheet.create({
  // Jak zdanie pod tytułem pasa (objasnienie, naPasie2), w rzędzie nawigacji; zawija się, nie ucina
  numer: { flex: 1, minWidth: 0, paddingHorizontal: theme.spacing.xs, fontSize: typografia.style.objasnienie.pt, color: theme.colors.naPasie2 },
});
