/**
 * Ścieżka ratunku z trybu awaryjnego kończy się w aplikacji, nie u dewelopera [M1-audytor-generalny-003; 12-niezawodnosc-001,
 * DEC-17 a, D-286]: pakiet plików bazy z ekranu awaryjnego albo ekranu błędu bazy (format `piekarz-pliki-bazy`) „Importuj
 * z pliku” rozpoznaje i przywraca istniejącą ścieżką importu kopii (kopia przed importem, restoreFromBackupData), a oba
 * ekrany mają „Napisz do nas” (napiszDoAutora) i ostrzeżenie przed usunięciem aplikacji.
 *
 * Prawdziwy SQLite (node:sqlite). Makieta expo-file-system trzyma pliki w pamięci, więc zapis base64 kopii z pakietu do
 * katalogu tymczasowego trafia tu też na dysk, tam gdzie adapter SQLite otwiera bazę o tej nazwie (most testu).
 * Źródło pakietu: kopia bazy buildu 1021 (v6; 4 wypieki, 2 zakwasy, 2 sesje — jak sonda S1) i zapis tylko w pliku -wal.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('../lib/zgloszenie-wyslanie', () => ({ napiszDoAutora: jest.fn(async () => undefined) }));
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => R.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import * as fs from 'node:fs';
import * as path from 'node:path';
import type React from 'react';
import type renderer from 'react-test-renderer';
import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts, control } from '../data/__tests__/helpers/node-sqlite-adapter';
import { zalozBaze1021 } from '../data/__tests__/helpers/baza-1021';
import type { RozpoznanyPlik } from '../lib/import-z-pliku';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const DB_URI = 'file:///var/mobile/Containers/Data/Application/TEST/Library/SQLite/piekarz.db';
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const flush = async () => {
  for (let i = 0; i < 50; i++) await new Promise((r) => setImmediate(r));
};

const OSTRZEZENIE = 'Nie usuwaj aplikacji. Usunięcie jej skasuje dane i kopie zapasowe zapisane w telefonie.';
const CO_Z_PLIKIEM = 'Zachowaj plik kopii, np. w Plikach. Gdy aplikacja znów zadziała, zaimportujesz go w Ustawieniach: Importuj z pliku.';
const NIEODCZYTANY = 'Nie odczytałem danych z tej kopii bazy. Zachowaj plik i napisz do nas.';

const writeMock = FileSystem.writeAsStringAsync as jest.Mock;
const deleteMock = FileSystem.deleteAsync as jest.Mock;
const zapisWPamieci = writeMock.getMockImplementation();
const usuniecieWPamieci = deleteMock.getMockImplementation();

/** Most: plik zapisany w base64 trafia też na dysk, gdzie adapter SQLite otwiera bazę o tej nazwie (Documents/SQLite). */
function mostDoDysku() {
  writeMock.mockImplementation(async (uri: string, tresc: string, opcje?: { encoding?: string }) => {
    mockFiles.set(uri, tresc);
    if (opcje?.encoding === 'base64') {
      const cel = dbFilePath(uri.slice(uri.lastIndexOf('/') + 1));
      fs.mkdirSync(path.dirname(cel), { recursive: true });
      fs.writeFileSync(cel, Buffer.from(tresc, 'base64'));
    }
  });
  // Usunięcie katalogu kopii z pakietu usuwa też pliki na dysku (jak na telefonie: każdy import ma nowy katalog)
  deleteMock.mockImplementation(async (uri: string, opcje?: unknown) => {
    await usuniecieWPamieci?.(uri, opcje);
    if (!uri.includes('import-pakietu')) return;
    for (const s of ['', '-wal', '-shm']) fs.rmSync(dbFilePath(`import-pakietu.db${s}`), { force: true });
  });
}

/** Pliki bazy 1021 z telefonu, który wpadł w pętlę awarii: zmiana nazwy zakwasu jest tylko w pliku -wal. */
function plikiTelefonu(): { db: string; wal: string } {
  const plik = path.join(control().dir, 'telefon-1', 'piekarz.db');
  zalozBaze1021(plik);
  const raw = openRaw(plik);
  raw.exec("PRAGMA wal_autocheckpoint = 0; UPDATE starters SET name = 'Zakwas z pliku WAL' WHERE id = 'starter_lodowka';");
  const db = fs.readFileSync(plik).toString('base64');
  const wal = fs.readFileSync(`${plik}-wal`).toString('base64');
  raw.close();
  return { db, wal };
}

