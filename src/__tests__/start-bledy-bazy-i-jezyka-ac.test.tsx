/**
 * Start aplikacji po błędach (KO-071, recenzja AB-01/AB-06/AB-07, D-424): (1) `initDatabase` rzuca, „Spróbuj ponownie”
 * się udaje: drzewo ekranów musi się narysować, a nie zostać w `start-jezyk-ladowanie` (bramka języka z D-423);
 * (2) `initLanguage` rzuca albo wisi: ekrany rysują się z językiem systemu, bez nieobsłużonego odrzucenia.
 */
import type renderer from 'react-test-renderer';

const flush = async () => {
  for (let i = 0; i < 30; i++) await new Promise((r) => setImmediate(r));
};

type Opcje = {
  initDatabase: () => Promise<void>;
  initLanguage: () => Promise<void>;
  /** Tryb awaryjny (dwa nieudane starty): `beginStartup` zwraca `rescue: true`. */
  rescue?: boolean;
};

function uruchom(o: Opcje) {
  jest.resetModules();
  jest.doMock('../lib/startup-guard', () => ({
    ...jest.requireActual('../lib/startup-guard'),
    beginStartup: jest.fn(async () => ({ rescue: o.rescue === true })),
    markStartupSucceeded: jest.fn(async () => undefined),
  }));
  jest.doMock('../data/sqlite-store', () => ({ ...jest.requireActual('../data/sqlite-store'), initDatabase: jest.fn(o.initDatabase) }));
  const initLanguage = jest.fn(o.initLanguage);
  const ustawJezykSystemu = jest.fn();
  jest.doMock('../lib/i18n', () => ({ ...jest.requireActual('../lib/i18n'), initLanguage, ustawJezykSystemu }));
  const initUnitSystem = jest.fn(async () => 'metric');
  jest.doMock('../lib/unit-converter', () => ({ ...jest.requireActual('../lib/unit-converter'), initUnitSystem }));
  const uruchomPlatnosci = jest.fn(() => () => undefined);
  jest.doMock('../lib/platnosci/stan', () => ({ ...jest.requireActual('../lib/platnosci/stan'), uruchomPlatnosci }));
  jest.doMock('../lib/notifications', () => ({ ...jest.requireActual('../lib/notifications'), resyncNotifications: jest.fn(async () => ({ status: 'granted', ok: true })) }));
  jest.doMock('../components/AppAccessProvider', () => ({ AppAccessProvider: ({ children }: { children: unknown }) => children }));
  return {
    Layout: (require('../../app/_layout') as { default: React.ComponentType }).default,
    React: require('react') as typeof import('react'),
    TR: require('react-test-renderer') as typeof import('react-test-renderer'),
    st: require('../data/storage-status') as typeof import('../data/storage-status'),
    initLanguage, ustawJezykSystemu, initUnitSystem, uruchomPlatnosci,
  };
}

const maTestId = (tree: renderer.ReactTestRenderer, id: string) => tree.root.findAll((n) => n.props?.testID === id).length > 0;
const odrzucenia = jest.fn();

beforeEach(() => {
  odrzucenia.mockClear();
  process.on('unhandledRejection', odrzucenia);
});
afterEach(() => {
  process.off('unhandledRejection', odrzucenia);
  jest.useRealTimers();
  for (const m of ['../lib/startup-guard', '../data/sqlite-store', '../lib/i18n', '../lib/unit-converter', '../lib/platnosci/stan', '../lib/notifications', '../components/AppAccessProvider']) jest.dontMock(m);
  jest.restoreAllMocks();
});

describe('AB-01: „Spróbuj ponownie” po błędzie initDatabase', () => {
  it('po udanym ponowieniu ekrany się rysują (nie zostaje ekran ładowania), a reszta startu się wykonuje', async () => {
    let wywolania = 0;
    const m = uruchom({
      // pierwszy start: baza oznaczona jako niedostępna i wyjątek (np. padła kopia ratunkowa w ratunekPoBledzie)
      initDatabase: async () => {
        wywolania += 1;
        if (wywolania === 1) {
          m.st.markStorageUnavailable('brak miejsca');
          throw new Error('ratunek padł');
        }
        m.st.markStorageReady();
      },
      initLanguage: async () => undefined,
    });
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    expect(maTestId(tree, 'storage-unavailable-screen')).toBe(true);
    await m.TR.act(async () => {
      await tree.root.findByProps({ testID: 'storage-retry' }).props.onPress();
      await flush();
    });
    expect(maTestId(tree, 'start-jezyk-ladowanie')).toBe(false);
    expect(maTestId(tree, 'start-kamien-milowy')).toBe(true);
    expect(m.initLanguage).toHaveBeenCalledTimes(1);
    expect(m.initUnitSystem).toHaveBeenCalledTimes(1);
    expect(m.uruchomPlatnosci).toHaveBeenCalledTimes(1);
    expect(odrzucenia).not.toHaveBeenCalled();
    m.TR.act(() => tree.unmount());
  });

  it('ponowienie po zwykłym starcie nie uruchamia języka, jednostek i płatności drugi raz', async () => {
    const m = uruchom({
      initDatabase: async () => {
        m.st.markStorageReady();
      },
      initLanguage: async () => undefined,
    });
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    expect(maTestId(tree, 'start-kamien-milowy')).toBe(true);
    m.TR.act(() => m.st.markStorageUnavailable('błąd odczytu w trakcie pracy'));
    await m.TR.act(async () => {
      await tree.root.findByProps({ testID: 'storage-retry' }).props.onPress();
      await flush();
    });
    expect(maTestId(tree, 'start-kamien-milowy')).toBe(true);
    expect(m.initLanguage).toHaveBeenCalledTimes(1);
    expect(m.uruchomPlatnosci).toHaveBeenCalledTimes(1);
    m.TR.act(() => tree.unmount());
  });
});

