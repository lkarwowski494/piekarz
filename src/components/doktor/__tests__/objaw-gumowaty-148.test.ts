/**
 * 148: objaw „Gumowaty” w Doktorze nazywa przyczynę jak EN „Gummy (Cut while hot)” — krojenie gorącego chleba
 * (KRO-POC-015), nie „gorący nóż”; klucz z opisem dla tłumacza w pl.kontekst.json i w kolejce przekładu
 * [M1-audytor-generalny-148; 06-tresci-506, 09-lokalizacja-506].
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { DIAGNOSTIC_PRESETS } from '../SymptomSelectorSection';
import { setLang, t } from '../../../lib/i18n';

const ROOT = join(__dirname, '..', '..', '..', '..');
const gumowaty = () => DIAGNOSTIC_PRESETS.find((p) => p.id === 'preset_gummy')!.name;

describe('148: etykieta objawu „Gumowaty”', () => {
  afterEach(() => setLang('pl'));

  it('PL nazywa przyczynę: krojony na gorąco, bez „nóż”', () => {
    expect(gumowaty()).toMatch(/krojony na gorąco/i);
    expect(gumowaty()).not.toMatch(/nóż/i);
  });

  it('EN: „Gummy (Cut while hot)”', () => {
    setLang('en');
    expect(t(gumowaty())).toBe('Gummy (Cut while hot)');
  });

  it('klucz ma opis dla tłumacza (pl.kontekst.json)', () => {
    const k = JSON.parse(readFileSync(join(ROOT, 'docs/lokalizacja/pl.kontekst.json'), 'utf8'));
    expect(String(k[gumowaty()]?.opis ?? '')).toMatch(/krojon|cut/i);
  });
});
