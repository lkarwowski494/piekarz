/**
 * Atrapa ofert sklepu tylko w buildzie E2E (KO-033, właściciel 2026-11-10: zrzut zakupu dla App Review „Jak w treningu”; D-365).
 * Wzór: trening EXPO_PUBLIC_STORE_FAKE (tests/store-adapter.test.ts @ 2e4b0f8). Symulator w CI nie ma StoreKit, więc ekran Pro bez
 * atrapy pokazuje „oferta niedostępna” (D-353). Przy EXPO_PUBLIC_STORE_FAKE === '1' (tylko krok buildu „Basic + atrapa ofert”
 * w e2e-ios.yml) `pobierzOferte` zwraca 3 plany z cenami bazowymi USD z docs/wydanie/ceny.json bez pytania sklepu; zakup,
 * przywracanie i uprawnienia bez zmian (Basic zostaje Basic). Wydanie: testflight.yml odrzuca flagę, inne workflowy jej nie ustawiają.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
type Sklep = typeof import('../platnosci/sklep');
type Mock = { __mock: { reset: () => void; products: unknown[] }; fetchProducts: jest.Mock; initConnection: jest.Mock };

function sklepZFlaga(wartosc: string | undefined): Sklep {
  const przed = process.env.EXPO_PUBLIC_STORE_FAKE;
  if (wartosc === undefined) delete process.env.EXPO_PUBLIC_STORE_FAKE;
  else process.env.EXPO_PUBLIC_STORE_FAKE = wartosc;
  let m: Sklep | undefined;
  jest.isolateModules(() => {
    m = jest.requireActual<Sklep>('../platnosci/sklep');
  });
  if (przed === undefined) delete process.env.EXPO_PUBLIC_STORE_FAKE;
  else process.env.EXPO_PUBLIC_STORE_FAKE = przed;
  if (!m) throw new Error('moduł sklepu nie załadowany');
  return m;
}

describe('atrapa ofert E2E (D-365)', () => {
  const Iap = jest.requireMock('expo-iap') as Mock;
  beforeEach(() => {
    Iap.__mock.reset();
    Iap.fetchProducts.mockClear();
  });

  it("EXPO_PUBLIC_STORE_FAKE === '1': trzy plany z cenami USD z ceny.json, bez pytania sklepu", async () => {
    const usa = JSON.parse(read('docs/wydanie/ceny.json')).reczne.USA as Record<string, string>;
    const oferta = await sklepZFlaga('1').pobierzOferte();
    expect(oferta).toEqual([
      { plan: 'yearly', cena: `$${usa.yearly}` },
      { plan: 'monthly', cena: `$${usa.monthly}` },
      { plan: 'lifetime', cena: `$${usa.lifetime}` },
    ]);
    expect(Iap.fetchProducts).not.toHaveBeenCalled();
  });

  it('bez flagi albo z inną wartością: oferta tylko ze sklepu (pusty sklep = pusta oferta)', async () => {
    for (const v of [undefined, '0', 'true', '', 'yes']) {
      Iap.fetchProducts.mockClear();
      expect({ v, oferta: await sklepZFlaga(v).pobierzOferte() }).toEqual({ v, oferta: [] });
      expect(Iap.fetchProducts).toHaveBeenCalledTimes(1);
    }
  });

  it('flaga tylko w sklep.ts; ustawia ją wyłącznie e2e-ios.yml (krok buildu z atrapą), testflight.yml ją odrzuca', () => {
    const pliki = (d: string): string[] =>
      readdirSync(join(root, d), { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? (e.name === '__tests__' ? [] : pliki(join(d, e.name))) : /\.tsx?$/.test(e.name) ? [join(d, e.name)] : []);
    expect([...pliki('src'), ...pliki('app')].filter((f) => read(f).includes('EXPO_PUBLIC_STORE_FAKE'))).toEqual([join('src', 'lib', 'platnosci', 'sklep.ts')]);
    for (const f of readdirSync(join(root, '.github/workflows'))) {
      const ustawia = /EXPO_PUBLIC_STORE_FAKE\s*:\s*['"]?1/.test(read(`.github/workflows/${f}`));
      expect({ f, ustawia }).toEqual({ f, ustawia: f === 'e2e-ios.yml' });
    }
    expect(read('.github/workflows/testflight.yml')).toMatch(/for var in EXPO_PUBLIC_STORE_FAKE[\s\S]*?exit 1/);
    for (const f of ['app.json', 'eas.json', 'package.json']) {
      let t = '';
      try { t = read(f); } catch { t = ''; }
      expect({ f, ma: t.includes('STORE_FAKE') }).toEqual({ f, ma: false });
    }
  });
});
