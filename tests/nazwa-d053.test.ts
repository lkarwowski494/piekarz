/**
 * Nazwa aplikacji według D-053 (M5, 2026-10-20): w każdym języku lokalne słowo „piekarz” sprzed dwukropka nazwy
 * w sklepie (`docs/app-store-metadata-v2.md` §5); po polsku „Piekarz”, po angielsku „Baker”. Dawna nazwa EN
 * „Crust” nie występuje jako nazwa aplikacji [M1-audytor-generalny-093; M1-audytor-generalny-118].
 * Słowo „crust” jako skórka chleba (np. „Crust quality”) zostaje.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { EN } from '../src/lib/i18n.en';
import { setLang, t } from '../src/lib/i18n';
import { trescZgloszenia } from '../src/lib/zgloszenie';

const root = path.join(__dirname, '..');
const plist = (kod: string) =>
  JSON.parse(fs.readFileSync(path.join(root, 'languages', `${kod}.json`), 'utf8')).ios.CFBundleDisplayName;

/** Nazwa aplikacji w tekście EN: dawne „Piekarz” albo „Crust” użyte jako nazwa (z przyimkiem lub nawiasem). */
const DAWNA_NAZWA_EN = /Piekarz|Crust \(|\(Crust\)|(of|in|from|by) Crust\b/;

describe('Nazwa aplikacji D-053', () => {
  afterEach(() => setLang('pl'));

  it('nazwa pod ikoną: pl „Piekarz”, en „Baker”', () => {
    expect(plist('pl')).toBe('Piekarz');
    expect(plist('en')).toBe('Baker');
  });

  it('słownik EN nie nazywa aplikacji „Piekarz” ani „Crust”', () => {
    const zle = Object.entries(EN).filter(([, v]) => DAWNA_NAZWA_EN.test(v)).map(([k]) => k);
    expect(zle).toEqual([]);
  });

  it('nazwa aplikacji idzie przez t(): „Piekarz” po polsku, „Baker” po angielsku', () => {
    expect(t('Piekarz')).toBe('Piekarz');
    setLang('en');
    expect(t('Piekarz')).toBe('Baker');
    expect(t('wymaga Piekarz Pro')).toBe('requires Baker Pro');
  });

  it('temat wiadomości do autora bez „(Crust)”', () => {
    const d = { wersja: '1.0.0', build: null, systemIos: null } as const;
    expect(trescZgloszenia({ ...d, jezyk: 'pl' }).temat).toBe('Piekarz 1.0.0 — wiadomość do autora');
    setLang('en');
    expect(trescZgloszenia({ ...d, jezyk: 'en' }).temat).toMatch(/^Baker 1\.0\.0 — /);
  });
});
