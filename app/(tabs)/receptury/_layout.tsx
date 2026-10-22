// Zakładka „Receptury” (D-051 2a, design-spec §11c „106”): lista receptur (ekran główny) → ekran receptury
// (push, tytuł = nazwa receptury, przycisk wstecz „Receptury”) → plan wypieku (dawny Harmonogram). Plan otwiera
// akcja receptury „Ułóż plan”; w pasku nawigacji ekranu receptury przycisk „Więcej” z menu (Kopiuj jako tekst,
// Udostępnij plik receptury; design-spec §11b „057”).
// [M1-audytor-generalny-101; M1-audytor-generalny-057; M1-audytor-generalny-106]
import React from 'react';
import { Stack } from 'expo-router';
import { t, useLang } from '../../../src/lib/i18n';
import { nazwaReceptury } from '../../../src/lib/nazwa-receptury';
import { useNaglowek } from '../../../src/ui/naglowek';
import { PrzyciskNaglowka } from '../../../src/components/nawigacja/PrzyciskNaglowka';
import { pokazMenuReceptury } from '../../../src/lib/menu-receptury';

const przyciskWiecej = () => (
  <PrzyciskNaglowka testID="recipe-more-btn" etykieta={t('Więcej działań: receptura')} tekst={t('Więcej')} onPress={pokazMenuReceptury} />
);

export default function RecepturyLayout() {
  // Opcje nawigacji liczone w renderze: useLang() renderuje ponownie po zmianie języka (Z-3 z 080) [M1-audytor-generalny-093]
  useLang();
  const { duzy, zwykly } = useNaglowek();
  return (
    <Stack screenOptions={duzy}>
      <Stack.Screen name="index" options={{ title: t('Receptury') }} />
      <Stack.Screen
        name="receptura"
        options={({ route }: { route: { params?: { nazwa?: string } } }) => ({
          // Nazwa receptury bazowej w języku aplikacji; zapisana nazwa (parametr) bez zmian [M1-audytor-generalny-093]
          title: nazwaReceptury(route.params?.nazwa ?? ''),
          headerBackTitle: t('Receptury'),
          headerRight: przyciskWiecej,
        })}
      />
      <Stack.Screen name="harmonogram" options={{ ...zwykly, title: t('Plan wypieku') }} />
    </Stack>
  );
}
