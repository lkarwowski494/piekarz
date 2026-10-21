import { notifyTimerFinished, notifySteamReleaseAlert } from '../timer-audio';
import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as announceModule from '../announce';

const mockPlay = jest.fn();
const mockRemove = jest.fn();

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    play: mockPlay,
    remove: mockRemove,
  })),
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
    expect(announceSpy).toHaveBeenCalledWith('Koniec kroku: Autoliza'); // 116: bez „Etap ukończony!”
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    expect(createAudioPlayer).toHaveBeenCalled();
    expect(mockPlay).toHaveBeenCalled();
  });

  it('handles step completion without specific step name gracefully', async () => {
    const announceSpy = jest.spyOn(announceModule, 'announce').mockImplementation(() => {});

    const success = await notifyTimerFinished();

    expect(success).toBe(true);
    expect(announceSpy).toHaveBeenCalledWith('Koniec kroku'); // 116: bez wykrzyknika (§11c)
    expect(createAudioPlayer).toHaveBeenCalled();
    expect(mockPlay).toHaveBeenCalled();
  });

  it('triggers steam release notification with warning haptics and steam alert message', async () => {
    const announceSpy = jest.spyOn(announceModule, 'announce').mockImplementation(() => {});

    const success = await notifySteamReleaseAlert();

    expect(success).toBe(true);
    expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('pokrywkę'));
    expect(Haptics.notificationAsync).toHaveBeenCalled();
  });

  it('alarm pary: jedno ogłoszenie VoiceOver, bez drugiego „Koniec kroku: …” [audyt-niezalezny G-2]', async () => {
    const announceSpy = jest.spyOn(announceModule, 'announce').mockImplementation(() => {});

    await notifySteamReleaseAlert();

    expect(announceSpy.mock.calls).toEqual([['Zdejmij pokrywkę garnka. Wypuść parę.']]);
    expect(mockPlay).toHaveBeenCalled();
  });
});
