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

  // Przepisane z kontraktu D-038 („14 dni”, oferta wprowadzająca) na Basic/Pro [M3 P-a-fix, P1-5]: bez obietnicy próby
  // i bez „bez zakupu tylko historia”; brzmienie z kontraktu („Basic stays free”, metadane: „Free Basic forever…”)
  const OBIETNICE_PROBY = [
    /Okres próbny 14 dni/,
    /bezpłatnym okresem próbnym/,
    /may start with a free trial/i,
    /ofert[aąęy] wprowadzając[a-ząęłńóśźż]* (App Store )?(dla uprawnionych|14 dni)/i,
    /oferta wprowadzająca: bezpłatny okres próbny/,
    /Without a purchase you can browse your bake history/,
    /Bez zakupu przeglądasz historię/,
    /działa tylko przegląd historii/,
  ];
  it.each(['README.md', 'docs/app-store-metadata-v2.md'])('%s has no old terms, no trial promise and names Basic (D-112)', (f) => {
    const text = read(f);
    for (const re of [...STARE, ...OBIETNICE_PROBY]) expect({ f, re: String(re), found: re.test(text) }).toEqual({ f, re: String(re), found: false });
    expect(text).toMatch(/Basic stays free/);
  });

  it('store description uses the contract wording „Free Basic forever. Pro adds planning, starter care, more starters and recipes.”', () => {
    expect(read('docs/app-store-metadata-v2.md')).toContain('Free Basic forever. Pro adds planning, starter care, more starters and recipes.');
    for (const kod of ['en-US', 'en-GB', 'en-AU', 'en-CA']) {
      expect({ kod, opis: read(`docs/wydanie/metadane/${kod}.json`).includes('Free Basic forever. Pro adds planning, starter care, more starters and recipes.') }).toEqual({ kod, opis: true });
    }
  });

  it('metadata lists exactly the product identifiers from the configuration module', () => {
    const text = read('docs/app-store-metadata-v2.md');
    for (const id of Object.values(PRODUKTY)) expect(text).toContain(id);
    expect(text.match(/com\.apps4brew\.baker\.[\w.]+/g)?.filter((x) => !Object.values(PRODUKTY).includes(x) && x !== 'com.apps4brew.baker')).toEqual([]);
  });

  // Przepisane z kontraktu D-038 („Start Free Trial”) [M3 P-a]: bez próby (D-112) notatki prowadzą recenzenta do ekranu Pro
  // przez funkcję Pro i przycisk zakupu planu w piaskownicy
  it('App Review notes tell the reviewer how to reach Pro in the sandbox, without a free trial (D-112)', () => {
    const text = read('docs/app-store-metadata-v2.md');
    const notatki = text.split(/^### /m).find((s) => /^4\.3\. .*Review Notes/.test(s)) ?? '';
    // Notatki po angielsku, przycisk jak w interfejsie EN [M1-audytor-generalny-078]; nazwa z §11e 127 [M1-audytor-generalny-127]
    expect(notatki).toMatch(/Buy Yearly Plan/);
    expect(notatki).toMatch(/sandbox/i);
    expect(notatki).not.toMatch(/Start Free Trial/);
  });

  it('scope contract no longer promises the 7-day / 3-loaf local trial', () => {
    expect(read('docs/scope-contract.md')).not.toMatch(/7-dniowy \/ 3-bochenkowy/);
  });
});