/** Pakiet tak, jak zapisuje go ekran awaryjny (pakietPlikowBazy), jako tekst pliku. */
async function pakietZEkranu(pliki: { db: string; wal?: string }): Promise<string> {
  mockFiles.set(DB_URI, pliki.db);
  if (pliki.wal) mockFiles.set(`${DB_URI}-wal`, pliki.wal);
  const { pakietPlikowBazy } = require('../lib/kopia-plikow-bazy') as typeof import('../lib/kopia-plikow-bazy');
  const sciezka = await pakietPlikowBazy(DB_URI);
  const tekst = String(mockFiles.get(String(sciezka)));
  mockFiles.delete(DB_URI);
  mockFiles.delete(`${DB_URI}-wal`);
  return tekst;
}

const counts = () => {
  const raw = openRaw(APP_DB());
  const c = tableCounts(raw);
  raw.close();
  return c;
};

/** Nowa instalacja po usunięciu aplikacji: pusta baza z jednym wpisem z nowego telefonu. */
async function nowaInstalacja() {
  const app = restartApp();
  await app.schema.initDatabase();
  await app.store.saveBakeLog({ id: 'bake_nowy', recipeName: 'Chleb po reinstalacji', startedAt: 5000, finishedAt: 6000 });
  return app;
}

describe('003: import pakietu plików bazy z trybu awaryjnego', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
    mostDoDysku();
  });
  afterEach(() => {
    writeMock.mockImplementation(zapisWPamieci);
    deleteMock.mockImplementation(usuniecieWPamieci);
    jest.restoreAllMocks();
  });

  it('pakiet z ekranu awaryjnego: rozpoznany, przywrócony z danymi z pliku -wal, z kopią przed importem; plik tymczasowy usunięty', async () => {
    const pliki = plikiTelefonu();
    const tekst = await pakietZEkranu(pliki);
    const app = await nowaInstalacja();
    const { rozpoznajPlik, importujKopie, zdanieKopii } = require('../lib/import-z-pliku') as typeof import('../lib/import-z-pliku');
    const { kopiaZPakietu } = require('../lib/import-pakietu') as typeof import('../lib/import-pakietu');

    const p = rozpoznajPlik(tekst);
    if (p?.rodzaj !== 'pakiet') throw new Error(`rodzaj: ${p?.rodzaj}`);
    const w: RozpoznanyPlik = await kopiaZPakietu(p.pakiet);
    if (w.rodzaj !== 'kopia') throw new Error(`rodzaj: ${w.rodzaj}`);
    expect(w.kopia.state.bakes).toHaveLength(4);
    expect(w.kopia.state.starters).toHaveLength(2);
    expect(w.kopia.state.starters.map((s) => s.name)).toContain('Zakwas z pliku WAL');
    expect(zdanieKopii(w.kopia)).toMatch(/^Kopia z /);
    // Kontrola: bez pliku -wal zmiany nazwy nie ma, więc test sprawdza, że import czyta zapisy z -wal
    const bezWal = await kopiaZPakietu({ ...p.pakiet, wal: null });
    if (bezWal.rodzaj !== 'kopia') throw new Error(`rodzaj: ${bezWal.rodzaj}`);
    expect(bezWal.kopia.state.starters.map((s) => s.name)).not.toContain('Zakwas z pliku WAL');

    await importujKopie(w.kopia);
    expect(counts()).toEqual(expect.objectContaining({ bakes: 4, starters: 2 }));
    expect((await app.store.getStarters()).map((s) => s.name)).toContain('Zakwas z pliku WAL');
    // Kopia przed importem z danymi nowej instalacji (istniejąca ścieżka importu)
    const przed = [...mockFiles.keys()].filter((k) => /piekarz-przed-importem-.*\.json$/.test(k));
    expect(przed).toHaveLength(1);
    expect(String(mockFiles.get(przed[0]))).toContain('bake_nowy');
    // Kopia z pakietu w katalogu tymczasowym usunięta; pakiet zostaje do ponownego importu
    expect([...mockFiles.keys()].filter((k) => k.includes('import-pakietu'))).toEqual([]);
    expect(rozpoznajPlik(tekst)?.rodzaj).toBe('pakiet');
  });

  it('arkusz „Importuj z pliku”: pakiet daje podgląd kopii i „Zastąp dane” zapisuje dane z pakietu', async () => {
    const tekst = await pakietZEkranu(plikiTelefonu());
    await nowaInstalacja();
    const R: typeof React = require('react');
    const TR: typeof renderer = require('react-test-renderer');
    const RN: typeof import('react-native') = require('react-native');
    jest.spyOn(RN.Alert, 'alert').mockImplementation(() => {});
    const { ImportZPlikuArkusz } = require('../components/settings/ImportZPlikuArkusz') as typeof import('../components/settings/ImportZPlikuArkusz');
    let t!: renderer.ReactTestRenderer;
    await TR.act(async () => {
      t = TR.create(R.createElement(ImportZPlikuArkusz, { onClose: () => undefined, onRecipeImported: () => undefined }));
    });
    await TR.act(async () => {
      t.root.findByProps({ testID: 'import-json-input' }).props.onChangeText(tekst);
      await flush();
    });
    await TR.act(async () => {
      await flush();
    });
    expect(t.root.findAll((n) => n.props?.testID === 'import-unrecognized')).toHaveLength(0);
    const zastap = t.root.findAll((n) => n.props?.testID === 'confirm-import-btn' && typeof n.props.onPress === 'function');
    expect(zastap).toHaveLength(1);
    await TR.act(async () => {
      await zastap[0].props.onPress();
      await flush();
    });
    expect(counts()).toEqual(expect.objectContaining({ bakes: 4, starters: 2 }));
    await TR.act(async () => t.unmount());
  });

  it('trwający i zaplanowany wypiek wracają z pakietu po „Zastąp dane” [M1-audytor-generalny-087; 12-niezawodnosc-601]', async () => {
    // Trwała kontrola: liczność bake_sessions po imporcie pakietu bazy 1021 (2 sesje: active, planned), jak sonda 601
    const pliki = plikiTelefonu();
    const zr = openRaw(path.join(control().dir, 'telefon-1', 'piekarz.db'));
    const wPakiecie = zr.prepare('SELECT id, status, session_json, created_at, updated_at FROM bake_sessions ORDER BY id;').all();
    zr.close();
    expect(wPakiecie.map((w) => (w as { status: string }).status).sort()).toEqual(['active', 'planned']);
    const tekst = await pakietZEkranu(pliki);
    await nowaInstalacja();
    expect(counts().bake_sessions).toBe(0);
    const R: typeof React = require('react');
    const TR: typeof renderer = require('react-test-renderer');
    const RN: typeof import('react-native') = require('react-native');
    jest.spyOn(RN.Alert, 'alert').mockImplementation(() => {});
    const { ImportZPlikuArkusz } = require('../components/settings/ImportZPlikuArkusz') as typeof import('../components/settings/ImportZPlikuArkusz');
    let t!: renderer.ReactTestRenderer;
    await TR.act(async () => {
      t = TR.create(R.createElement(ImportZPlikuArkusz, { onClose: () => undefined, onRecipeImported: () => undefined }));
    });
    await TR.act(async () => {
      t.root.findByProps({ testID: 'import-json-input' }).props.onChangeText(tekst);
      await flush();
    });
    await TR.act(async () => {
      await flush();
    });
    const zastap = t.root.findAll((n) => n.props?.testID === 'confirm-import-btn' && typeof n.props.onPress === 'function');
    expect(zastap).toHaveLength(1);
    await TR.act(async () => {
      await zastap[0].props.onPress();
      await flush();
    });
    expect(counts()).toEqual(expect.objectContaining({ bakes: 4, starters: 2, bake_sessions: 2 }));
    const po = openRaw(APP_DB());
    expect(po.prepare('SELECT id, status, session_json, created_at, updated_at FROM bake_sessions ORDER BY id;').all()).toEqual(wPakiecie);
    po.close();
    await TR.act(async () => t.unmount());
  });

  it('pakiet z nowszej wersji: „nowsza”; pakiet bez bazy Piekarza albo z uszkodzonym plikiem: powód i dane bez zmian', async () => {
    const app = await nowaInstalacja();
    const przed = counts();
    const { rozpoznajPlik } = require('../lib/import-z-pliku') as typeof import('../lib/import-z-pliku');
    const { kopiaZPakietu } = require('../lib/import-pakietu') as typeof import('../lib/import-pakietu');
    const zPakietu = async (tekst: string): Promise<RozpoznanyPlik | null> => {
      const p = rozpoznajPlik(tekst);
      return p?.rodzaj === 'pakiet' ? kopiaZPakietu(p.pakiet) : p;
    };
    const baza = (sql: string): string => {
      const plik = path.join(control().dir, 'inne', `b${Math.random()}.db`);
      const raw = openRaw(plik);
      raw.exec(sql);
      raw.close();
      return fs.readFileSync(plik).toString('base64');
    };

    expect((await zPakietu(await pakietZEkranu({ db: baza('CREATE TABLE x (a); PRAGMA user_version = 99;') })))?.rodzaj).toBe('nowsza');
    const obca = await zPakietu(await pakietZEkranu({ db: baza('CREATE TABLE x (a);') }));
    expect(obca).toEqual({ rodzaj: 'nierozpoznany', powod: NIEODCZYTANY });
    const smieci = await zPakietu(await pakietZEkranu({ db: Buffer.alloc(8192, 0x41).toString('base64') }));
    expect(smieci).toEqual({ rodzaj: 'nierozpoznany', powod: NIEODCZYTANY });
    const bezBazy = JSON.stringify({ format: 'piekarz-pliki-bazy', wersja: 1, utworzono: '2026-11-09T10:00:00.000Z', pliki: [{ nazwa: 'piekarz.db-wal', base64: 'QQ==' }] });
    expect(rozpoznajPlik(bezBazy)).toEqual({ rodzaj: 'nierozpoznany', powod: NIEODCZYTANY });
    expect(counts()).toEqual(przed);
    expect((await app.store.getBakeLogs()).map((b) => b.id)).toEqual(['bake_nowy']);
  });
});

