// Zakładka „Zakwasy” (D-051 2a): stos z dużym tytułem; skrót do Doktora Chleba w pasku nawigacji.
import React from 'react';
import { Stack, router } from 'expo-router';
import { t } from '../../../src/lib/i18n';
import { naglowekDuzy } from '../../../src/ui/naglowek';
import { PrzyciskNaglowka } from '../../../src/components/nawigacja/PrzyciskNaglowka';

export default function ZakwasyLayout() {
  return (
    <Stack screenOptions={naglowekDuzy}>
      <Stack.Screen
        name="index"
        options={{
          title: t('Zakwasy'),
          headerRight: () => (
            <PrzyciskNaglowka testID="zakwas-doctor-shortcut-btn" etykieta={t('Doktor Chleba')} tekst={t('Doktor')} onPress={() => router.push('/doktor')} />
          ),
        }}
      />
    </Stack>
  );
}
