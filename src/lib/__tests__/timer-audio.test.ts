import { notifyTimerFinished, notifySteamReleaseAlert } from '../timer-audio';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as announceModule from '../announce';

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          unloadAsync: jest.fn().mockResolvedValue(undefined),
        },
      }),
    },
  },
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: { Success: 'success' },
}));

describe('Timer Audio & Tactile Completion Notification (Apps4Brew Hands-in-Flour)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('triggers accessibility announcement, haptics, and audio playback upon timer finish', async () => {
    const announceSpy = jest.spyOn(announceModule, 'announce').mockImplementation(() => {});

    const success = await notifyTimerFinished('Autoliza');

    expect(success).toBe(true);
    expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('Autoliza'));
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    expect(Audio.Sound.createAsync).toHaveBeenCalled();
  });

  it('handles step completion without specific step name gracefully', async () => {
    const announceSpy = jest.spyOn(announceModule, 'announce').mockImplementation(() => {});

    const success = await notifyTimerFinished();

    expect(success).toBe(true);
    expect(announceSpy).toHaveBeenCalledWith('Etap ukończony!');
    expect(Audio.Sound.createAsync).toHaveBeenCalled();
  });

  it('triggers steam release notification with warning haptics and steam alert message', async () => {
    const announceSpy = jest.spyOn(announceModule, 'announce').mockImplementation(() => {});

    const success = await notifySteamReleaseAlert();

    expect(success).toBe(true);
    expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('pokrywkę'));
    expect(Haptics.notificationAsync).toHaveBeenCalled();
  });
});