describe('003: pakietZJson i pakietNieodczytany (dane z zewnątrz od unknown)', () => {
  it('nie-pakiet = null; pakiet bez bazy, z dwiema bazami albo z błędnym base64 = „uszkodzony”; -shm pominięty', () => {
    const { pakietZJson, pakietNieodczytany } = require('../lib/import-pakietu') as typeof import('../lib/import-pakietu');
    const pk = (pliki: unknown, extra: Record<string, unknown> = {}) => ({ format: 'piekarz-pliki-bazy', wersja: 1, pliki, ...extra });
    expect(pakietZJson(null)).toBeNull();
    expect(pakietZJson({ format: 'piekarz-backup' })).toBeNull();
    expect(pakietZJson(pk('x'))).toBe('uszkodzony');
    expect(pakietZJson(pk([]))).toBe('uszkodzony');
    expect(pakietZJson(pk([{ nazwa: 'piekarz.db', base64: 'QQ==' }, { nazwa: 'inna.db', base64: 'QQ==' }]))).toBe('uszkodzony');
    expect(pakietZJson(pk([{ nazwa: 'piekarz.db', base64: 'nie base64!' }]))).toBe('uszkodzony');
    expect(pakietZJson(pk([{ nazwa: 'piekarz.db', base64: 'QQ==' }, { nazwa: 'piekarz.db-shm', base64: 'Qg==' }, { nazwa: 'piekarz.db-wal', base64: 'Qw==' }], { utworzono: '2026-11-09T10:00:00.000Z' })))
      .toEqual({ utworzono: '2026-11-09T10:00:00.000Z', db: 'QQ==', wal: 'Qw==' });
    expect(pakietZJson(pk([{ nazwa: 'piekarz.db', base64: 'QQ==' }]))).toEqual({ utworzono: '', db: 'QQ==', wal: null });
    expect(pakietNieodczytany()).toEqual({ rodzaj: 'nierozpoznany', powod: NIEODCZYTANY });
  });
});

