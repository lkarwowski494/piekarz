/**
 * M2-p4-N10 (KO-011, D-330): iOS E2E #103 (run 42725323063) nie uruchomił w pl_PL żadnego przepływu, bo zimny start
 * sterownika XCUITest przekroczył limit 480 s („iOS driver not ready in time”); ta sama awaria 2026-11-02
 * (docs/noc-2026-11-02/dowody/e2e-41536995568.txt). Diagnoza: audit/M1-2026-11-08/role/07-jakosc/fix-2026-11-09/
 * diagnoza-e2e-103.md (gałąź audit-m1/piekarz-2026-11-08 @ 78d2e8c9).
 * Kontrakt:
 *  1. Krok pl_PL ponawia Maestro najwyżej raz i wyłącznie, gdy wyjście ma komunikat startu sterownika i nie ma
 *     żadnego wyniku przepływu; każda inna porażka (także porażka przepływu) zostaje czerwona. Wyrocznia: zachowanie
 *     skryptu z atrapą `maestro` na PATH, nie tekst workflow.
 *  2. Limit startu sterownika jest w jednym miejscu (env workflow) i mieści się w decyzji właściciela 600–900 s,
 *     z zapasem ≥ 20% nad najdłuższym zmierzonym startem (#103: serwer sterownika wstał po ok. 510 s).
 */
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = join(__dirname, '..');
const skrypt = join(root, 'scripts', 'ci', 'ponow-start-sterownika.sh');
const workflow = readFileSync(join(root, '.github', 'workflows', 'e2e-ios.yml'), 'utf8').replace(/\r\n/g, '\n');
/** Blok kroku od „- name: <nazwa>” do następnego kroku. */
const krok = (nazwa: string) => {
  const i = workflow.indexOf(`- name: ${nazwa}`);
  if (i < 0) return '';
  const j = workflow.indexOf('\n      - name:', i + 5);
  return workflow.slice(i, j < 0 ? undefined : j);
};

// Komunikat Maestro 2.11.0 z joba #103 (diagnoza, job103.log:2140)
const TIMEOUT_STEROWNIKA =
  'iOS driver not ready in time, consider increasing timeout by configuring MAESTRO_DRIVER_STARTUP_TIMEOUT env variable';
// Format wyników przepływów z logu E2E (2026-11-08, np. „[Passed] 03-prowadzenie-widok-skupiony (1m 8s)”)
const ZALICZONY = '[Passed] 01-pierwsze-uruchomienie (23s)';
const NIEZALICZONY = '[Failed] 05-dwa-wypieki (37s) (Assertion is false: id: next-or-finish-step-btn is visible)';

type Proba = { kod: number; tekst: string };
type Wynik = { kod: number | null; wywolania: number; argumenty: string[]; logi: string[] };

const katalogi: string[] = [];
afterAll(() => katalogi.forEach((d) => rmSync(d, { recursive: true, force: true })));

/** Uruchamia skrypt z atrapą `maestro`: n-te wywołanie wypisuje proby[n-1].tekst i kończy się jej kodem. */
function uruchom(proby: Proba[]): Wynik {
  const dir = mkdtempSync(join(tmpdir(), 'n10-'));
  katalogi.push(dir);
  const bin = join(dir, 'bin');
  const logi = join(dir, 'logi');
  spawnSync('mkdir', ['-p', bin, logi]);
  writeFileSync(join(dir, 'licznik'), '0');
  proby.forEach((p, i) => {
    writeFileSync(join(dir, `tekst-${i + 1}`), `${p.tekst}\n`);
    writeFileSync(join(dir, `kod-${i + 1}`), String(p.kod));
  });
  const atrapa = [
    '#!/usr/bin/env bash',
    `D='${dir}'`,
    'n=$(( $(cat "$D/licznik") + 1 )); echo "$n" > "$D/licznik"',
    'echo "$*" >> "$D/argumenty"',
    '[ -f "$D/tekst-$n" ] || { echo "atrapa: nieoczekiwane wywołanie $n"; exit 97; }',
    'cat "$D/tekst-$n"',
    'exit "$(cat "$D/kod-$n")"',
  ].join('\n');
  writeFileSync(join(bin, 'maestro'), `${atrapa}\n`);
  chmodSync(join(bin, 'maestro'), 0o755);
  const r = spawnSync(
    'bash',
    [skrypt, 'maestro', '--device', 'UDID-TEST', 'test', '.maestro/e2e', '-e', 'JEZYK=pl', '--output', 'pl.xml'],
    { env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, E2E_LOG_DIR: logi }, encoding: 'utf8' },
  );
  const argumenty = existsSync(join(dir, 'argumenty'))
    ? readFileSync(join(dir, 'argumenty'), 'utf8').trim().split('\n')
    : [];
  return {
    kod: r.status,
    wywolania: Number(readFileSync(join(dir, 'licznik'), 'utf8')),
    argumenty,
    logi: readdirSync(logi).sort(),
  };
}

