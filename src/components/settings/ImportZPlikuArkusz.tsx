// ============================================================================
// Piekarz — arkusz „Importuj z pliku” (design-spec §11c „113”, makiety import-receptura i import-kopia w
// docs/design/ekrany/inne.html) [M1-audytor-generalny-113; 04-studio-projektowe-028]. Do czasu zależności wyboru
// pliku (expo-document-picker, [DO USTALENIA]) treść pliku przychodzi ze schowka albo z pola, jak dotąd. Podgląd
// według rodzaju pliku; zapis dopiero po „Dodaj” albo „Zastąp dane”, ścieżkami z src/lib/import-z-pliku.ts.
// ============================================================================

import React, { useMemo, useState } from 'react';
import { View, Text, Modal, ScrollView, Pressable, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { theme } from '../../ui/theme';
import { promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { formatNumber } from '../../lib/format';
import { StorageWriteError } from '../../data/storage-status';
import { saveErrorText } from '../../lib/save-guard';
import { importujKopie, importujRecepture, rozpoznajPlik, zdanieKopii } from '../../lib/import-z-pliku';
import type { StoredRecipe } from '../../data/db';

export interface ImportZPlikuArkuszProps {
  onClose: () => void;
  onRecipeImported: (r: StoredRecipe) => void;
}

const procent = (v: number) => `${formatNumber(v)}%`;

export function ImportZPlikuArkusz({ onClose, onRecipeImported }: ImportZPlikuArkuszProps) {
  const [tresc, setTresc] = useState<string>('');
  const [zapis, setZapis] = useState<boolean>(false);
  const plik = useMemo(() => rozpoznajPlik(tresc), [tresc]);

  const wklej = async () => {
    try {
      const tekst = await Clipboard.getStringAsync();
      if (tekst) setTresc(tekst);
    } catch {
      Alert.alert(t('Błąd schowka'), t('Nie udało się odczytać zawartości schowka.'));
    }
  };

  const dodajRecepture = async (r: StoredRecipe) => {
    setZapis(true);
    try {
      await importujRecepture(r);
      onRecipeImported(r);
      onClose();
      Alert.alert(t('Receptura „{nazwa}” jest w Moich recepturach.', { nazwa: r.name }));
    } catch {
      Alert.alert(t('Błąd zapisu'), t('Nie zapisałem receptury. Spróbuj jeszcze raz.'));
    } finally {
      setZapis(false);
    }
  };

  const zastapDane = async () => {
    if (plik?.rodzaj !== 'kopia') return;
    const kopia = plik.kopia;
    setZapis(true);
    try {
      await importujKopie(kopia);
      onClose();
      Alert.alert(
        t('Kopia zapasowa'),
        kopia.skippedRows > 0
          ? t('Zaimportowano. Pominięto uszkodzone wpisy: {count}.', { count: kopia.skippedRows })
          : t('Zaimportowano pomyślnie!')
      );
    } catch (err: unknown) {
      if (err instanceof StorageWriteError) {
        Alert.alert(t('Nie zapisano'), saveErrorText(err));
        return;
      }
      Alert.alert(t('Kopia zapasowa'), err instanceof Error ? err.message : t('Nie udało się zaimportować kopii'));
    } finally {
      setZapis(false);
    }
  };

  const tytul =
    plik?.rodzaj === 'receptura' ? t('Receptura z pliku') : plik?.rodzaj === 'kopia' ? t('Kopia zapasowa z pliku') : t('Importuj z pliku');

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.arkusz} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.nav} testID="import-file-sheet">
          <Pressable testID="cancel-import-btn" accessibilityRole="button" style={styles.navBtn} onPress={onClose}>
            <Text style={styles.navTekst}>{t('Anuluj')}</Text>
          </Pressable>
          {plik?.rodzaj === 'receptura' && (
            <Pressable
              testID="confirm-import-btn"
              accessibilityRole="button"
              accessibilityState={{ disabled: zapis }}
              disabled={zapis}
              style={styles.navBtn}
              onPress={() => dodajRecepture(plik.receptura)}
            >
              <Text style={[styles.navTekst, styles.navWazny]}>{t('Dodaj')}</Text>
            </Pressable>
          )}
        </View>
        <ScrollView contentContainerStyle={styles.tresc} keyboardShouldPersistTaps="handled">
          <Text style={styles.tytul} accessibilityRole="header">{tytul}</Text>
          <Text style={styles.opis}>{t('Wklej zawartość pliku receptury albo kopii zapasowej.')}</Text>
          <Pressable testID="paste-clipboard-btn" accessibilityRole="button" style={styles.drugi} onPress={wklej}>
            <Text style={styles.drugiTekst}>{t('Wklej ze schowka')}</Text>
          </Pressable>
          <TextInput
            testID="import-json-input"
            accessibilityLabel={t('Wklej zawartość pliku receptury albo kopii zapasowej.')}
            style={styles.pole}
            multiline
            value={tresc}
            onChangeText={setTresc}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {plik?.rodzaj === 'receptura' && (
            <View testID="import-preview-recipe" style={styles.podglad}>
              <View style={styles.grupa}>
                <Wiersz etykieta={t('Nazwa')} wartosc={plik.receptura.name} />
                <Wiersz
                  etykieta={t('Mąki')}
                  wartosc={plik.receptura.formula.flours.map((f) => `${f.name} ${procent(f.percentage)}`).join(', ')}
                />
                <Wiersz etykieta={t('Woda')} wartosc={procent(plik.receptura.formula.waterPercentage)} />
                <Wiersz etykieta={t('Zakwas|składnik')} wartosc={procent(plik.receptura.formula.starterPercentage)} />
                <Wiersz etykieta={t('Sól')} wartosc={procent(plik.receptura.formula.saltPercentage)} ostatni />
              </View>
              <Text style={styles.info}>{t('Dodam ją do Moich receptur. Pozostałe dane zostaną bez zmian.')}</Text>
            </View>
          )}

          {plik?.rodzaj === 'kopia' && (
            <View testID="import-preview-backup" style={styles.podglad}>
              <Text style={styles.zdanie}>{zdanieKopii(plik.kopia)}</Text>
              <Text style={[styles.info, styles.infoTusz]}>
                {t('Import zastąpi wszystkie dane w aplikacji danymi z kopii. Przed importem zapiszę kopię obecnych danych.')}
              </Text>
              <Pressable
                testID="confirm-import-btn"
                accessibilityRole="button"
                accessibilityState={{ disabled: zapis }}
                disabled={zapis}
                style={styles.drugi}
                onPress={zastapDane}
              >
                <Text style={[styles.drugiTekst, styles.blad]}>{t('Zastąp dane')}</Text>
              </Pressable>
            </View>
          )}

          {plik?.rodzaj === 'nierozpoznany' && (
            <View testID="import-unrecognized" style={styles.podglad}>
              <Text style={styles.zdanie}>
                {t('Tego pliku nie rozpoznaję. Piekarz importuje plik receptury i plik kopii zapasowej z Piekarza.')}
              </Text>
              <Pressable testID="import-file-close-btn" accessibilityRole="button" style={styles.drugi} onPress={onClose}>
                <Text style={styles.drugiTekst}>{t('Zamknij')}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Wiersz({ etykieta, wartosc, ostatni }: { etykieta: string; wartosc: string; ostatni?: boolean }) {
  return (
    <View style={[styles.wiersz, !ostatni && styles.wierszLinia]}>
      <Text style={styles.etykieta}>{etykieta}</Text>
      <Text style={styles.wartosc}>{wartosc}</Text>
    </View>
  );
}

const T = typografia.style;
const styles = StyleSheet.create({
  arkusz: { flex: 1, backgroundColor: theme.colors.powierzchnia },
  nav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: theme.spacing.sm },
  navBtn: { minHeight: theme.cele.pozostale, minWidth: theme.cele.pozostale, justifyContent: 'center', paddingHorizontal: theme.spacing.sm },
  navTekst: { fontSize: T.tresc.pt, color: theme.colors.akcentTekst },
  navWazny: { fontWeight: '600' },
  tresc: { padding: theme.spacing.md, gap: theme.spacing.md },
  tytul: { fontFamily: theme.typography.krojTytulow, fontSize: T.tytulKroku.pt, fontWeight: '700', color: theme.colors.tusz },
  opis: { fontSize: T.objasnienie.pt, color: theme.colors.tusz2 },
  pole: {
    minHeight: 96,
    backgroundColor: theme.colors.tlo,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: promienie.pole,
    padding: theme.spacing.sm,
    fontSize: T.przypis.pt,
    color: theme.colors.tusz,
    textAlignVertical: 'top',
  },
  podglad: { gap: theme.spacing.md },
  grupa: { backgroundColor: theme.colors.tlo, borderRadius: promienie.grupa, paddingHorizontal: theme.spacing.md },
  wiersz: { minHeight: theme.cele.pozostale, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm, paddingVertical: theme.spacing.sm },
  wierszLinia: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.linia },
  etykieta: { fontSize: T.tresc.pt, color: theme.colors.tusz },
  wartosc: { flexShrink: 1, fontSize: T.tresc.pt, color: theme.colors.tusz2, textAlign: 'right' },
  zdanie: { fontSize: T.tresc.pt, color: theme.colors.tusz },
  info: { fontSize: T.objasnienie.pt, color: theme.colors.tusz2 },
  infoTusz: { color: theme.colors.tusz },
  drugi: {
    minHeight: theme.cele.glownyPrzeplyw,
    borderRadius: promienie.przycisk,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    backgroundColor: theme.colors.powierzchnia,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  drugiTekst: { fontSize: T.naglowek.pt, fontWeight: '600', color: theme.colors.akcentTekst },
  blad: { color: theme.colors.blad },
});