describe('003: ekran awaryjny i ekran błędu bazy — kontakt i ostrzeżenie przed usunięciem aplikacji', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  const tekstDrzewa = (t: renderer.ReactTestRenderer) =>
    t.root.findAll((n) => typeof n.type === 'string' && String(n.type) === 'Text')
      .flatMap((n) => n.children.filter((c): c is string => typeof c === 'string')).join('\n');

  async function render(element: (R: typeof React) => React.ReactElement) {
    const R: typeof React = require('react');
    const TR: typeof renderer = require('react-test-renderer');
    let t!: renderer.ReactTestRenderer;
    await TR.act(async () => {
      t = TR.create(element(R));
    });
    const napisz = (require('../lib/zgloszenie-wyslanie') as { napiszDoAutora: jest.Mock }).napiszDoAutora;
    const nacisnij = async (testID: string) => {
      const all = t.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
      expect({ testID, found: all.length }).toEqual({ testID, found: 1 });
      await TR.act(async () => {
        await all[0].props.onPress();
      });
    };
    return { t, napisz, nacisnij, TR };
  }

  it('ekran awaryjny: ostrzeżenie, co zrobić z plikiem i „Napisz do nas” wołające napiszDoAutora', async () => {
    jest.resetModules();
    const { RescueScreen } = require('../components/RescueScreen') as typeof import('../components/RescueScreen');
    const r = await render((R) => R.createElement(RescueScreen, { onRetry: async () => undefined, bezMigracji: true }));
    expect(tekstDrzewa(r.t)).toContain(OSTRZEZENIE);
    expect(tekstDrzewa(r.t)).toContain(CO_Z_PLIKIEM);
    expect(tekstDrzewa(r.t)).toContain('Napisz do nas');
    await r.nacisnij('rescue-contact');
    expect(r.napisz).toHaveBeenCalledTimes(1);
    await r.TR.act(async () => r.t.unmount());
  });

  it('ekran błędu bazy z pakietem: ostrzeżenie, co zrobić z plikiem i kontakt; z kopią .db sprzed migracji: ostrzeżenie i kontakt bez obietnicy importu', async () => {
    jest.resetModules();
    const status = require('../data/storage-status') as typeof import('../data/storage-status');
    const { StorageGate } = require('../components/StorageGate') as typeof import('../components/StorageGate');
    status.markStorageUnavailable('file is not a database', 'file:///mock/documents/Backup/kopie-ratunkowe/piekarz-pliki-bazy-1.json', 'pliki-bazy');
    const r = await render((R) => R.createElement(StorageGate, { onRetry: async () => undefined, children: null }));
    expect(tekstDrzewa(r.t)).toContain(OSTRZEZENIE);
    expect(tekstDrzewa(r.t)).toContain(CO_Z_PLIKIEM);
    await r.nacisnij('storage-contact');
    expect(r.napisz).toHaveBeenCalledTimes(1);
    await r.TR.act(async () => r.t.unmount());

    status.markStorageUnavailable('migration failed', '/x/backup_pre_migration-v6-1.db', 'przed-migracja');
    const r2 = await render((R) => R.createElement(StorageGate, { onRetry: async () => undefined, children: null }));
    expect(tekstDrzewa(r2.t)).toContain(OSTRZEZENIE);
    expect(tekstDrzewa(r2.t)).not.toContain(CO_Z_PLIKIEM);
    await r2.nacisnij('storage-contact');
    expect(r2.napisz).toHaveBeenCalledTimes(2);
    await r2.TR.act(async () => r2.t.unmount());
  });

  it('nowe teksty mają wpis EN i przekład w każdym z 33 języków (35 języków)', () => {
    const { EN } = require('../lib/i18n.en') as typeof import('../lib/i18n.en');
    const { LADOWANIE_SLOWNIKOW } = require('../lib/i18n-slowniki') as typeof import('../lib/i18n-slowniki');
    const kody = Object.keys(LADOWANIE_SLOWNIKOW);
    expect(kody).toHaveLength(33);
    for (const k of [OSTRZEZENIE, CO_Z_PLIKIEM, NIEODCZYTANY]) {
      expect({ k, en: Boolean(EN[k]) }).toEqual({ k, en: true });
      for (const kod of kody) {
        const v = LADOWANIE_SLOWNIKOW[kod]()[k];
        expect({ k, kod, ok: typeof v === 'string' && v.length > 0 && v !== k && v !== EN[k] }).toEqual({ k, kod, ok: true });
      }
    }
  });
});
