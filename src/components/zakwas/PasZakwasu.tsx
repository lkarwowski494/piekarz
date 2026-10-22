// ============================================================================
// Piekarz — pas nocy karty zakwasu (D10 opcja A, makieta roli 04 `d10-A-pas-390` ekran 3, `d10-ax5`): nazwa zakwasu,
// spirala cyklu i czas od dokarmienia na pasie (pas niesie prawdziwy czas), skrót „Doktor” w rzędzie nawigacji
// (dawniej w natywnym nagłówku, M1-audytor-generalny-117). Bez zakwasu: tytuł „Zakwasy” bez spirali [M3 D10].
// ============================================================================

import React from 'react';
import { useRouter } from 'expo-router';
import type { StoredStarter, StoredStarterEntry } from '../../data/db';
import { t } from '../../lib/i18n';
import { stanKartyZakwasu } from '../../lib/zakwas-widok';
import { PasZakladki } from '../nawigacja/PasZakladki';
import { PrzyciskNaglowka } from '../nawigacja/PrzyciskNaglowka';
import { CyklZakwasu } from './StarterCycleCard';
import { opisMiejsca } from './ZakwasDziennik';

export function PasZakwasu({ gora, starter, wpisy, maZakwas }: {
  gora: number;
  starter: StoredStarter;
  /** Wpisy zakwasu z tego samego useStarterLog co karta (jeden stan cyklu). */
  wpisy: readonly StoredStarterEntry[];
  maZakwas: boolean;
}) {
  const router = useRouter();
  return (
    <PasZakladki
      gora={gora}
      tytul={maZakwas ? starter.name : t('Zakwasy')}
      akcje={
        <PrzyciskNaglowka testID="zakwas-doctor-shortcut-btn" etykieta={t('Doktor zakwasu')} tekst={t('Doktor')} naPasie
          onPress={() => router.push('/zakwasy/doktor-zakwasu')} />
      }
    >
      {maZakwas && <CyklZakwasu stan={stanKartyZakwasu(starter, [...wpisy], Date.now())} opisMiejsca={opisMiejsca(starter)} naPasie />}
    </PasZakladki>
  );
}
