/**
 * Jedno źródło oferty: warunki w kodzie, README, metadanych i notatkach dla App Review są te same
 * [M1-audytor-generalny-009; 02-monetyzacja-002, 02-monetyzacja-009, 05-architekt-015, 08-programista-020, 11-wzrost-001].
 * Okres próbny istnieje tylko jako oferta wprowadzająca App Store (długość w App Store Connect, decyzja 2026-10-19: 14 dni).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PRODUKTY } from '../src/lib/platnosci/konfiguracja';

const root = path.join(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const walk = (dir: string): string[] =>
  fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : walk(rel);
    return /\.(ts|tsx)$/.test(e.name) ? [rel] : [];
  });

const STARE = [
  /7-dniow/i,
  /7 dni lub/i,
  /3 (pełne )?bochenk/i,
  /Craft Trial/,
  /uruchamiany lokalnie|aktywowany lokalnie/,
  /~\s?(4,49|22,99|69,99|1,91) zł/,
  /59,99 zł|24,99 zł/,
  /\$4\.99/,
  /0,99 €\/mc bez blokowania/,
  /prawym górnym rogu ekranu Ustawienia/,
];

describe('Offer terms are the same in code, README, metadata and App Review notes (009)', () => {
  it('no local trial counter is read by the app code', () => {
    const offenders = [...walk('src'), ...walk('app')].filter((f) => {
      const src = fs.readFileSync(path.join(root, f), 'utf8');
      // DDL migracji (sqlite-schema.ts, schema.ts) zostaje: kolumny są w bazach wydanych buildów.
      if (/sqlite-schema\.ts$|[\\/]schema\.ts$/.test(f)) return false;
      return /trial_started_at|trialStartedAt|TRIAL_DURATION_DAYS|TRIAL_MAX_COMPLETED_BAKES/.test(src);
    });
    expect(offenders).toEqual([]);
  });

  it.each(['README.md', 'docs/app-store-metadata-v2.md'])('%s has no old terms and names the App Store introductory offer', (f) => {
    const text = read(f);
    for (const re of STARE) expect({ f, re: String(re), found: re.test(text) }).toEqual({ f, re: String(re), found: false });
    expect(text).toMatch(/14 dni/);
    expect(text).toMatch(/ofert[aęy] wprowadzając/i);
  });

  it('metadata lists exactly the product identifiers from the configuration module', () => {
    const text = read('docs/app-store-metadata-v2.md');
    for (const id of Object.values(PRODUKTY)) expect(text).toContain(id);
    expect(text.match(/com\.apps4brew\.baker\.[\w.]+/g)?.filter((x) => !Object.values(PRODUKTY).includes(x) && x !== 'com.apps4brew.baker')).toEqual([]);
  });

  it('App Review notes tell the reviewer to start the trial (no history for a new user)', () => {
    const text = read('docs/app-store-metadata-v2.md');
    // Notatki po angielsku, przycisk jak w interfejsie EN [M1-audytor-generalny-078]; nazwa z §11e 127 [M1-audytor-generalny-127]
    expect(text).toMatch(/Start Free Trial/);
    expect(text).toMatch(/sandbox/i);
  });

  it('scope contract no longer promises the 7-day / 3-loaf local trial', () => {
    expect(read('docs/scope-contract.md')).not.toMatch(/7-dniowy \/ 3-bochenkowy/);
  });
});
