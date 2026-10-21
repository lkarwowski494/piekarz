// Poprawki słownika EN po kontroli przekładu 2026-10-22 (tłumaczenie zwrotne i druga ocena AI)
// [M1-audytor-generalny-074; 09-lokalizacja-009].
import { readFileSync } from 'fs';
import { join } from 'path';
import { EN } from '../i18n.en';
import { setLang, t, tPlural } from '../i18n';

const OCZEKIWANE: Record<string, string> = {
  'Bardzo kwaśny': 'Very sour',
  '{n} cz.': '{n} parts',
  'Przykryj naczynie luźno, co utrudnia rozwój pleśni, i zostaw na 24 godziny w ciepłym miejscu, w około 21 °C.':
    'Cover the container loosely, which makes mold less likely, and leave it for 24 hours in a warm spot, at about 21 °C.',
  'Mąka pszenna typ 650 (chlebowa jasna)': 'Light wheat bread flour (Polish type 650)',
  'Mąka pszenna typ 650': 'Light wheat flour (Polish type 650)',
  'Mąka pszenna luksusowa typ 550': 'Fine light wheat flour (Polish type 550)',
  'Mąka pszenna graham typ 1850': 'Graham wheat flour (coarse, Polish type 1850)',
  'Mąka żytnia typ 720': 'Light rye flour (Polish type 720)',
  'Mąka pszenna pełnoziarnista typ 2000': 'Wholemeal wheat flour (Polish type 2000)',
  'Mistrzowski': 'Expert',
  'Zakwas żytni': 'Rye starter',
  'Wymieszanie z solą i zakwasem': 'Mixing in salt and starter',
  'Niedofermentowanie': 'Under-fermentation (under-proofed)',
  'Dodaj jedno dodatkowe delikatne złożenie, aby rozprowadzić ciepło.': 'Do one extra gentle fold to distribute the heat.',
  '12 autorskich kart rzemieślniczych z fizykochemicznymi regułami, krokami wykonania i typowymi błędami.':
    '12 original technique cards with physicochemical principles, step-by-step cues and common mistakes.',
  'Aparat jest potrzebny, aby natychmiast zeskanować kod QR receptury od innego piekarza w 100% offline.':
    'The camera is needed to instantly scan a recipe QR code from another baker, 100% offline.',
  'Nie zdążysz na tę godzinę': "You won't make it by this time",
  'Wstaw gotową mieszankę': 'Insert a preset blend',
  'Udział mąki w zaczynie': 'Preferment flour share',
  'Cena energii': 'Energy price',
  'Mąka pełnoziarnista / razowa (100%)': 'Whole-grain / wholemeal flour (100%)',
  'Odhaczaj składniki w miarę wsypywania': 'Check off ingredients as you add them',
  'Czeladnik Piekarski': 'Journeyman Baker',
};

// Tekst krytyczny ZAK-PLE-003 („small patch of growth”) bez zmiany: zdania po przeglądzie człowieka (przeglad w
// docs/tresci/rejestr.json) zmienia dopiero nowy przegląd; propozycja czeka na przegląd EN właściciela.
const zrodlo = (p: string) => readFileSync(join(__dirname, '..', '..', '..', p), 'utf8');

describe('074: poprawki EN z kontroli 2026-10-22', () => {
  afterEach(() => setLang('pl'));

  it.each(Object.entries(OCZEKIWANE))('EN dla „%s”', (pl, en) => {
    expect(EN[pl]).toBe(en);
  });

  it('pisownia amerykańska: w słowniku EN nie ma „mould”', () => {
    expect(Object.values(EN).filter((v) => /\bmould/i.test(v))).toEqual([]);
  });

  it('nazwy mąk z polskim typem w nawiasie odróżniają 550, 650, 720, 1850 i 2000', () => {
    const typy = ['550', '650', '720', '1850', '2000'].map((n) => Object.values(EN).filter((v) => v.includes(`(Polish type ${n})`) || v.includes(`Polish type ${n})`)).length);
    expect(typy.every((x) => x > 0)).toBe(true);
  });

  it('proporcja karmienia po angielsku ma formę liczby: 1 part, 2 parts', () => {
    setLang('en');
    const CZESCI = { one: '{n} cz.', few: '{n} cz.', many: '{n} cz.', other: '{n} cz.' };
    expect([1, 2, 5].map((n) => tPlural(n, CZESCI))).toEqual(['1 part', '2 parts', '5 parts']);
    expect(zrodlo('src/components/zakwas/StarterFeedingCard.tsx')).toMatch(/tPlural\(selectedRatio\[0\]/);
  });

  it('pole procentu zakwasu w recepturze używa klucza „Zakwas|składnik” (Starter), a nie nazwy działu', () => {
    setLang('en');
    expect(t('Zakwas|składnik')).toBe('Starter');
    expect(t('Zakwas')).toBe('Sourdough');
    const kod = zrodlo('src/components/receptury/SkladnikiSheet.tsx');
    expect(kod).toMatch(/id="starter-pct-input" etykieta=\{t\('Zakwas\|składnik'\)\}/);
  });
});
