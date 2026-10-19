// ============================================================================
// Piekarz — wibracja dotyku dla przycisków Stolnicy (wydzielone z app/(tabs)/stolnica.tsx, limit 20 KB)
// Brak modułu albo błąd biblioteki nie przerywa akcji użytkownika.
// ============================================================================

import * as Haptics from 'expo-haptics';

export function tapHaptic(style: Haptics.ImpactFeedbackStyle): void {
  try {
    void Haptics.impactAsync(style);
  } catch {
    // Ignored
  }
}
