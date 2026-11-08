// ============================================================================
// Piekarz — Ustawienia: „Licencje open source” (Z-08-1, FOR-15, D-291). Lista pakietów produkcyjnych (nazwa, wersja, licencja);
// dotknięcie pokazuje notkę o prawach autorskich, treść licencji i NOTICE. Osobno: biblioteki natywne spoza npm i czcionka
// Sofia Sans (OFL-1.1). Nazwy pakietów i treść licencji w oryginale (prawnym), tłumaczone tylko etykiety.
// Dane: assets/licencje.generated.json (scripts/licencje.mjs, poza limitem 20 480 B); wczytanie z `unknown` w src/lib/licencje.ts.
// Wygląd z istniejących tokenów i wzorca wiersza Ustawień; do akceptacji roli 04. Duży tekst: bez stałych wysokości.
// ============================================================================

import React, { memo, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { typografia } from '../../ui/tokeny';
import { identyfikatoryLicencji, wczytajLicencje, type DaneLicencji, type WpisLicencji } from '../../lib/licencje';
import surowe from '../../../assets/licencje.generated.json';
import { WIERSZ } from './wiersz-ustawien';

type Teksty = DaneLicencji['teksty'];
const klucz = (w: WpisLicencji) => `licencja-${w.nazwa}@${w.wersja}`;
const opis = (w: WpisLicencji) => [w.licencja, ...w.notki].join(' · ');

interface WierszProps {
  wpis: WpisLicencji;
  teksty: Teksty;
  otwarty: boolean;
  onPrzelacz: () => void;
}

/** Wiersz z nazwą, wersją i licencją; po dotknięciu notka, treść licencji (każdej z wyrażenia SPDX) i NOTICE pakietu. */
export const WierszLicencji = memo(function WierszLicencji({ wpis, teksty, otwarty, onPrzelacz }: WierszProps) {
  const tytul = `${wpis.nazwa} ${wpis.wersja}`;
  return (
    <View>
      <Pressable
        style={styles.wiersz}
        onPress={onPrzelacz}
        accessibilityRole="button"
        accessibilityLabel={`${tytul}, ${wpis.licencja}`}
        accessibilityState={{ expanded: otwarty }}
        testID={klucz(wpis)}
      >
        <Text style={styles.nazwa}>{tytul}</Text>
        <Text style={styles.opis}>{opis(wpis)}</Text>
      </Pressable>
      {otwarty && (
        <View style={styles.tresc}>
          {identyfikatoryLicencji(wpis.licencja).map((id) =>
            teksty[id] ? (
              <Text key={id} style={styles.tekstLicencji} selectable>
                {teksty[id].tekst}
              </Text>
            ) : null
          )}
          {wpis.notice !== undefined && (
            <>
              <Text style={styles.etykieta}>NOTICE</Text>
              <Text style={styles.tekstLicencji} selectable>
                {wpis.notice}
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
});

function Sekcja({ tytul, wpisy, teksty, otwarty, onPrzelacz }: { tytul: string; wpisy: WpisLicencji[]; teksty: Teksty; otwarty: string | null; onPrzelacz: (k: string) => void }) {
  return (
    <>
      <Text style={styles.sekcja} accessibilityRole="header">{tytul}</Text>
      {wpisy.map((w) => (
        <WierszLicencji key={klucz(w)} wpis={w} teksty={teksty} otwarty={otwarty === klucz(w)} onPrzelacz={() => onPrzelacz(klucz(w))} />
      ))}
    </>
  );
}

/** Treść podekranu „Licencje open source”: własna lista (FlatList), nie wewnątrz ScrollView — 500+ wierszy. */
export function LicencjeEkran() {
  const wynik = useMemo(() => wczytajLicencje(surowe), []);
  const [otwarty, setOtwarty] = useState<string | null>(null);
  if (!wynik.ok) return <Text style={styles.wstep}>{t('Nie można wczytać listy licencji.')}</Text>;
  const { pakiety, czcionki, natywne, teksty } = wynik.wartosc;
  const przelacz = (k: string) => setOtwarty((p) => (p === k ? null : k));
  const naglowek = (
    <View>
      <Text style={styles.wstep}>
        {t('Aplikacja korzysta z bibliotek open source. Dotknij pozycji, by zobaczyć notkę o prawach autorskich i pełną treść licencji. Nazwy pakietów i treść licencji są w oryginale.')}
      </Text>
      <Sekcja tytul={t('Biblioteki natywne iOS spoza npm ({n})', { n: natywne.length })} wpisy={natywne} teksty={teksty} otwarty={otwarty} onPrzelacz={przelacz} />
      <Sekcja tytul={t('Czcionki ({n})', { n: czcionki.length })} wpisy={czcionki} teksty={teksty} otwarty={otwarty} onPrzelacz={przelacz} />
      <Text style={styles.sekcja} accessibilityRole="header">{t('Pakiety npm ({n})', { n: pakiety.length })}</Text>
    </View>
  );
  return (
    <FlatList
      testID="licencje-lista"
      data={pakiety}
      extraData={otwarty}
      keyExtractor={klucz}
      ListHeaderComponent={naglowek}
      renderItem={({ item }) => <WierszLicencji wpis={item} teksty={teksty} otwarty={otwarty === klucz(item)} onPrzelacz={() => przelacz(klucz(item))} />}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={20}
      windowSize={11}
      contentContainerStyle={styles.zawartosc}
    />
  );
}

const styles = StyleSheet.create({
  // Wiersz (karty/README §2): min 52, linia nad wierszem; tekst się zawija
  wiersz: { minHeight: 52, ...WIERSZ },
  zawartosc: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
  wstep: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz,
    marginBottom: theme.spacing.md,
  },
  sekcja: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.naglowek.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  nazwa: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz },
  opis: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2 },
  tresc: { paddingBottom: theme.spacing.sm, gap: theme.spacing.sm },
  etykieta: { fontSize: typografia.style.podpis.pt, fontWeight: '700', color: theme.colors.tusz2 },
  tekstLicencji: { fontSize: typografia.style.podpis.pt, color: theme.colors.tusz2 },
});
