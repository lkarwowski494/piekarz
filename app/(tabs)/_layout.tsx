import React from 'react';
import { Tabs } from 'expo-router';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import { TabIcon, TabLabel } from '../../src/components/TabIcon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Wysokość i odstępy paska liczy biblioteka z marginesu systemu (wskaźnik Home) [M1-audytor-generalny-054]
        tabBarStyle: {
          backgroundColor: theme.colors.powierzchnia,
          borderTopColor: theme.colors.linia,
        },
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
        name="index"
        options={{
          title: t('Kalkulator'),
          tabBarIcon: ({ color }) => <TabIcon name="calculator" color={color} />,
        }}
      />
      <Tabs.Screen
        name="harmonogram"
        options={{
          title: t('Harmonogram'),
          tabBarIcon: ({ color }) => <TabIcon name="schedule" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stolnica"
        options={{
          title: t('Stolnica'),
          tabBarIcon: ({ color }) => <TabIcon name="workbench" color={color} />,
        }}
      />
      <Tabs.Screen
        name="zakwas"
        options={{
          title: t('Zakwas'),
          tabBarIcon: ({ color }) => <TabIcon name="starter" color={color} />,
        }}
      />
      <Tabs.Screen
        name="doktor"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
