import '../src/lib/intl-polyfills';
import React, { useEffect, useRef, useState } from 'react';
import { Stack, router, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar, AppState, View, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { configureNotificationHandler, resyncNotifications } from '../src/lib/notifications';
import { initDatabase } from '../src/data/sqlite-store';
import { resetStorageState } from '../src/data/storage-status';
import { StorageGate } from '../src/components/StorageGate';
import { RescueScreen } from '../src/components/RescueScreen';
import { beginStartup, markStartupSucceeded } from '../src/lib/startup-guard';
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

/**
 * Start aplikacji wspólny dla zwykłego startu i „Spróbuj ponownie” w trybie awaryjnym [M1-audytor-generalny-140].
 * Zwraca zatrzymanie nasłuchu płatności.
 */
async function startAplikacji(): Promise<() => void> {
  await initDatabase();
  // Język z zapisu albo z systemu, po bazie (zapis w app_settings) [M1-audytor-generalny-048]
  await initLanguage();
  // Jednostki z zapisu albo według regionu urządzenia (D-044); rejestruje przeliczanie tekstów t() [M1-audytor-generalny-096]
  await initUnitSystem();
  // Nasłuch transakcji StoreKit od startu, zanim użytkownik otworzy ekran zakupu (MON-04) [M1-audytor-generalny-008]
  const stop = uruchomPlatnosci();
  void resyncNotifications();
  return stop;
}

/** Wyjątek renderu: ekran awaryjny z eksportem zamiast pętli awarii [M1-audytor-generalny-018]. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <RescueScreen onRetry={retry} />;
}

export default function RootLayout() {
  const [rescue, setRescue] = useState(false);
  // Opcje nawigacji liczone w renderze: useLang() renderuje ponownie po zmianie języka (Z-3 z 080) [M1-audytor-generalny-093]
  useLang();

  const stopPlatnosci = useRef<(() => void) | undefined>(undefined);
  const kamien = useRef(false);

  useEffect(() => {
    void (async () => {
      // Dwa nieudane starty z rzędu: tryb awaryjny bez migracji [M1-audytor-generalny-018]
      if ((await beginStartup()).rescue) {
        setRescue(true);
        return;
      }
      stopPlatnosci.current = await startAplikacji();
    })();
    return () => stopPlatnosci.current?.();
  }, []);

  // Kamień milowy: pierwszy ekran narysowany za StorageGate (baza otwarta, migracje zakończone), raz na start
  // [M1-audytor-generalny-140; 12-niezawodnosc-504]
  const pierwszyEkran = () => {
    if (kamien.current) return;
    kamien.current = true;
    void markStartupSucceeded();
  };

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
          // Pełny start bez zerowania licznika: zeruje go dopiero kamień milowy [M1-audytor-generalny-140]
          setRescue(false);
          stopPlatnosci.current = await startAplikacji();
        }}
      />
    );
  }

  return (
    <>
      {/* default: iOS sam dobiera kolor paska do jasnego albo ciemnego wyglądu (D-045) */}
      <StatusBar barStyle="default" />
      <StorageGate onRetry={retryDatabase}>
        {/* onLayout = kamień milowy strażnika startu (pierwszy ekran po bazie) [M1-audytor-generalny-140] */}
        <View style={styles.korzen} onLayout={pierwszyEkran} testID="start-kamien-milowy">
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
        </View>
      </StorageGate>
    </>
  );
}

const styles = StyleSheet.create({ korzen: { flex: 1 } });
