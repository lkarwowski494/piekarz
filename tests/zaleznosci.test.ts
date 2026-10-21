/**
 * M1-audytor-generalny-153 (08-programista-506): każda zależność `expo*` w package.json
 * ma użycie w aplikacji (import w app/ lub src/, wtyczka w app.json, punkt wejścia)
 * albo nazwany powód w WYJATKI. Nieużywany pakiet natywny powiększa build i opis
 * kryptografii w App Store Connect.
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));

/** Pakiety bez importu w kodzie, potrzebne z nazwanego powodu. */
const WYJATKI: Record<string, string> = {
  'expo-asset': 'peerDependency expo-audio (node_modules/expo-audio/package.json)',
  'expo-linking': 'peerDependency expo-router (node_modules/expo-router/package.json)',
};

const pliki = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : pliki(p);
    return /\.(ts|tsx|js)$/.test(e.name) && !/\.test\./.test(e.name) ? [p] : [];
  });

const kod = ['app', 'src'].flatMap((d) => pliki(path.join(root, d))).map((p) => fs.readFileSync(p, 'utf8')).join('\n');
const wtyczki = new Set((app.expo.plugins as (string | [string, unknown])[]).map((w) => (Array.isArray(w) ? w[0] : w)));

const uzyta = (nazwa: string) =>
  nazwa === 'expo' ||
  wtyczki.has(nazwa) ||
  String(pkg.main).startsWith(`${nazwa}/`) ||
  new RegExp(`['"]${nazwa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/[^'"]*)?['"]`).test(kod);

describe('zależności expo mają użycie (153)', () => {
  const expo = Object.keys(pkg.dependencies).filter((d) => d === 'expo' || d.startsWith('expo-'));

  it('każda zależność expo* jest importowana, jest wtyczką albo ma nazwany wyjątek', () => {
    expect(expo.filter((d) => !uzyta(d) && !(d in WYJATKI))).toEqual([]);
  });

  it('wyjątki dotyczą pakietów, które naprawdę są w zależnościach i nie mają użycia', () => {
    for (const d of Object.keys(WYJATKI)) {
      expect(expo).toContain(d);
      expect(uzyta(d)).toBe(false);
    }
  });
});
