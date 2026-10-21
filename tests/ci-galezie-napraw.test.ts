/**
 * M1-audytor-generalny-168 (07-jakosc-506): kandydat z gałęzi napraw nie przechodził CI,
 * bo ci.yml i macierz stref uruchamiały się przy pushu tylko na master/main. Na czas
 * napraw (wybór 168 b właściciela) push na `naprawy/**` uruchamia oba workflowy.
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const wf = (n: string) => fs.readFileSync(path.join(root, '.github', 'workflows', n), 'utf8').replace(/\r\n/g, '\n');

/** Lista gałęzi z `on: push: branches: [...]` (zapis w jednej linii, jak w repo). */
const galeziePush = (t: string) => {
  const push = /\n {2}push:\n {4}branches: \[([^\]]*)\]/.exec(t)?.[1] ?? '';
  return push.split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
};

describe('CI i macierz stref na gałęziach napraw (168)', () => {
  it.each(['ci.yml', 'tests-tz.yml'])('%s: push na master, main i naprawy/**', (n) => {
    expect(galeziePush(wf(n))).toEqual(expect.arrayContaining(['master', 'main', 'naprawy/**']));
  });

  it('pierwszy push nowej gałęzi (github.event.before = same zera) nie wywraca kontroli src/data', () => {
    const skrypt = fs.readFileSync(path.join(root, 'scripts', 'check-data-tests.mjs'), 'utf8');
    expect(skrypt).toMatch(/\^0\+\$/);
    expect(wf('ci.yml')).toMatch(/BASE_SHA: \$\{\{ github\.event\.pull_request\.base\.sha \|\| github\.event\.before \}\}/);
  });
});
