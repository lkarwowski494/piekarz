import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Wzorzec informowania VoiceOver (Apps4Brew / HIG Feedback).
 * Komunikaty w treści ogłasza VoiceOver przez AccessibilityInfo.announceForAccessibility.
 * Uwaga: accessibilityLiveRegion w React Native działa tylko na Androidzie, na iOS jest ignorowane.
 */
export const announce = (text: string): void => {
  try {
    AccessibilityInfo.announceForAccessibility(text);
  } catch {
    // brak VoiceOver w środowisku testowym / brak asysty
  }
};

/**
 * Hook ogłaszający tekst, gdy zmieni się na niepusty (np. status timera, ostrzeżenie DDT).
 */
export function useAnnounce(text: string | null | undefined): void {
  useEffect(() => {
    if (text) {
      announce(text);
    }
  }, [text]);
}
