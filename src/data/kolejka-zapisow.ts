// ============================================================================
// Piekarz — jedna kolejka zapisów na jednym połączeniu SQLite [M1-audytor-generalny-001; 05-architekt-001,
// 05-architekt-502, 08-programista-001]
// `withTransactionAsync` w expo-sqlite nie jest wyłączna: zapis spoza transakcji wchodzi do cudzej transakcji, a drugi
// BEGIN kończy się ROLLBACK, który cofa cudzą transakcję (docs.expo.dev, SQLite; moduł dane-lokalne-sqlite,
// „Transakcje w expo-sqlite i klucze obce”, wariant a). Dlatego każdy zapis (runAsync, execAsync) i każda transakcja
// czekają w jednej kolejce. Odczyty idą bez kolejki (w trakcie transakcji widzą jej niezatwierdzone zmiany).
// W treści transakcji używaj wyłącznie `tx` z argumentu: zapis przez obiekt z kolejki czekałby na samą transakcję
// (pilnuje tego tests/kolejka-zapisow-tx.test.ts).
// ============================================================================

import type * as SQLite from 'expo-sqlite';

/** Połączenie z kolejką zapisów; w transakcji `tx` to to samo połączenie bez kolejki. */
export interface BazaZKolejka extends SQLite.SQLiteDatabase {
  withTransactionAsync(task: (tx: SQLite.SQLiteDatabase) => Promise<void>): Promise<void>;
}

/** Kolejka zadań: następne zaczyna się po zakończeniu poprzedniego (także nieudanego). */
export function kolejka(): <T>(zadanie: () => Promise<T>) => Promise<T> {
  let ogon: Promise<unknown> = Promise.resolve();
  return <T>(zadanie: () => Promise<T>): Promise<T> => {
    const wynik = ogon.then(zadanie, zadanie);
    ogon = wynik.catch(() => undefined);
    return wynik;
  };
}

const ZAPISY = new Set<PropertyKey>(['runAsync', 'execAsync']);

/** Obiekt połączenia, przez który aplikacja zapisuje: zapisy i transakcje w jednej kolejce. */
export function zKolejka(db: SQLite.SQLiteDatabase): BazaZKolejka {
  const wKolejce = kolejka();
  return new Proxy(db, {
    get(cel, nazwa) {
      if (ZAPISY.has(nazwa)) {
        const f = Reflect.get(cel, nazwa, cel) as (...a: unknown[]) => Promise<unknown>;
        return (...a: unknown[]) => wKolejce(() => f.apply(cel, a));
      }
      if (nazwa === 'withTransactionAsync') {
        return (task: (tx: SQLite.SQLiteDatabase) => Promise<void>) =>
          wKolejce(() => cel.withTransactionAsync(() => task(cel)));
      }
      const v: unknown = Reflect.get(cel, nazwa, cel);
      return typeof v === 'function' ? v.bind(cel) : v;
    },
  }) as BazaZKolejka;
}
