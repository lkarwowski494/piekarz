import { dbDirectory } from '../db-path';

describe('Apps4Brew SQLite Directory Safety (lib/db-path)', () => {
  it('redirects Documents/SQLite directory to Library/SQLite to prevent accidental deletion in Files app', () => {
    const rawDefault = '/var/mobile/Containers/Data/Application/UUID/Documents/SQLite';
    const redirected = dbDirectory(rawDefault);
    expect(redirected).toBe('/var/mobile/Containers/Data/Application/UUID/Library/SQLite');
  });

  it('handles trailing slash cleanly', () => {
    const rawDefault = '/var/mobile/Containers/Data/Application/UUID/Documents/SQLite/';
    const redirected = dbDirectory(rawDefault);
    expect(redirected).toBe('/var/mobile/Containers/Data/Application/UUID/Library/SQLite');
  });

  it('returns undefined if default path is null or non-Documents path', () => {
    expect(dbDirectory(null)).toBeUndefined();
    expect(dbDirectory(undefined)).toBeUndefined();
    expect(dbDirectory('/some/custom/path')).toBeUndefined();
  });
});
