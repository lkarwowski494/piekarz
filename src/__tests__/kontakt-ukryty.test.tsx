/**
 * BR-OPIN-003, KM01 (DEC-13 a): dopóki SUPPORT_EMAIL to znacznik [DO USTALENIA], wiersz „Napisz do nas”
 * się nie renderuje, a dotknięcie nie może otworzyć poczty ani linku [M1-audytor-generalny-083; 11-wzrost-005].
 */
// Od 2026-10-20 SUPPORT_EMAIL to prawdziwy adres; KM01 sprawdza zachowanie przy znaczniku przez atrapę modułu.
jest.mock('../lib/links', () => ({
  ...jest.requireActual('../lib/links'),
  SUPPORT_EMAIL: '[DO USTALENIA: adres wsparcia od właściciela]',
}));
jest.mock('expo-mail-composer', () => ({
  isAvailableAsync: jest.fn(async () => true),
  composeAsync: jest.fn(async () => ({ status: 'sent' })),
}));

import React from 'react';
import { Linking } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as MailComposer from 'expo-mail-composer';
import { StudioEcosystemSection } from '../components/settings/StudioEcosystemSection';
import { napiszDoAutora } from '../lib/zgloszenie-wyslanie';
import { SUPPORT_EMAIL } from '../lib/links';

describe('KM01: adres wsparcia to znacznik', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('wiersz kontaktu się nie renderuje, prywatność zostaje', () => {
    expect(SUPPORT_EMAIL).toMatch(/^\[DO USTALENIA/);
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => {
      tree = renderer.create(<StudioEcosystemSection />);
    });
    expect(tree!.root.findAllByProps({ testID: 'settings-contact-link' })).toHaveLength(0);
    expect(tree!.root.findAllByProps({ testID: 'settings-privacy-link' }).length).toBeGreaterThan(0);
    act(() => tree!.unmount());
  });

  it('napiszDoAutora ze znacznikiem nie woła composeAsync ani openURL', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await napiszDoAutora();
    expect(MailComposer.isAvailableAsync).not.toHaveBeenCalled();
    expect(MailComposer.composeAsync).not.toHaveBeenCalled();
    expect(openURL).not.toHaveBeenCalled();
  });
});
