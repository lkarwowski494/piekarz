/**
 * M1-audytor-generalny-110 (KO-015, D-331): „Tests across Timezones” (tests-tz.yml) czerwony 7/7 na 1c723632 i b7c77c37
 * (run 42765008836): jedyna porażka `tests/dziennik-wydan-tagi-079.test.ts` — „Expected: > 0, Received: 0” tagów
 * `v*-b*`, bo `actions/checkout` bez `fetch-depth: 0` pobiera jeden commit bez tagów, a test 079 w CI wymaga tagów.
 * Kontrakt (mechanizm, nie jeden plik): każdy job workflowu, który uruchamia pełny zestaw Jest (`npm test` albo
 * `npm run verify`), robi checkout z pełną historią i tagami (`fetch-depth: 0`). Dotyczy też bramki stref przed buildem
 * TestFlight (testflight.yml, job tz-matrix), która uruchamia ten sam zestaw.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const katalog = join(__dirname, '..', '.github', 'workflows');
const workflowy = readdirSync(katalog).filter((f) => /\.ya?ml$/.test(f));

/** Joby workflowu: [nazwa, treść] (klucze na wcięciu 2 pod `jobs:`). */
function joby(tekst: string): [string, string][] {
  const i = tekst.indexOf('\njobs:\n');
  if (i < 0) return [];
  return tekst
    .slice(i + 7)
    .split(/\n(?= {2}[\w-]+:\s*\n)/)
    .map((b): [string, string] => [/^ {2}([\w-]+):/.exec(b)?.[1] ?? '?', b])
    .filter(([n]) => n !== '?');
}

/** Krok checkout w jobie (od `actions/checkout` do następnego kroku). */
function checkout(job: string): string {
  const i = job.indexOf('actions/checkout@');
  if (i < 0) return '';
  const j = job.indexOf('\n      - ', i);
  return job.slice(i, j < 0 ? undefined : j);
}

const zPelnymJest = workflowy.flatMap((f) => {
  const tekst = readFileSync(join(katalog, f), 'utf8').replace(/\r\n/g, '\n');
  return joby(tekst)
    .filter(([, b]) => /\bnpm test\b|\bnpm run verify\b/.test(b))
    .map(([n, b]): [string, string] => [`${f}#${n}`, b]);
});

describe('110: joby z pełnym Jest mają checkout z pełną historią i tagami (test 079)', () => {
  it('znaleziono joby z pełnym Jest (w tym tests-tz.yml i bramkę stref TestFlight)', () => {
    const nazwy = zPelnymJest.map(([n]) => n);
    expect(nazwy).toEqual(expect.arrayContaining(['tests-tz.yml#test-tz', 'testflight.yml#tz-matrix', 'ci.yml#verify']));
  });

  it.each(zPelnymJest)('%s: actions/checkout z fetch-depth: 0', (_n, job) => {
    const krok = checkout(job);
    expect(krok).not.toBe('');
    expect(krok).toMatch(/\n\s+fetch-depth:\s*0\s*(\n|$)/);
  });
});
