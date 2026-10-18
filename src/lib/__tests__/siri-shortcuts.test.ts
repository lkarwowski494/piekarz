// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Unit Tests for Siri Shortcuts & Deep Linking
// ============================================================================

import {
  SIRI_SHORTCUTS,
  parseSiriDeepLink,
} from '../siri-shortcuts';

describe('Siri Shortcuts & Voice Deep Linking', () => {
  it('defines 5 voice shortcuts with bilingual phrases', () => {
    expect(SIRI_SHORTCUTS.length).toBe(5);
    for (const shortcut of SIRI_SHORTCUTS) {
      expect(shortcut.id).toBeTruthy();
      expect(shortcut.phrasePl).toBeTruthy();
      expect(shortcut.phraseEn).toBeTruthy();
      expect(shortcut.urlScheme.startsWith('piekarz://')).toBe(true);
    }
  });

  it('parses deep links from Siri Shortcuts correctly', () => {
    expect(parseSiriDeepLink('piekarz://stolnica/lid-off')).toEqual({
      target: 'stolnica',
      action: 'lid-off',
    });

    expect(parseSiriDeepLink('piekarz://stolnica/fold')).toEqual({
      target: 'stolnica',
      action: 'fold',
    });

    expect(parseSiriDeepLink('piekarz://doktor/emergency')).toEqual({
      target: 'doktor',
      action: 'emergency',
    });

    expect(parseSiriDeepLink('piekarz://kalkulator/ddt')).toEqual({
      target: 'kalkulator',
      action: 'ddt',
    });
  });

  it('returns null for unknown or invalid URLs', () => {
    expect(parseSiriDeepLink('https://google.com')).toBeNull();
    expect(parseSiriDeepLink('piekarz://unknown/action')).toBeNull();
    expect(parseSiriDeepLink('')).toBeNull();
  });
});
