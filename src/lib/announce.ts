// ============================================================================
// Piekarz (Crust) — Accessibility Announcements (S8, NFR-INT-008)
// Komunikaty czytnika ekranu VoiceOver/TalkBack dla dynamicznych zmian stanu
// ============================================================================

import { AccessibilityInfo } from 'react-native';

export function announce(message: string): void {
  if (message && typeof message === 'string' && message.trim().length > 0) {
    try {
      AccessibilityInfo.announceForAccessibility(message);
    } catch {
      // Graceful fallback in environments without native accessibility bridge
    }
  }
}
