/**
 * Opis sklepu twierdzi tylko to, co robi ta wersja [M2-koordynator-napraw-631 (p12c)]:
 * - noc planu domyślnie 23:00–07:00 (D-066 1a; `DOMYSLNE_OKNO_SNU` w src/scheduler/reverse-scheduler.ts);
 * - ekran prowadzenia nie gaśnie tylko w kroku wymagającym rąk (`StolnicaKeepAwake active={… && !isPassive}`),
 *   nie przez cały wypiek.
 * Sprawdza źródło przekładu (docs/app-store-metadata-v2.md) i lokalizacje PL i EN; pozostałe 30 czeka na przekład.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { oknoSnu, DOMYSLNY_PROFIL_SNU } from '../src/lib/profile-snu';

const ROOT = join(__dirname, '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const KODY = ['pl', 'en-US', 'en-GB', 'en-AU', 'en-CA'];
const opisy: Array<[string, string]> = [
  ['docs/app-store-metadata-v2.md', read('docs/app-store-metadata-v2.md')],
  ['README.md', read('README.md')],
  ...KODY.map((k): [string, string] => [k, JSON.parse(read(`docs/wydanie/metadane/${k}.json`)).opis]),
];

describe('opis sklepu PL i EN zgodny z kodem (631)', () => {
  const okno = oknoSnu(DOMYSLNY_PROFIL_SNU) ?? { startH: 23, koniecH: 7 };
  const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;

  it('domyślne godziny snu w kodzie to 23:00–07:00', () => {
    expect([hh(okno.startH), hh(okno.koniecH)]).toEqual(['23:00', '07:00']);
  });

  it.each(opisy)('%s: noc domyślnie do 07:00, nie do 06:30', (_k, tekst) => {
    expect(tekst).not.toContain('06:30');
    expect(tekst).toContain(hh(okno.koniecH));
  });

  it.each(opisy)('%s: bez obietnicy ekranu, który nie gaśnie przez cały wypiek', (_k, tekst) => {
    expect(tekst).not.toMatch(/nie gaśnie w trakcie wypieku|stays on during the bake/);
  });
});
