/**
 * M1-audytor-generalny-054 (02-monetyzacja-002, MON-18; DEC-06 a, D-286): wydanie 1.0 jest tylko na iOS
 * (ADR-007: „Android poza planem 1.0”), a bramka opłacalności z 2026-10-19 liczyła iOS + Google Play.
 * Sekcja „Opcje modelu” w docs/monetyzacja.md ma podawać wynik dla platformy 1.0 (sam iOS, 174–218 USD netto/rok,
 * 35–44% progu 500 USD; `docs/monetyzacja-badanie-2026-10.md`, tabela E2e) i nazywać założenie o porcie na Androida
 * przy wyniku 345 USD. Plan wydania 1.0 nie podaje 345 jako wyniku bramki dla 1.0.
 * Dlaczego trwała kontrola: liczba 345 bez platformy wróciła już do polecenia M1 i planu wydania.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8').replace(/\r\n/g, '\n');

const monetyzacja = read('docs/monetyzacja.md');
const opcje = monetyzacja.split(/^## /m).find((s) => s.startsWith('Opcje modelu')) ?? '';
const badanie = read('docs/monetyzacja-badanie-2026-10.md');

describe('bramka opłacalności dla platformy wydania 1.0 (054)', () => {
  it('dane źródłowe: tabela E2e badania ma kolumnę „sam iOS” z 174 (Basic/Pro) i 218 (odczyt A)', () => {
    expect(badanie).toMatch(/\| iOS \+ Google Play \| sam iOS \|/);
    expect(badanie).toMatch(/D-112 Basic\/Pro[^\n]*\*\*174\*\*/);
    expect(badanie).toMatch(/D-038 \(odczyt A\) \| 345 \| 218 \|/);
  });

  it('„Opcje modelu” podaje wynik 1.0 dla samego iOS: 174–218 USD, 35–44% progu', () => {
    expect(opcje.length).toBeGreaterThan(0);
    expect(opcje).toMatch(/1\.0[^\n]*sam iOS|sam iOS[^\n]*1\.0/);
    expect(opcje).toMatch(/174–218/);
    expect(opcje).toMatch(/35–44%/);
    const wybrany = opcje.split('\n').find((l) => l.startsWith('|') && /\*\*wybrany\*\*/.test(l)) ?? '';
    expect(wybrany).toMatch(/174–218/);
  });

  it('345 USD stoi przy założeniu portu na Google Play, nie jako wynik 1.0', () => {
    expect(opcje).toMatch(/port[^\n]*(Android|Google Play)|(Android|Google Play)[^\n]*port/i);
    const naglowek = opcje.split('\n')[0];
    expect(naglowek).not.toMatch(/iOS \+ Google Play/);
    expect(opcje).toMatch(/DEC-06 a/);
  });

  it('plan wydania 1.0 podaje wynik bramki dla samego iOS (174–218), 345 tylko z portem', () => {
    const plan = read('docs/wydanie/plan-wydania-1.0.md');
    const punkt5 = plan.split('\n').find((l) => /^5\. \*\*Model płatności/.test(l)) ?? '';
    expect(punkt5).toMatch(/174–218/);
    expect(punkt5).toMatch(/sam iOS/);
    expect(punkt5).not.toMatch(/ok\. 345 USD netto\/rok w scen\. norm\. wobec/);
  });
});
