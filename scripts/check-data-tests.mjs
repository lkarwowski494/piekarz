#!/usr/bin/env node
// Reguła „zmiana src/data wymaga zmiany testu” (M1-audytor-generalny-063; 08-programista-017;
// decyzja właściciela 2026-10-20 „Tak, w CI”). Bez zależności.
// Użycie: node scripts/check-data-tests.mjs --base <sha>
//   Zakres: commity od wspólnego przodka <sha> i HEAD do HEAD (git diff <sha>...HEAD).
//   W CI: na PR github.event.pull_request.base.sha, na push github.event.before.
// Kod 1: zmienił się plik src/data/**/*.ts poza __tests__, a żaden plik w src/data/__tests__/ ani tests/.
// Kod 0: reguła spełniona albo pominięta (brak bazy, same zera przy pierwszym pushu, baza spoza historii).
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const i = args.indexOf('--base');
const base = i >= 0 ? (args[i + 1] ?? '').trim() : '';

function pomin(powod) {
  console.log(`check-data-tests: pomijam (${powod})`);
  process.exit(0);
}

if (!base) pomin('brak --base');
if (/^0+$/.test(base)) pomin('baza z samych zer: pierwszy push gałęzi');

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
try {
  git('cat-file', '-e', `${base}^{commit}`);
} catch {
  pomin(`commit bazowy ${base} poza pobraną historią (np. po force-push)`);
}

const zmienione = git('diff', '--name-only', `${base}...HEAD`)
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

const dane = zmienione.filter((f) => /^src\/data\/.+\.ts$/.test(f) && !f.split('/').includes('__tests__'));
const testy = zmienione.filter((f) => f.startsWith('src/data/__tests__/') || f.startsWith('tests/'));

if (dane.length && !testy.length) {
  console.error('check-data-tests: zmiana src/data bez zmiany testu (src/data/__tests__/ albo tests/):');
  for (const f of dane) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`check-data-tests: ${dane.length} plików src/data, ${testy.length} plików testów — w porządku`);
