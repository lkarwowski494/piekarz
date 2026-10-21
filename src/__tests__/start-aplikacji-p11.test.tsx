/**
 * Start aplikacji (app/_layout.tsx): ponowienie po błędzie bazy, kamień milowy strażnika startu i tryb awaryjny.
 * [M1-audytor-generalny-205; 05-architekt-601] „Spróbuj ponownie” na ekranie błędu bazy trzyma bramkę „initializing”
 * do końca initDatabase (kopia, migracje), więc ekrany nie czytają bazy w trakcie migracji.
 */
import type renderer from 'react-test-renderer';

type Odroczone = { promise: Promise<void>; resolve: () => void };
const odroczone = (): Odroczone => {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
};
const flush = async () => {
  for (let i = 0; i < 30; i++) await new Promise((r) => setImmediate(r));
};

/** RootLayout z kontrolowanym startem bazy; reszta startu (język, jednostki, płatności, powiadomienia) jako szpiedzy. */
function uruchom(opcje: { rescue?: boolean; init?: () => Promise<void> } = {}) {
  jest.resetModules();
  const init = jest.fn(opcje.init ?? (async () => require('../data/storage-status').markStorageReady()));
  const guard = { beginStartup: jest.fn(async () => ({ rescue: !!opcje.rescue })), markStartupSucceeded: jest.fn(async () => undefined) };
  jest.doMock('../lib/startup-guard', () => ({ ...jest.requireActual('../lib/startup-guard'), ...guard }));
  jest.doMock('../data/sqlite-store', () => ({ ...jest.requireActual('../data/sqlite-store'), initDatabase: init }));
  const lang = jest.fn(async () => undefined);
  const units = jest.fn(async () => 'metric');
  jest.doMock('../lib/i18n', () => ({ ...jest.requireActual('../lib/i18n'), initLanguage: lang }));
  jest.doMock('../lib/unit-converter', () => ({ ...jest.requireActual('../lib/unit-converter'), initUnitSystem: units }));
  jest.doMock('../lib/platnosci/stan', () => ({ ...jest.requireActual('../lib/platnosci/stan'), uruchomPlatnosci: () => () => undefined }));
  const resync = jest.fn(async () => ({ status: 'granted', ok: true }));
  jest.doMock('../lib/notifications', () => ({ ...jest.requireActual('../lib/notifications'), resyncNotifications: resync }));
  // Ekrany danych za bramką: licznik renderów zastępuje zapytania ekranów
  const ekrany = { rendery: 0 };
  jest.doMock('../components/AppAccessProvider', () => ({
    AppAccessProvider: ({ children }: { children: unknown }) => {
      ekrany.rendery += 1;
      return children;
    },
  }));
  const RN = require('react-native') as typeof import('react-native');
  const appState: Array<(s: string) => void> = [];
  jest.spyOn(RN.AppState, 'addEventListener').mockImplementation(((_t: string, fn: (s: string) => void) => {
    appState.push(fn);
    return { remove: () => appState.splice(appState.indexOf(fn), 1) };
  }) as never);
  return {
    Layout: (require('../../app/_layout') as { default: React.ComponentType }).default,
    React: require('react') as typeof import('react'),
    TR: require('react-test-renderer') as typeof import('react-test-renderer'),
    status: require('../data/storage-status') as typeof import('../data/storage-status'),
    init, guard, lang, units, resync, ekrany, appState,
  };
}

afterEach(() => {
  for (const m of ['../lib/startup-guard', '../data/sqlite-store', '../lib/i18n', '../lib/unit-converter', '../lib/platnosci/stan', '../lib/notifications', '../components/AppAccessProvider']) jest.dontMock(m);
  jest.restoreAllMocks();
});

// [M1-audytor-generalny-140; 12-niezawodnosc-504] Kamień milowy strażnika startu: pierwszy ekran po bazie (onLayout),
// nie timer 5 s; „Spróbuj ponownie” w trybie awaryjnym robi pełny start i nie zeruje licznika przed kamieniem.
describe('140: strażnik startu — wektory wzorca roli 12 (próg 2)', () => {
  const plik = 'file:///mock/documents/.piekarz/start-guard.json';
  const pliki = () => (require('expo-file-system/legacy') as { __mockFiles: Map<string, string> }).__mockFiles;
  beforeEach(() => {
    jest.resetModules();
    pliki().clear();
  });
  const g = () => require('../lib/startup-guard') as typeof import('../lib/startup-guard');

  it('pierwszy start i start po udanym → normalny; jeden bez kamienia → normalny; drugi z rzędu → awaryjny', async () => {
    expect((await g().beginStartup()).rescue).toBe(false);
    await g().markStartupSucceeded();
    expect((await g().beginStartup()).rescue).toBe(false); // po udanym
    expect((await g().beginStartup()).rescue).toBe(false); // jeden bez kamienia
    expect((await g().beginStartup()).rescue).toBe(true); // drugi z rzędu bez kamienia
  });

  it('start awaryjny i jego ekran → licznik bez zmian, kolejny start znów awaryjny', async () => {
    await g().beginStartup();
    await g().beginStartup();
    expect((await g().beginStartup()).rescue).toBe(true);
    const licznik = pliki().get(plik);
    expect((await g().beginStartup()).rescue).toBe(true);
    expect(pliki().get(plik)).toBe(licznik);
  });

  it('„spróbuj normalnie” bez kamienia → awaryjny; z kamieniem → licznik 0; zły zapis → stan początkowy', async () => {
    await g().beginStartup();
    await g().beginStartup();
    expect((await g().beginStartup()).rescue).toBe(true);
    // „Spróbuj ponownie” niczego nie zapisuje; próba bez kamienia → następny start awaryjny
    expect((await g().beginStartup()).rescue).toBe(true);
    await g().markStartupSucceeded();
    expect(JSON.parse(String(pliki().get(plik)))).toEqual({ failedStarts: 0 });
    for (const zly of ['{"x":1}', 'nie-json', 'null']) {
      pliki().set(plik, zly);
      expect((await g().beginStartup()).rescue).toBe(false);
    }
  });
});

