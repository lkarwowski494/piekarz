/**
 * Ekran pokazuje „Nie zapisano” zamiast sukcesu, gdy zapis do bazy się nie udał
 * [M1-audytor-generalny-003; 05-architekt-003, 08-programista-003, 12-niezawodnosc-003].
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

import React from 'react';
import { Alert, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import ZakwasScreen from '../../app/(tabs)/zakwas';
import { initDatabase, saveStarter, getStarters } from '../data/sqlite-store';
import { useTempDbDir, control } from '../data/__tests__/helpers/node-sqlite-adapter';
import { StorageGate, shareRescueFile } from '../components/StorageGate';
import { markStorageUnavailable, resetStorageState } from '../data/storage-status';
import { guardSave } from '../lib/save-guard';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const textOf = (node: renderer.ReactTestRendererJSON | renderer.ReactTestRendererJSON[] | null): string => {
  const walk = (n: unknown): string => {
    if (typeof n === 'string') return n;
    if (Array.isArray(n)) return n.map(walk).join('');
    if (typeof n === 'number') return String(n);
    if (n && typeof n === 'object' && 'children' in n) return walk((n as { children: unknown }).children);
    if (n && typeof n === 'object' && 'props' in n) return walk((n as { props: { children?: unknown } }).props.children);
    return '';
  };
  return walk(node);
};

describe('Write failure is visible on screen (003)', () => {
  beforeAll(() => {
    useTempDbDir();
  });

  beforeEach(() => {
    zUprawnieniem(); // dostęp z App Store (009): dawniej lokalny okres próbny
  });

  afterEach(() => {
    control().failWrites = false;
    resetStorageState();
  });

  it('Zakwas: logging a feeding on a full disk shows "Nie zapisano" and not the success message', async () => {
    await initDatabase();
    await saveStarter({
      id: 'starter_user_1',
      name: 'Zakwas Ani',
      flourType: 'Żytnia 2000',
      hydration: 100,
      birthDate: 1600000000000,
      storageState: 'ROOM_TEMP',
      lastFedAt: 1700000000000,
    });
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<ZakwasScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    control().failWrites = true;
    const feed = tree!.root.findAll(
      (n) => typeof n.props?.onPress === 'function' && textOf(n.props.children ?? null).includes('Zapisz dokarmienie')
    );
    expect(feed.length).toBeGreaterThan(0);
    await act(async () => {
      feed[0].props.onPress();
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });

    const titles = alert.mock.calls.map((c) => c[0]);
    expect(titles).toContain('Nie zapisano');
    expect(titles).not.toContain('Dokarmiono zakwas');
    control().failWrites = false;
    expect((await getStarters()).find((s) => s.id === 'starter_user_1')?.lastFedAt).toBe(1700000000000);
    act(() => tree!.unmount());
    alert.mockRestore();
  });

  it('StorageGate shows the database error screen instead of the app when storage is unavailable', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <StorageGate onRetry={async () => {}}>
          <Text>APP</Text>
        </StorageGate>
      );
    });
    expect(textOf(tree!.toJSON())).toContain('APP');

    await act(async () => {
      markStorageUnavailable('unable to open database file');
    });
    const text = textOf(tree!.toJSON());
    expect(text).not.toContain('APP');
    expect(text).toContain('Nie można otworzyć bazy danych');
    expect(text).toContain(
      'Twoje dane nie zostały zmienione, ale aplikacja nie może ich teraz odczytać ani zapisać. Uruchom aplikację ponownie. Jeśli problem wróci, zwolnij miejsce w pamięci telefonu.'
    );
    expect(text).toContain('Spróbuj ponownie');
    act(() => tree!.unmount());
  });

  it('StorageGate retry button re-runs database start-up', async () => {
    const onRetry = jest.fn(async () => resetStorageState());
    markStorageUnavailable('unable to open database file');
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <StorageGate onRetry={onRetry}>
          <Text>APP</Text>
        </StorageGate>
      );
    });
    const retry = tree!.root.findByProps({ testID: 'storage-retry' });
    await act(async () => {
      await retry.props.onPress();
    });
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(textOf(tree!.toJSON())).toContain('APP');
    act(() => tree!.unmount());
  });

  // [M1-audytor-generalny-004] po nieudanej migracji ekran daje drogę eksportu kopii bazy
  it('StorageGate offers sharing the pre-migration copy when a migration failed', async () => {
    const Sharing = require('expo-sharing');
    markStorageUnavailable('SQLITE_FULL', '/var/mobile/X/Library/SQLite/backup_pre_migration-v2-1.db');
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <StorageGate onRetry={async () => {}}>
          <Text>APP</Text>
        </StorageGate>
      );
    });
    const text = textOf(tree!.toJSON());
    expect(text).toContain('Kopia danych sprzed aktualizacji jest zapisana w telefonie. Możesz ją udostępnić, np. zapisać w Plikach.');
    expect(text).toContain('Udostępnij kopię bazy');
    await act(async () => {
      tree!.root.findByProps({ testID: 'storage-share-rescue' }).props.onPress();
      await Promise.resolve();
    });
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      'file:///var/mobile/X/Library/SQLite/backup_pre_migration-v2-1.db',
      expect.objectContaining({ mimeType: 'application/x-sqlite3' })
    );
    expect(await shareRescueFile('file:///a.db')).toBe(true);
    act(() => tree!.unmount());
  });

  it('StorageGate without a rescue copy (open failure) shows no share button', async () => {
    markStorageUnavailable('unable to open database file');
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <StorageGate onRetry={async () => {}}>
          <Text>APP</Text>
        </StorageGate>
      );
    });
    expect(tree!.root.findAll((n) => n.props?.testID === 'storage-share-rescue')).toEqual([]);
    act(() => tree!.unmount());
  });

  it('guardSave turns a storage write error into the "Nie zapisano" alert and rethrows other errors', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { StorageWriteError } = require('../data/storage-status');
    await guardSave(async () => {
      throw new StorageWriteError(new Error('SQLITE_FULL'));
    })();
    expect(alert).toHaveBeenCalledWith(
      'Nie zapisano',
      'Zmiana nie została zapisana w pamięci telefonu. Sprawdź wolne miejsce i spróbuj ponownie.'
    );
    await expect(guardSave(async () => {
      throw new Error('inny błąd');
    })()).rejects.toThrow('inny błąd');
    alert.mockRestore();
  });
});
