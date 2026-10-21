import { getDb, memStore } from './sqlite-schema';
import { assertWritable, writeOrThrow } from './storage-status';

// ----------------------------------------------------------------------------
// Bread School Lesson Progress (Z-084…090 / SCI)
// ----------------------------------------------------------------------------

export async function getCompletedLessons(): Promise<number[]> {
  const db = await getDb();
  if (!db) {
    return [...memStore.completedLessons];
  }

  try {
    const rows = (await db.getAllAsync(
      'SELECT level_id FROM lesson_progress ORDER BY level_id ASC;'
    )) as Array<{ level_id: number }>;
    return rows.map((r) => r.level_id);
  } catch {
    return [...memStore.completedLessons];
  }
}

export async function toggleLessonProgress(levelId: number): Promise<boolean> {
  assertWritable();
  const current = await getCompletedLessons();
  const isCurrentlyCompleted = current.includes(levelId);

  const db = await getDb();
  if (!db) {
    if (isCurrentlyCompleted) {
      memStore.completedLessons = memStore.completedLessons.filter((l) => l !== levelId);
      return false;
    } else {
      memStore.completedLessons.push(levelId);
      return true;
    }
  }

  // Nieudany zapis rzuca StorageWriteError zamiast zwracać sukces [M1-audytor-generalny-120; 05-architekt-501]
  if (isCurrentlyCompleted) {
    await writeOrThrow(() => db.runAsync('DELETE FROM lesson_progress WHERE level_id = ?;', levelId));
    memStore.completedLessons = memStore.completedLessons.filter((l) => l !== levelId);
    return false;
  }
  await writeOrThrow(() =>
    db.runAsync(
      'INSERT OR REPLACE INTO lesson_progress (level_id, completed_at) VALUES (?, ?);',
      levelId,
      Date.now()
    )
  );
  if (!memStore.completedLessons.includes(levelId)) {
    memStore.completedLessons.push(levelId);
  }
  return true;
}

export async function isLessonCompleted(levelId: number): Promise<boolean> {
  const list = await getCompletedLessons();
  return list.includes(levelId);
}

// ==========================================
// Generic App Settings (Key-Value)
// ==========================================

export async function getAppSetting(key: string, defaultValue?: string): Promise<string | undefined> {
  const db = await getDb();
  if (!db) return memStore.settings[key] ?? defaultValue;
  try {
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?;',
      key
    );
    return row?.value ?? memStore.settings[key] ?? defaultValue;
  } catch {
    return memStore.settings[key] ?? defaultValue;
  }
}

export async function setAppSetting(key: string, value: string): Promise<void> {
  // Baza nowsza niż aplikacja: ustawienie odrzucone typowanym błędem [M1-audytor-generalny-061]
  assertWritable();
  const db = await getDb();
  if (db) {
    // Błąd zapisu to StorageWriteError, nie cisza; wywołujący pokazują „Nie zapisano” [M1-audytor-generalny-120; 05-architekt-501]
    await writeOrThrow(() => db.runAsync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);', key, value));
  }
  memStore.settings[key] = value;
}

export type BakerRitualProfile = 'sourdough_purist' | 'artisan_hybrid' | 'beginner';
export type BakingVessel = 'dutch_oven' | 'cloche' | 'baking_steel' | 'pullman_pan';

export async function hasCompletedOnboarding(): Promise<boolean> {
  const val = await getAppSetting('has_completed_onboarding', 'false');
  return val === 'true';
}

export async function setOnboardingCompleted(completed = true): Promise<void> {
  await setAppSetting('has_completed_onboarding', completed ? 'true' : 'false');
}

export async function getBakerRitualProfile(): Promise<BakerRitualProfile> {
  const val = await getAppSetting('baker_ritual_profile', 'artisan_hybrid');
  if (val === 'sourdough_purist' || val === 'beginner') return val;
  return 'artisan_hybrid';
}

export async function setBakerRitualProfile(profile: BakerRitualProfile): Promise<void> {
  await setAppSetting('baker_ritual_profile', profile);
}

export async function getBakingVessel(): Promise<BakingVessel> {
  const val = await getAppSetting('selected_baking_vessel', 'dutch_oven');
  if (val === 'cloche' || val === 'baking_steel' || val === 'pullman_pan') return val;
  return 'dutch_oven';
}

export async function setBakingVessel(vessel: BakingVessel): Promise<void> {
  await setAppSetting('selected_baking_vessel', vessel);
}