describe('AB-06/AB-07: initLanguage rzuca albo wisi', () => {
  it('initLanguage rzuca: ekrany się rysują z językiem systemu, reszta startu idzie dalej, bez nieobsłużonego odrzucenia', async () => {
    const m = uruchom({
      initDatabase: async () => {
        m.st.markStorageReady();
      },
      initLanguage: async () => {
        throw new Error('odczyt języka');
      },
    });
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    expect(maTestId(tree, 'start-kamien-milowy')).toBe(true);
    expect(maTestId(tree, 'start-jezyk-ladowanie')).toBe(false);
    expect(m.ustawJezykSystemu).toHaveBeenCalled();
    expect(m.initUnitSystem).toHaveBeenCalledTimes(1);
    expect(m.uruchomPlatnosci).toHaveBeenCalledTimes(1);
    expect(odrzucenia).not.toHaveBeenCalled();
    m.TR.act(() => tree.unmount());
  });

  it('initLanguage wisi: po limicie czasu ekrany się rysują z językiem systemu', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate', 'nextTick', 'queueMicrotask'] });
    const m = uruchom({
      initDatabase: async () => {
        m.st.markStorageReady();
      },
      initLanguage: () => new Promise<void>(() => undefined),
    });
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    expect(maTestId(tree, 'start-jezyk-ladowanie')).toBe(true);
    await m.TR.act(async () => {
      jest.advanceTimersByTime(10_000);
      await flush();
    });
    expect(maTestId(tree, 'start-jezyk-ladowanie')).toBe(false);
    expect(maTestId(tree, 'start-kamien-milowy')).toBe(true);
    expect(m.ustawJezykSystemu).toHaveBeenCalled();
    m.TR.act(() => tree.unmount());
  });
});

describe('AC-04 (KO-072, D-427): odrzucone „Spróbuj ponownie” nie zostaje nieobsłużone', () => {
  it('StorageGate: retryDatabase rzuca (initDatabase) — przycisk kończy się bez odrzucenia, ekran błędu zostaje', async () => {
    let wywolania = 0;
    const m = uruchom({
      initDatabase: async () => {
        wywolania += 1;
        m.st.markStorageUnavailable('brak miejsca');
        if (wywolania > 1) throw new Error('ratunek padł');
      },
      initLanguage: async () => undefined,
    });
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    expect(maTestId(tree, 'storage-unavailable-screen')).toBe(true);
    let wynik: unknown = 'nie wywołano';
    await m.TR.act(async () => {
      wynik = await tree.root.findByProps({ testID: 'storage-retry' }).props.onPress().then(() => 'ok', (e: unknown) => e);
      await flush();
    });
    expect(wynik).toBe('ok');
    expect(maTestId(tree, 'storage-unavailable-screen')).toBe(true);
    expect(odrzucenia).not.toHaveBeenCalled();
    m.TR.act(() => tree.unmount());
  });

  it('RescueScreen: „Spróbuj ponownie” w trybie awaryjnym, gdy initDatabase rzuca — bez odrzucenia', async () => {
    const m = uruchom({
      rescue: true,
      initDatabase: async () => {
        throw new Error('baza nadal niedostępna');
      },
      initLanguage: async () => undefined,
    });
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    expect(maTestId(tree, 'rescue-retry')).toBe(true);
    let wynik: unknown = 'nie wywołano';
    await m.TR.act(async () => {
      wynik = await tree.root.findByProps({ testID: 'rescue-retry' }).props.onPress().then(() => 'ok', (e: unknown) => e);
      await flush();
    });
    expect(wynik).toBe('ok');
    expect(odrzucenia).not.toHaveBeenCalled();
    m.TR.act(() => tree.unmount());
  });
});
