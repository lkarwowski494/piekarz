// Zakładka „Zakwasy” (D-051 2a): karta zakwasu z pasem nocy zamiast natywnego nagłówka (D10 opcja A); skrót do
// Doktora zakwasu na pasie ekranu (ten sam przepływ co „Coś mnie niepokoi”, design-spec §5) [M1-audytor-generalny-117; M3 D10].
import React from 'react';
import { Stack } from 'expo-router';
import { t, useLang } from '../../../src/lib/i18n';
import { useNaglowek } from '../../../src/ui/naglowek';

export default function ZakwasyLayout() {
  // Opcje nawigacji liczone w renderze: useLang() renderuje ponownie po zmianie języka (Z-3 z 080) [M1-audytor-generalny-093]
  useLang();
  const { duzy } = useNaglowek();
  return (
    <Stack screenOptions={duzy}>
      <Stack.Screen name="index" options={{ title: t('Zakwasy'), headerShown: false }} />
      {/* „Coś mnie niepokoi” na karcie zakwasu (BR-DIAG-002) [M1-audytor-generalny-104] */}
      <Stack.Screen name="doktor-zakwasu" options={{ title: t('Doktor zakwasu'), headerLargeTitle: false }} />
    </Stack>
  );
}
