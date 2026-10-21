import '../src/lib/intl-polyfills';
import React, { useEffect, useState } from 'react';
import { Stack, router, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { configureNotificationHandler, resyncNotifications } from '../src/lib/notifications';
import { initDatabase } from '../src/data/sqlite-store';
import { resetStorageState } from '../src/data/storage-status';
import { StorageGate } from '../src/components/StorageGate';
import { RescueScreen } from '../src/components/RescueScreen';
import { beginStartup, markStartupSucceeded, STARTUP_MILESTONE_MS } from '../src/lib/startup-guard';
import { uruchomPlatnosci } from '../src/lib/platnosci/stan';
import { AppAccessProvider } from '../src/components/AppAccessProvider';
import { initLanguage, t, useLang } from '../src/lib/i18n';
import { initUnitSystem } from '../src/lib/unit-converter';
import { trasaZPowiadomienia } from '../src/core/notification-plan';
import { naglowekZwykly } from '../src/ui/naglowek';
import { PrzyciskNaglowka } from '../src/components/nawigacja/PrzyciskNaglowka';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

async function retryDatabase(): Promise<void> {
  // Ekrany czekają za bramką do końca kopii i migracji [M1-audytor-generalny-205]
  resetStorageState('initializing');
  await initDatabase();
}

/** Wyjątek renderu: ekran awaryjny z eksportem zamiast pętli awarii [M1-audytor-generalny-018]. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <RescueScreen onRetry={retry} />;
}

export default function RootLayout() {
  const [rescue, setRescue] = useState(false);
  // Opcje nawigacji liczone w renderze: useLang() renderuje ponownie po zmianie języka (Z-3 z 080) [M1-audytor-generalny-093]
  useLang();

  useEffect(() => {
    let milestone: ReturnType<typeof setTimeout> | undefined;
    let stopPlatnosci: (() => void) | undefined;
    void (async () => {
      // Dwa nieudane starty z rzędu: tryb awaryjny bez migracji [M1-audytor-generalny-018]
      if ((await beginStartup()).rescue) {
        setRescue(true);
        return;
      }
      await initDatabase();
      // Język z zapisu albo z systemu, po bazie (zapis w app_settings) [M1-audytor-generalny-048]
      await initLanguage();
      // Jednostki z zapisu albo według regionu urządzenia (D-044); rejestruje przeliczanie tekstów t() [M1-audytor-generalny-096]
      await initUnitSystem();
      // Nasłuch transakcji StoreKit od startu, zanim użytkownik otworzy ekran zakupu (MON-04) [M1-audytor-generalny-008]
      stopPlatnosci = uruchomPlatnosci();
      void resyncNotifications();
      milestone = setTimeout(() => void markStartupSucceeded(), STARTUP_MILESTONE_MS);
    })();
    return () => {
      clearTimeout(milestone);
      stopPlatnosci?.();
    };
  }, []);

  // Powiadomienia lokalne (ADR-006) [M1-audytor-generalny-006]: pokazywanie na pierwszym planie,
  // uzgodnienie po powrocie z tła i otwarcie ekranu z dotkniętego powiadomienia.
  // Tryb awaryjny nie dotyka bazy: bez uzgadniania powiadomień (czyta bazę) [M1-audytor-generalny-215; 12-niezawodnosc-604]
  useEffect(() => {
    if (rescue) return undefined;
    configureNotificationHandler();
    const appState = AppState.addEventListener('change', (s) => {
      if (s === 'active') void resyncNotifications();
    });
    const tap = Notifications.addNotificationResponseReceivedListener((r) => {
      // Prowadzenie otwiera się na bieżącym kroku (F-58, BR-ETAP-005); trasy sprzed 4 zakładek (D-051 2a)
      // z powiadomień zaplanowanych przez poprzednią wersję prowadzą w to samo miejsce [M1-audytor-generalny-101]
      const trasa = trasaZPowiadomienia(Reflect.get(r.notification.request.content.data ?? {}, 'route'));
      if (trasa) router.push(trasa);
    });
    return () => {
      appState.remove();
      tap.remove();
    };
  }, [rescue]);

  if (rescue) {
    return (
      <RescueScreen
        bezMigracji
        onRetry={async () => {
          await markStartupSucceeded();
          setRescue(false);
          await initDatabase();
        }}
      />
    );
  }

  return (
    <>
      {/* default: iOS sam dobiera kolor paska do jasnego albo ciemnego wyglądu (D-045) */}
      <StatusBar barStyle="default" />
      <StorageGate onRetry={retryDatabase}>
        {/* Jeden stan dostępu i jeden ekran zakupu dla wszystkich zakładek [M1-audytor-generalny-025] */}
        <AppAccessProvider>
          {/* Zakładki (D-051 2a) i ekrany nad nimi bez paska zakładek: prowadzenie wypieku, Doktor Chleba [M1-audytor-generalny-101] */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="stolnica"
              options={{
                ...naglowekZwykly,
                title: t('Stolnica'),
                headerBackButtonDisplayMode: 'minimal',
                headerRight: () => (
                  <PrzyciskNaglowka testID="stolnica-doctor-shortcut-btn" etykieta={t('Doktor Chleba')} tekst={t('Doktor')} onPress={() => router.push('/doktor')} />
                ),
              }}
            />
            <Stack.Screen name="doktor" options={{ ...naglowekZwykly, title: t('Doktor Chleba'), headerBackButtonDisplayMode: 'minimal' }} />
          </Stack>
        </AppAccessProvider>
      </StorageGate>
    </>
  );
}
