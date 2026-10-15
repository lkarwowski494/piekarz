import {
  buildBackup,
  AUTO_RE,
  SAFETY_RE,
  stampOf,
  SCHEMA_VERSION,
  PiekarzBackupData,
} from '../backup';

describe('Apps4Brew Backup & Safety Snapshot Specification (lib/backup)', () => {
  const sampleState: PiekarzBackupData = {
    bakes: [],
    starters: [],
    customRecipes: [],
  };

  it('buildBackup creates valid envelope with metadata', () => {
    const backup = buildBackup(sampleState);

    expect(backup.format).toBe('piekarz-backup');
    expect(backup.schemaVersion).toBe(SCHEMA_VERSION);
    expect(typeof backup.exportedAt).toBe('string');
    expect(backup.state).toEqual(sampleState);
  });

  it('AUTO_RE validates valid auto-backup filename formats', () => {
    expect(AUTO_RE.test('piekarz-2026-10-15-123045.json')).toBe(true);
    expect(AUTO_RE.test('piekarz-2026-10-15-123045-2.json')).toBe(true);
    expect(AUTO_RE.test('piekarz-2026-10-15-123045-999.json')).toBe(true);

    // Invalid
    expect(AUTO_RE.test('piekarz-2026-10-15.json')).toBe(false);
    expect(AUTO_RE.test('piekarz-backup-2026-10-15.json')).toBe(false);
    expect(AUTO_RE.test('random-file.txt')).toBe(false);
  });

  it('SAFETY_RE validates safety snapshot filenames before import or reset', () => {
    expect(SAFETY_RE.test('piekarz-przed-importem-2026-10-15-123045.json')).toBe(true);
    expect(SAFETY_RE.test('piekarz-przed-czyszczeniem-2026-10-15-123045.json')).toBe(true);
    expect(SAFETY_RE.test('piekarz-przed-importem-2026-10-15-123045-3.json')).toBe(true);

    // Invalid
    expect(SAFETY_RE.test('piekarz-przed-edycja-2026-10-15-123045.json')).toBe(false);
  });

  it('stampOf formats predictable timestamp strings', () => {
    const fixedDate = new Date(2026, 9, 15, 14, 5, 9); // Oct 15, 2026 14:05:09
    const stamp = stampOf(fixedDate);
    expect(stamp).toBe('2026-10-15-140509');
  });
});
