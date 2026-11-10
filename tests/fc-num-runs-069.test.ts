/**
 * Nightly z FC_NUM_RUNS=1000 uruchamia każdą własność co najmniej 1000 razy, także gdy test ma lokalne numRuns
 * [M1-audytor-generalny-069; 07-jakosc-005]. Pomocnik nr() i wszystkie testy własnościowe go używają.
 */
import fs from 'fs';
import path from 'path';
import fc from 'fast-check';
import { nr } from './helpers/fc-runs';

const { resolveFastCheckConfig } = require('./helpers/fc-config') as { resolveFastCheckConfig: (env: Record<string, string | undefined>) => fc.Parameters<unknown> };

describe('069: FC_NUM_RUNS działa przy lokalnym numRuns', () => {
  const przed = fc.readConfigureGlobal();
  afterEach(() => fc.configureGlobal(przed));
  it('przy FC_NUM_RUNS=1000 własność z lokalnym nr(100) biegnie ≥ 1000 razy', () => {
    fc.configureGlobal({ ...przed, ...resolveFastCheckConfig({ PROP_SEED: '1', FC_NUM_RUNS: '1000' }) });
    let ile = 0;
    fc.assert(fc.property(fc.integer(), () => { ile++; }), { numRuns: nr(100) });
    expect(ile).toBeGreaterThanOrEqual(1000);
  });
  it('bez FC_NUM_RUNS lokalna liczba zostaje', () => {
    fc.configureGlobal({ seed: 1 });
    expect(nr(100)).toBe(100);
  });
  it('żaden test nie ma gołego „numRuns: <liczba>” (bez nr)', () => {
    const zle: string[] = [];
    const chodz = (kat: string) => {
      for (const e of fs.readdirSync(kat, { withFileTypes: true })) {
        const p = path.join(kat, e.name);
        if (e.isDirectory() && e.name !== 'node_modules') chodz(p);
        else if (/\.test\.tsx?$/.test(e.name) && /numRuns:\s*\d/.test(fs.readFileSync(p, 'utf8'))) zle.push(p);
      }
    };
    chodz(path.join(__dirname, '..', 'src'));
    chodz(__dirname);
    expect(zle).toEqual([]);
  });
});
