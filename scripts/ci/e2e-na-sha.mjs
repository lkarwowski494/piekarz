#!/usr/bin/env node
// Bramka TestFlight: zielony iOS E2E na tym samym SHA (M1-audytor-generalny-068; 07-jakosc-004; DEC-18 → D-286 a).
// Wejście: SHA kandydata i odpowiedź API `actions/workflows/e2e-ios.yml/runs` (JSON z workflow_runs).
// Reguła:
//  1. Brane są tylko zakończone przebiegi (status completed) na SHA, który jest kandydatem albo jego przodkiem,
//     i tylko gdy różnica przodek..kandydat nie dotyka żadnej ścieżki z filtra `on.push.paths` w e2e-ios.yml
//     (taka zmiana nie uruchamia E2E, więc wynik przodka obowiązuje: wyjątek D-276 jako reguła).
//  2. Decyduje najbliższy taki SHA (najmniej commitów do kandydata): kod 0, gdy ma choć jeden przebieg
//     zakończony sukcesem (jedno ponowienie po awarii maszyny, D-131); inaczej kod 1.
//  3. Brak takiego SHA → kod 1. Nieobsługiwany wzorzec w filtrze → kod 1 (bramka pada głośno, nie zgaduje).
// Użycie: node scripts/ci/e2e-na-sha.mjs --sha <sha> --przebiegi <plik.json> [--workflow .github/workflows/e2e-ios.yml]
import { readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const arg = (n, d) => (args.indexOf(n) >= 0 ? args[args.indexOf(n) + 1] : d);
const sha = arg('--sha');
const plikPrzebiegow = arg('--przebiegi');
const plikWorkflow = arg('--workflow', '.github/workflows/e2e-ios.yml');

function blad(tekst) {
  console.log(`::error::Bramka E2E (D-286): ${tekst}`);
  process.exit(1);
}

if (!sha || !/^[0-9a-f]{40}$/.test(sha) || !plikPrzebiegow) blad('użycie: --sha <40 znaków hex> --przebiegi <plik.json>');

/** Wzorce z `on.push.paths` workflowu E2E (jedyne źródło listy). */
function wzorceE2e(tekst) {
  const m = /\n {2}push:\n(?: {4}[^\n]*\n)*? {4}paths:\n((?: {6}- [^\n]+\n)+)/.exec(tekst.replace(/\r\n/g, '\n'));
  if (!m) blad(`brak listy on.push.paths w ${plikWorkflow}`);
  const wzorce = m[1].split('\n').filter(Boolean).map((l) => l.replace(/^ {6}- /, '').trim().replace(/^['"]|['"]$/g, ''));
  for (const w of wzorce) {
    const katalog = w.endsWith('/**') ? w.slice(0, -3) : w;
    if (katalog.includes('*') || katalog.startsWith('!')) blad(`nieobsługiwany wzorzec w filtrze paths: ${w}`);
  }
  return wzorce;
}

const pasuje = (plik, w) => (w.endsWith('/**') ? plik.startsWith(w.slice(0, -2)) : plik === w);

const wzorce = wzorceE2e(readFileSync(plikWorkflow, 'utf8'));
const dane = JSON.parse(readFileSync(plikPrzebiegow, 'utf8'));
const przebiegi = (dane.workflow_runs ?? []).filter((p) => p.status === 'completed' && /^[0-9a-f]{40}$/.test(p.head_sha ?? ''));

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const gitOk = (...a) => spawnSync('git', a, { stdio: 'ignore' }).status === 0;

/** Odległość w commitach od przodka do kandydata albo null, gdy SHA nie jest przodkiem lub różnica dotyka filtra E2E. */
function odleglosc(s) {
  if (s === sha) return 0;
  if (!gitOk('cat-file', '-e', `${s}^{commit}`) || !gitOk('merge-base', '--is-ancestor', s, sha)) return null;
  const zmienione = git('diff', '--no-renames', '--name-only', s, sha).split('\n').filter(Boolean);
  const wFiltrze = zmienione.filter((p) => wzorce.some((w) => pasuje(p, w)));
  if (wFiltrze.length) {
    odrzucone.push(`${s.slice(0, 8)} (${wFiltrze.slice(0, 2).join(', ')}${wFiltrze.length > 2 ? ', …' : ''})`);
    return null;
  }
  return Number(git('rev-list', '--count', `${s}..${sha}`));
}

const odrzucone = []; // zieloni lub czerwoni przodkowie z różnicą w ścieżkach E2E
const wgSha = new Map();
for (const p of przebiegi) wgSha.set(p.head_sha, [...(wgSha.get(p.head_sha) ?? []), p]);
let najblizszy = null;
for (const s of wgSha.keys()) {
  const d = odleglosc(s);
  if (d !== null && (najblizszy === null || d < najblizszy.d)) najblizszy = { s, d };
}

if (!najblizszy) blad(`brak zakończonego przebiegu e2e-ios.yml dla ${sha} ani dla przodka różniącego się tylko poza ścieżkami E2E (${wzorce.join(', ')}). Uruchom E2E na tym SHA.${odrzucone.length ? ` Przodkowie z przebiegiem, ale ze zmianą w ścieżkach E2E: ${odrzucone.length}, np. ${odrzucone.slice(0, 2).join('; ')}.` : ''}`);
const naSha = wgSha.get(najblizszy.s);
const zielony = naSha.find((p) => p.conclusion === 'success');
const opis = (p) => `#${p.run_number} (${p.conclusion})`;
if (!zielony) blad(`iOS E2E na ${najblizszy.s}${najblizszy.d ? ` (przodek ${sha}, ${najblizszy.d} commitów, różnica poza ścieżkami E2E)` : ''} nie jest zielony: ${naSha.map(opis).join(', ')}. Build TestFlight dopiero po zielonym E2E (D-286, D-131).`);
console.log(`OK: zielony iOS E2E #${zielony.run_number} na ${najblizszy.s}${najblizszy.d ? ` (przodek ${sha}, ${najblizszy.d} commitów, różnica tylko poza ścieżkami E2E: wyjątek D-276)` : ''}.`);
