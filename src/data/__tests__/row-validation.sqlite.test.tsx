/**
 * Jeden błędny wiersz nie psuje importu ani odczytu [M1-audytor-generalny-022; 08-programista-012].
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { useTempDbDir, restartApp, openRaw, dbFilePath } from './helpers/node-sqlite-adapter';
import { buildBackup, parseAndValidateBackup } from '../../lib/backup';

const formula = {
  flours: [{ name: 'Mąka 750', percentage: 100 }],
  waterPercentage: 70,
  saltPercentage: 2,
  starterPercentage: 20,
  targetDoughWeightGrams: 1000,
};
const goodRecipe = (n: number) => ({ id: `recipe_user_${n}`, name: `Receptura ${n}`, formula, targetDDT: 25, isBuiltIn: false, createdAt: n });
const backupWithOneBadRecipe = () =>
  JSON.stringify(
    buildBackup({
      bakes: [{ id: 'bake_1', recipeName: 'Chleb', startedAt: 1 }],
      starters: [{ id: 's1', name: 'Zakwas', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'FRIDGE' }],
      customRecipes: [goodRecipe(1), { ...goodRecipe(2), formula: 'zepsute' as unknown as typeof formula }, goodRecipe(3)],
    })
  );

describe('Row validation on import and read (022)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('a backup with one bad recipe imports without it and reports one skipped row', () => {
    const parsed = parseAndValidateBackup(backupWithOneBadRecipe());
    expect(parsed.state.customRecipes.map((r) => r.id)).toEqual(['recipe_user_1', 'recipe_user_3']);
    expect(parsed.skippedRows).toBe(1);
    expect(parsed.state.bakes).toHaveLength(1);
    expect(parsed.state.starters).toHaveLength(1);
  });

  it('one damaged formula_json row in the database does not hide the other user recipes', async () => {
    const first = restartApp();
    await first.schema.initDatabase();
    await first.store.saveRecipe(goodRecipe(1));
    await first.store.saveRecipe(goodRecipe(3));
    const raw = openRaw(dbFilePath('piekarz.db', '/Library/SQLite'));
    raw.prepare("INSERT INTO recipes (id, name, formula_json, target_ddt, is_built_in, created_at) VALUES ('bad', 'Zła', '{nie json', 25, 0, 2)").run();
    raw.close();

    const second = restartApp();
    await second.schema.initDatabase();
    const user = (await second.store.getRecipes()).filter((r) => !r.isBuiltIn).map((r) => r.id);
    expect(user).toEqual(['recipe_user_1', 'recipe_user_3']);
  });

  it('Settings import shows how many damaged rows were skipped', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    // Po resetModules komponent, React i renderer muszą pochodzić z tego samego rejestru modułów.
    const { BackupAndDataSection } = require('../../components/settings/BackupAndDataSection');
    const R: typeof React = require('react');
    const TR: typeof renderer = require('react-test-renderer');
    const act = TR.act;
    const { Alert: FreshAlert }: { Alert: typeof Alert } = require('react-native');
    const alert = jest.spyOn(FreshAlert, 'alert').mockImplementation(() => {});
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = TR.create(R.createElement(BackupAndDataSection));
    });
    await act(async () => {
      tree!.root.findByProps({ testID: 'import-backup-btn' }).props.onPress();
    });
    await act(async () => {
      tree!.root.findByProps({ testID: 'import-json-input' }).props.onChangeText(backupWithOneBadRecipe());
    });
    await act(async () => {
      await tree!.root.findByProps({ testID: 'confirm-import-btn' }).props.onPress();
    });
    expect(alert).toHaveBeenCalledWith('Kopia zapasowa', 'Zaimportowano. Pominięto uszkodzone wpisy: 1.');
    const { t } = require('../../lib/i18n');
    expect(t('Zaimportowano. Pominięto uszkodzone wpisy: {count}.', { count: 1 })).toBe('Zaimportowano. Pominięto uszkodzone wpisy: 1.');
    expect((await app.store.getRecipes()).filter((r) => !r.isBuiltIn).map((r) => r.id)).toEqual(['recipe_user_1', 'recipe_user_3']);
    act(() => tree!.unmount());
    alert.mockRestore();
  });
});
