/**
 * Import kopii z innym językiem i jednostkami zmienia je od razu, bez ponownego uruchomienia (BR-DANE-003
 * „Pełny eksport”; ustawienia w kopii od 139) [M2-koordynator-napraw-502 (p11); M1-audytor-generalny-139].
 * Prawdziwa baza SQLite (adapter node:sqlite).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp } from '../data/__tests__/helpers/node-sqlite-adapter';

describe('502: import kopii a język i jednostki w działającej aplikacji', () => {
  it('kopia z language: en i unit_system: imperial → teksty po angielsku i °F od razu', async () => {
    useTempDbDir();
    const app = restartApp();
    await app.schema.initDatabase();
    const i18n = require('../lib/i18n') as typeof import('../lib/i18n');
    const units = require('../lib/unit-converter') as typeof import('../lib/unit-converter');
    const { importujKopie } = require('../lib/import-z-pliku') as typeof import('../lib/import-z-pliku');
    const { parseAndValidateBackup, buildBackup } = require('../lib/backup') as typeof import('../lib/backup');
    await i18n.chooseLanguage('pl');
    units.setUnitSystem('metric');
    await new Promise((r) => setTimeout(r, 0));

    const dane = await app.store.collectBackupData();
    const kopia = parseAndValidateBackup(
      JSON.stringify(buildBackup({ ...dane, settings: { ...(dane.settings ?? {}), language: 'en', unit_system: 'imperial' } })),
    );
    expect(i18n.lang()).toBe('pl');
    await importujKopie(kopia);

    expect(i18n.lang()).toBe('en');
    expect(i18n.t('Zapisz')).toBe('Save');
    expect(units.getUnitSystem()).toBe('imperial');
  });
});
