// Zakładka „Zakwasy” (D-051 2a): stos z dużym tytułem; skrót do Doktora zakwasu w pasku nawigacji
// (ten sam przepływ co „Coś mnie niepokoi”, design-spec §5) [M1-audytor-generalny-117].
import React from 'react';
import { Stack, router } from 'expo-router';
import { t, useLang } from '../../../src/lib/i18n';
import { naglowekDuzy } from '../../../src/ui/naglowek';
import { PrzyciskNaglowka } from '../../../src/components/nawigacja/PrzyciskNaglowka';

export default function ZakwasyLayout() {
  // Opcje nawigacji liczone w renderze: useLang() renderuje ponownie po zmianie języka (Z-3 z 080) [M1-audytor-generalny-093]
  useLang();
  return (
    <Stack screenOptions={naglowekDuzy}>
      <Stack.Screen
        name="index"
        options={{
          title: t('Zakwasy'),
          headerRight: () => (
            <PrzyciskNaglowka testID="zakwas-doctor-shortcut-btn" etykieta={t('Doktor zakwasu')} tekst={t('Doktor')} onPress={() => router.push('/zakwasy/doktor-zakwasu')} />
          ),
        }}
      />
      {/* „Coś mnie niepokoi” na karcie zakwasu (BR-DIAG-002) [M1-audytor-generalny-104] */}
      <Stack.Screen name="doktor-zakwasu" options={{ title: t('Doktor zakwasu'), headerLargeTitle: false }} />
    </Stack>
  );
}
