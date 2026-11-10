/**
 * M1-audytor-generalny-061 (03-zakres-005; DEC-01 a, D-286): kontrakt nazywa stan receptur bazowych w 1.0 — ile ich
 * jest, ile ma plan i prowadzenie krok po kroku, a które zostają przy ilościach bez planu (D-252: blokada D-3 dla
 * receptur bez zakwasu i bez danych planu). Liczby liczy test z katalogu i z tej samej reguły co ekran receptury
 * (`powodBezPlanu`), więc zmiana katalogu albo włączenie planu dla drożdży bez poprawki kontraktu czerwieni test
 * (trwała kontrola, Powraca: ZM-25).
 */
import * as fs from 'fs';
import * as path from 'path';
import { CATALOG_RECIPES } from '../src/recipes/katalog';
import { powodBezPlanu } from '../src/lib/plan-receptury';
import { wersjaDrozdzowa } from '../src/recipes/wersje-drozdzowe';

const root = path.resolve(__dirname, '..');
const kontrakt = fs.readFileSync(path.join(root, 'docs/scope-contract.md'), 'utf8').replace(/\r\n/g, '\n');
const wiersz = (f: string) => kontrakt.split('\n').find((l) => l.startsWith(`| ${f} |`)) ?? '';

const wszystkie = CATALOG_RECIPES.length;
const zPlanem = CATALOG_RECIPES.filter((r) => powodBezPlanu(r.formula, { recipeId: r.id }) === null).length;
const bezZakwasu = CATALOG_RECIPES.filter((r) => r.formula.starterPercentage <= 0).length;
// Receptury z zakwasem bez planu (brioszka na Lievito Madre do czasu źródła czasów rośnięcia, PIE-BRI-900) [M1-audytor-generalny-089]
const zZakwasemBezPlanu = wszystkie - zPlanem - bezZakwasu;
const zWersja = CATALOG_RECIPES.filter((r) => wersjaDrozdzowa(r.id) !== null);
const wersjeZPlanem = zWersja.filter((r) => powodBezPlanu(r.formula, { recipeId: r.id, wersja: 'drozdze' }) === null).length;

describe('kontrakt: receptury bazowe z planem i bez planu w 1.0 (061)', () => {
  it('F-26 podaje liczbę receptur bazowych i ile z nich ma plan i prowadzenie (liczone z katalogu)', () => {
    expect(wszystkie).toBeGreaterThan(0);
    expect(wiersz('F-26')).toContain(`${wszystkie} receptur bazowych, z czego ${zPlanem} z planem i prowadzeniem krok po kroku`);
    expect(wiersz('F-26')).toContain(`${bezZakwasu} bez zakwasu`);
    expect(wiersz('F-26')).toContain(`${zZakwasemBezPlanu} z zakwasem bez planu: brioszka na Lievito Madre`);
  });

  it('F-26 podaje wersje drożdżowe z przełącznikiem i ile z nich ma plan', () => {
    expect(wiersz('F-26')).toContain(`wersja drożdżowa w ${zWersja.length} recepturach na zakwasie, z planem w ${wersjeZPlanem}`);
  });

  it('F-55 i ZM-25 mówią wprost, że receptury bez zakwasu zostają w 1.0 bez planu (D-252)', () => {
    expect(wiersz('F-55')).toMatch(/bez planu i prowadzenia w 1\.0/);
    expect(wiersz('F-55')).toMatch(/D-252/);
    expect(wiersz('ZM-25')).toMatch(/D-252/);
  });
});
