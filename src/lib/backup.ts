import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { t } from './i18n';
import { StoredRecipe, StoredStarter, StoredBakeLog } from '../data/db';
import { isObj, parseRows, parseBakeRow, parseStarterRow, parseRecipeRow } from '../data/row-parsers';
import { assertWritable } from '../data/storage-status';

export const SCHEMA_VERSION = 1;
export const AUTO_DIR = 'Backup/';
export const AUTO_KEEP = 10;

/**
 * Wzorzec nazw kopii automatycznych: piekarz-RRRR-MM-DD-GGMMSS[-N].json
 */
export const AUTO_RE = /^piekarz-(?:kopia-)?(\d{4}-\d{2}-\d{2}-\d{6})(?:-(\d{1,3}))?\.json$/;

/**
 * Wzorzec nazw kopii bezpieczeństwa: piekarz-przed-(importem|czyszczeniem)-RRRR-MM-DD-GGMMSS[-N].json
 */
export const SAFETY_RE = /^piekarz-przed-(?:importem|czyszczeniem)-(\d{4}-\d{2}-\d{2}-\d{6})(?:-(\d{1,3}))?\.json$/;

export interface PiekarzBackupData {
  bakes: StoredBakeLog[];
  starters: StoredStarter[];
  customRecipes: StoredRecipe[];
  settings?: Record<string, unknown>;
}

export interface PiekarzBackupEnvelope {
  format: 'piekarz-backup';
  schemaVersion: number;
  exportedAt: string;
  state: PiekarzBackupData;
}

export function buildBackup(state: PiekarzBackupData): PiekarzBackupEnvelope {
  return {
    format: 'piekarz-backup',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  };
}

