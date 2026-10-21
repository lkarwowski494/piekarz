import React from 'react';
import { Tabs } from 'expo-router';
import { getFocusedRouteNameFromRoute } from 'expo-router/react-navigation';
import { theme } from '../../src/ui/theme';
import { t, useLang } from '../../src/lib/i18n';
import { TabIcon, TabLabel } from '../../src/components/TabIcon';

// 4 zakładki: Dziś, Receptury, Zakwasy, Dziennik; ustawienia z „Dziś” (D-051 2a, design-spec §4).
// Każda zakładka ma własny stos z dużym tytułem (app/(tabs)/<zakładka>/_layout.tsx); prowadzenie wypieku
// i Doktor Chleba otwierają się nad zakładkami, bez paska (app/_layout.tsx). [M1-audytor-generalny-101]

// Ekran receptury (push w stosie „Receptury”) ukrywa pasek zakładek (design-spec §11c 106); nazwa ekranu
// ze stanu stosu zakładki przez getFocusedRouteNameFromRoute (stan dziecka nie leży w route.state). [M1-audytor-generalny-106]
const PASEK = { backgroundColor: theme.colors.powierzchnia, borderTopColor: theme.colors.linia };
const stylPaskaReceptur = (route: Parameters<typeof getFocusedRouteNameFromRoute>[0]) =>
  getFocusedRouteNameFromRoute(route) === 'receptura' ? { ...PASEK, display: 'none' as const } : PASEK;

export default function TabsLayout() {
  // Opcje nawigacji liczone w renderze: useLang() renderuje ponownie po zmianie języka (Z-3 z 080) [M1-audytor-generalny-093]
  useLang();
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
          // testID przycisku zakładki: E2E nie zależy od języka (07-jakosc-501) [M1-audytor-generalny-037]
          tabBarButtonTestID: 'tab-dzis',
          tabBarIcon: ({ color }) => <TabIcon name="dzis" color={color} />,
        }}
      />
      <Tabs.Screen
        name="receptury"
        options={({ route }) => ({
          title: t('Receptury'),
          tabBarButtonTestID: 'tab-receptury',
          tabBarIcon: ({ color }) => <TabIcon name="receptury" color={color} />,
          tabBarStyle: stylPaskaReceptur(route),
        })}
      />
      <Tabs.Screen
        name="zakwasy"
        options={{
          title: t('Zakwasy'),
          tabBarButtonTestID: 'tab-zakwasy',
          tabBarIcon: ({ color }) => <TabIcon name="zakwasy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dziennik"
        options={{
          title: t('Dziennik'),
          tabBarButtonTestID: 'tab-dziennik',
          tabBarIcon: ({ color }) => <TabIcon name="dziennik" color={color} />,
        }}
      />
    </Tabs>
  );
}
