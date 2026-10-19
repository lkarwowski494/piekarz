jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

import * as Haptics from 'expo-haptics';
import { tapHaptic } from '../haptics';

describe('tapHaptic', () => {
  it('passes the style to impactAsync and swallows a library error', () => {
    tapHaptic(Haptics.ImpactFeedbackStyle.Medium);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    (Haptics.impactAsync as jest.Mock).mockImplementationOnce(() => {
      throw new Error('brak modułu');
    });
    expect(() => tapHaptic(Haptics.ImpactFeedbackStyle.Light)).not.toThrow();
  });
});