describe('M2-p4-N10: ponowienie Maestro tylko po porażce startu sterownika (KO-011, D-330)', () => {
  it('skrypt ponowienia istnieje', () => {
    expect(existsSync(skrypt)).toBe(true);
  });

  it('sukces za pierwszym razem: jedno wywołanie, kod 0', () => {
    const w = uruchom([{ kod: 0, tekst: ZALICZONY }]);
    expect([w.kod, w.wywolania]).toEqual([0, 1]);
  });

  it('timeout sterownika bez wyników przepływów, potem sukces: dwa wywołania z tymi samymi argumentami, kod 0', () => {
    const w = uruchom([
      { kod: 1, tekst: `Running on iPhone\n${TIMEOUT_STEROWNIKA}` },
      { kod: 0, tekst: ZALICZONY },
    ]);
    expect([w.kod, w.wywolania]).toEqual([0, 2]);
    expect(w.argumenty[0]).toBe('--device UDID-TEST test .maestro/e2e -e JEZYK=pl --output pl.xml');
    expect(w.argumenty[1]).toBe(w.argumenty[0]);
    expect(w.logi.length).toBe(2); // wyjście obu prób zostaje w artefakcie
  });

  it('dwa razy timeout sterownika: najwyżej jedno ponowienie, wynik czerwony', () => {
    const w = uruchom([
      { kod: 1, tekst: TIMEOUT_STEROWNIKA },
      { kod: 1, tekst: TIMEOUT_STEROWNIKA },
    ]);
    expect(w.wywolania).toBe(2);
    expect(w.kod).not.toBe(0);
  });

  it('ponowienie, które pada na przepływie: wynik czerwony z drugiej próby', () => {
    const w = uruchom([
      { kod: 1, tekst: TIMEOUT_STEROWNIKA },
      { kod: 1, tekst: NIEZALICZONY },
    ]);
    expect(w.wywolania).toBe(2);
    expect(w.kod).not.toBe(0);
  });

  it.each([
    ['porażka przepływu', NIEZALICZONY],
    ['timeout sterownika po wyniku przepływu [Passed]', `${ZALICZONY}\n${TIMEOUT_STEROWNIKA}`],
    ['timeout sterownika po wyniku przepływu [Failed]', `${NIEZALICZONY}\n${TIMEOUT_STEROWNIKA}`],
    ['inny błąd startu (bez komunikatu sterownika)', 'Unable to launch app com.apps4brew.baker'],
  ])('%s: bez ponowienia, wynik czerwony', (_opis, tekst) => {
    const w = uruchom([{ kod: 1, tekst }]);
    expect(w.wywolania).toBe(1);
    expect(w.kod).not.toBe(0);
  });

  it('kod porażki Maestro przechodzi bez zmian (bez ponowienia)', () => {
    const w = uruchom([{ kod: 3, tekst: NIEZALICZONY }]);
    expect([w.kod, w.wywolania]).toEqual([3, 1]);
  });

  it('krok pl_PL uruchamia Maestro przez skrypt ponowienia; pozostałe przebiegi bez ponowień', () => {
    const pl = krok('Run E2E flows (.maestro/e2e, pl_PL)');
    expect(pl).toMatch(
      /bash scripts\/ci\/ponow-start-sterownika\.sh maestro --device "\$UDID" test \.maestro\/e2e -e JEZYK=pl /,
    );
    expect(pl).not.toMatch(/continue-on-error|\|\|\s*true|\|\|\s*maestro/);
    const reszta = workflow.replace(pl, '');
    expect(reszta).not.toMatch(/ponow-start-sterownika/);
  });

  it('limit startu sterownika: jedno miejsce (env workflow), 600–900 s, zapas ≥ 20% nad zmierzonym 510 s', () => {
    const wpisy = [...workflow.matchAll(/MAESTRO_DRIVER_STARTUP_TIMEOUT:\s*["']?(\d+)["']?/g)];
    expect(wpisy.length).toBe(1);
    const ms = Number(wpisy[0][1]);
    expect(ms).toBeGreaterThanOrEqual(600000); // KO-011: 600–900 s
    expect(ms).toBeLessThanOrEqual(900000);
    expect(ms).toBeGreaterThanOrEqual(510000 * 1.2); // #103: 00:35:49 → serwer 00:44:19
    // Skrypt nie nadpisuje limitu (jedno miejsce)
    expect(readFileSync(skrypt, 'utf8')).not.toMatch(/MAESTRO_DRIVER_STARTUP_TIMEOUT/);
  });
});
