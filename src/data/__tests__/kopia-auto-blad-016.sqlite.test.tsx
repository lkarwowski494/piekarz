/**
 * Błąd kopii automatycznej po wypieku nie jest połykany: zapis stanu „ostatnia kopia automatyczna się nie udała”
 * i informacja w Ustawieniach → Kopia zapasowa; udana kopia czyści stan [M1-audytor-generalny-016; 07-jakosc-003].
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());
let mockKopia: 'ok' | 'null' | 'rzuca' = 'ok';
jest.mock('../../lib/backup', () => ({
  ...jest.requireActual('../../lib/backup'),
  autoBackup: jest.fn(async () => {
    if (mockKopia === 'rzuca') throw new Error('dysk pełny');
    return mockKopia === 'ok' ? 'file:///kopie/piekarz-kopia-1.json' : null;
  }),
}));
import type TR from 'react-test-renderer';
import { useTempDbDir, restartApp } from './helpers/node-sqlite-adapter';
const ka = () => require('../../lib/kopia-auto-stan') as typeof import('../../lib/kopia-auto-stan');
import { t } from '../../lib/i18n';

const log = (id: string) => ({ id, recipeName: 'X', startedAt: 1, finishedAt: 2, ratingStars: 5 });
const czekaj = async () => { for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r)); };

describe('016: błąd kopii automatycznej po wypieku', () => {
  beforeEach(() => { mockKopia = 'ok'; });
  it.each(['null', 'rzuca'] as const)('kopia %s → stan błędu zapisany i trwały po restarcie; udana kopia go czyści', async (tryb) => {
    useTempDbDir();
    let app = restartApp();
    await app.schema.initDatabase();
    mockKopia = tryb;
    expect(await app.store.finishBake(log('b1'), [], {})).toBe('zapisano');
    await czekaj();
    expect(await ka().bladKopiiAuto()).not.toBeNull();
    app = restartApp();
    await app.schema.initDatabase();
    expect(await ka().bladKopiiAuto()).not.toBeNull();
    mockKopia = 'ok';
    expect(await app.store.finishBake(log('b2'), [], {})).toBe('zapisano');
    await czekaj();
    expect(await ka().bladKopiiAuto()).toBeNull();
  });
  it('kopiaPoWypieku: wynik zapisany pod KLUCZ_BLEDU_KOPII (chwila błędu albo pusto)', async () => {
    useTempDbDir();
    const app = restartApp();
    await app.schema.initDatabase();
    const { kopiaPoWypieku, KLUCZ_BLEDU_KOPII } = ka();
    const { getAppSetting } = require('../settings-store');
    mockKopia = 'rzuca';
    await kopiaPoWypieku(async () => ({}) as never);
    expect(await getAppSetting(KLUCZ_BLEDU_KOPII)).toMatch(/^\d+$/);
    mockKopia = 'ok';
    await kopiaPoWypieku(async () => ({}) as never);
    expect(await getAppSetting(KLUCZ_BLEDU_KOPII)).toBe('');
  });
  it('Ustawienia → Kopia zapasowa pokazują informację o nieudanej kopii (useBladKopiiAuto)', async () => {
    useTempDbDir();
    const app = restartApp();
    await app.schema.initDatabase();
    mockKopia = 'null';
    await app.store.finishBake(log('b3'), [], {});
    await czekaj();
    // Po restarcie aplikacji stan czyta się z app_settings (informacja nie znika z ponownym uruchomieniem)
    const po = restartApp();
    await po.schema.initDatabase();
    // Po restartApp (resetModules) React i renderer z tego samego rejestru modułów co komponent
    const React = require('react') as typeof import('react');
    const renderer = require('react-test-renderer') as typeof TR;
    const { act } = renderer;
    const { useBladKopiiAuto } = ka();
    expect(typeof useBladKopiiAuto).toBe('function'); // hak ekranu Kopii zapasowej
    const { BackupAndDataSection } = require('../../components/settings/BackupAndDataSection');
    let tree!: TR.ReactTestRenderer;
    await act(async () => { tree = renderer.create(React.createElement(BackupAndDataSection)); await czekaj(); });
    expect(JSON.stringify(tree.toJSON())).toContain(t('Ostatnia kopia automatyczna po wypieku nie zapisała się. Zapisz kopię ręcznie przyciskiem niżej.'));
    act(() => tree.unmount());
  });
});
