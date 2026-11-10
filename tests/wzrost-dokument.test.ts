/**
 * M1-audytor-generalny-180 (11-wzrost-504): plan wzrostu nie podaje „PL i EN” jako
 * ograniczenia (aplikacja ma 35 języków, DEC-06), a każda ścieżka repo w nim istnieje.
 * M1-audytor-generalny-018 (11-wzrost-002, DEC-15 a): budżet godzin z ID decyzji, jeden kanał
 * startu z adresem, cytatem reguły autopromocji i datą odczytu, plan na złe przyjęcie i wiersz
 * listy kontrolnej wydania (trwała kontrola, bo luka wróciła z 11-wzrost-006 audytu 2026-10-20).
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const tekst = fs.readFileSync(path.join(root, 'docs/wzrost.md'), 'utf8');
const decyzje = fs.readFileSync(path.join(root, 'docs/decyzje.md'), 'utf8');
const planWydania = fs.readFileSync(path.join(root, 'docs/wydanie/plan-wydania-1.0.md'), 'utf8');

/** Treść sekcji `## <tytuł>` do następnego nagłówka drugiego stopnia. */
function sekcja(tytul: string): string {
  const start = tekst.indexOf(`\n## ${tytul}`);
  if (start < 0) return '';
  const koniec = tekst.indexOf('\n## ', start + 4);
  return tekst.slice(start, koniec < 0 ? undefined : koniec);
}

/** ID decyzji D-nnn z tekstu, które mają wpis `### [D-nnn]` w docs/decyzje.md. */
const zapisaneDecyzje = (s: string) =>
  [...s.matchAll(/D-(\d{3})/g)].map((m) => `D-${m[1]}`).filter((id) => decyzje.includes(`### [${id}]`));

/** Ścieżki repo w backtickach, bez sufiksu `:linia`. */
const sciezki = [...tekst.matchAll(/`((?:docs|src|app|tests|scripts)\/[^`\s:]+)(?::[\d-]+)?`/g)].map((m) => m[1]);

describe('docs/wzrost.md (180)', () => {
  it('nie podaje „PL i EN” jako ograniczenia wersji', () => {
    expect(tekst).not.toMatch(/PL i EN/);
  });

  it('każda ścieżka repo w dokumencie istnieje', () => {
    expect(sciezki.length).toBeGreaterThan(0);
    expect(sciezki.filter((p) => !fs.existsSync(path.join(root, p)))).toEqual([]);
  });

  it('budżet godzin tygodniowo ma liczbę i ID decyzji z docs/decyzje.md (018)', () => {
    const budzet = sekcja('Budżet i horyzont').split('\n').find((l) => /Budżet godzin tygodniowo/.test(l)) ?? '';
    expect(budzet).not.toMatch(/DO USTALENIA/);
    expect(budzet).toMatch(/\d+(?:,\d+)? h/);
    expect(zapisaneDecyzje(budzet).length).toBeGreaterThan(0);
  });

  it('jeden kanał startu: adres, cytat reguły autopromocji i data odczytu (018)', () => {
    const wiersze = sekcja('Kanały').split('\n').filter((l) => l.startsWith('| ') && /kanał startu/i.test(l));
    expect(wiersze).toHaveLength(1);
    expect(wiersze[0]).toMatch(/https:\/\/\S+/);
    expect(wiersze[0]).toMatch(/„[^”]{12,}”/);
    expect(wiersze[0]).toMatch(/odczyt \d{4}-\d{2}-\d{2}/);
  });

  it('plan na złe przyjęcie: kto odpowiada, w jakim czasie i dokąd trafia zgłoszony błąd (018)', () => {
    const plan = sekcja('Złe przyjęcie');
    expect(plan).toMatch(/właściciel/);
    expect(plan).toMatch(/recenzj/);
    expect(plan).toMatch(/w ciągu \d+/);
    expect(plan).toMatch(/ER\/ZM/);
  });

  it('lista kontrolna wydania 1.0 ma wiersz kanału startu z docs/wzrost.md (018, trwała kontrola)', () => {
    expect(planWydania).toMatch(/^- \[[ x]\] \*\*W1-\d+\*\*[^\n]*kanał startu[^\n]*`docs\/wzrost\.md`/m);
    expect(planWydania).not.toMatch(/## 6\. Po premierze: budżet czasu właściciela\s+`\[DO USTALENIA\]`/);
  });
});
