// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// 35-Language Global Localization Registry & Metadata (i18n Tier 1..3)
// 100% Offline-First, Zero External Dependencies, Zero Bundle Bloat
// ============================================================================

export type PluralRuleCategory =
  | 'slavic'   // 3 forms (1, 2-4, 5+)
  | 'germanic' // 2 forms (1, other)
  | 'romance'  // 2 forms (0-1, other)
  | 'asian'    // 1 form (invariable)
  | 'arabic'   // 6 forms (zero, one, two, few, many, other)
  | 'semitic'; // 4 forms / dual

export interface LocaleMetadata {
  code: string;
  name: string;
  englishName: string;
  tier: 1 | 2 | 3;
  isRtl: boolean;
  pluralRule: PluralRuleCategory;
}

export const SUPPORTED_LOCALES_35: readonly LocaleMetadata[] = [
  // Tier 1: Core Craft Markets (8 languages)
  { code: 'pl', name: 'Polski', englishName: 'Polish', tier: 1, isRtl: false, pluralRule: 'slavic' },
  { code: 'en', name: 'English', englishName: 'English', tier: 1, isRtl: false, pluralRule: 'germanic' },
  { code: 'de', name: 'Deutsch', englishName: 'German', tier: 1, isRtl: false, pluralRule: 'germanic' },
  { code: 'fr', name: 'Français', englishName: 'French', tier: 1, isRtl: false, pluralRule: 'romance' },
  { code: 'it', name: 'Italiano', englishName: 'Italian', tier: 1, isRtl: false, pluralRule: 'romance' },
  { code: 'es', name: 'Español', englishName: 'Spanish', tier: 1, isRtl: false, pluralRule: 'romance' },
  { code: 'pt', name: 'Português', englishName: 'Portuguese', tier: 1, isRtl: false, pluralRule: 'romance' },
  { code: 'ja', name: '日本語', englishName: 'Japanese', tier: 1, isRtl: false, pluralRule: 'asian' },

  // Tier 2: European & Nordic Bread Culture (12 languages)
  { code: 'sv', name: 'Svenska', englishName: 'Swedish', tier: 2, isRtl: false, pluralRule: 'germanic' },
  { code: 'da', name: 'Dansk', englishName: 'Danish', tier: 2, isRtl: false, pluralRule: 'germanic' },
  { code: 'no', name: 'Norsk', englishName: 'Norwegian', tier: 2, isRtl: false, pluralRule: 'germanic' },
  { code: 'fi', name: 'Suomi', englishName: 'Finnish', tier: 2, isRtl: false, pluralRule: 'germanic' },
  { code: 'nl', name: 'Nederlands', englishName: 'Dutch', tier: 2, isRtl: false, pluralRule: 'germanic' },
  { code: 'cs', name: 'Čeština', englishName: 'Czech', tier: 2, isRtl: false, pluralRule: 'slavic' },
  { code: 'sk', name: 'Slovenčina', englishName: 'Slovak', tier: 2, isRtl: false, pluralRule: 'slavic' },
  { code: 'uk', name: 'Українська', englishName: 'Ukrainian', tier: 2, isRtl: false, pluralRule: 'slavic' },
  { code: 'hu', name: 'Magyar', englishName: 'Hungarian', tier: 2, isRtl: false, pluralRule: 'germanic' },
  { code: 'el', name: 'Ελληνικά', englishName: 'Greek', tier: 2, isRtl: false, pluralRule: 'romance' },
  { code: 'ro', name: 'Română', englishName: 'Romanian', tier: 2, isRtl: false, pluralRule: 'romance' },
  { code: 'bg', name: 'Български', englishName: 'Bulgarian', tier: 2, isRtl: false, pluralRule: 'slavic' },

  // Tier 3: Global Craft & Emerging Markets (15 languages)
  { code: 'tr', name: 'Türkçe', englishName: 'Turkish', tier: 3, isRtl: false, pluralRule: 'asian' },
  { code: 'ko', name: '한국어', englishName: 'Korean', tier: 3, isRtl: false, pluralRule: 'asian' },
  { code: 'zh', name: '简体中文', englishName: 'Chinese (Simplified)', tier: 3, isRtl: false, pluralRule: 'asian' },
  { code: 'zh-TW', name: '繁體中文', englishName: 'Chinese (Traditional)', tier: 3, isRtl: false, pluralRule: 'asian' },
  { code: 'ar', name: 'العربية', englishName: 'Arabic', tier: 3, isRtl: true, pluralRule: 'arabic' },
  { code: 'he', name: 'עברית', englishName: 'Hebrew', tier: 3, isRtl: true, pluralRule: 'semitic' },
  { code: 'vi', name: 'Tiếng Việt', englishName: 'Vietnamese', tier: 3, isRtl: false, pluralRule: 'asian' },
  { code: 'th', name: 'ไทย', englishName: 'Thai', tier: 3, isRtl: false, pluralRule: 'asian' },
  { code: 'id', name: 'Bahasa Indonesia', englishName: 'Indonesian', tier: 3, isRtl: false, pluralRule: 'asian' },
  { code: 'ms', name: 'Bahasa Melayu', englishName: 'Malay', tier: 3, isRtl: false, pluralRule: 'asian' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', tier: 3, isRtl: false, pluralRule: 'germanic' },
  { code: 'hr', name: 'Hrvatski', englishName: 'Croatian', tier: 3, isRtl: false, pluralRule: 'slavic' },
  { code: 'lt', name: 'Lietuvių', englishName: 'Lithuanian', tier: 3, isRtl: false, pluralRule: 'slavic' },
  { code: 'lv', name: 'Latviešu', englishName: 'Latvian', tier: 3, isRtl: false, pluralRule: 'slavic' },
  { code: 'et', name: 'Eesti', englishName: 'Estonian', tier: 3, isRtl: false, pluralRule: 'germanic' },
] as const;

export function getLocaleMetadata(code: string): LocaleMetadata | undefined {
  return SUPPORTED_LOCALES_35.find((l) => l.code.toLowerCase() === code.toLowerCase());
}

export function getLocalesByTier(tier: 1 | 2 | 3): LocaleMetadata[] {
  return SUPPORTED_LOCALES_35.filter((l) => l.tier === tier);
}

export function isRtlLocale(code: string): boolean {
  const meta = getLocaleMetadata(code);
  return meta?.isRtl ?? false;
}

export function getAllSupportedLocaleCodes(): string[] {
  return SUPPORTED_LOCALES_35.map((l) => l.code);
}

/**
 * Plural formatting helper supporting Slavic, Germanic, Romance, Asian and Semitic rules.
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
  const meta = getLocaleMetadata(localeCode);
  const rule = meta?.pluralRule ?? 'germanic';
  const abs = Math.abs(Math.round(count));

  let word: string;

  switch (rule) {
    case 'asian': {
      word = forms.other;
      break;
    }
    case 'slavic': {
      const n = abs % 100;
      const n10 = n % 10;
      if (abs === 1) {
        word = forms.one;
      } else if (n10 >= 2 && n10 <= 4 && !(n >= 12 && n <= 14)) {
        word = forms.few ?? forms.other;
      } else {
        word = forms.many ?? forms.other;
      }
      break;
    }
    case 'romance': {
      word = abs <= 1 ? forms.one : forms.other;
      break;
    }
    case 'arabic': {
      if (abs === 0) word = forms.many ?? forms.other;
      else if (abs === 1) word = forms.one;
      else if (abs === 2) word = forms.few ?? forms.other;
      else if (abs % 100 >= 3 && abs % 100 <= 10) word = forms.few ?? forms.other;
      else word = forms.many ?? forms.other;
      break;
    }
    case 'semitic':
    case 'germanic':
    default: {
      word = abs === 1 ? forms.one : forms.other;
      break;
    }
  }

  return includeNumber ? `${count} ${word}` : word;
}
