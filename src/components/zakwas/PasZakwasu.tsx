// ============================================================================
// Piekarz — pas nocy karty zakwasu (D10 opcja A, makieta roli 04 `d10-A-pas-390` ekran 3, `d10-ax5`): nazwa zakwasu,
// spirala cyklu i czas od dokarmienia na pasie (pas niesie prawdziwy czas), skrót „Doktor” w rzędzie nawigacji
// (dawniej w natywnym nagłówku, M1-audytor-generalny-117). Bez zakwasu: tytuł „Zakwasy” bez spirali [M3 D10].
// ============================================================================

import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import type { StoredStarter, StoredStarterEntry } from '../../data/db';
import { t } from '../../lib/i18n';
import { stanKartyZakwasu } from '../../lib/zakwas-widok';
import { PasZakladki } from '../nawigacja/PasZakladki';
import { PrzyciskNaglowka } from '../nawigacja/PrzyciskNaglowka';
import { CyklZakwasu } from './StarterCycleCard';
import { opisMiejsca } from './ZakwasDziennik';

export function PasZakwasu({ gora, starter, wpisy, maZakwas, chipy, onEdytuj, onLayout }: {
  gora: number;
  starter: StoredStarter;
  /** Wpisy zakwasu z tego samego useStarterLog co karta (jeden stan cyklu). */
  wpisy: readonly StoredStarterEntry[];
  maZakwas: boolean;
  /** Wybór zakwasu jako chipy na pasie (karty/README.md §4) [M3 p2]. */
  chipy?: React.ReactNode;
  /** „Edytuj” profil zakwasu w akcjach pasa (makieta zakwasy.html, stan „z zakwasem”) [M3 p2]. */
  onEdytuj?: () => void;
  /** Wysokość pasa: ekran wylicza, kiedy pokazać mały tytuł w czapce paska stanu. */
  onLayout?: (wysokosc: number) => void;
}) {
  const router = useRouter();
  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.height)}>
    <PasZakladki
      gora={gora}
      tytul={maZakwas ? starter.name : t('Zakwasy')}
      // Bez zakwasu zdanie pustego stanu na pasie (makieta zakwasy.html, stan „pusty”) [M3 p2]
      podtytul={maZakwas ? undefined : t('Nie masz jeszcze zakwasu. Dodaj zakwas, który masz, albo załóż nowy.')}
      akcje={
        <>
          {maZakwas && onEdytuj ? (
            <PrzyciskNaglowka testID="edit-profile-btn" etykieta={t('Edytuj')} tekst={t('Edytuj')} naPasie onPress={onEdytuj} />
          ) : null}
          <PrzyciskNaglowka testID="zakwas-doctor-shortcut-btn" etykieta={t('Doktor zakwasu')} tekst={t('Doktor')} naPasie
            onPress={() => router.push('/zakwasy/doktor-zakwasu')} />
        </>
      }
    >
      {maZakwas && <CyklZakwasu stan={stanKartyZakwasu(starter, [...wpisy], Date.now())} opisMiejsca={opisMiejsca(starter)} naPasie />}
      {chipy}
    </PasZakladki>
    </View>
  );
}
