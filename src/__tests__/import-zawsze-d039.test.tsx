/**
 * Import działa zawsze (D-039): kopia i receptura w Ustawieniach (057) także po końcu okresu
 * próbnego bez zakupu i przed nim, bez ekranu zakupu; nic nie trafia do bazy przed potwierdzeniem
 * użytkownika [M1-audytor-generalny-026; 02-monetyzacja-007]. Baza v4 na prawdziwym SQLite (node:sqlite):
 * liczności przed i po, integrity_check, foreign_key_check.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => R.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import type React from 'react';
import type renderer from 'react-test-renderer';
import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts } from '../data/__tests__/helpers/node-sqlite-adapter';
import type { StoredBakeLog, StoredRecipe, StoredStarter } from '../data/db';

const FORMULA = { flours: [{ name: 'Mąka 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 };
const recipe = (n: number, name = `Moja ${n}`): StoredRecipe => ({ id: `recipe_user_${n}`, name, formula: FORMULA, targetDDT: 25, isBuiltIn: false, createdAt: n });
const bake = (n: number): StoredBakeLog => ({ id: `bake_${n}`, recipeName: `Chleb ${n}`, startedAt: 1000 + n, finishedAt: 2000 + n });
const starter = (n: number): StoredStarter => ({ id: `starter_${n}`, name: `Zakwas ${n}`, flourType: 'Żytnia 2000', hydration: 100, birthDate: 1, storageState: 'FRIDGE' });

const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
function dbState(): { counts: Record<string, number>; userRecipes: number; integrity: string; fk: unknown[] } {
  const raw = openRaw(APP_DB());
  const counts = tableCounts(raw);
  const userRecipes = Number((raw.prepare('SELECT count(*) AS c FROM recipes WHERE is_built_in = 0').get() as { c: number }).c);
  const integrity = String((raw.prepare('PRAGMA integrity_check').get() as { integrity_check: string }).integrity_check);
  const fk = raw.prepare('PRAGMA foreign_key_check').all();
  raw.close();
  return { counts, userRecipes, integrity, fk };
}

type Stan = 'po próbie bez zakupu' | 'przed próbą';

/** Świeże moduły aplikacji (jak ponowne uruchomienie), baza v4 z danymi i stan sklepu bez uprawnienia. */
async function start(stan: Stan) {
  const app = restartApp();
  await app.schema.initDatabase();
  await app.store.saveRecipe(recipe(1));
  await app.store.saveRecipe(recipe(2));
  await app.store.saveBakeLog(bake(1));
  await app.store.saveStarter(starter(1));
  const R: typeof React = require('react');
  const TR: typeof renderer = require('react-test-renderer');
  const { Alert } = require('react-native');
  const { mockIap } = require('../../tests/helpers/platnosci');
  const { _resetStanu } = require('../lib/platnosci/stan');
  mockIap.reset();
  if (stan === 'po próbie bez zakupu') {
    const { PRODUKTY } = require('../lib/platnosci/konfiguracja');
    // Oferta wprowadzająca subskrypcji rocznej skończyła się wczoraj, bez zakupu
    mockIap.entitlements = [{ id: 'tx_trial', transactionId: 'tx_trial', productId: PRODUKTY.yearly, purchaseState: 'purchased', transactionDate: 1, expirationDateIOS: Date.now() - 86400000 }];
  }
  _resetStanu();
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const CalculatorScreen = require('../../app/(tabs)/receptury/receptura').default;
  // Ustawienia (import kopii) są na „Dziś” (D-051 2a), kalkulator na „Receptury” [M1-audytor-generalny-101]
  const StartScreen = require('../../app/(tabs)/(dzis)/index').default;
  const { AppAccessProvider } = require('../components/AppAccessProvider');
  const { PaywallModal } = require('../components/PaywallModal');
  const flush = async () => {
    await TR.act(async () => {
      for (let i = 0; i < 40; i++) await Promise.resolve();
    });
  };
  let tree: renderer.ReactTestRenderer | null = null;
  await TR.act(async () => {
    tree = TR.create(R.createElement(AppAccessProvider, null, R.createElement(StartScreen), R.createElement(CalculatorScreen)));
  });
  await flush();
  const t = tree as unknown as renderer.ReactTestRenderer;
  const paywall = () => t.root.findAllByType(PaywallModal).some((p: renderer.ReactTestInstance) => p.props.visible === true);
  const press = async (testID: string, within: renderer.ReactTestInstance = t.root) => {
    const all = within.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
    expect({ testID, found: all.length > 0 }).toEqual({ testID, found: true });
    await TR.act(async () => {
      await all[all.length - 1].props.onPress();
    });
    await flush();
  };
  const closePaywall = async () => {
    await TR.act(async () => {
      t.root.findByType(PaywallModal).props.onClose();
    });
    await flush();
  };
  const mockFiles: Map<string, string> = require('expo-file-system/legacy').__mockFiles;
  return { app, TR, tree: t, alert, paywall, press, closePaywall, flush, mockFiles };
}

