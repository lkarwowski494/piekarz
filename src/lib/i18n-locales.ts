// ============================================================================
// Piekarz (Crust) — rejestr języków (DEC-06 b z rozszerzeniem właściciela)
// 35 języków w wydaniu 1.0 (przekład 093, partia 7; PL źródło, EN i 33 języki z przekładu maszynowego); lista języków „jak w aplikacji Trening” (repo trening, lib/i18n.ts `LANGS`,
// katalog locales/, commit 8273448, odczyt 2026-10-20). Powody, przekład i przeglądy: docs/lokalizacja/jezyki.md.
// Liczba mnoga zawsze z Intl.PluralRules (CLDR), nie z tej tabeli [M1-audytor-generalny-073; 09-lokalizacja-008].
// ============================================================================

/** `released` = język w wydaniu (słownik, app.json, przełącznik); `planned` = czeka na przekład 093 i przeglądy. */
export type LocaleStatus = 'released' | 'planned';

export interface LocaleMetadata {
  /** Tag BCP 47, jak plik słownika w Treningu (locales/<code>.json). */
  code: string;
  /** Nazwa języka w nim samym (lista w Ustawieniach), jak `LANG_NAME` w Treningu. */
  name: string;
  englishName: string;
  status: LocaleStatus;
}

/** Język w wydaniu: słownik z przekładu 093, languages/<kod>.json, app.json, przełącznik [M1-audytor-generalny-093]. */
const released = (code: string, name: string, englishName: string): LocaleMetadata => ({ code, name, englishName, status: 'released' });

/** Kolejność jak `LANGS` w Treningu. Żaden język nie jest pisany od prawej (app.json: supportsRTL false). */
export const SUPPORTED_LOCALES_35: readonly LocaleMetadata[] = [
  { code: 'pl', name: 'Polski', englishName: 'Polish', status: 'released' },
  { code: 'en', name: 'English', englishName: 'English', status: 'released' },
  released('cs', 'Čeština', 'Czech'),
  released('sk', 'Slovenčina', 'Slovak'),
  released('hu', 'Magyar', 'Hungarian'),
  released('ro', 'Română', 'Romanian'),
  released('bg', 'Български', 'Bulgarian'),
  released('hr', 'Hrvatski', 'Croatian'),
  released('sl', 'Slovenščina', 'Slovenian'),
  released('sr', 'Српски', 'Serbian'),
  released('lt', 'Lietuvių', 'Lithuanian'),
  released('lv', 'Latviešu', 'Latvian'),
  released('et', 'Eesti', 'Estonian'),
  released('uk', 'Українська', 'Ukrainian'),
  released('es', 'Español (España)', 'Spanish (Spain)'),
  released('es-419', 'Español (Latinoamérica)', 'Spanish (Latin America)'),
  released('pt', 'Português (Portugal)', 'Portuguese (Portugal)'),
  released('pt-BR', 'Português (Brasil)', 'Portuguese (Brazil)'),
  released('de', 'Deutsch', 'German'),
  released('fr', 'Français', 'French'),
  released('it', 'Italiano', 'Italian'),
  released('nl', 'Nederlands', 'Dutch'),
  released('sv', 'Svenska', 'Swedish'),
  released('da', 'Dansk', 'Danish'),
  released('nb', 'Norsk', 'Norwegian (Bokmål)'),
  released('fi', 'Suomi', 'Finnish'),
  released('tr', 'Türkçe', 'Turkish'),
  released('el', 'Ελληνικά', 'Greek'),
  released('id', 'Bahasa Indonesia', 'Indonesian'),
  released('ms', 'Bahasa Melayu', 'Malay'),
  released('vi', 'Tiếng Việt', 'Vietnamese'),
  released('ru', 'Русский', 'Russian'),
  released('ja', '日本語', 'Japanese'),
  released('ko', '한국어', 'Korean'),
  released('zh-Hant', '繁體中文', 'Chinese (Traditional)'),
];

export function getLocaleMetadata(code: string): LocaleMetadata | undefined {
  return SUPPORTED_LOCALES_35.find((l) => l.code.toLowerCase() === code.toLowerCase());
}

export function getLocalesByStatus(status: LocaleStatus): LocaleMetadata[] {
  return SUPPORTED_LOCALES_35.filter((l) => l.status === status);
}

export function getAllSupportedLocaleCodes(): string[] {
  return SUPPORTED_LOCALES_35.map((l) => l.code);
}

/**
 * Liczba mnoga dla dowolnego kodu języka według CLDR (Intl.PluralRules); forma `other` obowiązkowa.
 */
export function formatPluralUniversal(
  localeCode: string,
  count: number,
  forms: {
    one: string;
    other: string;
    few?: string;
    many?: string;
  },
  includeNumber = true
): string {
  // Kategoria CLDR z Intl.PluralRules [M1-audytor-generalny-071]; brak formy = other
  const cat = new Intl.PluralRules(localeCode).select(count);
  const word = (cat === 'one' || cat === 'few' || cat === 'many' ? forms[cat] : undefined) ?? forms.other;
  return includeNumber ? `${count} ${word}` : word;
}
