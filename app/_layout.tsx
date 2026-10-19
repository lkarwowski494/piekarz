import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { initDatabase } from '../src/data/sqlite-store';
import { resetStorageState } from '../src/data/storage-status';
import { StorageGate } from '../src/components/StorageGate';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

async function retryDatabase(): Promise<void> {
  resetStorageState();
  await initDatabase();
}

export default function RootLayout() {
  useEffect(() => {
    void initDatabase();
  }, []);

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
