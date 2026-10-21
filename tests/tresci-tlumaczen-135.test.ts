/**
 * 135 (część bez przeglądu człowieka): treść krytyczna karty zakwasu w każdym z 33 języków przekładu przechodzi
 * kontrolę mechaniczną roli 06 z `--przed-przegladem` — jedno zdanie = jeden znacznik twierdzenia, jak w PL,
 * bez znacznika mieszanego `[T:ID,-]`. Przegląd człowieka per język (pole `przeglad` ze `sha`) zostaje krokiem
 * właściciela (DEC-06) [M1-audytor-generalny-135; 06-tresci-501].
 */
import { spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getAllSupportedLocaleCodes } from '../src/lib/i18n-locales';

const ROOT = join(__dirname, '..');
/**
 * Wyjątek nazwany: w ja, ko i zh-Hant przekład sekcji wynik.hooch.actionPl nie dzieli się na tyle zdań, ile ma PL
 * (ja, zh-Hant: zdania bez spacji po „。”, a test karty łączy linie spacją; ko: pierwsze zdanie PL przełożone jako dwa),
 * więc automat nie przypisze znaczników bez ryzyka złego dopasowania. Do rozstrzygnięcia przez rolę 06 z człowiekiem
 * znającym język (przegląd DEC-06). Test pada, gdy błąd zniknie albo się zmieni — wtedy usuń język z listy.
 */
const WYJATKI: Record<string, string[]> = {
  ja: ['nieznane twierdzenie -'],
  ko: ['nieznane twierdzenie -'],
  'zh-Hant': ['nieznane twierdzenie -'],
};
const JEZYKI = getAllSupportedLocaleCodes().filter((k) => k !== 'pl' && k !== 'en');

function kontrola(kod: string) {
  const plik = join('docs', 'tresci', kod, 'zakwas-bezpieczenstwo.md');
  expect(existsSync(join(ROOT, plik))).toBe(true);
  const r = spawnSync(process.execPath, ['scripts/kontrole-tresci.mjs', 'docs/tresci/rejestr.json', plik, '--przed-przegladem'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  const bledy = (r.stdout || '').split('\n').filter((l) => l.startsWith('BŁĄD')).map((l) => l.replace(/^BŁĄD \S+:\d+: /, ''));
  return { bledy, status: r.status };
}

describe('135: znaczniki zdań treści krytycznej w 33 językach', () => {
  it.each(JEZYKI.filter((k) => !WYJATKI[k]))('%s: kontrole-tresci --przed-przegladem kod 0', (kod) => {
    const { bledy, status } = kontrola(kod);
    expect(bledy).toEqual([]);
    expect(status).toBe(0);
  });

  it.each(Object.keys(WYJATKI))('%s (wyjątek nazwany): tylko znany błąd znacznika mieszanego', (kod) => {
    expect(kontrola(kod).bledy).toEqual(WYJATKI[kod]);
  });

  it.each(JEZYKI.filter((k) => !WYJATKI[k]))('%s: bez znacznika mieszanego [T:ID,-]', (kod) => {
    const t = readFileSync(join(ROOT, 'docs', 'tresci', kod, 'zakwas-bezpieczenstwo.md'), 'utf8');
    expect(t).not.toMatch(/\[T:[^\]]*,-\]|\[T:-,[^\]]*\]/);
  });
});
