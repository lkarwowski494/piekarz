/**
 * Kopie ratunkowe bez limitu [M1-audytor-generalny-141; 12-niezawodnosc-506, 12-niezawodnosc-602, 12-niezawodnosc-603]:
 * jedna kopia (surowe pliki, plik state_corrupt_*, pakiet) na stan plików bazy i jeden plik uszkodzone-wiersze-*
 * na uszkodzenie, zamiast nowego zestawu przy każdym otwarciu, „Spróbuj ponownie” i uruchomieniu.
 * Zegar ustawiony (sekunda w nazwie pliku), pliki w makiecie expo-file-system.
 */
import * as FileSystem from 'expo-file-system/legacy';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const DB_URI = 'file:///var/mobile/Containers/Data/Application/TEST/Library/SQLite/piekarz.db';
const klucze = (re: RegExp) => [...mockFiles.keys()].filter((k) => re.test(k));
const katalogiKopii = () => new Set(klucze(/kopie-ratunkowe\/\d{4}-\d{2}-\d{2}-\d{6}\/piekarz\.db/).map((k) => k.slice(0, k.lastIndexOf('/'))));

let teraz = new Date(2026, 9, 21, 22, 0, 0).getTime();
const minieSekunda = () => {
  teraz += 61_000;
  jest.setSystemTime(teraz);
};

beforeEach(() => {
  mockFiles.clear();
  jest.useFakeTimers({ now: teraz, doNotFake: ['nextTick', 'setImmediate', 'clearImmediate', 'queueMicrotask', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
});
afterEach(() => jest.useRealTimers());

describe('141: kopie ratunkowe plików bazy (S8, sonda P3)', () => {
  it('S8: 5 nieudanych otwarć niezmienionego pliku zostawia jeden zestaw: katalog kopii, state_corrupt_* i pakiet', async () => {
    mockFiles.set(DB_URI, 'BAZA-1');
    mockFiles.set(`${DB_URI}-wal`, 'WAL-1');
    const { ratujPlikiBazy } = require('../lib/kopia-plikow-bazy') as typeof import('../lib/kopia-plikow-bazy');
    const pakiety = new Set<string | null>();
    for (let i = 0; i < 5; i++) {
      pakiety.add(await ratujPlikiBazy(DB_URI, 'file is not a database'));
      minieSekunda();
    }
    expect(katalogiKopii().size).toBe(1);
    expect(klucze(/state_corrupt_[^/]+\.json$/)).toHaveLength(1);
    expect(klucze(/piekarz-pliki-bazy-[^/]+\.json$/)).toHaveLength(1);
    expect([...pakiety]).toHaveLength(1);
    expect([...pakiety][0]).toMatch(/piekarz-pliki-bazy-[^/]+\.json$/);
  });

  it('zmieniony plik bazy (nowy stan) dostaje nowy zestaw; oryginał bez zmian', async () => {
    mockFiles.set(DB_URI, 'BAZA-1');
    const { ratujPlikiBazy } = require('../lib/kopia-plikow-bazy') as typeof import('../lib/kopia-plikow-bazy');
    await ratujPlikiBazy(DB_URI, 'x');
    minieSekunda();
    mockFiles.set(DB_URI, 'BAZA-2');
    await ratujPlikiBazy(DB_URI, 'x');
    expect(katalogiKopii().size).toBe(2);
    expect(klucze(/piekarz-pliki-bazy-[^/]+\.json$/)).toHaveLength(2);
    expect(mockFiles.get(DB_URI)).toBe('BAZA-2');
  });
});

describe('141: plik uszkodzonych wierszy (sonda P2)', () => {
  it('5 uruchomień z tym samym uszkodzonym wierszem zostawia jeden plik z jego surową treścią; nowy wiersz dopisuje się do niego', async () => {
    const wiersz = { tabela: 'recipes', id: 'r_bad', surowe: '{"flours": [ZEPSUTE' };
    for (let i = 0; i < 5; i++) {
      jest.resetModules();
      const u = require('../data/uszkodzone-wiersze') as typeof import('../data/uszkodzone-wiersze');
      u.zachowajUszkodzony(wiersz);
      await u.zapisUszkodzonych();
      minieSekunda();
    }
    const pliki = klucze(/kopie-ratunkowe\/uszkodzone-wiersze-[^/]+\.json$/);
    expect(pliki).toHaveLength(1);
    expect(JSON.parse(String(mockFiles.get(pliki[0]))).wiersze).toEqual([wiersz]);

    jest.resetModules();
    const u = require('../data/uszkodzone-wiersze') as typeof import('../data/uszkodzone-wiersze');
    const drugi = { tabela: 'bakes', id: 'b1', surowe: '{ZEPSUTE' };
    u.zachowajUszkodzony(wiersz);
    u.zachowajUszkodzony(drugi);
    await u.zapisUszkodzonych();
    expect(klucze(/kopie-ratunkowe\/uszkodzone-wiersze-[^/]+\.json$/)).toEqual(pliki);
    expect(JSON.parse(String(mockFiles.get(pliki[0]))).wiersze).toEqual([wiersz, drugi]);
  });
});
