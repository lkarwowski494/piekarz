/**
 * Z-08-1 (FOR-15, D-290 pkt 10, D-291 pkt 2): dane ekranu „Licencje open source”.
 * Lista pakietów w assets/licencje.generated.json = zależności produkcyjne z package-lock.json (bez devDependencies,
 * bez lightningcss — narzędzie budowania, D-290 pkt 7); plik generuje scripts/licencje.mjs, a `--check` (też w tym
 * teście) pada, gdy plik nie zgadza się z package-lock.json / node_modules. Biblioteki natywne spoza npm:
 * scripts/licencje-natywne.json, wersje porównane z podspec React Native; czcionka Sofia Sans (OFL-1.1) z pliku
 * assets/fonts/OFL-sofiasanssemicondensed.txt. Dane są poza plikami .ts (limit 20 480 B, CLAUDE.md §1.2).
 */
import { execFileSync } from 'child_process';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { wczytajLicencje, type DaneLicencji } from '../src/lib/licencje';

const root = join(__dirname, '..');
const RN = join(root, 'node_modules/react-native');
const czytaj = (p: string): unknown => JSON.parse(readFileSync(join(root, p), 'utf8'));

interface Lock { packages: Record<string, { version?: string; dev?: boolean }> }
const lock = czytaj('package-lock.json') as Lock;
const pkg = czytaj('package.json') as { dependencies: Record<string, string>; devDependencies: Record<string, string> };

function dane(): DaneLicencji {
  const w = wczytajLicencje(czytaj('assets/licencje.generated.json'));
  if (!w.ok) throw new Error(`assets/licencje.generated.json: ${w.blad}`);
  return w.wartosc;
}
const nazwaZKlucza = (k: string) => k.slice(k.lastIndexOf('node_modules/') + 'node_modules/'.length);

describe('Z-08-1: dane licencji open source (assets/licencje.generated.json)', () => {
  test('plik zgadza się z package-lock.json i node_modules (scripts/licencje.mjs --check, kod 0)', () => {
    const wynik = execFileSync(process.execPath, ['scripts/licencje.mjs', '--check'], { cwd: root, encoding: 'utf8' });
    expect(wynik).toMatch(/licencje: OK/);
  });

  test('lista = zależności produkcyjne: każda bezpośrednia zależność z package.json jest, żadna z wpisów „dev” w package-lock nie', () => {
    const { pakiety } = dane();
    const nazwy = new Set(pakiety.map((p) => p.nazwa));
    for (const d of Object.keys(pkg.dependencies)) expect({ d, jest: nazwy.has(d) }).toEqual({ d, jest: true });
    const wersje = new Set(pakiety.map((p) => `${p.nazwa}@${p.wersja}`));
    // ta sama nazwa@wersja bywa w drzewie raz jako dev, raz jako produkcyjna (inna ścieżka): liczy się tylko wersja wyłącznie dev
    const nv = ([k, e]: [string, { version?: string }]) => `${nazwaZKlucza(k)}@${e.version}`;
    const wpisyLock = Object.entries(lock.packages).filter(([k]) => k);
    const produkcyjne = new Set(wpisyLock.filter(([, e]) => e.dev !== true).map(nv));
    const tylkoDev = wpisyLock
      .filter(([, e]) => e.dev === true)
      .map(nv)
      .filter((x) => !produkcyjne.has(x) && wersje.has(x));
    expect(tylkoDev).toEqual([]);
    for (const dev of ['jest', 'eslint', 'typescript', '@stryker-mutator/core']) expect(nazwy.has(dev)).toBe(false);
  });

  test('lightningcss (narzędzie budowania, D-290 pkt 7) nie występuje na liście ani wśród tekstów', () => {
    const d = dane();
    expect(d.pakiety.filter((p) => /lightningcss/i.test(p.nazwa))).toEqual([]);
    expect(JSON.stringify(d)).not.toMatch(/lightningcss/i);
  });

  test('lista posortowana, bez duplikatów nazwa@wersja; wersja i licencja niepuste', () => {
    const { pakiety } = dane();
    expect(pakiety.length).toBeGreaterThan(300);
    const klucze = pakiety.map((p) => `${p.nazwa}@${p.wersja}`);
    expect(new Set(klucze).size).toBe(klucze.length);
    for (const p of pakiety) {
      expect(p.wersja).not.toBe('');
      expect(p.licencja).not.toBe('');
    }
  });

  test('co najmniej jeden pakiet na licencji MIT, a treść MIT jest dołączona', () => {
    const d = dane();
    const mit = d.pakiety.filter((p) => p.licencja === 'MIT');
    expect(mit.length).toBeGreaterThan(100);
    expect(d.teksty['MIT']?.tekst).toMatch(/Permission is hereby granted, free of charge/);
    expect(d.pakiety.some((p) => p.nazwa === 'react-native')).toBe(true);
  });

  test('każda licencja pakietu ma treść w pakiecie albo jest nazwana na liście wyjątków „bez treści”', () => {
    const d = dane();
    const id = (s: string) => s.replace(/[()]/g, ' ').split(/\s+(?:OR|AND)\s+|\s+/).filter((x) => x && x !== 'OR' && x !== 'AND');
    const uzyte = new Set([...d.pakiety, ...d.czcionki, ...d.natywne].flatMap((p) => id(p.licencja)));
    const bez = [...uzyte].filter((x) => !d.teksty[x]).sort();
    expect(bez).toEqual([...d.bezTresci].sort());
    // BSD-3-Clause, ISC i Apache-2.0 wymagają dołączenia pełnej treści z notką: nie mogą być wyjątkiem
    for (const x of ['MIT', 'ISC', 'BSD-3-Clause', 'BSD-2-Clause', 'Apache-2.0']) expect(d.bezTresci).not.toContain(x);
  });

  test('NOTICE (Apache-2.0 §4d): pakiety z plikiem NOTICE w node_modules mają go w danych', () => {
    const d = dane();
    const znalezione: string[] = [];
    for (const p of d.pakiety) {
      const dir = join(root, 'node_modules', p.nazwa);
      if (existsSync(dir) && readdirSync(dir).some((f) => /^notice(\.|$)/i.test(f))) znalezione.push(p.nazwa);
    }
    expect(znalezione.length).toBeGreaterThanOrEqual(1);
    for (const n of znalezione) expect({ n, notice: !!d.pakiety.find((p) => p.nazwa === n)?.notice }).toEqual({ n, notice: true });
  });

  test('czcionka Sofia Sans Semi Condensed: OFL-1.1, treść = assets/fonts/OFL-sofiasanssemicondensed.txt', () => {
    const d = dane();
    const f = d.czcionki.find((c) => /Sofia Sans/.test(c.nazwa));
    expect(f).toBeDefined();
    expect(f?.licencja).toBe('OFL-1.1');
    expect(f?.notki.join(' ')).toMatch(/Sofia Sans Project Authors/);
    const plik = readFileSync(join(root, 'assets/fonts/OFL-sofiasanssemicondensed.txt'), 'utf8').replace(/\r\n/g, '\n').trim();
    expect(d.teksty['OFL-1.1']?.tekst).toBe(plik);
  });
});

