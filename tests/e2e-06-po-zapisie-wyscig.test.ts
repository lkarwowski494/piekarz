/**
 * E2E #125 (en-US): w 06-koniec-wypieku stuknięcie `tab-dziennik` zaraz po `finish-save-btn` wpadło w
 * `router.replace('/')` ze Stolnicy (app/stolnica.tsx:62-64, po zapisie `onKoniec` → `wybrany === null`) i karta
 * Dziennik się nie przełączyła. Scenariusz czeka na stan po przejściu (`start-czynnosci` z Dziś), a po stuknięciu
 * sprawdza przełączenie z jednym warunkowym ponowieniem [KO-061].
 */
import fs from 'fs';
import path from 'path';

const PLIKI = [
  ['.maestro', 'e2e', '06-koniec-wypieku.yaml'],
  ['.maestro', 'zrzuty-sklepu', '00-przygotuj-podwojenie.yaml'],
];

describe.each(PLIKI)('KO-061: po zapisie wypieku (%s/%s/%s)', (...sciezka) => {
  const yaml = fs.readFileSync(path.join(__dirname, '..', ...sciezka), 'utf8');
  const po = yaml.slice(yaml.indexOf('id: "finish-save-btn"'));
  const poz = (z: string) => po.indexOf(z);

  it('po finish-save-btn czeka na stan po przejściu, zanim stuknie tab-dziennik', () => {
    const tap = poz('id: "tab-dziennik"');
    expect(tap).toBeGreaterThan(0);
    const czeka = po.slice(0, tap);
    expect(czeka).toMatch(/extendedWaitUntil:\s*\n\s+visible:\s*\n\s+id: "start-czynnosci"/);
  });
  it('po stuknięciu tab-dziennik: jedno warunkowe ponowienie stuknięcia, gdy karta nie przełączona', () => {
    const tap = poz('id: "tab-dziennik"');
    const kart = po.lastIndexOf('id: "bake-log-card-.*"');
    const blok = po.slice(tap, kart);
    expect(blok.match(/runFlow:/g)?.length).toBe(1);
    expect(blok).toMatch(/when:\s*\n\s+notVisible:\s*\n\s+id: "bake-log-card-\.\*"/);
    expect(blok).toMatch(/tapOn:\s*\n\s+id: "tab-dziennik"/);
  });
  it('asercja bake-log-card-.* zostaje, limit 15000 bez zmian', () => {
    expect(po).toMatch(/visible:\s*\n\s+id: "bake-log-card-\.\*"\s*\n\s+timeout: 15000/);
  });
});
