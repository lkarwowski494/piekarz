/**
 * Polityka prywatności i wsparcie pod jednym adresem: paywall, Ustawienia, metadane App Store i strona w site/
 * [M1-audytor-generalny-012; 01-odkrywanie-002, 10-wydanie-001]. Strony publikuje repo apps4brew-www pod
 * apps4brew.com/piekarz/ (decyzja właściciela 2026-10-20); odpowiedź 200 sprawdzona 2026-10-20.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import React from 'react';
import { Linking } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { PRIVACY_URL, SUPPORT_URL, APPLE_EULA_URL } from '../src/lib/links';
import { StudioEcosystemSection } from '../src/components/settings/StudioEcosystemSection';
import { PaywallModal } from '../src/components/PaywallModal';

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const root = path.join(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('Public privacy and support links (012)', () => {
  it('the addresses point to the Piekarz pages on apps4brew.com (owner 2026-10-20)', () => {
    expect(PRIVACY_URL).toBe('https://apps4brew.com/piekarz/privacy.html');
    expect(SUPPORT_URL).toBe('https://apps4brew.com/piekarz/support.html');
    expect(APPLE_EULA_URL).toContain('apple.com/legal');
    expect(fs.existsSync(path.join(root, 'site/privacy.html'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'site/support.html'))).toBe(true);
  });

  it('the Pages workflow publishes from the repository branch master', () => {
    const wf = read('.github/workflows/pages.yml');
    expect(wf).toMatch(/branches:\s*\n\s*-\s*master/);
    expect(wf).not.toMatch(/branches:\s*\n\s*-\s*main\b/);
  });

  it('App Store metadata uses the same addresses', () => {
    const doc = read('docs/15-app-store.md');
    expect(doc).toContain(PRIVACY_URL);
    expect(doc).toContain(SUPPORT_URL);
  });

  it('Settings has a privacy policy link that opens PRIVACY_URL (BR-UST-003 Otwarcie polityki)', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<StudioEcosystemSection />);
    });
    await act(async () => {
      tree!.root.findByProps({ testID: 'settings-privacy-link' }).props.onPress();
    });
    expect(open).toHaveBeenCalledWith(PRIVACY_URL);
    act(() => tree!.unmount());
    open.mockRestore();
  });

  it('the paywall privacy link opens PRIVACY_URL', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <PaywallModal visible={true} onClose={() => {}} onSubscribe={async () => {}} onRestore={async () => {}} />
      );
    });
    const links = tree!.root.findAll((n) => typeof n.props?.onPress === 'function' && n.props?.accessibilityRole === 'link');
    for (const l of links) {
      await act(async () => {
        l.props.onPress();
      });
    }
    expect(open).toHaveBeenCalledWith(PRIVACY_URL);
    expect(open).not.toHaveBeenCalledWith('https://apps4craft.com/privacy/piekarz');
    act(() => tree!.unmount());
    open.mockRestore();
  });
});
