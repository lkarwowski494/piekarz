// Zakładka „Dziennik” (D-051 2a): historia wypieków i wejście do Doktora Chleba; stos z dużym tytułem.
import React from 'react';
import { Stack } from 'expo-router';
import { t } from '../../../src/lib/i18n';
import { naglowekDuzy } from '../../../src/ui/naglowek';

export default function DziennikLayout() {
  return (
    <Stack screenOptions={naglowekDuzy}>
      <Stack.Screen name="index" options={{ title: t('Dziennik') }} />
    </Stack>
  );
}
