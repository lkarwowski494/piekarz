/**
 * BR-OPIN-003 (DEC-13 a): adres wsparcia podany przez właściciela 2026-10-20 („Zrób jak w aplikacji trening”),
 * ten sam co na stronie wsparcia; wiersz „Napisz do nas” widoczny w Ustawieniach [M1-audytor-generalny-083; 11-wzrost-005].
 */
jest.mock('expo-mail-composer', () => ({
  isAvailableAsync: jest.fn(async () => true),
  composeAsync: jest.fn(async () => ({ status: 'sent' })),
}));

import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import renderer, { act } from 'react-test-renderer';
import { StudioEcosystemSection } from '../components/settings/StudioEcosystemSection';
import { SUPPORT_EMAIL } from '../lib/links';
import { czyAdresWsparcia } from '../lib/zgloszenie';

describe('adres wsparcia (083)', () => {
  it('to support@apps4brew.com, poprawny adres i ten sam co w site/support.html', () => {
    expect(SUPPORT_EMAIL).toBe('support@apps4brew.com');
    expect(czyAdresWsparcia(SUPPORT_EMAIL)).toBe(true);
    const strona = readFileSync(join(__dirname, '..', '..', 'site', 'support.html'), 'utf8');
    expect(strona).toContain(SUPPORT_EMAIL);
  });

  it('wiersz „Napisz do nas” renderuje się w Ustawieniach', () => {
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => {
      tree = renderer.create(<StudioEcosystemSection />);
    });
    expect(tree!.root.findAllByProps({ testID: 'settings-contact-link' }).length).toBeGreaterThan(0);
    act(() => tree!.unmount());
  });
});
