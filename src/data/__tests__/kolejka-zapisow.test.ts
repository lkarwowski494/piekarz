/**
 * zKolejka i kolejka [M1-audytor-generalny-001]: zapisy i transakcje po kolei, odczyty bez kolejki, w transakcji `tx`
 * to połączenie bez kolejki.
 */
import type * as SQLite from 'expo-sqlite';
import { kolejka, zKolejka } from '../kolejka-zapisow';

function atrapa() {
  const log: string[] = [];
  const pauza = () => new Promise<void>((r) => setTimeout(r, 5));
  const db = {
    runAsync: async (sql: string) => { log.push(`start ${sql}`); await pauza(); log.push(`koniec ${sql}`); return { changes: 1, lastInsertRowId: 0 }; },
    execAsync: async (sql: string) => { log.push(`start ${sql}`); await pauza(); log.push(`koniec ${sql}`); },
    getAllAsync: async (sql: string) => { log.push(`odczyt ${sql}`); return []; },
    withTransactionAsync: async (fn: () => Promise<void>) => { log.push('BEGIN'); await fn(); log.push('COMMIT'); },
  };
  return { db: db as unknown as SQLite.SQLiteDatabase, log };
}

describe('zKolejka', () => {
  it('zapisy spoza transakcji czekają na jej koniec; w transakcji tx zapisuje bez kolejki', async () => {
    const { db, log } = atrapa();
    const b = zKolejka(db);
    let tx: SQLite.SQLiteDatabase | null = null;
    const t = b.withTransactionAsync(async (x) => {
      tx = x;
      await x.runAsync('A');
      await x.runAsync('B');
    });
    const z = b.runAsync('C');
    await Promise.all([t, z]);
    expect(tx).toBe(db);
    expect(log).toEqual(['BEGIN', 'start A', 'koniec A', 'start B', 'koniec B', 'COMMIT', 'start C', 'koniec C']);
  });

  it('odczyt nie czeka w kolejce', async () => {
    const { db, log } = atrapa();
    const b = zKolejka(db);
    const z = b.execAsync('X');
    await b.getAllAsync('S');
    await z;
    expect(log.indexOf('odczyt S')).toBeLessThan(log.indexOf('koniec X'));
  });

  it('nieudane zadanie nie blokuje następnych', async () => {
    const q = kolejka();
    await expect(q(async () => { throw new Error('x'); })).rejects.toThrow('x');
    await expect(q(async () => 2)).resolves.toBe(2);
  });
});
