/**
 * „Dodaj do kalendarza” przy planie wypieku (M3 D8; BR-KAL-011; makieta roli 04 a2 „1.1 f”): w Harmonogramie i w arkuszu
 * zaplanowanego wypieku; plik .ics przez arkusz udostępniania bez prośby o dostęp do kalendarza (OG-08); po zmianie
 * planu informacja, że wydarzenie w kalendarzu telefonu się nie zmieniło; błąd udostępniania z komunikatem.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn() }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
  useLocalSearchParams: () => ({}),
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { ArkuszPlanu } from '../components/start/ArkuszPlanu';
import type { PlannedBake } from '../data/bake-sessions-store';
import { initDatabase, setActiveBake, _resetMemStore, getStarters, deleteStarter } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ustawGodzinePlanu } from '../../tests/helpers/plan-godzina';
import { setLang } from '../lib/i18n';
import { ustawDzienGotowe } from '../lib/plan-receptury';

const mockFiles: Map<string, string> = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const przycisk = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button');
const host = (root: renderer.ReactTestInstance, testID: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === testID);
const czekaj = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
async function renderHarmonogram(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<HarmonogramScreen />);
  });
  await czekaj();
  return tree!;
}

let alertSpy: jest.SpyInstance;
beforeEach(async () => {
  zUprawnieniem();
  useTempDbDir();
  _resetMemStore();
  setActiveBake(null);
  setLang('pl');
  ustawDzienGotowe(null);
  mockFiles.clear();
  jest.clearAllMocks();
  (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
  (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await initDatabase();
  await saveBakeSession(null);
  for (const s of await getStarters()) await deleteStarter(s.id);
});
afterEach(() => alertSpy.mockRestore());

describe('BR-KAL-011 Harmonogram: Dodaj do kalendarza', () => {
  it('BR-KAL-011 Dodanie bez dostępu do kalendarza: przycisk otwiera arkusz z plikiem .ics planu, wyjaśnienie pod przyciskiem', async () => {
    const harm = await renderHarmonogram();
    const [btn] = przycisk(harm.root, 'plan-kalendarz-btn');
    expect(btn).toBeDefined();
    expect(textOf(harm.root.findByProps({ testID: 'plan-kalendarz-opis' }))).toContain('Piekarz nie dostaje dostępu do Twojego kalendarza');
    await act(async () => {
      btn.props.onPress();
    });
    await czekaj();
    expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
    expect((Sharing.shareAsync as jest.Mock).mock.calls[0][1]).toMatchObject({ mimeType: 'text/calendar' });
    const [plik] = [...mockFiles.entries()].filter(([k]) => k.endsWith('.ics'));
    expect(plik?.[1]).toMatch(/^BEGIN:VCALENDAR\r\n[\s\S]*DTSTART:\d{8}T\d{6}Z\r\n[\s\S]*END:VCALENDAR\r\n$/);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('BR-KAL-011 Zmiana planu po dodaniu: po przesunięciu godziny pojawia się informacja, że wydarzenie się nie zmieniło', async () => {
    const harm = await renderHarmonogram();
    expect(host(harm.root, 'plan-kalendarz-nie-zmienil')).toHaveLength(0);
    await act(async () => {
      przycisk(harm.root, 'plan-kalendarz-btn')[0].props.onPress();
    });
    await czekaj();
    expect(host(harm.root, 'plan-kalendarz-nie-zmienil')).toHaveLength(0); // plan taki sam jak dodany
    await ustawGodzinePlanu(harm.root, 'Pojutrze', 12, 0);
    await czekaj();
    const info = host(harm.root, 'plan-kalendarz-nie-zmienil');
    expect(info).toHaveLength(1);
    expect(textOf(info[0])).toContain('Wydarzenie w kalendarzu telefonu się nie zmieniło');
  });

  it('BR-KAL-011 bez dodania przesunięcie planu nie pokazuje informacji o wydarzeniu', async () => {
    const harm = await renderHarmonogram();
    await ustawGodzinePlanu(harm.root, 'Pojutrze', 12, 0);
    await czekaj();
    expect(host(harm.root, 'plan-kalendarz-nie-zmienil')).toHaveLength(0);
  });

  it('BR-KAL-011 brak udostępniania: komunikat „Nie dodano do kalendarza”, bez cichej porażki', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);
    const harm = await renderHarmonogram();
    await act(async () => {
      przycisk(harm.root, 'plan-kalendarz-btn')[0].props.onPress();
    });
    await czekaj();
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy.mock.calls[0][0]).toBe('Nie dodano do kalendarza');
    expect(host(harm.root, 'plan-kalendarz-nie-zmienil')).toHaveLength(0); // nic nie dodano
  });
});

describe('BR-KAL-011 arkusz zaplanowanego wypieku: Dodaj do kalendarza', () => {
  const plan: PlannedBake = {
    version: 1, id: 'bake_sob', recipeName: 'Wiejski chleb', plannedStartAt: Date.UTC(2026, 9, 31, 8),
    steps: [
      { id: 'mix', name: 'Mieszanie', category: 'mix', durationMin: 30, isPassive: false, instructions: '', plannedStart: Date.UTC(2026, 9, 31, 8), plannedEnd: Date.UTC(2026, 9, 31, 8, 30) },
      { id: 'bake', name: 'Pieczenie', category: 'bake', durationMin: 45, isPassive: false, instructions: '', plannedStart: Date.UTC(2026, 10, 1, 7), plannedEnd: Date.UTC(2026, 10, 1, 7, 45) },
    ],
  };
  const arkusz = async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<ArkuszPlanu plan={plan} teraz={Date.UTC(2026, 9, 22)} onZacznij={jest.fn()} onUsun={jest.fn()} onClose={jest.fn()} />);
    });
    return tree!;
  };

  it('BR-KAL-011 przycisk w arkuszu planu wysyła plik z UID zapisanego wypieku', async () => {
    const a = await arkusz();
    await act(async () => {
      przycisk(a.root, 'plan-kalendarz-btn')[0].props.onPress();
    });
    await czekaj();
    expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
    const [plik] = [...mockFiles.entries()].filter(([k]) => k.endsWith('.ics'));
    expect(plik?.[1]).toContain('UID:bake_sob@piekarz');
    expect(plik?.[1]).toContain('DTSTART:20261031T080000Z');
    expect(plik?.[1]).toContain('DTEND:20261101T074500Z');
  });
});
