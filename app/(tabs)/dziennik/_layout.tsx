// Zakładka „Dziennik” (D-051 2a): historia wypieków i wejście do Doktora Chleba; stos z dużym tytułem.
import React from 'react';
import { Stack } from 'expo-router';
import { t, useLang } from '../../../src/lib/i18n';
import { useNaglowek } from '../../../src/ui/naglowek';

export default function DziennikLayout() {
  // Opcje nawigacji liczone w renderze: useLang() renderuje ponownie po zmianie języka (Z-3 z 080) [M1-audytor-generalny-093]
  useLang();
  const { duzy } = useNaglowek();
  return (
    <Stack screenOptions={duzy}>
      {/* Pas nocy zamiast natywnego nagłówka (D10 opcja A): tytuł i filtry smaku na pasie ekranu [M3 D10] */}
      <Stack.Screen name="index" options={{ title: t('Dziennik'), headerShown: false }} />
    </Stack>
  );
}
