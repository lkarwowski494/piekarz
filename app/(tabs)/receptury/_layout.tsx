// Zakładka „Receptury” (D-051 2a): receptura i ilości (dawny Kalkulator) oraz plan wypieku (dawny Harmonogram)
// w jednym stosie, plan z przyciskiem wstecz „Receptury”. Plan otwiera akcja receptury „Ułóż plan”; w pasku
// nawigacji receptury przycisk „Więcej” z menu (Kopiuj jako tekst, Udostępnij plik receptury; design-spec §11b
// „057”). [M1-audytor-generalny-101; M1-audytor-generalny-057]
import React from 'react';
import { Stack } from 'expo-router';
import { t } from '../../../src/lib/i18n';
import { naglowekDuzy, naglowekZwykly } from '../../../src/ui/naglowek';
import { PrzyciskNaglowka } from '../../../src/components/nawigacja/PrzyciskNaglowka';
import { pokazMenuReceptury } from '../../../src/lib/menu-receptury';

export default function RecepturyLayout() {
  return (
    <Stack screenOptions={naglowekDuzy}>
      <Stack.Screen
        name="index"
        options={{
          title: t('Receptury'),
          headerRight: () => (
            <PrzyciskNaglowka testID="recipe-more-btn" etykieta={t('Więcej działań: receptura')} tekst={t('Więcej')} onPress={pokazMenuReceptury} />
          ),
        }}
      />
      <Stack.Screen name="harmonogram" options={{ ...naglowekZwykly, title: t('Plan wypieku') }} />
    </Stack>
  );
}
