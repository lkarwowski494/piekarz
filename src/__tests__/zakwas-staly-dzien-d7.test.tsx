/**
 * Stały dzień karmienia na karcie zakwasu w lodówce (M3 D7; BR-KAL-010, PR-22; RD-25, RD-31; ZAK-ZAL-012,
 * ZAK-LOD-005; D-114): wybór dnia tygodnia i godziny (±30 min), „Bez stałego dnia”, zapis przez saveStarter (UPSERT,
 * kolumny z D1) i uzgodnienie przypomnień; w trakcie zakładania i przed 7 dniami od założenia — wyjaśnienie zamiast
 * ustawienia; po dokarmieniu w inny dzień pytanie systemowe „zostawić {dzień} czy liczyć od {dzień}” (karta zakwasu
 * i „Zrobione” na „Dziś”).
 */
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
import { Alert, StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, getStarters, saveStarter, deleteStarter, _resetMemStore } from '../data/sqlite-store';
import type { StoredStarter } from '../data/db';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { zapytajOStalyDzien } from '../lib/staly-dzien-pytanie';
import { nazwaDniaTygodnia } from '../lib/kalendarz-widok';
import { STALY_DZIEN_DOMYSLNA_MINUTA } from '../core/kalendarz-config';
import { setLang } from '../lib/i18n';
import { EN } from '../lib/i18n.en';

const D = 86_400_000;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const przycisk = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button');
const host = (root: renderer.ReactTestInstance, testID: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === testID);
const teksty = (root: renderer.ReactTestInstance) => root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');
const nacisnij = async (n: renderer.ReactTestInstance | undefined) => {
  expect(n).toBeDefined();
  await act(async () => n?.props.onPress());
  await flush();
};
const isoDzis = () => new Date().getDay() || 7;
const innyDzien = () => (isoDzis() % 7) + 1;

type Przycisk = { text: string; style?: string; onPress?: () => void };
let alertSpy: jest.SpyInstance;
const ostatniAlert = () => {
  const [tytul, tresc, przyciski] = alertSpy.mock.calls[alertSpy.mock.calls.length - 1] as [string, string | undefined, Przycisk[]];
  return { tytul, tresc, przyciski };
};

const zakwas = (x: Partial<StoredStarter> = {}): StoredStarter => ({
  id: 'z1', name: 'Żytni', flourType: 'Żytnia 2000', hydration: 100, birthDate: Date.now() - 60 * D, storageState: 'FRIDGE', lastFedAt: Date.now() - 3 * D, ...x,
});
const zapisany = async () => (await getStarters()).find((s) => s.id === 'z1');

let tree: renderer.ReactTestRenderer | null = null;
async function render() {
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><ZakwasScreen /></AppAccessProvider>);
  });
  await flush();
  return tree!.root;
}

beforeEach(async () => {
  zUprawnieniem();
  _resetMemStore();
  setLang('pl');
  mockResync.mockClear();
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await initDatabase();
  for (const s of await getStarters()) await deleteStarter(s.id);
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  alertSpy.mockRestore();
});

