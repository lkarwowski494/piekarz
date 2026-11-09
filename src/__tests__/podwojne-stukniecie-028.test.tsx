/**
 * Dwa szybkie stuknięcia w akcję zapisu karty zakwasu zapisują jeden wpis [M1-audytor-generalny-028; 08-programista-006]:
 * „Zapisz dokarmienie”, „Podwoił objętość” i dodanie zakwasu mają blokadę w trakcie zapisu (wzór useFinishBake).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { initDatabase, saveStarter, _resetMemStore, deleteStarter, getStarters } from '../data/sqlite-store';
import { getAllStarterEntries } from '../data/starter-entries-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(20000);
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return { SafeAreaView: ({ children, style }: { children: unknown; style: unknown }) => R.createElement('View', { style }, children), useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }) };
});
jest.mock('../lib/pdf-sheet-generator', () => ({ exportStarterLabelAsPdf: jest.fn(), printStarterLabelDirectly: jest.fn() }));

function tekst(n: unknown): string {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(tekst).join('');
  const o = n as { props?: { children?: unknown } } | null;
  return o?.props?.children !== undefined ? tekst(o.props.children) : '';
}
const przycisk = (root: renderer.ReactTestInstance, napis: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && tekst(n).includes(napis))[0];

describe('M1-audytor-generalny-028: blokada podwójnego zapisu na karcie zakwasu', () => {
  let zegar = 1_800_000_000_000;
  beforeEach(async () => {
    zUprawnieniem();
    jest.spyOn(Date, 'now').mockImplementation(() => (zegar += 1000)); // każde stuknięcie w innej chwili
    _resetMemStore();
    await initDatabase();
    for (const s of await getStarters()) await deleteStarter(s.id);
    await saveStarter({ id: 'z1', name: 'Żytni', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP' });
  });
  afterEach(() => jest.restoreAllMocks());

  it.each(['Zapisz dokarmienie', 'Podwoił objętość'])('dwa stuknięcia „%s” bez czekania → jeden nowy wpis', async (napis) => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ZakwasScreen />);
    });
    const przed = (await getAllStarterEntries()).length;
    const p = przycisk(tree.root, napis);
    expect(p).toBeDefined();
    await act(async () => {
      p.props.onPress();
      p.props.onPress();
      for (let i = 0; i < 30; i++) await Promise.resolve();
    });
    expect((await getAllStarterEntries()).length).toBe(przed + 1);
    act(() => tree.unmount());
  });
});
