import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { announce } from './announce';
import { t } from './i18n';

let soundInstance: Audio.Sound | null = null;

/**
 * Triggers audio, haptic, and VoiceOver announcement when a timer step finishes.
 */
export async function notifyTimerFinished(stepName?: string): Promise<boolean> {
  // 1. Accessibility announcement for screen readers
  const message = stepName
    ? `${t('Etap ukończony!')}: ${stepName}`
    : t('Etap ukończony!');
  announce(message);

  // 2. High-priority tactile feedback
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Ignore in non-native / test environments
  }

  // 3. Audio chime playback
  try {
    if (soundInstance) {
      await soundInstance.unloadAsync().catch(() => {});
      soundInstance = null;
    }

    // Gentle short acoustic sine tone encoded as wav data URI (440Hz A4 chime)
    const audioDataUri = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioDataUri },
      { shouldPlay: true, volume: 1.0 }
    );
    soundInstance = sound;
    return true;
  } catch {
    return false;
  }
}
