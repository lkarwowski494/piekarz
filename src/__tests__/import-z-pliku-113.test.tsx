/**
 * 113: jedno wejście „Importuj z pliku” w Ustawieniach dla receptury i kopii; arkusz rozpoznaje rodzaj po zawartości
 * i pokazuje podgląd według rodzaju; zapis idzie dotychczasową ścieżką (design-spec §11c „113”) oraz tytuł karty
 * „Ilości do dokarmienia” [M1-audytor-generalny-113; 04-studio-projektowe-028]. Baza na prawdziwym SQLite (node:sqlite):
 * liczności tabel po imporcie nową drogą = po imporcie drogą dotychczasową.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
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
import type { RozpoznanyPlik } from '../lib/import-z-pliku';

const FORMULA = { flours: [{ name: 'pszenna', percentage: 80 }, { name: 'żytnia', percentage: 20 }], waterPercentage: 75, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 };
const recipe = (n: number, name = `Moja ${n}`): StoredRecipe => ({ id: `recipe_user_${n}`, name, formula: FORMULA, targetDDT: 25, isBuiltIn: false, createdAt: n });
const bake = (n: number): StoredBakeLog => ({ id: `bake_${n}`, recipeName: `Chleb ${n}`, startedAt: 1000 + n, finishedAt: 2000 + n });
const starter = (n: number): StoredStarter => ({ id: `starter_${n}`, name: `Zakwas ${n}`, flourType: 'Żytnia 2000', hydration: 100, birthDate: 1, storageState: 'FRIDGE' });
const NBSP = ' ';

const counts = (): Record<string, number> => {
  const raw = openRaw(dbFilePath('piekarz.db', '/Library/SQLite'));
  const c = tableCounts(raw);
  raw.close();
  return c;
};

/** Świeża baza (jak nowy telefon z danymi): 2 receptury użytkownika, 1 wypiek, 1 zakwas. */
async function baza() {
  useTempDbDir();
  const app = restartApp();
  await app.schema.initDatabase();
  await app.store.saveRecipe(recipe(1));
  await app.store.saveRecipe(recipe(2));
  await app.store.saveBakeLog(bake(1));
  await app.store.saveStarter(starter(1));
  const R: typeof React = require('react');
  const TR: typeof renderer = require('react-test-renderer');
  const RN: typeof import('react-native') = require('react-native');
  const alert = jest.spyOn(RN.Alert, 'alert').mockImplementation(() => {});
  const mockFiles: Map<string, string> = require('expo-file-system/legacy').__mockFiles;
  mockFiles.clear();
  return { app, R, TR, alert, mockFiles };
}

type Baza = Awaited<ReturnType<typeof baza>>;

/** Ustawienia: wiersz „Importuj z pliku” → arkusz z treścią pliku. */
async function arkuszZTrescia(b: Baza, tresc: string) {
  const { ImportRecepturySection } = require('../components/settings/ImportRecepturySection');
  let tree: renderer.ReactTestRenderer | null = null;
  await b.TR.act(async () => {
    tree = b.TR.create(b.R.createElement(ImportRecepturySection));
  });
  const t = tree as unknown as renderer.ReactTestRenderer;
  const press = async (testID: string) => {
    const all = t.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
    expect({ testID, found: all.length }).toEqual({ testID, found: 1 });
    await b.TR.act(async () => {
      await all[0].props.onPress();
    });
  };
  await press('import-file-btn');
  await b.TR.act(async () => {
    t.root.findByProps({ testID: 'import-json-input' }).props.onChangeText(tresc);
  });
  const tekst = () => t.root.findAll((n) => typeof n.type === 'string' && String(n.type) === 'Text')
    .flatMap((n) => n.children.filter((c): c is string => typeof c === 'string')).join('\n');
  const ma = (testID: string) => t.root.findAll((n) => n.props?.testID === testID).length > 0;
  return { tree: t, press, tekst, ma, done: () => b.TR.act(() => t.unmount()) };
}

const kopiaJson = (b: Baza, n = { recipes: 3, starters: 1, bakes: 12 }) =>
  JSON.stringify({
    ...b.app.backup.buildBackup({
      bakes: Array.from({ length: n.bakes }, (_, i) => bake(i + 10)),
      starters: Array.from({ length: n.starters }, (_, i) => starter(i + 10)),
      customRecipes: Array.from({ length: n.recipes }, (_, i) => recipe(i + 10)),
    }),
    exportedAt: '2026-10-18T12:00:00.000Z',
  });

