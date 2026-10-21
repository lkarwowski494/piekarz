/**
 * Błąd odczytu ustawienia albo sesji wypieku nie może skończyć się zapisem w miejsce danych użytkownika
 * [audyt-niezalezny B-8]. Odczyt po błędzie zwraca wartość zastępczą (ekran działa), ale zapis do klucza, którego
 * nie udało się odczytać, najpierw zachowuje surową wartość z bazy w pliku ratunkowym (uszkodzone-wiersze, 121);
 * gdy bazy nadal nie da się odczytać — zapis jest odrzucony („Nie zapisano”), a dane zostają.
 * To samo dla postępu lekcji: przełącznik nie zapisuje nic na podstawie nieudanego odczytu. Prawdziwy SQLite (node:sqlite).
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp, control, openRaw } from './helpers/node-sqlite-adapter';

const wartosc = (file: string, key: string) => {
  const raw = openRaw(file);
  const r = raw.prepare('SELECT value FROM app_settings WHERE key = ?').get(key) as { value: string } | undefined;
  raw.close();
  return r?.value;
};

async function telefon() {
  useTempDbDir();
  const pierwszy = restartApp();
  await pierwszy.schema.initDatabase();
  const SESJA = '{"version":2,"recipeName":"Mój chleb"}';
  await pierwszy.store.setAppSetting('active_bake_session', SESJA);
  // Ponowne uruchomienie: pamięć pusta, wartość tylko w bazie
  const app = restartApp();
  await app.schema.initDatabase();
  const file = (await app.schema.getDb())?.databasePath ?? '';
  const uszk = require('../uszkodzone-wiersze') as typeof import('../uszkodzone-wiersze');
  return { app, file, SESJA, uszk };
}

describe('B-8: błąd odczytu ustawień i sesji', () => {
  it('odczyt z błędem zwraca wartość zastępczą; zapis w czasie trwającego błędu jest odrzucony, sesja w bazie zostaje', async () => {
    const { app, file, SESJA } = await telefon();
    control().failReadsMatching = /FROM app_settings/;
    expect(await app.store.getAppSetting('active_bake_session', 'DOMYSLNA')).toBe('DOMYSLNA');
    await expect(app.store.setAppSetting('active_bake_session', '')).rejects.toBeInstanceOf(app.status.StorageWriteError);
    control().failReadsMatching = null;
    expect(wartosc(file, 'active_bake_session')).toBe(SESJA);
  });

  it('po przejściowym błędzie odczytu zapis nowej wartości najpierw zachowuje starą w pliku ratunkowym', async () => {
    const { app, file, SESJA, uszk } = await telefon();
    control().failReadsMatching = /FROM app_settings/;
    expect(await app.store.getAppSetting('active_bake_session')).toBeUndefined();
    control().failReadsMatching = null;
    await app.store.setAppSetting('active_bake_session', '');
    expect(wartosc(file, 'active_bake_session')).toBe('');
    expect(uszk.uszkodzoneWiersze()).toEqual([{ tabela: 'app_settings', id: 'active_bake_session', surowe: SESJA }]);
    // Następny zapis po udanym odczycie nie robi kolejnej kopii
    expect(await app.store.getAppSetting('active_bake_session')).toBe('');
    await app.store.setAppSetting('active_bake_session', '{"version":2}');
    expect(uszk.uszkodzoneWiersze()).toHaveLength(1);
  });

  it('zapis bez wcześniejszego błędu odczytu działa jak dotąd (bez pliku ratunkowego)', async () => {
    const { app, file, uszk } = await telefon();
    await app.store.setAppSetting('unit_system', 'imperial');
    expect(wartosc(file, 'unit_system')).toBe('imperial');
    expect(uszk.uszkodzoneWiersze()).toEqual([]);
  });

  it('lekcja: przełącznik przy błędzie odczytu postępu jest odrzucony, zaliczone lekcje zostają', async () => {
    const { app } = await telefon();
    await app.store.toggleLessonProgress(2);
    control().failReadsMatching = /FROM lesson_progress/;
    await expect(app.store.toggleLessonProgress(2)).rejects.toBeInstanceOf(app.status.StorageWriteError);
    await expect(app.store.toggleLessonProgress(3)).rejects.toBeInstanceOf(app.status.StorageWriteError);
    control().failReadsMatching = null;
    expect(await app.store.getCompletedLessons()).toEqual([2]);
  });
});
