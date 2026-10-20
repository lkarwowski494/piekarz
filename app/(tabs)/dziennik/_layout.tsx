// Zakładka „Dziennik” (D-051 2a): historia wypieków i wejście do Doktora Chleba; stos z dużym tytułem.
import React from 'react';
import { Stack } from 'expo-router';
import { t, useLang } from '../../../src/lib/i18n';
import { naglowekDuzy } from '../../../src/ui/naglowek';

export default function DziennikLayout() {
  // Opcje nawigacji liczone w renderze: useLang() renderuje ponownie po zmianie języka (Z-3 z 080) [M1-audytor-generalny-093]
  useLang();
  return (
    <Stack screenOptions={naglowekDuzy}>
      <Stack.Screen name="index" options={{ title: t('Dziennik') }} />
    </Stack>
  );
}
