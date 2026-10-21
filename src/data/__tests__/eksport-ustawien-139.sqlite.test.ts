/**
 * Eksport i kopie automatyczne z ustawieniami i postępem lekcji [M1-audytor-generalny-139; 05-architekt-504, 05-architekt-602]
 * (BR-DANE-003 Pełny eksport): dozwolone ustawienia (język, jednostki, godziny snu, naczynie, profil, wprowadzenie)
 * i lekcje Szkoły chleba w kopii; sesja wypieku, pamięć zakupu i daty próśb nie trafiają do pliku. Format zostaje w wersji 2
 * (pola opcjonalne); kopia v2 bez `settings` i `lessonProgress` zostawia ustawienia i lekcje w telefonie.
 * Prawdziwy SQLite (node:sqlite).
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw } from './helpers/node-sqlite-adapter';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;

async function telefonZUstawieniami() {
  const app = restartApp();
  await app.schema.initDatabase();
  await app.store.setAppSetting('language', 'en');
  await app.store.setAppSetting('unit_system', 'imperial');
  await app.store.setAppSetting('selected_baking_vessel', 'cloche');
  await app.store.setAppSetting('active_bake_session', '{"version":2}');
  await app.store.setAppSetting('platnosci_pamiec', '{"aktywne":true}');
  await app.store.setAppSetting('prosba_o_ocene_daty', '[1]');
  await app.store.toggleLessonProgress(2);
  await app.store.toggleLessonProgress(5);
  return app;
}

const ustawienia = (file: string) => {
  const raw = openRaw(file);
  const rows = raw.prepare('SELECT key, value FROM app_settings ORDER BY key').all() as Array<{ key: string; value: string }>;
  const lekcje = (raw.prepare('SELECT level_id FROM lesson_progress ORDER BY level_id').all() as Array<{ level_id: number }>).map((r) => r.level_id);
  raw.close();
  return { s: Object.fromEntries(rows.map((r) => [r.key, r.value])), lekcje };
};

describe('139: ustawienia i lekcje w kopii (BR-DANE-003 Pełny eksport)', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('eksport → import na drugim telefonie przenosi dozwolone ustawienia i lekcje; sesja wypieku i pamięć zakupu nie trafiają do pliku', async () => {
    const app = await telefonZUstawieniami();
    const dane = await app.store.collectBackupData();
    expect(dane.settings).toEqual({ language: 'en', unit_system: 'imperial', selected_baking_vessel: 'cloche' });
    expect(dane.lessonProgress?.map((l) => l.levelId)).toEqual([2, 5]);
    const plik = JSON.stringify(app.backup.buildBackup(dane));
    for (const zakazany of ['active_bake_session', 'platnosci_pamiec', 'prosba_o_ocene_daty']) expect(plik).not.toContain(zakazany);

    // Drugi telefon: pusta baza, import pliku
    useTempDbDir();
    const nowy = restartApp();
    await nowy.schema.initDatabase();
    const odczyt = nowy.backup.parseAndValidateBackup(plik);
    await nowy.store.restoreFromBackupData(odczyt.state);
    const file = (await nowy.schema.getDb())?.databasePath ?? '';
    const po = ustawienia(file);
    expect(po.s).toEqual(expect.objectContaining({ language: 'en', unit_system: 'imperial', selected_baking_vessel: 'cloche' }));
    expect(po.s.active_bake_session ?? '').not.toContain('version');
    expect(po.s.platnosci_pamiec).toBeUndefined();
    expect(po.lekcje).toEqual([2, 5]);
  });

  it('kopia v2 bez settings i lessonProgress zostawia ustawienia i lekcje w telefonie', async () => {
    const app = await telefonZUstawieniami();
    const dane = await app.store.collectBackupData();
    const stara = app.backup.parseAndValidateBackup(JSON.stringify(app.backup.buildBackup({ ...dane, settings: undefined, lessonProgress: undefined })));
    await app.store.restoreFromBackupData(stara.state);
    const po = ustawienia((await app.schema.getDb())?.databasePath ?? '');
    expect(po.s.language).toBe('en');
    expect(po.lekcje).toEqual([2, 5]);
  });

  it('„Usuń wszystkie dane”: kopia przed czyszczeniem zawiera zaliczone lekcje, a jej import je przywraca (05-architekt-602)', async () => {
    const app = await telefonZUstawieniami();
    const { usunWszystkieDane } = require('../usun-wszystko') as typeof import('../usun-wszystko');
    await usunWszystkieDane();
    const kopia = [...mockFiles.keys()].find((k) => /piekarz-przed-czyszczeniem-[^/]+\.json$/.test(k));
    expect(kopia).toBeDefined();
    const odczyt = app.backup.parseAndValidateBackup(String(mockFiles.get(String(kopia))));
    expect(odczyt.state.lessonProgress?.map((l) => l.levelId)).toEqual([2, 5]);
    expect(await app.store.getCompletedLessons()).toEqual([]);
    await app.store.restoreFromBackupData(odczyt.state);
    expect(await app.store.getCompletedLessons()).toEqual([2, 5]);
  });
});
