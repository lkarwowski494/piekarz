#!/usr/bin/env node
// Bramka TestFlight: zielony iOS E2E na tym samym SHA (M1-audytor-generalny-068; 07-jakosc-004; DEC-18 → D-286 a).
// Wejście: SHA kandydata i odpowiedź API `actions/workflows/e2e-ios.yml/runs` (JSON z workflow_runs).
// Reguła:
//  1. Brane są tylko zakończone przebiegi (status completed) na SHA, który jest kandydatem albo jego przodkiem,
//     i tylko gdy różnica przodek..kandydat dotyka wyłącznie ścieżek spoza buildu z listy POZA_BUILDEM
//     (wyjątek D-276 jako reguła). Lista dozwolonych, nie filtr `paths` e2e-ios.yml: filtr pomijał pliki w buildzie
//     (languages/, assets/, konfiguracja budowania) — przegląd ścieżki wrażliwej 068, D-316. Nowy katalog → nowe E2E.
//  2. Decyduje najbliższy taki SHA (najmniej commitów do kandydata): kod 0, gdy ma choć jeden przebieg
//     zakończony sukcesem (jedno ponowienie po awarii maszyny, D-131); inaczej kod 1.
//  3. Brak takiego SHA → kod 1 (bramka pada głośno, nie zgaduje).
// Użycie: node scripts/ci/e2e-na-sha.mjs --sha <sha> --przebiegi <plik.json>
import { readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const arg = (n, d) => (args.indexOf(n) >= 0 ? args[args.indexOf(n) + 1] : d);
const sha = arg('--sha');
const plikPrzebiegow = arg('--przebiegi');

function blad(tekst) {
  console.log(`::error::Bramka E2E (D-286): ${tekst}`);
  process.exit(1);
}

if (!sha || !/^[0-9a-f]{40}$/.test(sha) || !plikPrzebiegow) blad('użycie: --sha <40 znaków hex> --przebiegi <plik.json>');

/** Ścieżki, które nie trafiają do buildu ani nie zmieniają sposobu budowania (D-316). Wszystko inne wymaga E2E. */
const POZA_BUILDEM_KATALOGI = ['docs/', 'audit/', 'tests/', 'site/'];
const WORKFLOWY_BUILDU = ['.github/workflows/e2e-ios.yml', '.github/workflows/testflight.yml'];
const pozaBuildem = (p) =>
  POZA_BUILDEM_KATALOGI.some((k) => p.startsWith(k)) ||
  /^[^/]+\.md$/.test(p) ||
  (p.startsWith('.github/workflows/') && !WORKFLOWY_BUILDU.includes(p));
const dane = JSON.parse(readFileSync(plikPrzebiegow, 'utf8'));
const przebiegi = (dane.workflow_runs ?? []).filter((p) => p.status === 'completed' && /^[0-9a-f]{40}$/.test(p.head_sha ?? ''));

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const gitOk = (...a) => spawnSync('git', a, { stdio: 'ignore' }).status === 0;

/** Odległość w commitach od przodka do kandydata albo null, gdy SHA nie jest przodkiem lub różnica dotyka filtra E2E. */
function odleglosc(s) {
  if (s === sha) return 0;
  if (!gitOk('cat-file', '-e', `${s}^{commit}`) || !gitOk('merge-base', '--is-ancestor', s, sha)) return null;
  const zmienione = git('diff', '--no-renames', '--name-only', s, sha).split('\n').filter(Boolean);
  const wFiltrze = zmienione.filter((p) => !pozaBuildem(p));
  if (wFiltrze.length) {
    odrzucone.push(`${s.slice(0, 8)} (${wFiltrze.slice(0, 2).join(', ')}${wFiltrze.length > 2 ? ', …' : ''})`);
    return null;
  }
  return Number(git('rev-list', '--count', `${s}..${sha}`));
}

const odrzucone = []; // przodkowie z przebiegiem, ale z różnicą w ścieżkach buildu
const wgSha = new Map();
for (const p of przebiegi) wgSha.set(p.head_sha, [...(wgSha.get(p.head_sha) ?? []), p]);
let najblizszy = null;
for (const s of wgSha.keys()) {
  const d = odleglosc(s);
  if (d !== null && (najblizszy === null || d < najblizszy.d)) najblizszy = { s, d };
}

if (!najblizszy) blad(`brak zakończonego przebiegu e2e-ios.yml dla ${sha} ani dla przodka różniącego się tylko poza buildem (${POZA_BUILDEM_KATALOGI.join(', ')}, *.md, workflowy poza ${WORKFLOWY_BUILDU.join(', ')}). Uruchom E2E na tym SHA.${odrzucone.length ? ` Przodkowie z przebiegiem, ale ze zmianą w ścieżkach buildu: ${odrzucone.length}, np. ${odrzucone.slice(0, 2).join('; ')}.` : ''}`);
const naSha = wgSha.get(najblizszy.s);
const zielony = naSha.find((p) => p.conclusion === 'success');
const opis = (p) => `#${p.run_number} (${p.conclusion})`;
if (!zielony) blad(`iOS E2E na ${najblizszy.s}${najblizszy.d ? ` (przodek ${sha}, ${najblizszy.d} commitów, różnica poza buildem)` : ''} nie jest zielony: ${naSha.map(opis).join(', ')}. Build TestFlight dopiero po zielonym E2E (D-286, D-131).`);
console.log(`OK: zielony iOS E2E #${zielony.run_number} na ${najblizszy.s}${najblizszy.d ? ` (przodek ${sha}, ${najblizszy.d} commitów, różnica tylko poza buildem: wyjątek D-276)` : ''}.`);
