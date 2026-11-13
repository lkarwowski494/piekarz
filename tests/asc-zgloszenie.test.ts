/**
 * @jest-environment node
 *
 * Zgłoszenie do App Store przez API: scripts/asc-zgloszenie.mjs na atrapie API [M1-audytor-generalny-186].
 * - przebieg na sucho wysyła wyłącznie GET i wypisuje „utworzy / zmieni / bez zmian” dla metadanych 34 lokalizacji
 *   (docs/wydanie/metadane), opisów produktów i zrzutu zakupu dla App Review; App Privacy jako krok poza API; skrót planu;
 * - zrzuty sklepu są poza skryptem (KO-033, D-366: workflow asc-zrzuty.yml, App Asset Library): skrypt nie wywołuje
 *   appScreenshotSets ani appScreenshots, nawet GET, i nigdy nie wysyła DELETE; inny zrzut zakupu w ASC = „ręcznie”;
 * - zapis tylko ze zgodą na ten sam skrót; po zapisie stan = pliki repo i drugi przebieg na sucho = 0 różnic;
 * - opisy produktów bez wartości w źródłach i brakujący zrzut zakupu czekają, zamiast mieć wymyśloną treść.
 * Dlaczego test: metadane 34 lokalizacji wpisywane ręcznie rozjeżdżają się z plikami repo, a zapis w App Store
 * Connect jest działaniem zewnętrznym, więc błąd skryptu trzeba złapać tutaj, nie na koncie właściciela.
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFile } from 'node:child_process';
import { createHash, generateKeyPairSync, randomBytes } from 'node:crypto';
import { AtrapaZgloszenia, OpcjeAtrapy } from './atrapa-asc-zgloszenie';
import { PRODUKTY } from '../src/lib/platnosci/konfiguracja';
import { PRIVACY_URL, SUPPORT_URL } from '../src/lib/links';

const root = path.join(__dirname, '..');
const SKRYPT = path.join(root, 'scripts', 'asc-zgloszenie.mjs');
const dane = JSON.parse(fs.readFileSync(path.join(root, 'docs/wydanie/asc-zgloszenie.json'), 'utf8'));
const KATALOG_META = path.join(root, 'docs/wydanie/metadane');
const LOKALIZACJE = fs.readdirSync(KATALOG_META).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();
const meta = (kod: string) => JSON.parse(fs.readFileSync(path.join(KATALOG_META, `${kod}.json`), 'utf8'));
const md5 = (b: Buffer) => createHash('md5').update(b).digest('hex');

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const PEM = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const KLUCZ_ID = 'ATRAPA8KEY';
const WYSTAWCA = '7b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'asc-zgloszenie-'));

type Wynik = { kod: number; wyjscie: string };

function uruchom(api: string, argumenty: string[] = [], env: Record<string, string> = {}): Promise<Wynik> {
  return new Promise((ok) => {
    execFile(
      process.execPath,
      [SKRYPT, '--api', api, ...argumenty],
      {
        env: { NODE_ENV: 'test', PATH: process.env.PATH ?? '', ASC_KEY_ID: KLUCZ_ID, ASC_ISSUER_ID: WYSTAWCA, ASC_KEY_P8: Buffer.from(PEM).toString('base64'), ...env },
        maxBuffer: 64 * 1024 * 1024,
      },
      (blad: Error | null, stdout: string, stderr: string) => ok({ kod: blad ? Number((blad as { code?: number }).code ?? 1) : 0, wyjscie: `${stdout}\n${stderr}` }),
    );
  });
}

const skrot = (w: Wynik) => /Skrót planu: ([0-9a-f]{64})/.exec(w.wyjscie)?.[1] ?? '';
const roznice = (w: Wynik) => Number(/Różnice: (\d+)/.exec(w.wyjscie)?.[1] ?? 'NaN');
const czeka = (w: Wynik) => Number(/czeka (\d+)/.exec(w.wyjscie)?.[1] ?? 'NaN');

function plik(nazwa: string, tresc: unknown): string {
  const p = path.join(tmp, nazwa);
  fs.writeFileSync(p, typeof tresc === 'string' ? tresc : JSON.stringify(tresc, null, 2));
  return p;
}

/** Zapytania, których skrypt nie może wysłać w żadnym scenariuszu (D-366): zestawy i pliki zrzutów sklepu, każde DELETE. */
const zakazane = (a: AtrapaZgloszenia) => a.zapytania.filter((z) => z.metoda === 'DELETE' || /appScreenshot/.test(z.sciezka));