describe('140: kamień milowy w RootLayout', () => {
  afterEach(() => jest.useRealTimers());

  it('start bez narysowanego pierwszego ekranu nie zeruje licznika, także po 60 s; narysowany ekran zeruje od razu', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'clearImmediate', 'queueMicrotask'] });
    const m = uruchom();
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    await m.TR.act(async () => {
      jest.advanceTimersByTime(60_000);
      await flush();
    });
    expect(m.guard.markStartupSucceeded).not.toHaveBeenCalled();
    const kamien = tree.root.findAll((n) => n.props?.testID === 'start-kamien-milowy' && typeof n.props.onLayout === 'function');
    expect(kamien.length).toBeGreaterThan(0);
    await m.TR.act(async () => {
      kamien[0].props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 844 } } });
      kamien[0].props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 844 } } });
      await flush();
    });
    expect(m.guard.markStartupSucceeded).toHaveBeenCalledTimes(1);
    m.TR.act(() => tree.unmount());
  });

  it('„Spróbuj ponownie” w trybie awaryjnym: pełny start (baza, język, jednostki) bez zerowania licznika przed kamieniem', async () => {
    const m = uruchom({ rescue: true });
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    await m.TR.act(async () => {
      await tree.root.findByProps({ testID: 'rescue-retry' }).props.onPress();
      await flush();
    });
    expect(m.init).toHaveBeenCalledTimes(1);
    expect(m.lang).toHaveBeenCalledTimes(1);
    expect(m.units).toHaveBeenCalledTimes(1);
    expect(m.guard.markStartupSucceeded).not.toHaveBeenCalled();
    m.TR.act(() => tree.unmount());
  });
});

// [M1-audytor-generalny-215;12-niezawodnosc-604] Tryb awaryjny nie dotyka bazy: powrót na pierwszy plan
// nie uzgadnia powiadomień (to uzgodnienie czyta sesję wypieku i zakwasy z bazy)
describe('215: tryb awaryjny bez uzgadniania powiadomień przy powrocie na pierwszy plan', () => {
  it('RootLayout w trybie awaryjnym: zdarzenie „active” nie wywołuje resyncNotifications ani initDatabase', async () => {
    const m = uruchom({ rescue: true });
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    expect(tree.root.findAllByProps({ testID: 'rescue-screen' }).length).toBeGreaterThan(0);
    await m.TR.act(async () => {
      for (const fn of [...m.appState]) fn('active');
      await flush();
    });
    expect(m.resync).not.toHaveBeenCalled();
    expect(m.init).not.toHaveBeenCalled();
    m.TR.act(() => tree.unmount());
  });

  it('zwykły start: zdarzenie „active” nadal uzgadnia powiadomienia', async () => {
    const m = uruchom();
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    const przed = m.resync.mock.calls.length;
    await m.TR.act(async () => {
      for (const fn of [...m.appState]) fn('active');
      await flush();
    });
    expect(m.resync.mock.calls.length).toBe(przed + 1);
    m.TR.act(() => tree.unmount());
  });
});

describe('205:„Spróbuj ponownie” na ekranie błędu bazy czeka na koniec initDatabase', () => {
  it('po markStorageUnavailable i ponowieniu stan „initializing” do końca initDatabase; ekrany za bramką nie renderują się w trakcie', async () => {
    const m = uruchom();
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    expect(m.status.getStorageState()).toBe('ok');
    // Błąd migracji przy starcie: ekran błędu
    await m.TR.act(async () => {
      m.status.markStorageUnavailable('migration failed');
      await flush();
    });
    expect(tree.root.findAllByProps({ testID: 'storage-retry' }).length).toBeGreaterThan(0);
    // Ponowienie: migracja trwa (initDatabase nie skończył)
    const migracja = odroczone();
    m.init.mockImplementation(async () => {
      await migracja.promise;
      m.status.markStorageReady();
    });
    const renderyPrzed = m.ekrany.rendery;
    await m.TR.act(async () => {
      void tree.root.findAllByProps({ testID: 'storage-retry' })[0].props.onPress();
      await flush();
    });
    expect(m.status.getStorageState()).toBe('initializing');
    expect(tree.root.findAllByProps({ testID: 'storage-initializing' }).length).toBeGreaterThan(0);
    expect(m.ekrany.rendery).toBe(renderyPrzed);
    // Koniec migracji: ekrany wracają
    await m.TR.act(async () => {
      migracja.resolve();
      await flush();
    });
    expect(m.status.getStorageState()).toBe('ok');
    expect(m.ekrany.rendery).toBeGreaterThan(renderyPrzed);
    m.TR.act(() => tree.unmount());
  });
});
