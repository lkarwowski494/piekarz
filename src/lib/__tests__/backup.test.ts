import {
  buildBackup,
  AUTO_RE,
  SAFETY_RE,
  stampOf,
  SCHEMA_VERSION,
  PiekarzBackupData,
  parseAndValidateBackup,
  autoBackup,
  safetyBackup,
  AUTO_DIR,
  AUTO_KEEP,
} from '../backup';
import * as FileSystem from 'expo-file-system/legacy';

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

  describe('parseAndValidateBackup validation rules', () => {
    it('successfully parses and validates valid backup JSON', () => {
      const backup = buildBackup({
        bakes: [{ id: 'b1', recipeName: 'Pain de Campagne', startedAt: 123456789, ratingStars: 5 }],
        starters: [{ id: 's1', name: 'Stefan', flourType: 'rye', hydration: 100, birthDate: 1700000000000, storageState: 'FRIDGE' }],
        // [M1-audytor-generalny-022] poprawna formuła: wcześniej `{} as any`, czyli wiersz, który walidacja słusznie pomija
        customRecipes: [{
          id: 'r1',
          name: 'Custom Boule',
          formula: { flours: [{ name: 'Mąka 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 },
          targetDDT: 24,
          isBuiltIn: false,
          createdAt: 123456,
        }],
      });
      const jsonStr = JSON.stringify(backup);
      const parsed = parseAndValidateBackup(jsonStr);

      expect(parsed.format).toBe('piekarz-backup');
      expect(parsed.schemaVersion).toBe(SCHEMA_VERSION);
      expect(parsed.state.bakes).toHaveLength(1);
      expect(parsed.state.starters).toHaveLength(1);
      expect(parsed.state.customRecipes).toHaveLength(1);
    });

    it('rejects invalid JSON syntax', () => {
      expect(() => parseAndValidateBackup('{ not valid json')).toThrow('Nieprawidłowy format JSON');
    });

    it('rejects primitive JSON values or null', () => {
      expect(() => parseAndValidateBackup('"just a string"')).toThrow('Plik kopii musi być obiektem JSON');
      expect(() => parseAndValidateBackup('123')).toThrow('Plik kopii musi być obiektem JSON');
      expect(() => parseAndValidateBackup('null')).toThrow('Plik kopii musi być obiektem JSON');
    });

    it('rejects unknown format envelope', () => {
      const invalid = { format: 'other-app', schemaVersion: 1, state: { bakes: [], starters: [], customRecipes: [] } };
      expect(() => parseAndValidateBackup(JSON.stringify(invalid))).toThrow('Nieznany format pliku');
    });

    it('rejects missing or invalid schema version', () => {
      const invalid = { format: 'piekarz-backup', schemaVersion: -1, state: { bakes: [], starters: [], customRecipes: [] } };
      expect(() => parseAndValidateBackup(JSON.stringify(invalid))).toThrow('Nieprawidłowa wersja schematu');
    });

    it('rejects backup from future schema version', () => {
      const future = { format: 'piekarz-backup', schemaVersion: SCHEMA_VERSION + 1, state: { bakes: [], starters: [], customRecipes: [] } };
      expect(() => parseAndValidateBackup(JSON.stringify(future))).toThrow('Kopia pochodzi z nowszej wersji aplikacji');
    });

    it('rejects missing state object', () => {
      const noState = { format: 'piekarz-backup', schemaVersion: 1 };
      expect(() => parseAndValidateBackup(JSON.stringify(noState))).toThrow('Brak danych stanu');
    });

    it('rejects non-array bakes, starters, or customRecipes', () => {
      const badBakes = { format: 'piekarz-backup', schemaVersion: 1, state: { bakes: 'not-array', starters: [], customRecipes: [] } };
      expect(() => parseAndValidateBackup(JSON.stringify(badBakes))).toThrow('Nieprawidłowa struktura wypieków');

      const badStarters = { format: 'piekarz-backup', schemaVersion: 1, state: { bakes: [], starters: null, customRecipes: [] } };
      expect(() => parseAndValidateBackup(JSON.stringify(badStarters))).toThrow('Nieprawidłowa struktura zakwasów');

      const badRecipes = { format: 'piekarz-backup', schemaVersion: 1, state: { bakes: [], starters: [], customRecipes: {} } };
      expect(() => parseAndValidateBackup(JSON.stringify(badRecipes))).toThrow('Nieprawidłowa struktura przepisów');
    });
  });

  // [M1-audytor-generalny-005; 07-jakosc-002 M4] rotacja nie może skasować całej puli ani nowej kopii.
  describe('autoBackup rotation keeps the newest AUTO_KEEP copies', () => {
    const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
    const dir = `${FileSystem.documentDirectory}${AUTO_DIR}`;
    const poolFiles = () =>
      [...mockFiles.keys()].filter((k) => k.startsWith(dir)).map((k) => k.slice(dir.length)).filter((f) => AUTO_RE.test(f));

    beforeEach(() => mockFiles.clear());

    it('eleven automatic copies leave exactly 10 files, including the newest one', async () => {
      const paths: Array<string | null> = [];
      for (let i = 0; i < AUTO_KEEP + 1; i++) {
        paths.push(await autoBackup({ bakes: [{ id: `b${i}`, recipeName: 'Chleb', startedAt: i }], starters: [], customRecipes: [] }));
      }
      const files = poolFiles();
      expect(files).toHaveLength(AUTO_KEEP);
      const newest = paths[paths.length - 1];
      expect(newest).not.toBeNull();
      expect(files).toContain(String(newest).slice(dir.length));
      expect(files).not.toContain(String(paths[0]).slice(dir.length));
    });

    it('safety copies (before import) are a separate pool and are not removed by automatic rotation', async () => {
      const safety = await safetyBackup('import', sampleState);
      for (let i = 0; i < AUTO_KEEP + 2; i++) await autoBackup(sampleState);
      expect(mockFiles.has(safety)).toBe(true);
      expect(poolFiles()).toHaveLength(AUTO_KEEP);
    });
  });
});
