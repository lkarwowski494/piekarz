// Zakładka „Receptury” (D-051 2a): receptura i ilości (dawny Kalkulator) oraz plan wypieku (dawny Harmonogram)
// w jednym stosie, plan z przyciskiem wstecz „Receptury”. Wejście do planu z paska nawigacji do czasu
// akcji „Ułóż plan” w recepturze (057, zestaw F). [M1-audytor-generalny-101]
import React from 'react';
import { Stack, router } from 'expo-router';
import { t } from '../../../src/lib/i18n';
import { naglowekDuzy, naglowekZwykly } from '../../../src/ui/naglowek';
import { PrzyciskNaglowka } from '../../../src/components/nawigacja/PrzyciskNaglowka';

export default function RecepturyLayout() {
  return (
    <Stack screenOptions={naglowekDuzy}>
      <Stack.Screen
        name="index"
        options={{
          title: t('Receptury'),
          headerRight: () => (
            <PrzyciskNaglowka testID="open-plan-btn" etykieta={t('Plan wypieku')} tekst={t('Plan wypieku')} onPress={() => router.push('/receptury/harmonogram')} />
          ),
        }}
      />
      <Stack.Screen name="harmonogram" options={{ ...naglowekZwykly, title: t('Plan wypieku') }} />
    </Stack>
  );
}
