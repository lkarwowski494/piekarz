/**
 * D3a: część BR-DIAG-003 i BR-DIAG-004 dotycząca prowadzenia (F-71, D-096): cztery protokoły na ekranie Doktora,
 * powrót do prowadzenia bez zmian kroku, zegara i powiadomień, dostęp jak Doktor dla bochenka z ostrzeżeniami
 * nieukrytymi za ofertą w trakcie wypieku zaczętego z dostępem (D-039 pkt 3), etykiety VoiceOver zdań protokołu.
 * Zrzuty w skali szarości to praca roli 04 [M3 D3a].
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
const mockResync = jest.fn(() => Promise.resolve({ status: 'granted', ok: true }));
jest.mock('../lib/notifications', () => ({ ...jest.requireActual('../lib/notifications'), resyncNotifications: () => mockResync() }));

import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import DoctorScreen from '../../app/doktor';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, setActiveBake } from '../data/sqlite-store';
import { saveBakeSession, loadBakeSession } from '../data/bake-session-store';
import { zacznijWypiekBezReceptury } from '../../tests/helpers/wypiek';
import { zUprawnieniem, bezUprawnienia } from '../../tests/helpers/platnosci';
import { DOUGH_RECOVERY_PROTOCOLS } from '../doctor/dough-recovery';
import { setLang } from '../lib/i18n';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree!;
}
const chip = (root: renderer.ReactTestInstance, id: string) =>
  root.findAll((n) => n.props.testID === `recovery-chip-${id}` && typeof n.props.onPress === 'function')[0];
/** Czy element leży w zablokowanej treści (BlokadaFunkcji: dotknięcie otwiera ofertę zamiast akcji). */
const zablokowany = (n: renderer.ReactTestInstance | null): boolean =>
  n === null ? false : (typeof n.props?.testID === 'string' && /^blokada-.*-tresc$/.test(n.props.testID)) || zablokowany(n.parent);

describe('D3a: ratunek ciasta przy prowadzeniu (BR-DIAG-003, BR-DIAG-004)', () => {
  const now = 1_800_000_000_000;
  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    mockResync.mockClear();
    await initDatabase();
    await saveBakeSession(null);
  });
  afterEach(() => jest.restoreAllMocks());

  it('BR-DIAG-003 Cztery objawy: ekran Doktora przy trwającym wypieku pokazuje cztery protokoły', async () => {
    zUprawnieniem();
    await zacznijWypiekBezReceptury(now, { zaczetyZDostepem: true });
    const tree = await render(<DoctorScreen />);
    const chipy = DOUGH_RECOVERY_PROTOCOLS.map((p) => chip(tree.root, p.id));
    expect(chipy.every(Boolean)).toBe(true);
    expect(chipy.map((c) => c.findAllByType(Text).map((x) => x.props.children).join(''))).toEqual([
      'Przerośnięte ciasto',
      'Zbyt luźne ciasto',
      'Ospała fermentacja (Zimna kuchnia)',
      'Zapomniana sól',
    ]);
    act(() => tree.unmount());
  });

  it('BR-DIAG-003 Powrót do prowadzenia: po protokole ten sam krok, zegar liczył dalej, powiadomienia bez zmian', async () => {
    zUprawnieniem();
    await zacznijWypiekBezReceptury(now, { zaczetyZDostepem: true });
    const stol = await render(<StolnicaScreen />);
    const przed = await loadBakeSession();
    const wywolaniaPrzed = mockResync.mock.calls.length;
    // Doktor otwiera się nad prowadzeniem (stos), Stolnica zostaje zamontowana
    const dok = await render(<DoctorScreen />);
    await act(async () => {
      chip(dok.root, 'FORGOTTEN_SALT').props.onPress();
    });
    act(() => dok.unmount());
    const po = await loadBakeSession();
    expect({ stepIdx: po?.stepIdx, timerEndsAt: po?.timerEndsAt }).toEqual({ stepIdx: przed?.stepIdx, timerEndsAt: przed?.timerEndsAt });
    expect(po?.timerEndsAt).toBeGreaterThan(now); // zegar biegnie od zapisanego końca kroku
    expect(mockResync.mock.calls.length).toBe(wywolaniaPrzed);
    act(() => stol.unmount());
  });

  // Przepisane z wykładni D-104 („Doktor przy wypieku z dostępem”) na Basic/Pro [M3 P-a]: Doktor i protokoły są w Basic
  // (BR-DIAG-001, -003…005; D-112, D-113, D-116), więc otwarte bez Pro — bez wypieku, z wypiekiem zaczętym z Pro i bez niego
  it('BR-DIAG-003 Bez Pro: protokoły otwarte bez wypieku i przy każdym wypieku, z ostrzeżeniem BR-DIAG-004', async () => {
    bezUprawnienia();
    let tree = await render(<DoctorScreen />);
    expect(zablokowany(chip(tree.root, 'FORGOTTEN_SALT'))).toBe(false);
    act(() => tree.unmount());

    await zacznijWypiekBezReceptury(now, { zaczetyZDostepem: true });
    tree = await render(<DoctorScreen />);
    const c = chip(tree.root, 'FORGOTTEN_SALT');
    expect(zablokowany(c)).toBe(false);
    await act(async () => {
      c.props.onPress();
    });
    const karta = tree.root.findByProps({ testID: 'recovery-protocol-card' });
    // M3 T2 (D-123): ostrzeżenie z powodem (bakterie w surowej mące) zamiast atrybucji FDA w zdaniu
    expect(karta.findAllByType(Text).map((x) => [x.props.children].flat().join('')).join(' ')).toMatch(/Nie próbuj ciasta.*surowego ciasta nie je się ani nie próbuje, bo w surowej mące mogą być groźne bakterie/);
    act(() => tree.unmount());

    // Wypiek zaczęty bez Pro (zaczety false): też otwarte
    await saveBakeSession(null);
    await zacznijWypiekBezReceptury(now, { zaczetyZDostepem: false });
    tree = await render(<DoctorScreen />);
    expect(zablokowany(chip(tree.root, 'FORGOTTEN_SALT'))).toBe(false);
    act(() => tree.unmount());
  });

  it('BR-DIAG-004 Ostrzeżenie nie tylko kolorem: akcja natychmiastowa i każdy krok to jeden element VoiceOver z tekstem (numer i zdanie)', async () => {
    zUprawnieniem();
    const tree = await render(<DoctorScreen />);
    await act(async () => {
      chip(tree.root, 'FORGOTTEN_SALT').props.onPress();
    });
    const alert = tree.root.findByProps({ testID: 'recovery-immediate-action' });
    expect(alert.props.accessible).toBe(true);
    const kroki = tree.root.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.startsWith('recovery-step-') && typeof n.type === 'string');
    expect(kroki.length).toBeGreaterThan(0);
    expect(kroki.every((k) => k.props.accessible === true)).toBe(true);
    const pierwszy = kroki[0].findAllByType(Text).map((x) => [x.props.children].flat().join('')).join(' ');
    expect(pierwszy).toMatch(/^1 Nie próbuj ciasta.*bo w surowej mące mogą być groźne bakterie\.$/); // M3 T2 (D-123)
    act(() => tree.unmount());
  });
});
