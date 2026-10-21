/**
 * Dane pokazowe nie udają danych użytkownika [M1-audytor-generalny-003; 05-architekt-502, 12-niezawodnosc-501, 12-niezawodnosc-508].
 * Prawdziwy SQLite (node:sqlite) i ekran Zakwasów za StorageGate, jak w aplikacji (app/_layout.tsx).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import * as fs from 'node:fs';
import * as path from 'node:path';
import type React from 'react';
import type { ReactTestRenderer } from 'react-test-renderer';
import { useTempDbDir, openRaw, dbFilePath } from '../data/__tests__/helpers/node-sqlite-adapter';

const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const DEMO = 'Bolesław';

type Mods = {
  store: typeof import('../data/sqlite-store');
  status: typeof import('../data/storage-status');
  Gate: typeof import('../components/StorageGate').StorageGate;
  Zakwasy: React.ComponentType;
  React: typeof import('react');
  TR: typeof import('react-test-renderer');
};

/** Świeże moduły jak przy uruchomieniu aplikacji (stan magazynu od zera), z dostępem z App Store. */
function uruchom(): Mods {
  jest.resetModules();
  (require('../../tests/helpers/platnosci') as typeof import('../../tests/helpers/platnosci')).zUprawnieniem();
  return {
    store: require('../data/sqlite-store'),
    status: require('../data/storage-status'),
    Gate: require('../components/StorageGate').StorageGate,
    Zakwasy: require('../../app/(tabs)/zakwasy/index').default,
    React: require('react'),
    TR: require('react-test-renderer'),
  };
}

const tekst = (r: ReactTestRenderer): string =>
  r.root.findAll((n) => typeof n.props.children === 'string').map((n) => n.props.children as string).join(' | ');

/** Baza z buildu b1013 (schemat ebd8471) z dwoma zakwasami użytkownika. */
function bazaB1013(): void {
  const raw = openRaw(APP_DB());
  raw.exec(fs.readFileSync(path.join(__dirname, '../data/__tests__/fixtures/schema-ebd8471.sql'), 'utf8'));
  for (let n = 1; n <= 2; n++) {
    raw.prepare('INSERT INTO starters (id, name, flour_type, hydration, birth_date, storage_state, last_fed_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(`starter_${n}`, `Zakwas użytkownika ${n}`, 'Żytnia 2000', 100, 1, 'FRIDGE', 2);
  }
  raw.close();
}

async function renderZaBramka(m: Mods): Promise<ReactTestRenderer> {
  let r!: ReactTestRenderer;
  await m.TR.act(async () => {
    r = m.TR.create(m.React.createElement(m.Gate, { onRetry: async () => undefined, children: m.React.createElement(m.Zakwasy) }));
  });
  return r;
}

describe('Dane pokazowe a dane użytkownika (003)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('pierwszy start po aktualizacji z b1013: Zakwasy nie pytają bazy przed końcem migracji i pokazują zakwasy użytkownika, nie pokazowy', async () => {
    bazaB1013();
    const m = uruchom();
    const r = await renderZaBramka(m);
    // Start aplikacji: bramka czeka na koniec initDatabase, ekran danych jeszcze się nie wyrenderował
    expect(r.root.findAllByProps({ testID: 'storage-initializing' }).length).toBeGreaterThan(0);
    expect(tekst(r)).not.toContain(DEMO);
    await m.TR.act(async () => {
      await m.store.initDatabase();
    });
    await m.TR.act(async () => {
      await new Promise((res) => setTimeout(res, 0));
    });
    const t = tekst(r);
    expect(t).toContain('Zakwas użytkownika 1');
    expect(t).toContain('Zakwas użytkownika 2');
    expect(t).not.toContain(DEMO);
    expect((await m.store.getStarters()).map((s) => s.id).sort()).toEqual(['starter_1', 'starter_2']);
  });

  it('świeża instalacja: pusta lista zakwasów, bez zakwasu i mąk pokazowych', async () => {
    const m = uruchom();
    await m.store.initDatabase();
    expect(m.status.getStorageState()).toBe('ok');
    expect(await m.store.getStarters()).toEqual([]);
    expect(await m.store.getFlourInventory()).toEqual([]);
    const r = await renderZaBramka(m);
    expect(tekst(r)).not.toContain(DEMO);
    const data = await m.store.collectBackupData();
    expect(data.starters).toEqual([]);
    expect(data.flourInventory).toEqual([]);
  });

  it('błąd odczytu tabeli: ekran niedostępnej bazy zamiast danych pokazowych, a kopia zapasowa nie powstaje z niepełnych danych', async () => {
    const m = uruchom();
    await m.store.initDatabase();
    const raw = openRaw(APP_DB());
    raw.exec('DROP TABLE starter_entries;');
    raw.close();
    expect(await m.store.getStarters()).toEqual([]);
    expect(m.status.getStorageState()).toBe('unavailable');
    await expect(m.store.collectBackupData()).rejects.toThrow();
    const r = await renderZaBramka(m);
    expect(r.root.findAllByProps({ testID: 'storage-unavailable-screen' }).length).toBeGreaterThan(0);
    expect(tekst(r)).not.toContain(DEMO);
  });

  it('odczytNieudany: pusta lista i stan „unavailable” z komunikatem błędu', () => {
    const m = uruchom();
    const { odczytNieudany } = require('../data/odczyt') as typeof import('../data/odczyt');
    expect(odczytNieudany(new Error('no such table: starters'))).toEqual([]);
    expect(m.status.getStorageState()).toBe('unavailable');
    expect(m.status.getStorageError()).toBe('no such table: starters');
    // markStorageReady na końcu initDatabase nie zasłania błędu
    m.status.markStorageReady();
    expect(m.status.getStorageState()).toBe('unavailable');
  });
});
