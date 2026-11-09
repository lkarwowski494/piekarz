/**
 * Wiadomość do autora zawiera numer buildu [M1-audytor-generalny-031; 12-niezawodnosc-002, wariant b]: numer z
 * EXPO_PUBLIC_BUILD_NUMBER (workflow TestFlight ustawia go przed archiwum, Metro wstawia go przy budowaniu), bo app.json
 * celowo nie ma ios.buildNumber. Atrapa expo-constants bez numeru — jak w prawdziwym buildzie.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

jest.mock('expo-mail-composer', () => ({ isAvailableAsync: jest.fn(async () => true), composeAsync: jest.fn(async () => ({ status: 'sent' })) }));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { version: '1.0.0', ios: {} } } }));

import * as MailComposer from 'expo-mail-composer';
import { napiszDoAutora } from '../lib/zgloszenie-wyslanie';

describe('M1-audytor-generalny-031: numer buildu w zgłoszeniu', () => {
  const przed = process.env.EXPO_PUBLIC_BUILD_NUMBER;
  afterEach(() => {
    if (przed === undefined) delete process.env.EXPO_PUBLIC_BUILD_NUMBER;
    else process.env.EXPO_PUBLIC_BUILD_NUMBER = przed;
  });

  it('treść zgłoszenia ma numer buildu z EXPO_PUBLIC_BUILD_NUMBER', async () => {
    process.env.EXPO_PUBLIC_BUILD_NUMBER = '1023';
    await napiszDoAutora();
    const arg = jest.mocked(MailComposer.composeAsync).mock.calls.at(-1)?.[0];
    expect(`${arg?.subject ?? ''} ${arg?.body ?? ''}`).toContain('1.0.0 (1023)');
  });

  it('workflow TestFlight ustawia EXPO_PUBLIC_BUILD_NUMBER przed krokiem archiwum', () => {
    const wf = fs.readFileSync(path.join(__dirname, '../../.github/workflows/testflight.yml'), 'utf8');
    const ustawienie = wf.indexOf('EXPO_PUBLIC_BUILD_NUMBER=$BUILD_NUMBER');
    expect(ustawienie).toBeGreaterThan(-1);
    expect(ustawienie).toBeLessThan(wf.indexOf('xcodebuild archive'));
  });
});
