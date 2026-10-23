/**
 * Klucze usuniętego ekranu zakupu (design-spec §11e 127, lista „Znikają z ekranu zakupu”) nie zostają w słowniku EN
 * ani w 33 słownikach przekładu, bo kod ich nie używa (wersaliki, „•”, „(Lifetime)”, „(Read-Only)” wracałyby
 * przy kopiowaniu klucza) [M1-audytor-generalny-203; 04-studio-projektowe-612].
 * Z listy §11e zostają klucze nadal używane: „Przetwarzanie...”, „Zarządzaj subskrypcją” („rok” i „Odblokuj pełny
 * dostęp” usunięte w M3 P-b, D-117).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { EN } from '../src/lib/i18n.en';

const root = path.join(__dirname, '..');

const MARTWE = [
  'Odblokuj wszystkie funkcje aplikacji. Bez zakupu dostępne zostają historia wypieków oraz podgląd, eksport i usuwanie Twoich danych.',
  'Twoja historia jest bezpieczna',
  'Nawet bez zakupu Twoje notatki, archiwalne bochenki i receptury są zawsze bezpłatne do wglądu (tryb Read-Only).',
  'Bez chmury: dane zostają w telefonie',
  'Zero reklam, zero śledzenia telemetrycznego',
  'Wszystkie zaawansowane narzędzia i asystent stolnicy bez limitów',
  'Dożywotni (Lifetime)',
  '12 miesięcy',
  '1 miesiąc',
  'Odnawia się automatycznie co rok',
  'Odnawia się automatycznie co miesiąc',
  'miesiąc',
  'jednorazowo',
  'Jednorazowy zakup na zawsze • Wszystkie aktualizacje',
  'Pierwsze {dni} dni bezpłatnie, potem {cena}',
  'Wypróbuj {dni} dni',
  'Aktywuj plan roczny',
  'Aktywuj plan miesięczny',
  'Subskrypcja odnawia się automatycznie za cenę podaną przy planie, dopóki jej nie anulujesz. Płatność pobiera App Store z Twojego konta Apple. Subskrypcję anulujesz w każdej chwili w ustawieniach konta Apple albo przyciskiem „Zarządzaj subskrypcją”.',
  'Dostęp dożywotni to jednorazowy zakup bez odnawiania.',
  'Przeglądaj historię (Read-Only)',
  'Nie udało się dokończyć zakupu. Spróbuj ponownie.',
  // M3 P-b (D-117): opis ekranu Pro obiecujący funkcje Basic (P1-4), kłódka „Odblokuj pełny dostęp” zastąpiona
  // oznaczeniem „Pro”, „rok” z uprzedzenia o końcu próby (usuniętego w P-a, D-116) i blokada usuwania jedynego zakwasu
  // (zdjęta w P-a-fix, P0-1)
  'Liczenie receptur, plan wypieku, prowadzenie z powiadomieniami, zakwasy i dziennik. Bez reklam, bez konta.',
  'Odblokuj pełny dostęp',
  'rok',
  'Nie można usunąć',
  'Musisz posiadać co najmniej jeden profil zakwasu.',
];

const lit = (k: string) => `'${k.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}':`;

function plikiSlownikow(): string[] {
  const dir = path.join(root, 'src/lib/i18n-slowniki');
  const kody = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  expect(kody).toHaveLength(33);
  return kody.flatMap((kod) =>
    fs.readdirSync(path.join(dir, kod)).filter((f) => /^czesc-\d+\.ts$/.test(f)).map((f) => path.join(dir, kod, f)));
}

describe('203: martwe klucze starego ekranu zakupu', () => {
  it('słownik EN nie ma kluczy z listy §11e', () => {
    expect(MARTWE.filter((k) => k in EN)).toEqual([]);
  });

  it('33 słowniki przekładu nie mają kluczy z listy §11e', () => {
    const zostaly: string[] = [];
    for (const f of plikiSlownikow()) {
      const s = fs.readFileSync(f, 'utf8');
      for (const k of MARTWE) if (s.includes(lit(k))) zostaly.push(`${path.relative(root, f)}: ${k}`);
    }
    expect(zostaly).toEqual([]);
  });

  // Zmienione w M3 P-b: „rok” zostawało dla uprzedzenia o końcu próby, które P-a usunęło (D-116); teraz jest na liście MARTWE
  it('„rok” nie zostaje: uprzedzenie o próbie usunięte (D-116)', () => {
    expect(EN['rok']).toBeUndefined();
  });
});