describe('113: jedno wejście „Importuj z pliku”', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Ustawienia mają dokładnie jeden element „Importuj z pliku” (import-file-btn), bez import-backup-btn, import-recipe-json-btn i „Importuj recepturę”', async () => {
    const b = await baza();
    const { SettingsModal } = require('../components/SettingsModal');
    let tree: renderer.ReactTestRenderer | null = null;
    await b.TR.act(async () => {
      tree = b.TR.create(b.R.createElement(SettingsModal, { visible: true, onClose: () => {} }));
    });
    const root = (tree as unknown as renderer.ReactTestRenderer).root;
    const teksty = root.findAll((n) => typeof n.type === 'string' && String(n.type) === 'Text').flatMap((n) => n.children.filter((c): c is string => typeof c === 'string'));
    expect(teksty.filter((x) => x === 'Importuj z pliku')).toHaveLength(1);
    expect(teksty).not.toContain('Importuj recepturę');
    const ids = root.findAll((n) => typeof n.props?.testID === 'string' && typeof n.props.onPress === 'function').map((n) => String(n.props.testID));
    expect(ids.filter((id) => id === 'import-file-btn')).toHaveLength(1);
    expect(ids).not.toContain('import-backup-btn');
    expect(ids).not.toContain('import-recipe-json-btn');
    b.TR.act(() => (tree as unknown as renderer.ReactTestRenderer).unmount());
  });

  it('kopia (format „piekarz-backup”): podgląd kopii z liczbami z pliku, informacja i „Zastąp dane”', async () => {
    const b = await baza();
    const a = await arkuszZTrescia(b, kopiaJson(b));
    expect(a.ma('import-preview-backup')).toBe(true);
    expect(a.ma('import-preview-recipe')).toBe(false);
    const tekst = a.tekst();
    expect(tekst).toContain('Wklej zawartość pliku receptury albo kopii zapasowej.');
    expect(tekst).toContain('Kopia zapasowa z pliku');
    // Ekran pokazuje datę kopii w strefie telefonu: wyrocznia z tego samego exportedAt przez Intl w strefie procesu,
    // nie stała „18 października” (w Auckland to już 19) [M1-audytor-generalny-190; 07-jakosc-601]
    const dataKopii = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date('2026-10-18T12:00:00.000Z'));
    expect(['18 października 2026', '19 października 2026']).toContain(dataKopii);
    expect(tekst).toContain(`Kopia z ${dataKopii}: 3${NBSP}receptury, 1${NBSP}zakwas, 12${NBSP}wpisów w Dzienniku.`);
    expect(tekst).toContain('Import zastąpi wszystkie dane w aplikacji danymi z kopii. Przed importem zapiszę kopię obecnych danych.');
    expect(tekst).toContain('Zastąp dane');
    a.done();
  });

  it('receptura: podgląd receptury (nazwa, mąki, woda, zakwas, sól) i „Dodaj”', async () => {
    const b = await baza();
    const { encodeRecipeToShareUrl } = require('../lib/recipe-sharing');
    const a = await arkuszZTrescia(b, encodeRecipeToShareUrl({ ...recipe(9, 'Mój wiejski 75%'), id: 'recipe_shared_9' }));
    expect(a.ma('import-preview-recipe')).toBe(true);
    expect(a.ma('import-preview-backup')).toBe(false);
    const tekst = a.tekst();
    for (const x of ['Receptura z pliku', 'Mój wiejski 75%', 'pszenna 80%, żytnia 20%', '75%', '20%', '2%', 'Dodaj',
      'Dodam ją do Moich receptur. Pozostałe dane zostaną bez zmian.']) {
      expect(tekst).toContain(x);
    }
    a.done();
  });

  it('inna treść: komunikat „Tego pliku nie rozpoznaję…”, „Zamknij”, bez przycisku zapisu', async () => {
    const b = await baza();
    for (const tresc of ['{"cos":"innego"}', 'zwykły tekst', '{ zepsuty']) {
      const a = await arkuszZTrescia(b, tresc);
      expect(a.tekst()).toContain('Tego pliku nie rozpoznaję. Piekarz importuje plik receptury i plik kopii zapasowej z Piekarza.');
      expect(a.tekst()).toContain('Zamknij');
      expect(a.ma('confirm-import-btn')).toBe(false);
      a.done();
    }
  });

  it('formy liczby w podglądzie kopii: 1 receptura, 3 receptury, 5 receptur, 22 receptury; EN 1 recipe, 3 recipes', async () => {
    const b = await baza();
    const zdanie = async (recipes: number) => {
      const a = await arkuszZTrescia(b, kopiaJson(b, { recipes, starters: 1, bakes: 1 }));
      const linia = a.tekst().split('\n').find((l) => /^Kopia z \d|^Backup from [A-Z][a-z]+ \d/.test(l)) ?? '';
      a.done();
      return linia;
    };
    expect(await zdanie(1)).toContain(`1${NBSP}receptura,`);
    expect(await zdanie(3)).toContain(`3${NBSP}receptury,`);
    expect(await zdanie(5)).toContain(`5${NBSP}receptur,`);
    expect(await zdanie(22)).toContain(`22${NBSP}receptury,`);
    const { setLang } = require('../lib/i18n');
    setLang('en');
    try {
      expect(await zdanie(1)).toContain(`1${NBSP}recipe,`);
      expect(await zdanie(3)).toContain(`3${NBSP}recipes,`);
    } finally {
      setLang('pl');
    }
  });

  it('receptura przez nowe wejście daje ten sam stan bazy co dotychczasowe okno importu receptury (liczności tabel)', async () => {
    const { encodeRecipeToShareUrl } = require('../lib/recipe-sharing');
    const plik = encodeRecipeToShareUrl({ ...recipe(9, 'Chleb od sąsiada'), id: 'recipe_shared_9' });

    // Droga dotychczasowa: okno ImportRecipeModal i „Zaimportuj przepis”
    const stara = await baza();
    const przed = counts();
    const { ImportRecipeModal } = require('../components/ImportRecipeModal');
    let tree: renderer.ReactTestRenderer | null = null;
    await stara.TR.act(async () => {
      tree = stara.TR.create(stara.R.createElement(ImportRecipeModal, { visible: true, onClose: () => {}, onImportSuccess: () => {}, initialInput: plik }));
    });
    await stara.TR.act(async () => {
      await (tree as unknown as renderer.ReactTestRenderer).root.findByProps({ testID: 'confirm-import-btn' }).props.onPress();
    });
    const poStarej = counts();
    stara.TR.act(() => (tree as unknown as renderer.ReactTestRenderer).unmount());
    jest.restoreAllMocks();

    // Nowa droga: „Importuj z pliku” → podgląd receptury → „Dodaj”
    const nowa = await baza();
    expect(counts()).toEqual(przed);
    const a = await arkuszZTrescia(nowa, plik);
    expect(counts()).toEqual(przed); // przed „Dodaj” nic się nie zapisuje
    await a.press('confirm-import-btn');
    expect(counts()).toEqual(poStarej);
    expect(poStarej).toEqual({ ...przed, recipes: przed.recipes + 1 });
    expect((await nowa.app.store.getRecipes()).some((r) => r.name === 'Chleb od sąsiada')).toBe(true);
    expect(nowa.alert).toHaveBeenCalledWith('Receptura „Chleb od sąsiada” jest w Moich recepturach.');
    expect(a.ma('import-json-input')).toBe(false); // arkusz zamknięty
    a.done();
  });

  it('kopia przez nowe wejście daje ten sam stan bazy co dotychczasowy import kopii; kopia przed importem nadal powstaje', async () => {
    // Droga dotychczasowa (BackupAndDataSection do 113): walidacja, kopia przed importem z collectBackupData, przywrócenie
    const stara = await baza();
    const plik = kopiaJson(stara, { recipes: 4, starters: 2, bakes: 3 });
    const przed = counts();
    const env = stara.app.backup.parseAndValidateBackup(plik);
    await stara.app.backup.safetyBackup('import', await stara.app.store.collectBackupData());
    await stara.app.store.restoreFromBackupData(env.state);
    const poStarej = counts();
    jest.restoreAllMocks();

    const nowa = await baza();
    const a = await arkuszZTrescia(nowa, plik);
    expect(counts()).toEqual(przed); // przed „Zastąp dane” nic się nie zmienia
    await a.press('confirm-import-btn');
    expect(counts()).toEqual(poStarej);
    expect({ bakes: poStarej.bakes, starters: poStarej.starters }).toEqual({ bakes: 3, starters: 2 });
    const safety = [...nowa.mockFiles.keys()].filter((k) => /piekarz-przed-importem-.*\.json$/.test(k));
    expect(safety).toHaveLength(1);
    const zapisana = JSON.parse(nowa.mockFiles.get(safety[0]) as string);
    expect({ bakes: zapisana.state.bakes.length, starters: zapisana.state.starters.length, recipes: zapisana.state.customRecipes.length })
      .toEqual({ bakes: 1, starters: 1, recipes: 2 });
    expect(nowa.alert).toHaveBeenCalledWith('Zaimportowano', 'Dane z kopii są w aplikacji. Poprzednie dane zapisałem w kopii przed importem.');
    a.done();
  });
});

