// 089: jedna nazwa na akcję według słownika interakcji (docs/design/design-spec.md §5),
// etykiety VoiceOver „akcja + obiekt”, przycisk tekstowy zamiast ikony zamknięcia (docs/design/mapa-rol.md §4)
// [M1-audytor-generalny-089; 04-studio-projektowe-017]
import fs from 'fs';
import path from 'path';
import { EN } from '../src/lib/i18n.en';

const rootDir = path.resolve(__dirname, '..');

function walk(dir: string): string[] {
  let res: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['__tests__', 'node_modules', 'i18n-en'].includes(entry.name)) res = res.concat(walk(full));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name)) {
      res.push(full);
    }
  }
  return res;
}

const rel = (f: string) => path.relative(rootDir, f).split(path.sep).join('/');
const kod = ['app', 'src'].flatMap((d) => walk(path.join(rootDir, d))).map((f) => ({ plik: rel(f), zrodlo: fs.readFileSync(f, 'utf8') }));
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Miejsca, w których tekst jest kluczem t('…'). */
const uzycia = (pl: string) => kod.filter(({ zrodlo }) => new RegExp(`\\bt\\(\\s*'${esc(pl)}'`).test(zrodlo)).map((x) => x.plik);

/** Akcje słownika §5, które aplikacja ma dziś w kodzie: nazwa PL (klucz) i EN. */
const SLOWNIK_W_KODZIE: [string, string][] = [
  ['Zrobione', 'Done'],
  ['Zacznij wypiek', 'Start Bake'],
  ['Zapisz jako moją', 'Save as Mine'],
  ['Temperatura wody', 'Water temperature'],
  ['Kopiuj jako tekst', 'Copy as Text'],
  ['Udostępnij plik receptury', 'Share Recipe File'],
  ['Zapisz dokarmienie', 'Log Feeding'],
  ['Edytuj', 'Edit'],
  ['Zapisz', 'Save'],
  ['Anuluj', 'Cancel'],
  ['Zamknij', 'Close'],
  ['Przywróć zakupy', 'Restore Purchases'],
  ['Zarządzaj subskrypcją', 'Manage Subscription'],
  ['Spróbuj ponownie', 'Try Again'],
  ['Oceń w App Store', 'Rate on the App Store'],
  ['Napisz do nas', 'Email Us'],
  ['Przerwij wypiek', 'Stop Bake'],
  ['Wróć do wypieku', 'Back to Bake'],
  ['Przerwij', 'Stop'],
  ['Otwórz Doktora Chleba', 'Open Bread Doctor'],
  ['Nie teraz', 'Not Now'],
  ['Piecz ponownie', 'Bake Again'],
  ['Usuń wpis', 'Delete Entry'],
  ['Usuń recepturę', 'Delete Recipe'],
  ['Eksportuj do pliku', 'Export to File'],
  ['Zacznij od nowa', 'Start Over'],
  // [M1-audytor-generalny-089; 04-studio-projektowe-028]: import kopii w Ustawieniach (para „Eksportuj do pliku”),
  // „Ułóż plan” zamiast „Przejdź do Harmonogramu” w Doktorze
  ['Importuj z pliku', 'Import from File'],
  ['Ułóż plan', 'Make a Plan'],
];

/** Akcje słownika dla ekranów, które dopiero powstają (partia 5, zestawy C–H): jeśli są w słowniku EN, to z tą nazwą. */
const SLOWNIK_POZOSTALE: [string, string][] = [
  ['Cofnij poprzedni', 'Undo Previous'],
  ['Po co ten krok', 'Why this step'],
  ['Ułóż plan', 'Make a Plan'],
  ['Zmień składniki', 'Change Ingredients'],
  ['Podwoił objętość', 'Doubled in volume'],
  ['Coś mnie niepokoi', 'Something Looks Off'],
  ['Usuń wszystkie dane', 'Delete All Data'],
  ['Importuj z pliku', 'Import from File'],
  ['Kopie zapasowe', 'Backups'],
  ['Dodaj mąkę', 'Add Flour'],
  ['Gotowe', 'Done'],
  ['Przywróć', 'Restore'],
];

/** Nazwy z kodu, które znikają (§5), i synonimy akcji ze słownika. */
const ZNIKAJA = [
  'Klonuj recepturę',
  'Rozpocznij wypiek na Stolnicy',
  'Rozpocznij wypiek',
  'Następny krok',
  'Odrzuć wypiek',
  'Resetuj',
  'Resetuj profil',
  'Resetuj profil zakwasu',
  'Eksportuj JSON',
  'Zapisz jako mój przepis',
  'Kopiuj recepturę',
  'Zarejestruj dokarmienie',
  'Otwórz Doktora',
  'Eksportuj kopię',
  'Zakończ wypiek',
  // [M1-audytor-generalny-089; 04-studio-projektowe-028, 04-studio-projektowe-035]
  'Importuj kopię',
  'Przejdź do Harmonogramu',
  'Dostosuj hydratację w Kalkulatorze',
  'Załaduj do Kalkulatora',
  'Pora nakarmić zakwas',
  'Zaczyny rzemieślnicze',
  '{nazwa}, gotowy {dzien} o {godzina}',
];

