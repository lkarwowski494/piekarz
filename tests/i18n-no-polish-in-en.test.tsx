// ============================================================================
// Piekarz (Crust) — i18n Hygiene & No Polish Diacritics in EN (NFR-I18N-003..004)
// Weryfikuje czystość słownika angielskiego i zakaz hardkodowanego `lang === 'pl'` w JSX.
// ============================================================================

import fs from 'fs';
import path from 'path';
import { EN } from '../src/lib/i18n.en';
import { t, setLang } from '../src/lib/i18n';

const rootDir = path.resolve(__dirname, '..');
const appDir = path.resolve(rootDir, 'app');

function walk(dir: string, filter: (f: string) => boolean): string[] {
  if (!fs.existsSync(dir)) return [];
  let res: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        res = res.concat(walk(full, filter));
      }
    } else if (filter(entry.name)) {
      res.push(full);
    }
  }
  return res;
}

describe('i18n Hygiene & Zero Polish in English (NFR-I18N-003..004)', () => {
  beforeEach(() => {
    setLang('en');
  });

  afterEach(() => {
    setLang('pl');
  });

  it('EN dictionary values contain zero unintentional Polish diacritics (NFR-I18N-003)', () => {
    const polishDiacriticsRe = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
    const allowedExceptions = [
      'Kłodawska', // Polish salt region name
      'Zacier',
      'Pumpernikiel',
    ];

    const violations: { key: string; val: string }[] = [];

    for (const [key, val] of Object.entries(EN)) {
      if (polishDiacriticsRe.test(val)) {
        const isAllowed = allowedExceptions.some((exc) => val.includes(exc));
        if (!isAllowed) {
          violations.push({ key, val });
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('t() function translates representative domain terms cleanly into English', () => {
    setLang('en');
    expect(t('Kalkulator')).toBe('Calculator');
    expect(t('Historia wypieków')).toBe('Bake history');
    expect(t('Mąka')).toBe('Flour');
    expect(t('Woda')).toBe('Water');
    expect(t('Sól')).toBe('Salt');
    expect(t('Zakwas')).toBe('Sourdough');
    expect(t('Anuluj')).toBe('Cancel');
    expect(t('Zapisz')).toBe('Save');
  });

  it('prohibits hardcoded `lang === \'pl\'` branching in JSX files (NFR-I18N-004)', () => {
    const tsxFiles = walk(appDir, (f) => f.endsWith('.tsx'));
    const violations: string[] = [];

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      // Detect raw JSX conditionals like: lang === 'pl' ? '...' : '...'
      if (content.match(/lang\s*===?\s*['"]pl['"]/) && !file.includes('__tests__')) {
        violations.push(file);
      }
    }

    expect(violations).toEqual([]);
  });
});