describe('D7: stały dzień karmienia na karcie zakwasu', () => {
  it('BR-KAL-010 Karmienie w niedziele: wybór niedzieli zapisuje dzień 7 o 10:00, +30 min → 10:30, przypomnienia uzgodnione; „Bez stałego dnia” czyści', async () => {
    await saveStarter(zakwas());
    const root = await render();
    expect(host(root, 'staly-dzien-karta')).toHaveLength(1);
    const dni = [1, 2, 3, 4, 5, 6, 7].map((d) => przycisk(root, `staly-dzien-${d}`));
    expect(dni.map((d) => d.length)).toEqual([1, 1, 1, 1, 1, 1, 1]);
    for (const [d] of dni) expect(Number((StyleSheet.flatten(d.props.style) as { minHeight?: number }).minHeight)).toBeGreaterThanOrEqual(44);
    expect(dni[6][0].props.accessibilityLabel).toBe('niedziela');
    await nacisnij(dni[6][0]);
    expect((await zapisany())?.fridgeFeedDay).toEqual({ weekday: 7, minuteOfDay: STALY_DZIEN_DOMYSLNA_MINUTA });
    expect(przycisk(root, 'staly-dzien-7')[0].props.accessibilityState?.selected).toBe(true);
    expect(teksty(root)).toContain('Karmienie co 7 dni: niedziela, 10:00.');
    expect(mockResync).toHaveBeenCalled();
    await nacisnij(przycisk(root, 'staly-dzien-plus')[0]);
    expect((await zapisany())?.fridgeFeedDay).toEqual({ weekday: 7, minuteOfDay: STALY_DZIEN_DOMYSLNA_MINUTA + 30 });
    await nacisnij(przycisk(root, 'staly-dzien-brak')[0]);
    expect((await zapisany())?.fridgeFeedDay ?? null).toBeNull();
    expect(teksty(root)).toContain('Bez stałego dnia: następne karmienie 7 dni po ostatnim.');
  });

  it('BR-KAL-010 tekst ustawionego dnia przez t() z parametrami: PL i EN (klucz „Karmienie co 7 dni: {dzien}, {h}.”)', async () => {
    expect(EN['Karmienie co 7 dni: {dzien}, {h}.']).toBe('Feeding every 7 days: {dzien}, {h}.');
    await saveStarter(zakwas({ fridgeFeedDay: { weekday: 6, minuteOfDay: 9 * 60 + 30 } }));
    setLang('en');
    const root = await render();
    expect(teksty(root)).toMatch(/Feeding every 7 days: Saturday, 0?9:30\sAM\./);
  });

  it('BR-KAL-010 Zakwas w trakcie zakładania (5. dzień): bez wyboru dnia, wyjaśnienie o lodówce po 7–10 dniach', async () => {
    await saveStarter(zakwas({ setupStartedAt: Date.now() - 4 * D }));
    const root = await render();
    expect(host(root, 'staly-dzien-karta')).toHaveLength(1);
    expect(przycisk(root, 'staly-dzien-7')).toHaveLength(0);
    expect(teksty(root)).toContain('Stały dzień karmienia ustawisz, gdy zakwas będzie gotowy. Zakwas trafia do lodówki dopiero po 7–10 dniach od założenia.');
  });

  it('BR-KAL-010 zakwas na blacie: karty stałego dnia nie ma (ustawienie dotyczy zakwasu w lodówce)', async () => {
    await saveStarter(zakwas({ storageState: 'ROOM_TEMP' }));
    const root = await render();
    expect(host(root, 'staly-dzien-karta')).toHaveLength(0);
  });

  it('BR-KAL-010 Po karmieniu do lodówki: karta mówi, że zakwas wraca do lodówki po 1–2 h w temperaturze pokojowej', async () => {
    await saveStarter(zakwas({ fridgeFeedDay: { weekday: 7, minuteOfDay: 600 } }));
    const root = await render();
    expect(teksty(root)).toContain('Po dokarmieniu zakwas może wrócić do lodówki po 1–2 h w temperaturze pokojowej.');
  });

  it('BR-KAL-010 Karmienie w inny dzień: dokarmienie na karcie pyta „zostawić czy liczyć od”; „Licz od” zapisuje dzień dokarmienia', async () => {
    await saveStarter(zakwas({ fridgeFeedDay: { weekday: innyDzien(), minuteOfDay: 600 } }));
    const root = await render();
    await nacisnij(przycisk(root, 'zakwas-dokarm-btn')[0]);
    const pytanie = alertSpy.mock.calls.find((c) => c[0] === 'Stały dzień karmienia');
    expect(pytanie).toBeDefined();
    const { tresc, przyciski } = ostatniAlert();
    expect(tresc).toBe(`Stały dzień karmienia to ${nazwaDniaTygodnia(innyDzien())}, a zakwas dokarmiono w dniu: ${nazwaDniaTygodnia(isoDzis())}.`);
    expect(przyciski.map((p) => p.text)).toEqual([`Zostaw: ${nazwaDniaTygodnia(innyDzien())}`, `Licz od: ${nazwaDniaTygodnia(isoDzis())}`]);
    await act(async () => przyciski[1].onPress?.());
    await flush();
    expect((await zapisany())?.fridgeFeedDay).toEqual({ weekday: isoDzis(), minuteOfDay: 600 });
  });

  it('BR-KAL-010 Karmienie w inny dzień, „Zostaw”: dzień bez zmian; dokarmienie w stały dzień — bez pytania', async () => {
    await saveStarter(zakwas({ fridgeFeedDay: { weekday: innyDzien(), minuteOfDay: 600 } }));
    const fedAt = Date.now();
    const odp = zapytajOStalyDzien('z1', fedAt);
    await flush();
    expect(alertSpy).toHaveBeenCalledTimes(1);
    const { przyciski } = ostatniAlert();
    await act(async () => przyciski[0].onPress?.());
    await expect(odp).resolves.toBe('zostaw');
    expect((await zapisany())?.fridgeFeedDay).toEqual({ weekday: innyDzien(), minuteOfDay: 600 });
    alertSpy.mockClear();
    await saveStarter(zakwas({ fridgeFeedDay: { weekday: isoDzis(), minuteOfDay: 600 } }));
    await expect(zapytajOStalyDzien('z1', fedAt)).resolves.toBeNull();
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
