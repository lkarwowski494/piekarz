/**
 * Kontrola (a) tłumaczenia zwrotnego tekstów krytycznych [M1-audytor-generalny-011; 09-lokalizacja-001]: każdy klucz
 * z twierdzeniem krytycznym z partii 09m i p8 (7 zdań trybu maszyny, 2 notatki z BEZ-WRZ-001) ma w 21 językach wpis
 * w rejestrze; każda poprawka jest wdrożona w słowniku (zdania maszyny: wyjątek od D-287 decyzją D-308).
 */
import fs from 'fs';
import path from 'path';
import { LADOWANIE_SLOWNIKOW } from '../src/lib/i18n-slowniki';

const ROOT = path.join(__dirname, '..');
const rej = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'lokalizacja', 'kontrola-a-m2-2026-11-09.json'), 'utf8')) as {
  wpisy: { jezyk: string; id: string; klucz: string; zwrotne_pl: string; wynik: string; poprawiony: string | null; stan: string }[];
};
const JEZYKI = 'cs sk hr sl sr lt et uk es-419 pt pt-BR it nl sv da nb tr el id ms vi'.split(' ');
const IDS = ['k52', 'k53', 'k56', 'k57', 'k58', 'k59', 'k60', 'n1', 'n2'];

describe('011: kontrola (a) tekstów krytycznych w 21 językach', () => {
  it('rejestr ma tłumaczenie zwrotne i wynik dla każdego klucza krytycznego i języka', () => {
    for (const l of JEZYKI) for (const id of IDS) {
      const w = rej.wpisy.find((x) => x.jezyk === l && x.id === id);
      expect([l, id, !!w?.zwrotne_pl, ['zgodne', 'drobna', 'poprawka'].includes(w?.wynik ?? '')]).toEqual([l, id, true, true]);
    }
  });
  it('poprawka wdrożona = tekst w słowniku; wszystkie wdrożone (zdania maszyny decyzją D-308)', async () => {
    for (const w of rej.wpisy.filter((x) => x.wynik === 'poprawka')) {
      if (w.stan.startsWith('wdrożona')) {
        const slownik = await LADOWANIE_SLOWNIKOW[w.jezyk as keyof typeof LADOWANIE_SLOWNIKOW]();
        expect([w.jezyk, w.id, slownik[w.klucz]]).toEqual([w.jezyk, w.id, w.poprawiony]);
      } else {
        throw new Error(`nierozstrzygnięta poprawka ${w.jezyk} ${w.id}: ${w.stan}`);
      }
    }
  });
});
