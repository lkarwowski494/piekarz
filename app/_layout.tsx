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

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

async function retryDatabase(): Promise<void> {
  resetStorageState();
  await initDatabase();
}

/** Wyjątek renderu: ekran awaryjny z eksportem zamiast pętli awarii [M1-audytor-generalny-018]. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <RescueScreen onRetry={retry} />;
}

export default function RootLayout() {
  const [rescue, setRescue] = useState(false);

  useEffect(() => {
    let milestone: ReturnType<typeof setTimeout> | undefined;
    void (async () => {
      // Dwa nieudane starty z rzędu: tryb awaryjny bez migracji [M1-audytor-generalny-018]
      if ((await beginStartup()).rescue) {
        setRescue(true);
        return;
      }
      await initDatabase();
      void resyncNotifications();
      milestone = setTimeout(() => void markStartupSucceeded(), STARTUP_MILESTONE_MS);
    })();
    return () => clearTimeout(milestone);
  }, []);

  // Powiadomienia lokalne (ADR-006) [M1-audytor-generalny-006]: pokazywanie na pierwszym planie,
  // uzgodnienie po powrocie z tła i otwarcie ekranu z dotkniętego powiadomienia.
  useEffect(() => {
    configureNotificationHandler();
    const appState = AppState.addEventListener('change', (s) => {
      if (s === 'active') void resyncNotifications();
    });
    const tap = Notifications.addNotificationResponseReceivedListener((r) => {
      const route: unknown = Reflect.get(r.notification.request.content.data ?? {}, 'route');
      if (route === '/(tabs)/stolnica' || route === '/(tabs)/zakwas') router.push(route);
    });
    return () => {
      appState.remove();
      tap.remove();
    };
  }, []);

  if (rescue) {
    return (
      <RescueScreen
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
      <StatusBar barStyle="light-content" />
      <StorageGate onRetry={retryDatabase}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </StorageGate>
    </>
  );
}
