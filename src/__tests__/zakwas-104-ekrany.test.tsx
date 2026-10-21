/**
 * M1-audytor-generalny-104 — ekrany zakwasu na funkcjach toru B2 (design-spec §5, §6 stany `karta`,
 * `zakladanie-dzien-3`, `plesn`; makieta docs/design/ekrany/zakwas.html). Scenariusze BRD:
 * BR-ZAKW-005 (docs/brd/wymagania-zakwas.md:77), BR-ZAKW-006 (:98), BR-ZAKW-007 (:111), BR-DIAG-002
 * (docs/brd/wymagania-dziennik.md:104). Prawdziwa baza SQLite (adapter node:sqlite), render zakładki Zakwasy.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => {
  const push = jest.fn();
  return {
    useRouter: () => ({ push, navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => mockParams,
    useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
    Stack: Object.assign(({ children }: { children: unknown }) => children, { Screen: () => null }),
    __push: push,
  };
});

import type React from 'react';
import type renderer from 'react-test-renderer';
import { useTempDbDir, restartApp } from '../data/__tests__/helpers/node-sqlite-adapter';
import type { StoredStarter, StoredStarterEntry } from '../data/db';
import { SETUP_GUIDE, FIRST_DAY_NO_ACTIVITY } from '../core/starter-log';
import { FRIDGE_WAKE_NOT_READY } from '../core/fridge-wake';
import { NO_DOUBLING_CAUSES, NO_DOUBLING_ACTIONS, DOCTOR_CAUSES_HEADER, DOCTOR_ACTIONS_HEADER } from '../core/starter-doctor';
import { evaluateSourdoughSafety } from '../core/sourdough-physics';

jest.setTimeout(30000);

const H = 3600_000;
const DAY = 24 * H;
const dzienTemu = (n: number) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n, 9, 0).getTime();
};
// Założenie n pełnych dób (i godzinę) temu: dzień n + 1 niezależnie od godziny przebiegu (setupDay w dobach, 501)
const dobTemu = (n: number) => Date.now() - n * DAY - H;
const starter = (id: string, extra: Partial<StoredStarter> = {}): StoredStarter => ({
  id, name: `Zakwas ${id}`, flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', ...extra,
});
const feed = (id: string, starterId: string, at: number, feedRatio?: string): StoredStarterEntry => ({
  id, starterId, kind: 'feeding', occurredAt: at, signs: [], createdAt: at, updatedAt: at, ...(feedRatio ? { feedRatio } : {}),
});

type Tree = renderer.ReactTestRenderer;

async function start(seed: (entries: typeof import('../data/starter-entries-store'), store: typeof import('../data/sqlite-store')) => Promise<void>) {
  const app = restartApp();
  await app.schema.initDatabase();
  const entries = require('../data/starter-entries-store') as typeof import('../data/starter-entries-store');
  await app.store.deleteStarter('starter_default');
  await seed(entries, app.store);
  (require('../../tests/helpers/platnosci') as typeof import('../../tests/helpers/platnosci')).zUprawnieniem();
  const R: typeof React = require('react');
  const TR: typeof renderer = require('react-test-renderer');
  const RN: typeof import('react-native') = require('react-native');
  const alert = jest.spyOn(RN.Alert, 'alert').mockImplementation(() => {});
  const push: jest.Mock = require('expo-router').__push;
  const flush = async () => {
    await TR.act(async () => {
      for (let i = 0; i < 40; i++) await Promise.resolve();
    });
  };
  const mount = async (path: string) => {
    const Ekran = require(path).default as React.ComponentType;
    let tree: Tree | null = null;
    await TR.act(async () => {
      tree = TR.create(R.createElement(Ekran));
    });
    await flush();
    return tree as unknown as Tree;
  };
  const tree = await mount('../../app/(tabs)/zakwasy/index');
  const tekst = (t: Tree = tree) =>
    t.root.findAllByType(RN.Text).map((n) => [n.props.children].flat().filter((c) => typeof c === 'string' || typeof c === 'number').join('')).join(' | ');
  const press = async (testID: string, t: Tree = tree) => {
    const all = t.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
    expect({ testID, found: all.length > 0 }).toEqual({ testID, found: true });
    await TR.act(async () => {
      await all[all.length - 1].props.onPress();
    });
    await flush();
  };
  const done = (...trees: Tree[]) => {
    for (const t of [tree, ...trees]) TR.act(() => t.unmount());
    alert.mockRestore();
  };
  return { app, entries, TR, tree, tekst, press, flush, push, mount, done };
}

describe('104: ekrany zakwasu', () => {
  // Jednorazowe ładowanie grafu modułów ekranów (transformacja i kompilacja; ok. 1,5 s z 1,8 s pierwszego testu
  // przy pracy w pojedynkę) liczyło się dotąd w limicie pierwszego testu i przy kilku torach naraz go
  // przekraczało. Rozgrzewka przenosi ten koszt przed testy; każdy test dalej startuje od jest.resetModules
  // (restartApp) [M2-koordynator-napraw-p12c2-002].
  beforeAll(() => {
    useTempDbDir();
    restartApp();
    require('react-test-renderer');
    require('../../app/(tabs)/zakwasy/index');
    require('../../app/(tabs)/zakwasy/doktor-zakwasu');
  });

  beforeEach(() => {
    useTempDbDir();
    mockParams = {};
  });

  it('BR-ZAKW-005 Start: „Zakładam zakwas” i pierwsze dokarmienie → dzień 1, plan dnia 1 i średnio 7–10 dni', async () => {
    const s = await start(async () => {});
    expect(s.tekst()).toContain('Zakładam zakwas');
    expect(s.tekst()).toContain(SETUP_GUIDE.start[0]);
    await s.press('zakladanie-pierwsze-dokarmienie-btn');
    const [nowy] = await s.app.store.getStarters();
    expect(nowy).toEqual(expect.objectContaining({ name: 'Mój zakwas', hydration: 100, storageState: 'ROOM_TEMP' }));
    expect(nowy.setupStartedAt).toBeGreaterThan(Date.now() - H);
    expect((await s.entries.getStarterEntries(nowy.id)).map((e) => e.kind)).toEqual(['feeding']);
    const t = s.tekst();
    expect(t).toContain('Dzień 1');
    expect(t).toContain('Co dziś zrobić');
    for (const z of [...SETUP_GUIDE.start, ...SETUP_GUIDE.day1]) expect(t).toContain(z);
    expect(t).toContain('Zapisz dzień 1');
    s.done();
  });

  // Zegar ustawiony (tylko Date; timery i mikrozadania prawdziwe), żeby wynik nie zależał od godziny przebiegu
  // [M1-audytor-generalny-191; 07-jakosc-602]
  const ustawZegar = (godz: number, min: number) => {
    const now = new Date(2026, 9, 21, godz, min, 0, 0).getTime();
    jest.useFakeTimers({
      now,
      doNotFake: ['nextTick', 'setImmediate', 'clearImmediate', 'queueMicrotask', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'hrtime', 'performance'],
    });
    return now;
  };

  it.each([[0, 30], [12, 0], [23, 30]])('BR-ZAKW-005 Brak aktywności pierwszego dnia (zegar %i:%i): obserwacja → to normalne w pierwszej dobie i termin następnego dokarmienia', async (godz, min) => {
    const now = ustawZegar(godz, min);
    // Dzień 1 to pierwsza doba od założenia (setupDay, 501): pierwsze dokarmienie godzinę temu (o 0:30 o północy)
    const fedAt = Math.max(now - H, new Date(2026, 9, 21, 0, 0, 0, 0).getTime());
    try {
      await brakAktywnosciDnia1(fedAt);
    } finally {
      jest.useRealTimers();
    }
  });

  // Dzień liczony w pełnych dobach od założenia, nie od północy [M2-koordynator-napraw-501 (p11)]
  it('BR-ZAKW-005 Tuż po północy: założony wczoraj o 23:46, o 00:46 to nadal dzień 1 (pełne doby) — plan dnia 1 i porada pierwszej doby', async () => {
    const now = ustawZegar(0, 46);
    const fedAt = new Date(2026, 9, 20, 23, 46, 0, 0).getTime();
    try {
      const s = await start(async (e) => {
        await e.createStarterWithEntry(starter('z', { setupStartedAt: fedAt }), feed('f1', 'z', fedAt));
      });
      expect(s.tekst()).toContain('Dzień 1');
      expect(s.tekst()).not.toContain('Dzień 2');
      for (const z of SETUP_GUIDE.day1) expect(s.tekst()).toContain(z);
      await s.press('zakladanie-objaw-no_activity');
      await s.press('zakladanie-zapisz-btn');
      const t = s.tekst();
      for (const z of FIRST_DAY_NO_ACTIVITY) expect(t).toContain(z);
      const { formatTime } = require('../lib/format');
      expect(t).toContain(`Następne dokarmienie: dziś o ${formatTime(fedAt + DAY)}.`);
      expect(now - fedAt).toBe(H);
      s.done();
    } finally {
      jest.useRealTimers();
    }
  });

  async function brakAktywnosciDnia1(fedAt: number) {
    const s = await start(async (e) => {
      await e.createStarterWithEntry(starter('z', { setupStartedAt: fedAt }), feed('f1', 'z', fedAt));
    });
    await s.press('zakladanie-objaw-no_activity');
    await s.press('zakladanie-zapisz-btn');
    const t = s.tekst();
    for (const z of FIRST_DAY_NO_ACTIVITY) expect(t).toContain(z);
    const { formatTime } = require('../lib/format');
    expect(t).toContain(`Następne dokarmienie: jutro o ${formatTime(fedAt + DAY)}.`);
    expect((await s.entries.getStarterEntries('z')).map((x) => [x.kind, x.signs])).toEqual([['observation', ['no_activity']], ['feeding', []]]);
    s.done();
  }

  it('BR-ZAKW-005 Pleśń w trakcie zakładania: dzień 4, kolorowe plamy → Ostrzeżenie „wyrzuć” i „Zacznij od nowa” od dnia 1', async () => {
    const s = await start(async (e) => {
      await e.createStarterWithEntry(starter('z', { setupStartedAt: dobTemu(3) }), feed('f1', 'z', dzienTemu(3)));
      await e.addStarterEntry(feed('f2', 'z', dzienTemu(1)));
    });
    expect(s.tekst()).toContain('Dzień 4');
    await s.press('zakladanie-objaw-mold_signs');
    await s.press('zakladanie-zapisz-btn');
    const d = evaluateSourdoughSafety({ hasColoredSpots: true });
    expect(s.tree.root.findAll((n) => n.props?.testID === 'zakladanie-ostrzezenie' && n.props.accessibilityRole === 'alert').length).toBeGreaterThan(0);
    expect(s.tekst()).toContain(d.titlePl);
    expect(s.tekst()).toContain(d.actionPl);
    expect(s.tekst()).toContain('Zostaw zapis i wróć');
    expect(s.tree.root.findAll((n) => n.props?.testID === 'zakladanie-karta')).toHaveLength(0);
    await s.press('zakladanie-od-nowa-btn');
    const wpisy = await s.entries.getStarterEntries('z');
    expect(wpisy.map((x) => x.kind)).toEqual(['feeding']);
    expect((await s.app.store.getStarters())[0].setupStartedAt).toBe(wpisy[0].occurredAt);
    expect(s.tekst()).toContain('Dzień 1');
    s.done();
  });

  it('BR-ZAKW-005 Gotowy: dzień 7, podwojenie w 8 h → „gotowy” i „Ułóż plan” do pierwszego wypieku', async () => {
    const fedAt = Date.now() - 7 * H;
    const s = await start(async (e) => {
      await e.createStarterWithEntry(starter('z', { setupStartedAt: dobTemu(6) }), feed('f1', 'z', fedAt));
    });
    expect(s.tekst()).toContain('Dzień 7');
    await s.press('zakladanie-objaw-doubled');
    await s.press('zakladanie-zapisz-btn');
    for (const z of SETUP_GUIDE.ready) expect(s.tekst()).toContain(z);
    expect((await s.app.store.getStarters())[0].setupCompletedAt).toBeGreaterThan(fedAt);
    await s.press('zakladanie-uloz-plan-btn');
    expect(s.push).toHaveBeenCalledWith('/receptury');
    s.done();
  });

  it('karta: Spirala cyklu z etykietą, „Podwoił objętość” zapisuje obserwację i pokazuje „gotowy” z atrybucją (BR-ZAKW-003 Podwojenie w 6 h)', async () => {
    const fedAt = Date.now() - 380 * 60_000;
    const s = await start(async (e) => {
      await e.createStarterWithEntry(starter('z'), feed('f1', 'z', fedAt, '1:2:2'));
    });
    const spirala = s.tree.root.findByProps({ testID: 'brand-spiral' });
    expect(spirala.props.accessibilityLabel).toBe('Od dokarmienia minęło 6 godzin 20 minut z 12 godzin.');
    const t = s.tekst();
    expect(t).toContain('6 godzin 20 minut od dokarmienia');
    expect(t).toContain('na blacie, 1:2:2');
    expect(t).toContain('Zaznacz, gdy zakwas urośnie dwa razy od kreski na słoiku. Wtedy jest gotowy do ciasta (według King Arthur Baking).');
    expect(t).toContain('Coś mnie niepokoi');
    expect(s.tree.root.findAll((n) => n.props?.testID === 'zakwas-gotowy')).toHaveLength(0);
    await s.press('zakwas-podwoil-btn');
    expect((await s.entries.getStarterEntries('z'))[0]).toEqual(expect.objectContaining({ kind: 'observation', signs: ['doubled'] }));
    expect(s.tekst()).toContain('Gotowy do ciasta (według King Arthur Baking).');
    expect(s.tekst()).toContain('Obserwacja: Podwoił objętość');
    s.done();
  });

  it('BR-ZAKW-007 Zła godzina dokarmienia: poprawa 18:00 → 08:00 przez „Edytuj”; stan liczy się od 08:00, inne wpisy bez zmian', async () => {
    const wczoraj = dzienTemu(1);
    const o18 = wczoraj + 9 * H; // wczoraj 18:00
    const s = await start(async (e) => {
      await e.createStarterWithEntry(starter('z'), feed('stary', 'z', dzienTemu(2) + 11 * H));
      await e.addStarterEntry(feed('zly', 'z', o18, '1:1:1'));
    });
    const stary = (await s.entries.getStarterEntries('z')).find((x) => x.id === 'stary');
    await s.press('wpis-edytuj-zly');
    const sheet = s.tree.root.findByProps({ testID: 'wpis-arkusz' });
    expect([sheet.findByProps({ testID: 'wpis-godzina' }).props.value, sheet.findByProps({ testID: 'wpis-minuta' }).props.value]).toEqual([18, 0]);
    await s.TR.act(async () => {
      sheet.findByProps({ testID: 'wpis-godzina' }).props.onChangeNumber(25);
    });
    await s.press('wpis-zapisz');
    expect(s.tekst()).toContain('Godzina od 0 do 23, minuty od 0 do 59.');
    expect((await s.entries.getStarterEntries('z')).find((x) => x.id === 'zly')?.occurredAt).toBe(o18);
    await s.TR.act(async () => {
      sheet.findByProps({ testID: 'wpis-godzina' }).props.onChangeNumber(8);
    });
    await s.press('wpis-zapisz');
    const po = await s.entries.getStarterEntries('z');
    expect(po.find((x) => x.id === 'zly')).toEqual(expect.objectContaining({ occurredAt: wczoraj - H, feedRatio: '1:1:1' }));
    expect(po.find((x) => x.id === 'stary')).toEqual(stary);
    expect((await s.app.store.getStarters())[0].lastFedAt).toBe(wczoraj - H);
    const { formatTime } = require('../lib/format');
    expect(s.tekst()).toContain(`Wczoraj ${formatTime(wczoraj - H)}: Dokarmienie 1:1:1`);
    s.done();
  });

  it('BR-ZAKW-007 Usunięcie wpisu: znika tylko ten wpis, pasek „Usunięto wpis” z „Przywróć” oddaje ten sam wiersz', async () => {
    const s = await start(async (e) => {
      await e.createStarterWithEntry(starter('z'), feed('a', 'z', Date.now() - 30 * H));
      await e.addStarterEntry(feed('b', 'z', Date.now() - 2 * H));
    });
    const przed = await s.entries.getStarterEntries('z');
    await s.press('wpis-usun-b');
    expect((await s.entries.getStarterEntries('z')).map((x) => x.id)).toEqual(['a']);
    expect(s.tekst()).toContain('Usunięto wpis');
    await s.press('pasek-cofnij-przywroc');
    expect(await s.entries.getStarterEntries('z')).toEqual(przed);
    expect(s.tree.root.findAll((n) => n.props?.testID === 'pasek-cofnij')).toHaveLength(0);
    s.done();
  });

  it('BR-ZAKW-006 Zakwas niegotowy w dniu ciasta: wybrany do wypieku, 9 h po dokarmieniu bez podwojenia → rada i propozycja przesunięcia', async () => {
    const s = await start(async (e) => {
      await e.createStarterWithEntry(starter('z'), feed('f1', 'z', Date.now() - 9 * H));
      const sesja = require('../data/bake-session-store') as typeof import('../data/bake-session-store');
      const { planBakeSteps } = require('../core/bake-steps') as typeof import('../core/bake-steps');
      const now = Date.now();
      await sesja.saveBakeSession({
        version: 2, steps: planBakeSteps({ startAt: now, isHighRye: false }), stepIdx: 0, dutchOvenPhase: 'lid_on',
        timerEndsAt: null, pausedLeftSec: null, recipeName: 'Chleb', startedAt: now,
        bake: { id: 'b1', recipeName: 'Chleb', startedAt: now, currentStageId: 'mix', starterId: 'z' },
      });
      expect((await sesja.loadBakeSession())?.bake?.starterId).toBe('z');
    });
    const pole = s.tree.root.findByProps({ testID: 'lodowka-not_ready' });
    expect(pole).toBeDefined();
    for (const z of FRIDGE_WAKE_NOT_READY) expect(s.tekst()).toContain(z);
    expect(s.tekst()).toMatch(/Proponowane mieszanie ciasta: .+ o .+\./);
    s.done();
  });

  it('BR-DIAG-002 Zakwas bez aktywności w dniu 5: „Coś mnie niepokoi” → Doktor zakwasu z przyczynami i radą co 12 h; plamy → wyrzuć bez listy', async () => {
    const s = await start(async (e) => {
      await e.createStarterWithEntry(starter('z', { setupStartedAt: dobTemu(4) }), feed('f1', 'z', Date.now() - 3 * H));
    });
    await s.press('zakwas-niepokoi-btn');
    expect(s.push).toHaveBeenCalledWith({ pathname: '/zakwasy/doktor-zakwasu', params: { starterId: 'z' } });
    mockParams = { starterId: 'z' };
    const przed = await s.entries.getStarterEntries('z');
    const doktor = await s.mount('../../app/(tabs)/zakwasy/doktor-zakwasu');
    expect(s.tekst(doktor)).toContain('Dzień 5');
    for (const n of ['Nic się nie dzieje', 'Nie podwaja objętości', 'Długo stał w lodówce bez dokarmiania', 'Kolorowe plamy albo puszysty nalot']) {
      expect(s.tekst(doktor)).toContain(n);
    }
    await s.press('doktor-zakwasu-objaw-no_doubling', doktor);
    const t = s.tekst(doktor);
    expect(t).toContain(DOCTOR_CAUSES_HEADER);
    expect(t).toContain(DOCTOR_ACTIONS_HEADER);
    for (const z of [...NO_DOUBLING_CAUSES, ...NO_DOUBLING_ACTIONS]) expect(t).toContain(z);
    expect(t).toContain('co 12 godzin');
    await s.press('doktor-zakwasu-objaw-mold_signs', doktor);
    const d = evaluateSourdoughSafety({ hasColoredSpots: true });
    expect(doktor.root.findAll((n) => n.props?.testID === 'doktor-zakwasu-wyrzuc' && n.props.accessibilityRole === 'alert').length).toBeGreaterThan(0);
    expect(s.tekst(doktor)).toContain(d.actionPl);
    expect(s.tekst(doktor)).not.toContain(DOCTOR_CAUSES_HEADER);
    expect(await s.entries.getStarterEntries('z')).toEqual(przed);
    s.done(doktor);
  });
});