describe('113: logika importu z pliku (src/lib/import-z-pliku.ts)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rozpoznajPlik: kopia, receptura, nierozpoznany; pusty tekst = null', async () => {
    const b = await baza();
    const { rozpoznajPlik, zdanieKopii } = require('../lib/import-z-pliku');
    const { encodeRecipeToShareUrl } = require('../lib/recipe-sharing');
    const pusty: RozpoznanyPlik | null = rozpoznajPlik('   ');
    expect(pusty).toBeNull();
    const { t } = require('../lib/i18n');
    expect(t('Receptura „{nazwa}” jest w Moich recepturach.', { nazwa: 'Mój' })).toBe('Receptura „Mój” jest w Moich recepturach.');
    expect(rozpoznajPlik(kopiaJson(b)).rodzaj).toBe('kopia');
    expect(rozpoznajPlik(encodeRecipeToShareUrl(recipe(7))).rodzaj).toBe('receptura');
    expect(rozpoznajPlik('{"format":"piekarz-backup"}').rodzaj).toBe('nierozpoznany'); // kopia bez danych
    expect(rozpoznajPlik('[1,2]').rodzaj).toBe('nierozpoznany');
    // brak daty w pliku zostaje brakiem: zdanie bez daty
    const bezDaty = rozpoznajPlik(JSON.stringify({ ...JSON.parse(kopiaJson(b, { recipes: 2, starters: 0, bakes: 5 })), exportedAt: undefined }));
    expect(zdanieKopii(bezDaty.kopia)).toBe(`Kopia: 2${NBSP}receptury, 0${NBSP}zakwasów, 5${NBSP}wpisów w Dzienniku.`);
  });

  it('importujRecepture i importujKopie zapisują dotychczasowymi ścieżkami (kopia przed importem kopii)', async () => {
    const b = await baza();
    const { importujRecepture, importujKopie, rozpoznajPlik } = require('../lib/import-z-pliku');
    const przed = counts();
    await importujRecepture(recipe(50));
    expect(counts()).toEqual({ ...przed, recipes: przed.recipes + 1 });
    await importujKopie(rozpoznajPlik(kopiaJson(b, { recipes: 1, starters: 1, bakes: 2 })).kopia);
    expect([...b.mockFiles.keys()].filter((k) => /piekarz-przed-importem-.*\.json$/.test(k))).toHaveLength(1);
    expect({ bakes: counts().bakes, starters: counts().starters }).toEqual({ bakes: 2, starters: 1 });
  });
});

describe('113: karta dokarmienia', () => {
  it('tytuł „Ilości do dokarmienia” / “Feeding Amounts”; w tekstach t() nie ma „Kalkulator dokarmiania”', () => {
    const fs = require('fs');
    const path = require('path');
    const plik = fs.readFileSync(path.join(__dirname, '../components/zakwas/StarterFeedingCard.tsx'), 'utf8');
    expect(plik).toContain("t('Ilości do dokarmienia')");
    expect(plik).not.toContain('Kalkulator dokarmiania');
    const { EN } = require('../lib/i18n.en');
    expect(EN['Ilości do dokarmienia']).toBe('Feeding Amounts');
    expect(EN['Kalkulator dokarmiania']).toBeUndefined();
  });
});
