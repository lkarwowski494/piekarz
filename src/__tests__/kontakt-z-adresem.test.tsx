/**
 * BR-OPIN-003 (DEC-13 a): przy prawdziwym adresie wsparcia „Napisz do nas” otwiera systemowe okno poczty
 * z adresem, tematem i treścią do zmiany przed wysłaniem (KM02); bez skonfigurowanej poczty pokazuje adres
 * do skopiowania, bez mailto i bez sieci (KM03); zamknięcie okna bez wysyłania nic nie robi (KM04)
 * [M1-audytor-generalny-083; 11-wzrost-005].
 */
jest.mock('../lib/links', () => ({
  ...jest.requireActual('../lib/links'),
  SUPPORT_EMAIL: 'pomoc@example.com',
}));
jest.mock('expo-mail-composer', () => ({
  isAvailableAsync: jest.fn(async () => true),
  composeAsync: jest.fn(async () => ({ status: 'sent' })),
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.0.0', ios: { buildNumber: '1014' } } },
}));

import React from 'react';
import { Alert, AlertButton, Linking } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as MailComposer from 'expo-mail-composer';
import * as Clipboard from 'expo-clipboard';
import { StudioEcosystemSection } from '../components/settings/StudioEcosystemSection';

const mail = MailComposer as jest.Mocked<typeof MailComposer>;

async function pressContact(): Promise<void> {
  let tree: renderer.ReactTestRenderer | null = null;
  act(() => {
    tree = renderer.create(<StudioEcosystemSection />);
  });
  const row = tree!.root.findByProps({ testID: 'settings-contact-link' });
  expect(row.props.accessibilityLabel).toBe('Napisz do nas');
  await act(async () => {
    row.props.onPress();
    for (let i = 0; i < 10; i++) await Promise.resolve();
  });
  act(() => tree!.unmount());
}

describe('Ustawienia: „Napisz do nas” z adresem wsparcia', () => {
  let alert: jest.SpyInstance;
  let openURL: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    mail.isAvailableAsync.mockResolvedValue(true);
    mail.composeAsync.mockResolvedValue({ status: 'sent' } as never);
    alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('KM02: poczta dostępna — composeAsync z adresem, tematem i treścią, bez HTML', async () => {
    await pressContact();
    expect(mail.composeAsync).toHaveBeenCalledTimes(1);
    const opcje = mail.composeAsync.mock.calls[0][0];
    expect(opcje.recipients).toEqual(['pomoc@example.com']);
    expect(opcje.isHtml).toBe(false);
    expect(opcje.subject).toBe('Piekarz (Crust) 1.0.0 — wiadomość do autora');
    expect(opcje.body).toContain('Wersja aplikacji: 1.0.0 (1014)');
    expect(opcje.body).toContain('iOS: ');
    expect(opcje.body).not.toMatch(/null|undefined|bake_/);
    expect(openURL).not.toHaveBeenCalled();
  });

  it('KM04: zamknięcie okna bez wysyłania — brak komunikatu i ponowienia', async () => {
    mail.composeAsync.mockResolvedValue({ status: 'cancelled' } as never);
    await pressContact();
    expect(mail.composeAsync).toHaveBeenCalledTimes(1);
    expect(alert).not.toHaveBeenCalled();
  });

  it('KM03: poczta nieskonfigurowana — okno z adresem do skopiowania, bez composeAsync i bez mailto', async () => {
    mail.isAvailableAsync.mockResolvedValue(false);
    await pressContact();
    expect(mail.composeAsync).not.toHaveBeenCalled();
    expect(openURL).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledTimes(1);
    const [tytul, tresc, przyciski] = alert.mock.calls[0] as [string, string, AlertButton[]];
    expect(tytul).toBe('Napisz do nas');
    expect(tresc).toContain('pomoc@example.com');
    const kopiuj = przyciski.find((b) => b.text === 'Kopiuj adres');
    expect(kopiuj).toBeDefined();
    kopiuj!.onPress?.();
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('pomoc@example.com');
  });
});