export function localISODate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function stampOf(d: Date = new Date()): string {
  const iso = localISODate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${iso}-${hours}${minutes}${seconds}`;
}

const poolKey = (m: RegExpExecArray) => `${m[1]}-${(m[2] ?? '1').padStart(3, '0')}`;

/**
 * Udostępnienie pliku tymczasowego w Caches z gwarantowanym usunięciem w bloku finally (Apps4Brew SEC-09).
 */
async function shareTemp(
  name: string,
  body: string,
  opts: { mimeType: string; dialogTitle: string }
): Promise<boolean> {
  const path = `${FileSystem.cacheDirectory}${name}`;
  try {
    await FileSystem.writeAsStringAsync(path, body);
    if (!(await Sharing.isAvailableAsync())) {
      return false;
    }
    await Sharing.shareAsync(path, opts);
    return true;
  } finally {
    await FileSystem.deleteAsync(path, { idempotent: true }).catch(() => {});
  }
}

/**
 * Eksport kopii zapasowej do pliku JSON.
 */
export async function exportBackup(state: PiekarzBackupData): Promise<boolean> {
  const envelope = buildBackup(state);
  const fileName = `piekarz-backup-${localISODate()}.json`;
  return await shareTemp(fileName, JSON.stringify(envelope, null, 2), {
    mimeType: 'application/json',
    dialogTitle: t('Kopia zapasowa'),
  });
}

/**
 * Zapis kopii zapasowej w katalogu Dokumentów (Backup/...) z rotacją do AUTO_KEEP.
 */
async function writeBackupFile(
  prefix: string,
  re: RegExp,
  state: PiekarzBackupData
): Promise<string> {
  // Baza nowsza niż aplikacja: kopia ze starszego odczytu nie wypiera z puli kopii nowszych danych [M1-audytor-generalny-061]
  assertWritable();
  if (!FileSystem.documentDirectory) {
    throw new Error('Brak katalogu dokumentów aplikacji');
  }

  const dir = `${FileSystem.documentDirectory}${AUTO_DIR}`;
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const stamp = stampOf(new Date());
  let name = `${prefix}${stamp}.json`;

  for (let n = 2; n < 1000 && (await FileSystem.getInfoAsync(`${dir}${name}`)).exists; n++) {
    name = `${prefix}${stamp}-${n}.json`;
  }

  const envelope = buildBackup(state);
  const targetPath = `${dir}${name}`;

  try {
    await FileSystem.writeAsStringAsync(targetPath, JSON.stringify(envelope, null, 2));
  } catch (e) {
    await FileSystem.deleteAsync(targetPath, { idempotent: true }).catch(() => {});
    throw e;
  }

  // Rotacja puli
  try {
    const files = await FileSystem.readDirectoryAsync(dir);
    const pool = files
      .map((f) => [f, re.exec(f)] as const)
      .filter((x): x is readonly [string, RegExpExecArray] => !!x[1]);

    const oldFiles = pool
      .map(([f, m]) => [f, poolKey(m)] as const)
      .sort((a, b) => (a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0))
      .slice(AUTO_KEEP);

    for (const [f] of oldFiles) {
      await FileSystem.deleteAsync(`${dir}${f}`, { idempotent: true });
    }
  } catch {
    // Nieprzerwana praca przy błędzie sprzątania
  }

  return targetPath;
}

/**
 * Automatyczna kopia po zakończonym wypieku (Apps4Brew T-012).
 */
export async function autoBackup(state: PiekarzBackupData): Promise<string | null> {
  try {
    return await writeBackupFile('piekarz-kopia-', AUTO_RE, state);
  } catch {
    return null;
  }
}

/**
 * Kopia bezpieczeństwa przed operacjami niszczącymi (import, reset).
 * Bezwzględnie wymagana: nieudany zapis rzuca błąd i blokuje niszczącą akcję.
 */
export async function safetyBackup(
  kind: 'import' | 'reset',
  state: PiekarzBackupData
): Promise<string> {
  const prefix = kind === 'import' ? 'piekarz-przed-importem-' : 'piekarz-przed-czyszczeniem-';
  return await writeBackupFile(prefix, SAFETY_RE, state);
}

export interface BackupImportStats {
  bakesCount: number;
  startersCount: number;
  recipesCount: number;
  exportedAt: string;
}

/**
 * Waliduje poprawność schematu pliku kopii zapasowej (Apps4Brew envelope).
 */
export interface ValidatedBackup extends PiekarzBackupEnvelope {
  /** Liczba pominiętych uszkodzonych wierszy (wypieki, zakwasy, receptury). */
  skippedRows: number;
}

export function parseAndValidateBackup(rawJson: string): ValidatedBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('Nieprawidłowy format JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Plik kopii musi być obiektem JSON');
  }

  const envelope = parsed as Partial<PiekarzBackupEnvelope>;

  if (envelope.format !== 'piekarz-backup') {
    throw new Error('Nieznany format pliku (oczekiwano "piekarz-backup")');
  }

  if (typeof envelope.schemaVersion !== 'number' || envelope.schemaVersion <= 0) {
    throw new Error('Nieprawidłowa wersja schematu kopii');
  }

  if (envelope.schemaVersion > SCHEMA_VERSION) {
    throw new Error(`Kopia pochodzi z nowszej wersji aplikacji (v${envelope.schemaVersion}). Zaktualizuj aplikację.`);
  }

  if (!envelope.state || typeof envelope.state !== 'object') {
    throw new Error('Brak danych stanu (sekcja "state") w pliku kopii');
  }

  const state: unknown = envelope.state;
  if (!isObj(state) || !Array.isArray(state.bakes)) {
    throw new Error('Nieprawidłowa struktura wypieków ("bakes" musi być tablicą)');
  }
  if (!Array.isArray(state.starters)) {
    throw new Error('Nieprawidłowa struktura zakwasów ("starters" musi być tablicą)');
  }
  if (!Array.isArray(state.customRecipes)) {
    throw new Error('Nieprawidłowa struktura przepisów ("customRecipes" musi być tablicą)');
  }

  // Każdy wiersz parsowany osobno: zły wiersz jest pomijany i liczony, reszta wchodzi [M1-audytor-generalny-022]
  const bakes = parseRows(state.bakes, parseBakeRow);
  const starters = parseRows(state.starters, parseStarterRow);
  const recipes = parseRows(state.customRecipes, parseRecipeRow);
  return {
    format: 'piekarz-backup',
    schemaVersion: envelope.schemaVersion,
    exportedAt: typeof envelope.exportedAt === 'string' ? envelope.exportedAt : '',
    state: {
      bakes: bakes.rows,
      starters: starters.rows,
      customRecipes: recipes.rows.map((r) => ({ ...r, isBuiltIn: false })),
    },
    skippedRows: bakes.skipped + starters.skipped + recipes.skipped,
  };
}

export interface CorruptStateRecovery {
  corruptFile: string;
  timestamp: string;
  rawSnippet: string;
  /** Kopie surowych plików bazy (.db, -wal, -shm) zrobione po błędzie otwarcia [M1-audytor-generalny-024]. */
  rawFiles: string[];
}

/** Podkatalog Backup/ z surowymi kopiami plików bazy (widoczny w aplikacji Pliki). */
export const RESCUE_DIR = 'kopie-ratunkowe/';

/**
 * Surowa kopia plików bazy po błędzie otwarcia, bez otwierania bazy: komplet .db, -wal i -shm,
 * bo sam plik .db przy WAL nie zawiera ostatnich zapisów [M1-audytor-generalny-024].
 */
export async function copyRawDatabaseFiles(dbUri: string): Promise<string[]> {
  const docDir = FileSystem.documentDirectory;
  if (!docDir) return [];
  const target = `${docDir}${AUTO_DIR}${RESCUE_DIR}${stampOf(new Date())}/`;
  await FileSystem.makeDirectoryAsync(target, { intermediates: true });
  const name = dbUri.slice(dbUri.lastIndexOf('/') + 1);
  const copies: string[] = [];
  for (const suffix of ['', '-wal', '-shm']) {
    const from = `${dbUri}${suffix}`;
    if (!(await FileSystem.getInfoAsync(from)).exists) continue;
    const to = `${target}${name}${suffix}`;
    await FileSystem.copyAsync({ from, to });
    copies.push(to);
  }
  return copies;
}

/** Po błędzie otwarcia: najpierw surowa kopia plików, potem plik ratunkowy z opisem błędu i listą kopii. */
export async function rescueAfterOpenFailure(dbUri: string, message: string): Promise<string | null> {
  let copies: string[] = [];
  try {
    copies = await copyRawDatabaseFiles(dbUri);
  } catch {
    copies = [];
  }
  try {
    return await saveCorruptState(JSON.stringify({ error: message }), 'SQLite open failed', copies);
  } catch {
    return null;
  }
}

/**
 * BR-TEST-023: Zapis uszkodzonego stanu do pliku ratunkowego state_corrupt_<timestamp>.json
 */
export async function saveCorruptState(rawPayload: string, reason: string, rawFiles: string[] = []): Promise<string> {
  const docDir = FileSystem.documentDirectory;
  if (!docDir) throw new Error('Brak katalogu dokumentów aplikacji');
  const dir = `${docDir}${AUTO_DIR}`;
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const stamp = stampOf(new Date());
  const name = `state_corrupt_${stamp}.json`;
  const filePath = `${dir}${name}`;
  const envelope = {
    format: 'piekarz-corrupt-state',
    timestamp: new Date().toISOString(),
    reason,
    recovery: {
      rawPayload,
      rawFiles,
    },
  };
  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(envelope, null, 2));
  return filePath;
}

/**
 * BR-TEST-023: Sprawdzenie czy istnieje zapisany uszkodzony stan po awarii
 */
export async function checkCorruptState(): Promise<CorruptStateRecovery | null> {
  try {
    const docDir = FileSystem.documentDirectory;
    if (!docDir) return null;
    const dir = `${docDir}${AUTO_DIR}`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) return null;
    const files = await FileSystem.readDirectoryAsync(dir);
    const dismissed = new Set(files.filter((f) => f.endsWith(DISMISSED_SUFFIX)).map((f) => f.slice(0, -DISMISSED_SUFFIX.length)));
    const corruptFiles = files
      .filter((f) => f.startsWith('state_corrupt_') && f.endsWith('.json') && !dismissed.has(f))
      .sort()
      .reverse();
    if (corruptFiles.length === 0) return null;

    const latest = corruptFiles[0];
    const content = await FileSystem.readAsStringAsync(`${dir}${latest}`);
    const parsed: unknown = JSON.parse(content);
    const recovery = isObj(parsed) && isObj(parsed.recovery) ? parsed.recovery : {};
    const rawFiles = Array.isArray(recovery.rawFiles) ? recovery.rawFiles.filter((f): f is string => typeof f === 'string') : [];
    return {
      corruptFile: latest,
      timestamp: isObj(parsed) && typeof parsed.timestamp === 'string' ? parsed.timestamp : '',
      rawSnippet: (typeof recovery.rawPayload === 'string' ? recovery.rawPayload : '').slice(0, 100),
      rawFiles,
    };
  } catch {
    return null;
  }
}

const DISMISSED_SUFFIX = '.ukryty';

/**
 * BR-TEST-023: ukrycie banera. Plik ratunkowy i kopie zostają — obok powstaje znacznik ukrycia
 * [M1-audytor-generalny-024].
 */
export async function dismissCorruptState(fileName: string): Promise<void> {
  try {
    const docDir = FileSystem.documentDirectory;
    if (!docDir) return;
    await FileSystem.writeAsStringAsync(`${docDir}${AUTO_DIR}${fileName}${DISMISSED_SUFFIX}`, new Date().toISOString());
  } catch {}
}

/**
 * TASK-R05-02 / Zero Data Loss Axiom: przedrostek kopii bazy sprzed migracji. Kopię robi `VACUUM INTO`
 * obok pliku bazy (sqlite-schema.ts) — spójną przy WAL, bez podmiany otwartej bazy [M1-audytor-generalny-004].
 */
export const PRE_MIGRATION_BACKUP_NAME = 'backup_pre_migration';

