import React, { useEffect, useState } from 'react';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'react-native';
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
      milestone = setTimeout(() => void markStartupSucceeded(), STARTUP_MILESTONE_MS);
    })();
    return () => clearTimeout(milestone);
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
