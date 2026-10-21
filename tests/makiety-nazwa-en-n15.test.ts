/**
 * Makiety EN (docs/design/ekrany/teksty.js, en-US) nazywają aplikację jak słownik EN: „Baker”, nie „Piekarz”
 * (src/lib/i18n-en/czesc-12.ts: „Baker works without internet…”) [reaudit-noc N-15; M1-audytor-generalny-204].
 */
import fs from 'fs';
import path from 'path';
import { t, setLang } from '../src/lib/i18n';

const ROOT = path.join(__dirname, '..');
const czytaj = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');

describe('N-15: nazwa aplikacji w makietach EN', () => {
  const teksty = czytaj('docs/design/ekrany/teksty.js');

  it('teksty.js (en-US) bez „Piekarz” w tekstach', () => {
    const linie = teksty.split('\n').filter((l) => /^ "[^"]+": ".*Piekarz/.test(l));
    expect(linie).toEqual([]);
  });

  it('st.offline równe słownikowi EN tekstu z start.html', () => {
    setLang('en' as Parameters<typeof setLang>[0]);
    const pl = /data-t="st\.offline">([^<]+)</.exec(czytaj('docs/design/ekrany/start.html'))?.[1] ?? '';
    const enMakieta = /^ "st\.offline": "((?:[^"\\]|\\.)*)",?$/m.exec(teksty)?.[1] ?? '';
    expect(pl).not.toBe('');
    expect(JSON.parse(`"${enMakieta}"`)).toBe(t(pl));
    expect(t(pl)).toMatch(/^Baker works/);
  });
});