describe('Z-08-1: biblioteki natywne spoza npm (scripts/licencje-natywne.json)', () => {
  interface Pod { pod: string; name: string; version: string; license: string; copyright: string[] }
  const lista = czytaj('scripts/licencje-natywne.json') as { _opis: string; pods: Pod[] };
  const wersjaPodu = (pod: string): string | undefined => {
    const helpers = readFileSync(join(RN, 'scripts/cocoapods/helpers.rb'), 'utf8');
    if (pod === 'RCT-Folly') return /@@folly_config = \{\s*:version => '([^']+)'/.exec(helpers)?.[1];
    if (pod === 'SocketRocket') return /@@socket_rocket_config = \{\s*:version => '([^']+)'/.exec(helpers)?.[1];
    const f = join(RN, 'third-party-podspecs', `${pod}.podspec`);
    return existsSync(f) ? /spec\.version\s*=\s*['"]([^'"]+)['"]/.exec(readFileSync(f, 'utf8'))?.[1] : undefined;
  };

  test('każdy podspec React Native (poza zbiorczym ReactNativeDependencies) i SocketRocket są na liście, wersje zgodne', () => {
    const pody = readdirSync(join(RN, 'third-party-podspecs'))
      .filter((f) => f.endsWith('.podspec'))
      .map((f) => f.replace(/\.podspec$/, ''))
      .filter((p) => p !== 'ReactNativeDependencies');
    expect(lista.pods.map((p) => p.pod).sort()).toEqual([...pody, 'SocketRocket'].sort());
    for (const p of lista.pods) expect({ pod: p.pod, v: p.version }).toEqual({ pod: p.pod, v: wersjaPodu(p.pod) });
  });

  test('lista jawnie mówi, że do uzupełnienia z ios/Podfile.lock w CI (ios/ nie ma w repo)', () => {
    expect(lista._opis).toMatch(/do uzupełnienia z Podfile\.lock w CI/);
    expect(existsSync(join(root, 'ios/Podfile.lock'))).toBe(false);
  });

  test('plik danych: sekcja natywna = lista (nazwa, wersja, licencja, notki), każda z treścią licencji', () => {
    const d = dane();
    expect(d.natywne.map((n) => [n.nazwa, n.wersja, n.licencja, n.notki])).toEqual(lista.pods.map((p) => [p.name, p.version, p.license, p.copyright]));
    for (const n of d.natywne) expect({ n: n.nazwa, tekst: !!d.teksty[n.licencja] }).toEqual({ n: n.nazwa, tekst: true });
  });
});

describe('Z-08-1: wczytajLicencje (granica pliku danych, typy z unknown)', () => {
  test('odrzuca dane o złym kształcie zamiast zgadywać', () => {
    expect(wczytajLicencje(null).ok).toBe(false);
    expect(wczytajLicencje({}).ok).toBe(false);
    expect(wczytajLicencje({ pakiety: [{ nazwa: 'a' }], czcionki: [], natywne: [], teksty: {}, bezTresci: [] }).ok).toBe(false);
    expect(wczytajLicencje({ pakiety: [], czcionki: [], natywne: [], teksty: { MIT: 'x' }, bezTresci: [] }).ok).toBe(false);
  });

  test('przyjmuje poprawne dane', () => {
    const w = wczytajLicencje({
      pakiety: [{ nazwa: 'a', wersja: '1.0.0', licencja: 'MIT', notki: ['Copyright (c) A'] }],
      czcionki: [],
      natywne: [],
      teksty: { MIT: { zrodlo: 'a', tekst: 'Permission' } },
      bezTresci: [],
    });
    expect(w.ok).toBe(true);
  });
});
