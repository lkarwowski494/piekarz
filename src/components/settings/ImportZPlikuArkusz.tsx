// ============================================================================
// Piekarz — arkusz „Importuj z pliku” (design-spec §11c „113”, makiety import-receptura i import-kopia w
// docs/design/ekrany/inne.html) [M1-audytor-generalny-113; 04-studio-projektowe-028]. Do czasu zależności wyboru
// pliku (expo-document-picker, [DO USTALENIA]) treść pliku przychodzi ze schowka albo z pola, jak dotąd. Podgląd
// według rodzaju pliku; zapis dopiero po „Dodaj” albo „Zastąp dane”, ścieżkami z src/lib/import-z-pliku.ts.
// Na systemie kart: „Anuluj” / „Dodaj” w pasku arkusza, wklejanie i podgląd w karcie z tytułem według rodzaju pliku
// (README §1, §3); ścieżki zapisu bez zmian [M1-audytor-generalny-007; 04-studio-projektowe-003].
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { theme } from '../../ui/theme';
import { promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { formatNumber } from '../../lib/format';
import { StorageWriteError } from '../../data/storage-status';
import { saveErrorText } from '../../lib/save-guard';
import { importujKopie, importujRecepture, rozpoznajPlik, zdanieKopii, type RozpoznanyPlik } from '../../lib/import-z-pliku';
import { kopiaZPakietu } from '../../lib/import-pakietu';
import type { StoredRecipe } from '../../data/db';
import { useAppAccess } from '../../lib/app-access';
import { ArkuszKart } from '../arkusz/ArkuszKart';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';

export interface ImportZPlikuArkuszProps {
  onClose: () => void;
  onRecipeImported: (r: StoredRecipe) => void;
  /**
   * Receptura ponad limitem Basic: wywołujący zamyka arkusz (i Ustawienia) i otwiera ekran Pro po zniknięciu (D-117);
   * po zakupie import nie zapisuje się sam (N2, W-fix3). Bez niej: ekran Pro od razu, arkusz i treść zostają.
   */
  onPonadLimitem?: () => void;
}

const procent = (v: number) => `${formatNumber(v)}%`;

export function ImportZPlikuArkusz({ onClose, onRecipeImported, onPonadLimitem }: ImportZPlikuArkuszProps) {
  const [tresc, setTresc] = useState<string>('');
  const [zapis, setZapis] = useState<boolean>(false);
  const zTresci = useMemo(() => rozpoznajPlik(tresc), [tresc]);
  // Pakiet plików bazy z trybu awaryjnego: kopia czytana z osobnej bazy, potem podgląd jak kopia; do tego czasu
  // wskaźnik (plik === undefined) [M1-audytor-generalny-003; 12-niezawodnosc-001]
  const [zPakietu, setZPakietu] = useState<{ zrodlo: RozpoznanyPlik; wynik: RozpoznanyPlik } | null>(null);
  useEffect(() => {
    if (zTresci?.rodzaj !== 'pakiet') return;
    let aktualny = true;
    void kopiaZPakietu(zTresci.pakiet).then((wynik) => {
      if (aktualny) setZPakietu({ zrodlo: zTresci, wynik });
    });
    return () => {
      aktualny = false;
    };
  }, [zTresci]);
  const plik = zTresci?.rodzaj === 'pakiet' ? (zPakietu?.zrodlo === zTresci ? zPakietu.wynik : undefined) : zTresci;

  const wklej = async () => {
    try {
      const tekst = await Clipboard.getStringAsync();
      if (tekst) setTresc(tekst);
    } catch {
      Alert.alert(t('Błąd schowka'), t('Nie udało się odczytać zawartości schowka.'));
    }
  };

  // Import pojedynczej receptury to dodanie: limit Basic 5 własnych (kontrakt zwalnia tylko import kopii; D-116, właściciel
  // „Wg rekomendacji”). Ponad limitem ekran Pro [M3 P-a-fix P1-2]; z Ustawień po zamknięciu arkuszy (onPonadLimitem, N2)
  const { dodaj } = useAppAccess();
  const dodajRecepture = (r: StoredRecipe) =>
    dodaj('wlasneReceptury', async () => {
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
    }, onPonadLimitem);

  const zastapDane = async () => {
    if (plik?.rodzaj !== 'kopia') return;
    const kopia = plik.kopia;
    setZapis(true);
    try {
      await importujKopie(kopia);
      onClose();
      // tytuł mówi, co się stało, treść: następny stan danych (§8, §11c 116) [M1-audytor-generalny-116]
      Alert.alert(
        t('Zaimportowano'),
        kopia.skippedRows > 0
          ? t('Dane z kopii są w aplikacji. Pominięte uszkodzone wpisy: {n}. Poprzednie dane zapisałem w kopii przed importem.', { n: kopia.skippedRows })
          : t('Dane z kopii są w aplikacji. Poprzednie dane zapisałem w kopii przed importem.')
      );
    } catch (err: unknown) {
      if (err instanceof StorageWriteError) {
        Alert.alert(t('Nie zapisano'), saveErrorText(err));
        return;
      }
      Alert.alert(t('Kopia zapasowa'), err instanceof Error ? t(err.message) : t('Nie udało się zaimportować kopii')); // komunikat z kluczem w języku [M1-audytor-generalny-147]
    } finally {
      setZapis(false);
    }
  };

  const tytul =
    plik?.rodzaj === 'receptura' ? t('Receptura z pliku') : plik?.rodzaj === 'kopia' ? t('Kopia zapasowa z pliku') : t('Importuj z pliku');

  return (
    <ArkuszKart
      visible
      onRequestClose={onClose}
      trescTestID="import-file-sheet"
      lewy={{ tekst: t('Anuluj'), onPress: onClose, testID: 'cancel-import-btn' }}
      prawy={
        plik?.rodzaj === 'receptura'
          ? { tekst: t('Dodaj'), onPress: () => dodajRecepture(plik.receptura), testID: 'confirm-import-btn', wylaczony: zapis }
          : undefined
      }
    >
      <Karta testID="karta-importu-z-pliku" tytul={tytul} ikona={<IkonaKarty nazwa="dysk" />}
        podpis={t('Wklej zawartość pliku receptury albo kopii zapasowej.')}>
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

        {plik === undefined && <ActivityIndicator testID="import-reading-package" style={styles.podglad} color={theme.colors.akcent} />}

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

        {/* Kopia z nowszej wersji: aktualizacja aplikacji, bez zapisu [audyt-niezalezny B-7] */}
        {plik?.rodzaj === 'nowsza' && (
          <View testID="import-newer-version" style={styles.podglad}>
            <Text style={styles.zdanie}>
              {t('Ta kopia pochodzi z nowszej wersji Piekarza. Zaktualizuj aplikację i zaimportuj plik ponownie.')}
            </Text>
            <Pressable testID="import-file-close-btn" accessibilityRole="button" style={styles.drugi} onPress={onClose}>
              <Text style={styles.drugiTekst}>{t('Zamknij')}</Text>
            </Pressable>
          </View>
        )}

        {plik?.rodzaj === 'nierozpoznany' && (
          <View testID="import-unrecognized" style={styles.podglad}>
            <Text style={styles.zdanie}>
              {t('Tego pliku nie rozpoznaję. Piekarz importuje plik receptury i plik kopii zapasowej z Piekarza.')}
            </Text>
            {plik.powod ? <Text testID="import-unrecognized-reason" style={styles.zdanie}>{plik.powod}</Text> : null}
            <Pressable testID="import-file-close-btn" accessibilityRole="button" style={styles.drugi} onPress={onClose}>
              <Text style={styles.drugiTekst}>{t('Zamknij')}</Text>
            </Pressable>
          </View>
        )}
      </Karta>
    </ArkuszKart>
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
