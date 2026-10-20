// ============================================================================
// Piekarz (Crust) — rejestr języków (DEC-06 b z rozszerzeniem właściciela)
// PL + EN w wydaniu 1.0; razem 35 języków „jak w aplikacji Trening” (repo trening, lib/i18n.ts `LANGS`,
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

const planned = (code: string, name: string, englishName: string): LocaleMetadata => ({ code, name, englishName, status: 'planned' });

/** Kolejność jak `LANGS` w Treningu. Żaden język nie jest pisany od prawej (app.json: supportsRTL false). */
export const SUPPORTED_LOCALES_35: readonly LocaleMetadata[] = [
  { code: 'pl', name: 'Polski', englishName: 'Polish', status: 'released' },
  { code: 'en', name: 'English', englishName: 'English', status: 'released' },
  planned('cs', 'Čeština', 'Czech'),
  planned('sk', 'Slovenčina', 'Slovak'),
  planned('hu', 'Magyar', 'Hungarian'),
  planned('ro', 'Română', 'Romanian'),
  planned('bg', 'Български', 'Bulgarian'),
  planned('hr', 'Hrvatski', 'Croatian'),
  planned('sl', 'Slovenščina', 'Slovenian'),
  planned('sr', 'Српски', 'Serbian'),
  planned('lt', 'Lietuvių', 'Lithuanian'),
  planned('lv', 'Latviešu', 'Latvian'),
  planned('et', 'Eesti', 'Estonian'),
  planned('uk', 'Українська', 'Ukrainian'),
  planned('es', 'Español (España)', 'Spanish (Spain)'),
  planned('es-419', 'Español (Latinoamérica)', 'Spanish (Latin America)'),
  planned('pt', 'Português (Portugal)', 'Portuguese (Portugal)'),
  planned('pt-BR', 'Português (Brasil)', 'Portuguese (Brazil)'),
  planned('de', 'Deutsch', 'German'),
  planned('fr', 'Français', 'French'),
  planned('it', 'Italiano', 'Italian'),
  planned('nl', 'Nederlands', 'Dutch'),
  planned('sv', 'Svenska', 'Swedish'),
  planned('da', 'Dansk', 'Danish'),
  planned('nb', 'Norsk', 'Norwegian (Bokmål)'),
  planned('fi', 'Suomi', 'Finnish'),
  planned('tr', 'Türkçe', 'Turkish'),
  planned('el', 'Ελληνικά', 'Greek'),
  planned('id', 'Bahasa Indonesia', 'Indonesian'),
  planned('ms', 'Bahasa Melayu', 'Malay'),
  planned('vi', 'Tiếng Việt', 'Vietnamese'),
  planned('ru', 'Русский', 'Russian'),
  planned('ja', '日本語', 'Japanese'),
  planned('ko', '한국어', 'Korean'),
  planned('zh-Hant', '繁體中文', 'Chinese (Traditional)'),
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