async function zAtrapa<T>(opcje: Partial<OpcjeAtrapy>, f: (a: AtrapaZgloszenia) => Promise<T>): Promise<T> {
  const a = new AtrapaZgloszenia({ bundleId: 'com.apps4brew.baker', kluczPubliczny: publicKey, kluczId: KLUCZ_ID, wystawca: WYSTAWCA, produkty: PRODUKTY, ...opcje });
  await a.start();
  try {
    const wynik = await f(a);
    // Każdy scenariusz: ani zrzutów sklepu (także GET), ani usuwania (KO-033, D-366).
    expect(zakazane(a)).toEqual([]);
    return wynik;
  } finally {
    await a.stop();
  }
}

/** Dane testowe zapisu: opisy produktów i zrzut zakupu w kopii pliku danych. Teksty opisów są tylko testowe. */
let daneTestowe = '';
const OPISY: Record<string, Record<string, string>> = {
  monthly: { 'en-US': 'Test monthly', pl: 'Test miesięczny' },
  yearly: { 'en-US': 'Test yearly', pl: 'Test roczny' },
  lifetime: { 'en-US': 'Test lifetime', pl: 'Test dożywotni' },
};
const ZAKUP = randomBytes(5000);

beforeAll(() => {
  fs.writeFileSync(path.join(tmp, 'zakup.png'), ZAKUP);
  daneTestowe = plik('dane.json', { ...dane, opisyProduktow: OPISY, zrzutZakupu: path.join(tmp, 'zakup.png') });
});