describe.each<Stan>(['po próbie bez zakupu', 'przed próbą'])('import działa zawsze (D-039), stan: %s', (stan) => {
  beforeEach(() => {
    useTempDbDir();
  });

  // Przepisane z kontraktu D-038 (płatny kalkulator) na Basic/Pro [M3 P-a]: liczenie jest w Basic (bez kłódki), a stan
  // bez Pro sprawdza funkcja Pro na „Dziś” — widok miesiąca (BR-KAL-013, D-113)
  it('kontrola: stan bez Pro — liczenie bez kłódki, funkcja Pro (widok miesiąca) otwiera ekran Pro (BR-ZAK-004 Po końcu Pro)', async () => {
    const s = await start(stan);
    expect(s.tree.root.findAll((n) => n.props?.testID === 'blokada-kalkulator')).toEqual([]);
    await s.press('kalendarz-tryb-miesiac');
    expect(s.paywall()).toBe(true);
    s.TR.act(() => s.tree.unmount());
    s.alert.mockRestore();
  });

  it('Ustawienia: import kopii przywraca dane z kopii, bez ekranu zakupu; kopia przed importem powstaje przed zapisem (BR-DANE-003 Kopia przed importem, Import bez zakupu)', async () => {
    const s = await start(stan);
    s.mockFiles.clear();
    const kopia = JSON.stringify(
      s.app.backup.buildBackup({
        bakes: [bake(1), bake(2), bake(3)],
        starters: [starter(1), starter(2)],
        customRecipes: [recipe(1), recipe(3), recipe(4), recipe(5)],
      })
    );
    const przed = dbState();
    expect({ bakes: przed.counts.bakes, starters: przed.counts.starters, user: przed.userRecipes }).toEqual({ bakes: 1, starters: 1, user: 2 });

    await s.press('open-settings-btn');
    expect(s.paywall()).toBe(false);
    // Jedno wejście „Importuj z pliku” dla kopii i receptury [M1-audytor-generalny-113]
    const { ImportRecepturySection } = require('../components/settings/ImportRecepturySection');
    const sekcja = s.tree.root.findByType(ImportRecepturySection);
    await s.press('import-file-btn', sekcja);
    await s.TR.act(async () => {
      sekcja.findByProps({ testID: 'import-json-input' }).props.onChangeText(kopia);
    });
    // Przed „Zatwierdź import” w bazie nic się nie zmienia
    expect(dbState().counts).toEqual(przed.counts);
    await s.press('confirm-import-btn', sekcja);

    const po = dbState();
    expect({ bakes: po.counts.bakes, starters: po.counts.starters, user: po.userRecipes }).toEqual({ bakes: 3, starters: 2, user: 4 });
    expect(po.integrity).toBe('ok');
    expect(po.fk).toEqual([]);
    expect(s.paywall()).toBe(false);
    expect(s.alert).toHaveBeenCalledWith('Zaimportowano', 'Dane z kopii są w aplikacji. Poprzednie dane zapisałem w kopii przed importem.');
    // Kopia bezpieczeństwa ma stan sprzed importu, więc powstała przed zapisem
    const safety = [...s.mockFiles.keys()].filter((k) => /piekarz-przed-importem-.*\.json$/.test(k));
    expect(safety).toHaveLength(1);
    const zapisana = JSON.parse(s.mockFiles.get(safety[0]) as string);
    expect({
      bakes: zapisana.state.bakes.length,
      starters: zapisana.state.starters.length,
      recipes: zapisana.state.customRecipes.map((r: StoredRecipe) => r.id).sort(),
    }).toEqual({ bakes: 1, starters: 1, recipes: ['recipe_user_1', 'recipe_user_2'] });
    s.TR.act(() => s.tree.unmount());
    s.alert.mockRestore();
  });

  // Import receptury tylko w Ustawieniach, nie na ekranie receptury (F-33, design-spec §11b „057”) [M1-audytor-generalny-057]
  it.each(['import-file-btn'])(
    'Ustawienia: „%s” otwiera okno importu bez ekranu zakupu; receptura trafia do bazy dopiero po „Zaimportuj”',
    async (wejscie) => {
      const s = await start(stan);
      const { encodeRecipeToShareUrl } = require('../lib/recipe-sharing');
      const { ImportZPlikuArkusz } = require('../components/settings/ImportZPlikuArkusz');
      const { ImportRecepturySection } = require('../components/settings/ImportRecepturySection');
      const payload = encodeRecipeToShareUrl({ ...recipe(9, 'Chleb od sąsiada'), id: 'recipe_shared_9' });
      const przed = dbState();

      // Ekran receptury nie ma wejścia importu
      expect(s.tree.root.findAll((n) => ['import-recipe-json-btn', 'open-import-recipe-btn'].includes(n.props?.testID)).length).toBe(0);
      await s.press('open-settings-btn');
      const sekcja = s.tree.root.findByType(ImportRecepturySection);
      await s.press(wejscie, sekcja);
      expect(s.paywall()).toBe(false);
      expect(sekcja.findAllByType(ImportZPlikuArkusz)).toHaveLength(1);
      const okno = sekcja.findByType(ImportZPlikuArkusz);
      await s.TR.act(async () => {
        okno.findByProps({ testID: 'import-json-input' }).props.onChangeText(payload);
      });
      await s.flush();
      // Przed potwierdzeniem liczności wszystkich tabel bez zmian
      expect(dbState().counts).toEqual(przed.counts);
      expect(s.alert).not.toHaveBeenCalled();

      await s.press('confirm-import-btn', okno);
      const po = dbState();
      expect(po.counts).toEqual({ ...przed.counts, recipes: przed.counts.recipes + 1 });
      expect(po.userRecipes).toBe(przed.userRecipes + 1);
      expect(po.integrity).toBe('ok');
      expect(po.fk).toEqual([]);
      expect((await s.app.store.getRecipes()).some((r) => r.name === 'Chleb od sąsiada')).toBe(true);
      expect(s.paywall()).toBe(false);
      expect(s.alert).toHaveBeenCalledTimes(1);
      s.TR.act(() => s.tree.unmount());
      s.alert.mockRestore();
    }
  );
});
