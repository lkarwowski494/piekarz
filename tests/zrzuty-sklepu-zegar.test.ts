// ============================================================================
// Piekarz — zegar maszyny w zrzutach sklepu (KO-049 A1, D-385).
// Zrzuty #4: godziny w scenach z zegara CI („do 20:44”, „Dziś 19:38”, „jutro 07:38”) przeczyły paskowi 9:41, a „podwoił
// objętość” stał minutę po dokarmieniu. Symulator bierze czas z maszyny, więc skrypt ustawia zegar runnera: dokarmienie 03:35,
// podwojenie i wypiek 09:35 (osobny scenariusz, bo skok czasu tylko między scenariuszami), każda scena 09:41; dni zawsze
// przyszłe (lokalizacja n = dziś + n dni), żeby skoki szły do przodu; na końcu przywrócenie (trap). Bez sudo: jak dotąd.
// Test uruchamia skrypt z atrapami xcrun, maestro, sips i sudo (zapis wywołań do dziennika), bez zmiany zegara.
// ============================================================================

import { chmodSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const SKRYPT = join(__dirname, '..', 'scripts', 'ci', 'zrzuty-sklepu.sh');

function uruchom(sudoDziala: boolean, sceny: string) {
  const dir = mkdtempSync(join(tmpdir(), 'zegar-'));
  const bin = join(dir, 'bin');
  mkdirSync(bin);
  const dziennik = join(dir, 'wywolania.txt');
  const atrapa = (nazwa: string, cialo: string) => {
    writeFileSync(join(bin, nazwa), `#!/usr/bin/env bash\n${cialo}\n`);
    chmodSync(join(bin, nazwa), 0o755);
  };
  atrapa('maestro', `for a in "$@"; do case "$a" in *.yaml) echo "maestro $(basename "$a" .yaml)" >> "${dziennik}";; esac; done; exit 0`);
  atrapa('xcrun', `if [ "$2" = io ]; then printf x > "\${@: -1}"; fi; exit 0`);
  atrapa('sips', `echo "  pixelWidth: 1"; echo "  pixelHeight: 1"`);
  atrapa('sudo', sudoDziala ? `echo "sudo $*" >> "${dziennik}"; exit 0` : 'exit 1');
  const r = spawnSync('bash', [SKRYPT, 'UDID', 'iphone-6.3', join(dir, 'out'), join(dir, 'logi'), join(dir, 'app'), 'pl:pl:pl_PL en-US:en-US:en_US'], {
    encoding: 'utf8',
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, ZRZUTY_SCENY: sceny, GITHUB_STEP_SUMMARY: '', ZRZUTY_PAUZA: '0' },
  });
  let wywolania: string[] = [];
  try { wywolania = readFileSync(dziennik, 'utf8').trim().split('\n'); } catch { wywolania = []; }
  return { kod: r.status, wyjscie: r.stdout + r.stderr, wywolania };
}

// Argument `date` w macOS (BSD z Apple) i GNU: [[[mm]dd]HH]MM[[cc]yy] — miesiąc i dzień, godzina, rok na końcu (recenzja
// niezależna, P1: wcześniej ccyymmddHHMM, odrzucany jako zły format). Funkcja zwraca mmdd i ccyy dnia dziś + n.
const dzien = (n: number) => {
  const d = new Date(Date.now() + n * 86400000);
  return { md: `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`, r: String(d.getFullYear()) };
};
const ustaw = (n: number, ggmm: string) => `sudo -n date ${dzien(n).md}${ggmm}${dzien(n).r}`;

jest.setTimeout(30000);

describe('zrzuty sklepu: zegar maszyny zgodny z paskiem 9:41 (KO-049, D-385)', () => {
  it('kolejność: NTP wyłączone, 03:35 dokarmienie, 09:35 podwojenie i wypiek, 09:41 przed każdą sceną; dni przyszłe; przywrócenie na końcu', () => {
    const { kod, wywolania } = uruchom(true, '05-zakwasy 07-offline');
    expect(kod).toBe(0);
    expect(wywolania).toEqual([
      'sudo -n systemsetup -setusingnetworktime off',
      'maestro 00-zgoda',
      ustaw(1, '0335'), 'maestro 00-przygotuj',
      ustaw(1, '0935'), 'maestro 00-przygotuj-podwojenie',
      ustaw(1, '0941'), 'maestro 05-zakwasy',
      ustaw(1, '0941'), 'maestro 07-offline',
      ustaw(2, '0335'), 'maestro 00-przygotuj',
      ustaw(2, '0935'), 'maestro 00-przygotuj-podwojenie',
      ustaw(2, '0941'), 'maestro 05-zakwasy',
      ustaw(2, '0941'), 'maestro 07-offline',
      'sudo -n systemsetup -setusingnetworktime on',
      'sudo -n sntp -sS time.apple.com',
    ]);
  });

  it('bez sudo: ostrzeżenie, sceny idą jak dotąd na zegarze maszyny (bez przerwania przebiegu)', () => {
    const { kod, wyjscie, wywolania } = uruchom(false, '05-zakwasy');
    expect(kod).toBe(0);
    expect(wyjscie).toMatch(/::warning::.*zegar/);
    expect(wywolania).toEqual(['maestro 00-zgoda', 'maestro 00-przygotuj', 'maestro 00-przygotuj-podwojenie', 'maestro 05-zakwasy',
      'maestro 00-przygotuj', 'maestro 00-przygotuj-podwojenie', 'maestro 05-zakwasy']);
  });

  // Recenzja niezależna, P1: dzień liczony od bieżącego zegara narastał (po lokalizacji 1 zegar jest już jutro) — dziś + 1, + 3, + 6…
  it('dzień lokalizacji liczony od znacznika startu skryptu (sprzed zmiany zegara), nie od bieżącego zegara', () => {
    const skrypt = readFileSync(SKRYPT, 'utf8');
    const start = skrypt.indexOf('START_ZEGARA=');
    expect(start).toBeGreaterThan(-1);
    expect(start).toBeLessThan(skrypt.indexOf('systemsetup -setusingnetworktime off'));
    const funkcja = skrypt.split('dzien_za() {')[1]?.split('\n')[0] ?? '';
    expect(funkcja).toContain('START_ZEGARA');
    expect(funkcja).not.toMatch(/-v\+|\+\$1 day/);
  });
});