describe('scripts/asc-zgloszenie.mjs na atrapie App Store Connect API (M1-audytor-generalny-186)', () => {
  jest.setTimeout(180000);

  it('przebieg na sucho na danych repo: tylko GET; 34 lokalizacje, czekające opisy i zrzut zakupu, zrzuty sklepu poza skryptem, App Privacy poza API', async () => {
    await zAtrapa({}, async (a) => {
      const w = await uruchom(a.adres);
      expect(w.kod).toBe(0);
      expect(a.zapisy()).toEqual([]);
      expect(w.wyjscie).toContain('przebieg na sucho');
      expect(skrot(w)).toMatch(/^[0-9a-f]{64}$/);
      for (const kod of LOKALIZACJE) {
        expect(w.wyjscie).toContain(`metadane ${kod} (App Information)`);
        expect(w.wyjscie).toContain(`metadane ${kod} (wersja 1.0.0)`);
      }
      expect(w.wyjscie).toMatch(/zmieni · metadane en-US \(App Information\): .*nazwa „Baker: Sourdough Bread Planner”/);
      expect(w.wyjscie).toMatch(/utworzy · metadane pl \(App Information\): nazwa „Piekarz: Chleb na zakwasie”/);
      expect(w.wyjscie).toMatch(/poza API · App Privacy: „Data Not Collected”/);
      const nullOpisow = Object.values(dane.opisyProduktow as Record<string, Record<string, string | null>>).flatMap((o) => Object.values(o)).filter((x) => x == null).length;
      const brakZakupu = fs.existsSync(path.join(root, dane.zrzutZakupu)) ? 0 : 3;
      expect(czeka(w)).toBe(nullOpisow + brakZakupu);
      if (nullOpisow) expect(w.wyjscie).toMatch(/czeka · opis produktu .*decyzja właściciela/);
      if (brakZakupu) expect(w.wyjscie).toMatch(/czeka · zrzut ekranu zakupu dla App Review .*z finalnej aplikacji/);
    });
  });

  it('zrzuty sklepu poza skryptem (D-366): jedna pozycja informacyjna z odesłaniem do asc-zrzuty.yml; żadnego zapytania appScreenshotSets/appScreenshots, także GET', async () => {
    await zAtrapa({}, async (a) => {
      const w = await uruchom(a.adres, ['--dane', daneTestowe]);
      expect(w.kod).toBe(0);
      const pozycje = w.wyjscie.split('\n').filter((l) => /^- poza skryptem · /.test(l));
      expect(pozycje).toHaveLength(1);
      expect(pozycje[0]).toMatch(/zrzuty sklepu.*\.github\/workflows\/asc-zrzuty\.yml.*scripts\/asc\/zrzuty\.mjs.*App Asset Library.*D-366/);
      expect(w.wyjscie).not.toMatch(/zrzuty (pl|en-US) iphone|ramek|sumy\.json/);
      expect(a.zapytania.length).toBeGreaterThan(0);
      expect(a.zapytania.filter((z) => /appScreenshot/.test(z.sciezka))).toEqual([]);
    });
  });

  it('opcje zrzutów usunięte (D-366): --zrzuty, --sumy i --generuj-sumy = kod 1 z odesłaniem do asc-zrzuty.yml, bez zapytań do API', async () => {
    await zAtrapa({}, async (a) => {
      for (const opcja of ['--zrzuty', '--sumy', '--generuj-sumy']) {
        const w = await uruchom(a.adres, [opcja, tmp]);
        expect({ opcja, kod: w.kod }).toEqual({ opcja, kod: 1 });
        expect(w.wyjscie).toMatch(/asc-zrzuty\.yml.*D-366/);
      }
      expect(a.zapytania).toEqual([]);
    });
  });

  it('zgoda na inny plan (inny skrót) = odmowa bez zapisu, kod 3; zgoda wyłączona = bez zapisu', async () => {
    await zAtrapa({}, async (a) => {
      const inny = await uruchom(a.adres, ['--zgoda', plik('inny.json', { zapis: true, skrot: '0'.repeat(64), zgoda: '2026-10-21: test' })]);
      expect(inny.kod).toBe(3);
      expect(inny.wyjscie).toMatch(/Skrót planu nie zgadza się ze zgodą/);
      const bez = await uruchom(a.adres, ['--zgoda', plik('bez.json', { zapis: false, skrot: null })]);
      expect(bez.kod).toBe(0);
      expect(a.zapisy()).toEqual([]);
    });
  });

  it('zapis ze zgodą: metadane, opisy i zrzut zakupu jak w plikach, bez DELETE i bez zrzutów sklepu; drugi przebieg na sucho = 0 różnic', async () => {
    await zAtrapa({}, async (a) => {
      const arg = ['--dane', daneTestowe];
      const sucho = await uruchom(a.adres, arg);
      expect(sucho.kod).toBe(0);
      expect(czeka(sucho)).toBe(0);
      const z = plik('ok.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test' });
      const w = await uruchom(a.adres, [...arg, '--zgoda', z]);
      expect(w.wyjscie).toMatch(/Po zapisie: różnice 0/);
      expect(w.kod).toBe(0);

      for (const kod of LOKALIZACJE) {
        const m = meta(kod);
        expect(a.lokInfo.find((l) => l.attributes.locale === kod)?.attributes).toMatchObject({ name: m.nazwa, subtitle: m.podtytul, privacyPolicyUrl: PRIVACY_URL });
        expect(a.lokWersji.find((l) => l.attributes.locale === kod)?.attributes).toMatchObject({ description: m.opis, keywords: m.slowaKluczowe, promotionalText: m.tekstPromocyjny, supportUrl: SUPPORT_URL });
      }
      expect(a.lokInfo).toHaveLength(LOKALIZACJE.length);

      for (const [plan, id] of [['monthly', 'sub-m'], ['yearly', 'sub-y'], ['lifetime', 'iap-l']]) {
        const lok = a.lokProduktow.filter((l) => l.produkt === id);
        expect(Object.fromEntries(lok.map((l) => [l.attributes.locale, l.attributes.description]))).toEqual(OPISY[plan]);
        expect(a.zrzutyReview.find((r) => r.wlasciciel === id)?.attributes.sourceFileChecksum).toBe(md5(ZAKUP));
      }
      expect(a.zrzutyReview).toHaveLength(3);
      expect(a.zrzutyReview.every((x) => (x.attributes.assetDeliveryState as { state: string }).state === 'COMPLETE')).toBe(true);
      // Zapis był, a mimo to ani jednego DELETE ani zapytania o zrzuty sklepu (D-366).
      expect(a.zapisy().length).toBeGreaterThan(0);
      expect(a.zapytania.filter((q) => q.metoda === 'DELETE')).toEqual([]);
      expect(a.zapytania.filter((q) => /appScreenshot/.test(q.sciezka))).toEqual([]);

      const drugi = await uruchom(a.adres, arg);
      expect(drugi.kod).toBe(0);
      expect(roznice(drugi)).toBe(0);
      const zapisyPrzed = a.zapisy().length;
      const ponownie = await uruchom(a.adres, [...arg, '--zgoda', z]);
      expect(ponownie.kod).toBe(0);
      expect(a.zapisy().length).toBe(zapisyPrzed);
    });
  });

  it('inny zrzut zakupu już w ASC: „ręcznie” (podmień w App Store Connect, docs/wydanie/zrzut-zakupu.md); po zapisie ze zgodą bez DELETE i bez POST zrzutu', async () => {
    await zAtrapa({ zrzutZakupuWAsc: 'f'.repeat(32) }, async (a) => {
      const arg = ['--dane', daneTestowe];
      const sucho = await uruchom(a.adres, arg);
      expect(sucho.kod).toBe(0);
      const reczne = sucho.wyjscie.split('\n').filter((l) => /^- ręcznie · zrzut ekranu zakupu dla App Review /.test(l));
      expect(reczne).toHaveLength(3);
      for (const l of reczne) expect(l).toMatch(/podmień w App Store Connect.*docs\/wydanie\/zrzut-zakupu\.md/);
      expect(sucho.wyjscie).not.toMatch(/(zmieni|utworzy) · zrzut ekranu zakupu/);
      const w = await uruchom(a.adres, [...arg, '--zgoda', plik('inny-zakup.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test' })]);
      expect(w.wyjscie).toMatch(/Po zapisie: różnice 3/);
      expect(w.kod).toBe(5);
      expect(a.zapisy().length).toBeGreaterThan(0);
      expect(a.zapytania.filter((q) => q.metoda === 'DELETE')).toEqual([]);
      expect(a.zapisy().filter((q) => /ReviewScreenshot/.test(q.sciezka))).toEqual([]);
      expect(a.zrzutyReview.map((r) => [r.id, r.attributes.sourceFileChecksum])).toEqual([['rev-sub-m', 'f'.repeat(32)], ['rev-sub-y', 'f'.repeat(32)], ['rev-iap-l', 'f'.repeat(32)]]);
    });
  });

  it('bez wersji iOS w stanie edycji: krok ręczny, bez zapisu metadanych wersji', async () => {
    await zAtrapa({ bezWersji: true }, async (a) => {
      const w = await uruchom(a.adres);
      expect(w.kod).toBe(0);
      expect(w.wyjscie).toMatch(/ręcznie · wersja iOS 1\.0\.0/);
      expect(a.zapisy()).toEqual([]);
    });
  });

  it('numer wersji w ASC inny niż app.json (1.0 wobec 1.0.0): zmieni numer, potem metadane tej wersji; 0 różnic', async () => {
    await zAtrapa({ numerWersji: '1.0' }, async (a) => {
      const arg = ['--dane', daneTestowe];
      const sucho = await uruchom(a.adres, arg);
      expect(sucho.kod).toBe(0);
      expect(sucho.wyjscie).toMatch(/zmieni · numer wersji iOS w edycji: 1\.0\.0 \(teraz 1\.0/);
      expect(a.zapisy()).toEqual([]);
      const w = await uruchom(a.adres, [...arg, '--zgoda', plik('wersja.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test' })]);
      expect(w.wyjscie).toMatch(/Po zapisie: różnice 0/);
      expect(w.kod).toBe(0);
      expect(a.wersje[0].attributes.versionString).toBe('1.0.0');
      expect(a.lokWersji).toHaveLength(LOKALIZACJE.length);
      expect(a.lokWersji.find((l) => l.attributes.locale === 'pl')?.attributes.description).toBe(meta('pl').opis);
    });
  });

  it('zakres z pliku zgody (pl, metadane): lista i skrót tylko z zakresu, zapis tylko tych lokalizacji; reszta planu nietknięta', async () => {
    await zAtrapa({}, async (a) => {
      a.lokWersji.push({ type: 'appStoreVersionLocalizations', id: 'avl-pl', wersja: 'ver-1', attributes: { locale: 'pl', description: 'stary', keywords: null, promotionalText: null, supportUrl: null } });
      const zakres = { lokalizacja: 'pl', obiekty: ['metadane'] };
      const sucho = await uruchom(a.adres, ['--zgoda', plik('zakres-sucho.json', { zapis: false, skrot: null, zakres })]);
      expect(sucho.kod).toBe(0);
      expect(sucho.wyjscie).toMatch(/Zakres planu z pliku zgody: pl; obiekty: metadane/);
      expect(roznice(sucho)).toBe(2);
      expect(sucho.wyjscie).not.toMatch(/metadane en-US|opis produktu|App Privacy|zrzuty sklepu/);
      expect(a.zapisy()).toEqual([]);
      const z = plik('zakres-zapis.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test', zakres });
      const w = await uruchom(a.adres, ['--zgoda', z]);
      expect(w.wyjscie).toMatch(/Po zapisie: różnice 0/);
      expect(w.kod).toBe(0);
      expect(a.lokInfo.map((l) => l.attributes.locale).sort()).toEqual(['en-US', 'pl']);
      expect(a.lokInfo.find((l) => l.attributes.locale === 'en-US')?.attributes.name).toBe('Piekarz');
      expect(a.lokWersji.find((l) => l.attributes.locale === 'pl')?.attributes.description).toBe(meta('pl').opis);
      expect(a.lokWersji).toHaveLength(2);
      expect(a.lokProduktow.every((l) => l.attributes.description == null)).toBe(true);
      const po = await uruchom(a.adres, ['--zgoda', plik('zakres-po.json', { zapis: false, skrot: null, zakres })]);
      expect(roznice(po)).toBe(0);
      const calosc = await uruchom(a.adres);
      expect(roznice(calosc)).toBeGreaterThan(60);
    });
  });

  it('zakres z obiektem „zrzuty” w pliku zgody: kod 3 z odesłaniem do asc-zrzuty.yml (D-366), bez zapytań do API', async () => {
    await zAtrapa({}, async (a) => {
      const w = await uruchom(a.adres, ['--zgoda', plik('zakres-zrzuty.json', { zapis: false, skrot: null, zakres: { lokalizacja: 'pl', obiekty: ['zrzuty'] } })]);
      expect(w.kod).toBe(3);
      expect(w.wyjscie).toMatch(/asc-zrzuty\.yml.*D-366/);
      expect(a.zapytania).toEqual([]);
    });
  });

  it('opis produktu ponad 45 znaków (limit opisu In-App Purchase): kod 1 przed zapytaniami do API', async () => {
    await zAtrapa({}, async (a) => {
      const dlugi = plik('dane-dlugi.json', { ...dane, opisyProduktow: { ...OPISY, lifetime: { 'en-US': 'x'.repeat(46), pl: 'Test' } } });
      const w = await uruchom(a.adres, ['--dane', dlugi]);
      expect(w.kod).toBe(1);
      expect(w.wyjscie).toMatch(/opis produktu lifetime en-US .*45 znaków/);
      expect(a.zapytania).toEqual([]);
    });
  });

  it('403 przy zapisie: kod 4; w wyjściu nie ma klucza, tokenu, identyfikatora klucza ani wystawcy', async () => {
    await zAtrapa({ zabronZapis: true }, async (a) => {
      const sucho = await uruchom(a.adres);
      const w = await uruchom(a.adres, ['--zgoda', plik('403.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test' })]);
      expect(w.kod).toBe(4);
      expect(w.wyjscie).toMatch(/Admin albo App Manager/);
      for (const x of [w, sucho]) {
        expect(x.wyjscie).not.toContain(KLUCZ_ID);
        expect(x.wyjscie).not.toContain(WYSTAWCA);
        expect(x.wyjscie).not.toMatch(/eyJ[\w-]+\.[\w-]+\./);
        expect(x.wyjscie).not.toMatch(/PRIVATE KEY/);
      }
    });
  });

  it('bez sekretów: kod 1 z nazwą brakującej zmiennej, bez zapytań do API', async () => {
    await zAtrapa({}, async (a) => {
      const w = await uruchom(a.adres, [], { ASC_ISSUER_ID: '' });
      expect(w.kod).toBe(1);
      expect(w.wyjscie).toMatch(/ASC_ISSUER_ID/);
      expect(a.zapytania).toEqual([]);
    });
  });
  // --- Migracja na zasoby wersji (ASC API 4.4.1), docs/wydanie/asc-api-v2-zrodla.md ---
  it('opisy produktów przez wersje v2: odczyt z …/versions, zapis PATCH /v2/…Localizations/{id}, żadnych starych ścieżek lokalizacji', async () => {
    await zAtrapa({}, async (a) => {
      const arg = ['--dane', daneTestowe];
      const sucho = await uruchom(a.adres, arg);
      const w = await uruchom(a.adres, [...arg, '--zgoda', plik('v2.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-11-13: test' })]);
      expect(w.kod).toBe(0);
      const sciezki = a.zapytania.map((q) => `${q.metoda} ${q.sciezka}`);
      expect(sciezki.some((p) => /^GET \/v1\/subscriptions\/[^/]+\/versions$/.test(p))).toBe(true);
      expect(sciezki.some((p) => /^GET \/v2\/inAppPurchases\/[^/]+\/versions$/.test(p))).toBe(true);
      expect(sciezki.filter((p) => /^PATCH \/v2\/(subscriptionLocalizations|inAppPurchaseLocalizations)\//.test(p))).toHaveLength(6);
      expect(sciezki.filter((p) => /\/v1\/(subscriptionLocalizations|inAppPurchaseLocalizations)|\/subscriptionLocalizations$|\/inAppPurchaseLocalizations$/.test(p))).toEqual([]);
    });
  });

  it('wersja produktu nieedytowalna: opis jako „ręcznie”, zapis nie rusza produktów', async () => {
    await zAtrapa({ stanWersjiProduktow: 'APPROVED' }, async (a) => {
      const sucho = await uruchom(a.adres, ['--dane', daneTestowe]);
      expect(sucho.kod).toBe(0);
      expect(sucho.wyjscie).toMatch(/ręcznie · .*opis produktu .*wersja.*nieedytowalna/);
      expect(a.zapytania.filter((q) => q.metoda !== 'GET')).toEqual([]);
    });
  });
});
