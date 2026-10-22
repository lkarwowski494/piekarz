/**
 * Komunikat gratulacji po zakończeniu zakładania pierwszego zakwasu [M3 P-b, D-117] (kontrakt docs/monetyzacja.md:
 * BR-ZAKW-005 „na końcu «Gratulacje, Twój pierwszy zakwas jest gotowy…»”, W-10; D-113 słowa właściciela): raz, w Basic
 * z neutralną informacją, że przypomnienia o dokarmianiu są w Pro, bez ekranu Pro. Prawdziwa baza SQLite (node:sqlite),
 * render zakładki Zakwasy jak w zakwas-104-ekrany.test.tsx.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('expo-router', () => {
  const push = jest.fn();
  return {
    useRouter: () => ({ push, navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
    Stack: Object.assign(({ children }: { children: unknown }) => children, { Screen: () => null }),
  };
});

import type React from 'react';
import type renderer from 'react-test-renderer';
import { useTempDbDir, restartApp } from '../data/__tests__/helpers/node-sqlite-adapter';
import type { StoredStarter, StoredStarterEntry } from '../data/db';

jest.setTimeout(30000);

const H = 3600_000;
const DAY = 24 * H;
const dobTemu = (n: number) => Date.now() - n * DAY - H;
const starter = (id: string, extra: Partial<StoredStarter> = {}): StoredStarter => ({
  id, name: `Zakwas ${id}`, flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', ...extra,
});
const feed = (id: string, starterId: string, at: number): StoredStarterEntry => ({
  id, starterId, kind: 'feeding', occurredAt: at, signs: [], createdAt: at, updatedAt: at,
});

const GRATULACJE = 'Gratulacje, Twój pierwszy zakwas jest gotowy. Pamiętaj, aby o niego dbać zgodnie z zasadami.';
const W_PRO = 'Przypomnienia o dokarmianiu są w Piekarz Pro.';

type Tree = renderer.ReactTestRenderer;

/** Zakwas w zakładaniu, dzień 7, dokarmiony 7 h temu; render zakładki Zakwasy z Pro albo bez. */
async function start(pro: boolean, przedtem?: (app: ReturnType<typeof restartApp>) => Promise<void>) {
  const app = restartApp();
  await app.schema.initDatabase();
  const entries = require('../data/starter-entries-store') as typeof import('../data/starter-entries-store');
  await app.store.deleteStarter('starter_default');
  await entries.createStarterWithEntry(starter('z', { setupStartedAt: dobTemu(6) }), feed('f1', 'z', Date.now() - 7 * H));
  if (przedtem) await przedtem(app);
  const platnosci = require('../../tests/helpers/platnosci') as typeof import('../../tests/helpers/platnosci');
  if (pro) platnosci.zUprawnieniem();
  else platnosci.bezUprawnienia();
  const R: typeof React = require('react');
  const TR: typeof renderer = require('react-test-renderer');
  const RN: typeof import('react-native') = require('react-native');
  const alert = jest.spyOn(RN.Alert, 'alert').mockImplementation(() => {});
  const { AppAccessProvider } = require('../components/AppAccessProvider') as typeof import('../components/AppAccessProvider');
  const { PaywallModal } = require('../components/PaywallModal') as typeof import('../components/PaywallModal');
  const Ekran = require('../../app/(tabs)/zakwasy/index').default as React.ComponentType;
  const flush = async () => {
    await TR.act(async () => {
      for (let i = 0; i < 40; i++) await Promise.resolve();
    });
  };
  const mount = async () => {
    let t: Tree | null = null;
    await TR.act(async () => {
      t = TR.create(R.createElement(AppAccessProvider, null, R.createElement(Ekran)));
    });
    await flush();
    return t as unknown as Tree;
  };
  const tree = await mount();
  const tekst = (t: Tree) =>
    t.root.findAllByType(RN.Text).map((n) => [n.props.children].flat().filter((c) => typeof c === 'string').join('')).join(' | ');
  const press = async (t: Tree, testID: string) => {
    const all = t.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
    expect({ testID, found: all.length > 0 }).toEqual({ testID, found: true });
    await TR.act(async () => {
      await all[all.length - 1].props.onPress();
    });
    await flush();
  };
  const ekranPro = (t: Tree) => t.root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
  /** „Podwoił objętość” w dniu 7 kończy zakładanie (BR-ZAKW-005 Gotowy). */
  const gotowy = async (t: Tree) => {
    await press(t, 'zakladanie-objaw-doubled');
    await press(t, 'zakladanie-zapisz-btn');
  };
  const done = (...trees: Tree[]) => {
    for (const t of trees) TR.act(() => t.unmount());
    alert.mockRestore();
  };
  return { app, tree, tekst, press, gotowy, ekranPro, mount, done, t: (k: string) => (require('../lib/i18n') as typeof import('../lib/i18n')).t(k) };
}

describe('gratulacje po założeniu pierwszego zakwasu (BR-ZAKW-005 Gotowy, W-10; D-113)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('Basic: gratulacje i neutralna informacja o przypomnieniach w Pro, bez ekranu Pro; po powrocie na ekran już nie', async () => {
    const s = await start(false);
    await s.gotowy(s.tree);
    expect(s.tekst(s.tree)).toContain(s.t(GRATULACJE));
    expect(s.tekst(s.tree)).toContain(s.t(W_PRO));
    expect(s.ekranPro(s.tree)).toBe(false);
    s.done(s.tree);
    const drugi = await s.mount();
    expect(s.tekst(drugi)).not.toContain(s.t(GRATULACJE));
    s.done(drugi);
  });

  it('Pro: gratulacje bez zdania o Pro', async () => {
    const s = await start(true);
    await s.gotowy(s.tree);
    expect(s.tekst(s.tree)).toContain(s.t(GRATULACJE));
    expect(s.tekst(s.tree)).not.toContain(s.t(W_PRO));
    s.done(s.tree);
  });

  it('raz: po pokazanych gratulacjach kolejne zakończone zakładanie ich nie pokazuje', async () => {
    const s = await start(false, async (app) => {
      const { setAppSetting } = require('../data/settings-store') as typeof import('../data/settings-store');
      void app;
      await setAppSetting('gratulacje_pierwszego_zakwasu', '1');
    });
    await s.gotowy(s.tree);
    expect(s.tekst(s.tree)).not.toContain(s.t(GRATULACJE));
    s.done(s.tree);
  });
});
