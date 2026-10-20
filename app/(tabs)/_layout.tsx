import React from 'react';
import { Tabs } from 'expo-router';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import { TabIcon, TabLabel } from '../../src/components/TabIcon';

// 4 zakładki: Dziś, Receptury, Zakwasy, Dziennik; ustawienia z „Dziś” (D-051 2a, design-spec §4).
// Każda zakładka ma własny stos z dużym tytułem (app/(tabs)/<zakładka>/_layout.tsx); prowadzenie wypieku
// i Doktor Chleba otwierają się nad zakładkami, bez paska (app/_layout.tsx). [M1-audytor-generalny-101]

// Ekran receptury (push w stosie „Receptury”) ukrywa pasek zakładek (design-spec §11c 106); nazwa ekranu
// z zagnieżdżonego stanu stosu zakładki. [M1-audytor-generalny-106]
type TrasaZakladki = { state?: { index?: number; routes: { name: string }[] } };
const PASEK = { backgroundColor: theme.colors.powierzchnia, borderTopColor: theme.colors.linia };
const stylPaskaReceptur = (route: TrasaZakladki) => {
  const s = route.state;
  const ekran = s ? s.routes[s.index ?? s.routes.length - 1]?.name : undefined;
  return ekran === 'receptura' ? { ...PASEK, display: 'none' as const } : PASEK;
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Wysokość i odstępy paska liczy biblioteka z marginesu systemu (wskaźnik Home) [M1-audytor-generalny-054]
        tabBarStyle: PASEK,
        tabBarActiveTintColor: theme.colors.akcentTekst,
        tabBarInactiveTintColor: theme.colors.tusz3,
        tabBarLabel: ({ color, position, children }) => (
          <TabLabel color={color} position={position}>
            {children}
          </TabLabel>
        ),
      }}
    >
      <Tabs.Screen
        name="(dzis)"
        options={{
          title: t('Dziś'),
          tabBarIcon: ({ color }) => <TabIcon name="dzis" color={color} />,
        }}
      />
      <Tabs.Screen
        name="receptury"
        options={({ route }) => ({
          title: t('Receptury'),
          tabBarIcon: ({ color }) => <TabIcon name="receptury" color={color} />,
          tabBarStyle: stylPaskaReceptur(route as TrasaZakladki),
        })}
      />
      <Tabs.Screen
        name="zakwasy"
        options={{
          title: t('Zakwasy'),
          tabBarIcon: ({ color }) => <TabIcon name="zakwasy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dziennik"
        options={{
          title: t('Dziennik'),
          tabBarIcon: ({ color }) => <TabIcon name="dziennik" color={color} />,
        }}
      />
    </Tabs>
  );
}
