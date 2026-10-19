/**
 * English translation dictionary for Piekarz (Crust).
 * Polish text is the primary key.
 */
import { EN_1 } from './i18n-en/czesc-1';
import { EN_2 } from './i18n-en/czesc-2';
import { EN_3 } from './i18n-en/czesc-3';
import { EN_4 } from './i18n-en/czesc-4';

export const EN: Record<string, string> = { ...EN_1, ...EN_2, ...EN_3, ...EN_4 };
