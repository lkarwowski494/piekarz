// ============================================================================
// Piekarz — bezpieczny obszar w oknie pełnoekranowym (Modal bez pageSheet) [M3 E2E-basic]
// Modal to osobne okno iOS: SafeAreaView bez własnego dostawcy dostaje przy pierwszym pokazaniu wcięcie 0 i nagłówek
// (np. „Zamknij” ekranu Pro) wchodzi pod pasek stanu. Dostawca z metrykami okna daje wcięcia od pierwszej klatki.
// Bez znanych metryk (np. środowisko testów) dostawca nie rysowałby treści do pierwszego pomiaru, więc wtedy treść
// idzie bez niego, jak przed tą zmianą.
// ============================================================================

import React from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

export function BezpiecznyObszarOkna({ children }: { children: React.ReactNode }) {
  if (!initialWindowMetrics) return <>{children}</>;
  return <SafeAreaProvider initialMetrics={initialWindowMetrics}>{children}</SafeAreaProvider>;
}