/** Miejsca, których po D-051 2a nie ma („Kalkulator” → Receptury, „Harmonogram” → Plan wypieku), w odmianach nazwy miejsca. */
const MIEJSCA_DAWNE = /Kalkulatorze|Kalkulatora\b|Harmonogramu|Harmonogramie|\(Harmonogram\)/;
/** Klucze t() w kodzie (teksty PL). */
const kluczeWKodzie = [...new Set(kod.flatMap(({ zrodlo }) => [...zrodlo.matchAll(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1])))];

describe('089: słownik akcji', () => {
  it.each(SLOWNIK_W_KODZIE)('„%s” / „%s”: jedna nazwa PL i EN, użyta w kodzie', (pl, en) => {
    expect(EN[pl]).toBe(en);
    expect(uzycia(pl).length).toBeGreaterThan(0);
  });

  it('pozostałe akcje słownika mają w słowniku EN nazwę z §5 (gdy już są)', () => {
    const zle = SLOWNIK_POZOSTALE.filter(([pl, en]) => pl in EN && EN[pl] !== en);
    expect(zle).toEqual([]);
  });

  it('nazwy, które znikają, nie są kluczami t() w kodzie ani w słowniku EN', () => {
    const znalezione = ZNIKAJA.flatMap((pl) => [...uzycia(pl).map((p) => `${p}: ${pl}`), ...(pl in EN ? [`słownik EN: ${pl}`] : [])]);
    expect(znalezione).toEqual([]);
  });

  it('M1-audytor-generalny-089: teksty nie odsyłają do „Kalkulatora” ani „Harmonogramu” (dziś Receptury i Plan wypieku)', () => {
    expect(kluczeWKodzie.length).toBeGreaterThan(500);
    expect(kluczeWKodzie.filter((k) => MIEJSCA_DAWNE.test(k))).toEqual([]);
    expect(Object.keys(EN).filter((k) => MIEJSCA_DAWNE.test(k))).toEqual([]);
  });

  it('M1-audytor-generalny-089: „Plan wypieku” ma w EN jedną nazwę “Bake plan” (nagłówek i etykieta Spirali)', () => {
    expect(EN['Plan wypieku']).toBe('Bake plan');
    expect(EN['Plan wypieku: {n} kroków.']).toMatch(/^Bake plan: /);
  });

  it('M1-audytor-generalny-089: poprawki tekstów 04-035 (gotowe przy nazwie, dokarmienie, Zaczyny)', () => {
    expect(EN['{nazwa}: gotowe {dzien} o {godzina}']).toBe('{nazwa}: ready {dzien} at {godzina}');
    expect(uzycia('{nazwa}: gotowe {dzien} o {godzina}')).toContain('src/components/start/TrwajacyWypiek.tsx');
    expect(uzycia('Pora dokarmić zakwas')).toContain('src/lib/notifications.ts');
    expect(uzycia('Zakwas „{name}” stoi na blacie od 12 godzin bez dokarmienia.')).toContain('src/lib/notifications.ts');
    expect('Zakwas „{name}” stoi na blacie od 12 godzin bez karmienia.' in EN).toBe(false);
    expect(EN['Zaczyny']).toBe('Preferments');
    expect(uzycia('Zaczyny')).toContain('src/components/calculator/accordion/AccordionPrefermentSection.tsx');
  });

  it('kontrola wzorca 089: nazwy dawnych miejsc w odmianie są wykrywane, inne słowa nie', () => {
    expect(MIEJSCA_DAWNE.test('Wybierz recepturę w Kalkulatorze')).toBe(true);
    expect(MIEJSCA_DAWNE.test('Przejdź do Harmonogramu')).toBe(true);
    expect(MIEJSCA_DAWNE.test('Klasyczny chleb (Harmonogram)')).toBe(true);
    expect(MIEJSCA_DAWNE.test('Kalkulator dokarmiania')).toBe(false);
  });

  it('ikona zamknięcia z @apps4craft/ui zastąpiona przyciskiem tekstowym (Zamknij albo Anuluj)', () => {
    expect(kod.filter(({ zrodlo }) => /\bCloseIcon\b/.test(zrodlo)).map((x) => x.plik)).toEqual([]);
  });

  it('etykiety VoiceOver to akcja z obiektem, nie samo słowo', () => {
    const GOLE = ['Mniej', 'Więcej', 'Usuń', 'Edytuj', 'Zwiększ', 'Zmniejsz', 'Dodaj', 'Kopiuj', 'Wyczyść'];
    const znalezione = kod.flatMap(({ plik, zrodlo }) =>
      [...zrodlo.matchAll(/accessibilityLabel=\{t\('([^']*)'\)\}/g)].filter((m) => GOLE.includes(m[1])).map((m) => `${plik}: ${m[1]}`)
    );
    expect(znalezione).toEqual([]);
    expect(EN['Mniej bochenków']).toBe('Fewer loaves');
    expect(EN['Więcej bochenków']).toBe('More loaves');
    expect(uzycia('Mniej bochenków')).toContain('src/components/calculator/DoMiskiScaleCard.tsx');
  });
});
