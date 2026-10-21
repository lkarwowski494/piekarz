// ============================================================================
// Piekarz — „Importuj z pliku”: jedno wejście dla pliku receptury i pliku kopii zapasowej (design-spec §11c „113”)
// [M1-audytor-generalny-113; 04-studio-projektowe-028]. Rodzaj pliku po zawartości: `format: "piekarz-backup"` = kopia,
// poprawna receptura = receptura, inaczej plik nierozpoznany. Zapis tą samą ścieżką co dotąd: receptura przez saveRecipe
// (jak okno importu receptury), kopia z kopią przed importem z collectBackupData (jak import kopii w Ustawieniach).
// ============================================================================

import { parseAndValidateBackup, safetyBackup, ValidatedBackup } from './backup';
import { decodeRecipeFromShareUrl } from './recipe-sharing';
import { collectBackupData, restoreFromBackupData, saveRecipe } from '../data/sqlite-store';
import { resyncNotifications } from './notifications';
import { initLanguage, t, tPlural } from './i18n';
import { initUnitSystem } from './unit-converter';
import { wczytajPonowniePrzypomnieniaKarmienia } from './przypomnienia-karmienia';
import { appLocale, formatDate } from './format';
import type { StoredRecipe } from '../data/db';

export type RozpoznanyPlik =
  | { rodzaj: 'kopia'; kopia: ValidatedBackup }
  | { rodzaj: 'receptura'; receptura: StoredRecipe }
  | { rodzaj: 'nierozpoznany' };

/** Czy tekst to obiekt JSON z `format: "piekarz-backup"` (dane z zewnątrz: od `unknown`). */
function maFormatKopii(tekst: string): boolean {
  let v: unknown;
  try {
    v = JSON.parse(tekst);
  } catch {
    return false;
  }
  return typeof v === 'object' && v !== null && Reflect.get(v, 'format') === 'piekarz-backup';
}

/** Rodzaj pliku po zawartości; pusty tekst = null (nic jeszcze nie wklejono). */
export function rozpoznajPlik(tresc: string): RozpoznanyPlik | null {
  const tekst = tresc.trim();
  if (!tekst) return null;
  if (maFormatKopii(tekst)) {
    try {
      return { rodzaj: 'kopia', kopia: parseAndValidateBackup(tekst) };
    } catch {
      return { rodzaj: 'nierozpoznany' };
    }
  }
  const r = decodeRecipeFromShareUrl(tekst);
  return r.success ? { rodzaj: 'receptura', receptura: r.recipe } : { rodzaj: 'nierozpoznany' };
}

// Formy liczby (CLDR one/few/many/other), liczba i rzeczownik ze spacją niełamiącą (design-spec §11c „113”)
const RECEPTURY = { one: '{n} receptura', few: '{n} receptury', many: '{n} receptur', other: '{n} receptury' };
const ZAKWASY = { one: '{n} zakwas', few: '{n} zakwasy', many: '{n} zakwasów', other: '{n} zakwasu' };
const WPISY = {
  one: '{n} wpis w Dzienniku',
  few: '{n} wpisy w Dzienniku',
  many: '{n} wpisów w Dzienniku',
  other: '{n} wpisu w Dzienniku',
};

/** Zdanie podglądu kopii: data eksportu w formacie regionu i liczby z pliku; brak daty w pliku = zdanie bez daty. */
export function zdanieKopii(kopia: ValidatedBackup): string {
  const params = {
    receptury: tPlural(kopia.state.customRecipes.length, RECEPTURY),
    zakwasy: tPlural(kopia.state.starters.length, ZAKWASY),
    wpisy: tPlural(kopia.state.bakes.length, WPISY),
  };
  const ms = Date.parse(kopia.exportedAt);
  if (Number.isNaN(ms)) return t('Kopia: {receptury}, {zakwasy}, {wpisy}.', params);
  const data = formatDate(ms, appLocale(), { day: 'numeric', month: 'long', year: 'numeric' });
  return t('Kopia z {data}: {receptury}, {zakwasy}, {wpisy}.', { data, ...params });
}

/** Import kopii: kopia przed importem z pełnego stanu bazy (ZP-06, ADR-008), potem dane z kopii i przypomnienia (ADR-006). */
export async function importujKopie(kopia: ValidatedBackup): Promise<void> {
  await safetyBackup('import', await collectBackupData());
  await restoreFromBackupData(kopia.state);
  // Język i jednostki z kopii działają od razu, bez ponownego uruchomienia; przed przypomnieniami, żeby ich
  // teksty były w nowym języku. Kopia bez tych pól nic nie zmienia [M2-koordynator-napraw-502 (p11)].
  await initLanguage();
  await initUnitSystem();
  // Przełącznik przypomnień o karmieniu z kopii przed planem powiadomień [audyt-niezalezny B-6]
  await wczytajPonowniePrzypomnieniaKarmienia();
  void resyncNotifications();
}

/** Import receptury: zapis dopiero po potwierdzeniu, bez bramki (D-039), jak w oknie importu receptury. */
export async function importujRecepture(receptura: StoredRecipe): Promise<void> {
  await saveRecipe(receptura);
}
