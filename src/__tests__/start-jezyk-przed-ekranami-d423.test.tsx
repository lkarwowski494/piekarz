/**
 * Start aplikacji: drzewo ekranów rysuje się dopiero po `initLanguage()` (KO-070, D-419, D-423). Ekrany zamontowane przed
 * ustawieniem języka z zapisu miały pierwszy render w języku źródłowym (pl), czyli ze stylami z krojem Sofia także dla
 * ru/uk (bułgarskie formy) i vi/ja/ko/zh-Hant (brak glifów). Test: pierwszy render ekranów widzi już język z zapisu.
 */
import type renderer from 'react-test-renderer';

const flush = async () => {
  for (let i = 0; i < 30; i++) await new Promise((r) => setImmediate(r));
};

function uruchom(docelowy: string) {
  jest.resetModules();
  let zwolnij!: () => void;
  const brama = new Promise<void>((r) => (zwolnij = r));
  const i18n = jest.requireActual('../lib/i18n') as typeof import('../lib/i18n');
  jest.doMock('../lib/startup-guard', () => ({
    ...jest.requireActual('../lib/startup-guard'),
    beginStartup: jest.fn(async () => ({ rescue: false })),
    markStartupSucceeded: jest.fn(async () => undefined),
  }));
  jest.doMock('../data/sqlite-store', () => ({
    ...jest.requireActual('../data/sqlite-store'),
    initDatabase: jest.fn(async () => require('../data/storage-status').markStorageReady()),
  }));
  const initLanguage = jest.fn(async () => {
    await brama;
    require('../lib/i18n').setLang(docelowy);
  });
  jest.doMock('../lib/i18n', () => ({ ...jest.requireActual('../lib/i18n'), initLanguage }));
  jest.doMock('../lib/unit-converter', () => ({ ...jest.requireActual('../lib/unit-converter'), initUnitSystem: jest.fn(async () => 'metric') }));
  jest.doMock('../lib/platnosci/stan', () => ({ ...jest.requireActual('../lib/platnosci/stan'), uruchomPlatnosci: () => () => undefined }));
  jest.doMock('../lib/notifications', () => ({ ...jest.requireActual('../lib/notifications'), resyncNotifications: jest.fn(async () => ({ status: 'granted', ok: true })) }));
  const pierwszy: { jezyk?: string; kroj?: string | undefined; rendery: number } = { rendery: 0 };
  jest.doMock('../components/AppAccessProvider', () => ({
    AppAccessProvider: ({ children }: { children: unknown }) => {
      const m = require('../lib/i18n') as typeof import('../lib/i18n');
      if (pierwszy.rendery === 0) {
        pierwszy.jezyk = m.lang();
        pierwszy.kroj = (require('../ui/theme') as typeof import('../ui/theme')).theme.typography.krojTytulow;
      }
      pierwszy.rendery += 1;
      return children;
    },
  }));
  void i18n;
  return {
    Layout: (require('../../app/_layout') as { default: React.ComponentType }).default,
    React: require('react') as typeof import('react'),
    TR: require('react-test-renderer') as typeof import('react-test-renderer'),
    typografia: (require('../ui/tokeny') as typeof import('../ui/tokeny')).typografia,
    pierwszy, zwolnij, initLanguage,
  };
}

afterEach(() => {
  for (const m of ['../lib/startup-guard', '../data/sqlite-store', '../lib/i18n', '../lib/unit-converter', '../lib/platnosci/stan', '../lib/notifications', '../components/AppAccessProvider']) jest.dontMock(m);
  jest.restoreAllMocks();
});

describe('start: ekrany po initLanguage (D-423)', () => {
  it.each(['ru', 'uk', 'vi', 'ja', 'ko', 'zh-Hant'])('język z zapisu %s: pierwszy render ekranów ma ten język i krój systemowy', async (docelowy) => {
    const m = uruchom(docelowy);
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    // baza gotowa, język jeszcze nie: żaden ekran nie jest narysowany
    expect(m.initLanguage).toHaveBeenCalled();
    expect(m.pierwszy.rendery).toBe(0);
    expect(tree.root.findAll((n) => n.props?.testID === 'start-kamien-milowy')).toHaveLength(0);
    await m.TR.act(async () => {
      m.zwolnij();
      await flush();
    });
    expect(m.pierwszy.rendery).toBeGreaterThan(0);
    expect(m.pierwszy.jezyk).toBe(docelowy);
    expect(m.pierwszy.kroj).toBeUndefined();
    m.TR.act(() => tree.unmount());
  });

  it('język z zapisu pl: po initLanguage ekrany mają krój Sofia', async () => {
    const m = uruchom('pl');
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
      m.zwolnij();
      await flush();
    });
    expect(m.pierwszy.kroj).toBe(m.typografia.krojTytulow);
    m.TR.act(() => tree.unmount());
  });
});
