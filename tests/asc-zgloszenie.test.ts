/**
 * @jest-environment node
 *
 * Zgłoszenie do App Store przez API: scripts/asc-zgloszenie.mjs na atrapie API [M1-audytor-generalny-186].
 * - przebieg na sucho wysyła wyłącznie GET i wypisuje „utworzy / zmieni / bez zmian” dla metadanych 34 lokalizacji
 *   (docs/wydanie/metadane), zrzutów (sumy MD5 z docs/wydanie/zrzuty/sumy.json, także lokalizacji spoza repo),
 *   opisów produktów i zrzutu zakupu dla App Review; App Privacy jako krok poza API; skrót planu;
 * - zapis tylko ze zgodą na ten sam skrót; po zapisie stan = pliki repo i drugi przebieg na sucho = 0 różnic;
 * - opisy produktów bez wartości w źródłach i brakujący zrzut zakupu czekają, zamiast mieć wymyśloną treść.
 * Dlaczego test: metadane i zrzuty 34 lokalizacji wpisywane ręcznie rozjeżdżają się z plikami repo, a zapis w App Store
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
const sumy = JSON.parse(fs.readFileSync(path.join(root, 'docs/wydanie/zrzuty/sumy.json'), 'utf8'));
const KATALOG_META = path.join(root, 'docs/wydanie/metadane');
const LOKALIZACJE = fs.readdirSync(KATALOG_META).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();
const meta = (kod: string) => JSON.parse(fs.readFileSync(path.join(KATALOG_META, `${kod}.json`), 'utf8'));
const KLASY: Record<string, string> = dane.klasyZrzutow;
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

async function zAtrapa<T>(opcje: Partial<OpcjeAtrapy>, f: (a: AtrapaZgloszenia) => Promise<T>): Promise<T> {
  const a = new AtrapaZgloszenia({ bundleId: 'com.apps4brew.baker', kluczPubliczny: publicKey, kluczId: KLUCZ_ID, wystawca: WYSTAWCA, produkty: PRODUKTY, ...opcje });
  await a.start();
  try {
    return await f(a);
  } finally {
    await a.stop();
  }
}

/**
 * Dane testowe zapisu: zrzuty lokalizacji spoza repo jako losowe pliki w katalogu tymczasowym (w Actions plików z K nie ma),
 * sumy wygenerowane przez skrypt, opisy produktów i zrzut zakupu w kopii pliku danych. Teksty opisów są tylko testowe.
 */
let zrzutyTestowe = '';
let sumyTestowe = '';
let daneTestowe = '';
const OPISY: Record<string, Record<string, string>> = {
  monthly: { 'en-US': 'Test monthly', pl: 'Test miesięczny' },
  yearly: { 'en-US': 'Test yearly', pl: 'Test roczny' },
  lifetime: { 'en-US': 'Test lifetime', pl: 'Test dożywotni' },
};
const ZAKUP = randomBytes(5000);

beforeAll(async () => {
  zrzutyTestowe = path.join(tmp, 'zrzuty');
  for (const kod of LOKALIZACJE) {
    if (fs.existsSync(path.join(root, 'docs/wydanie/zrzuty', kod))) continue;
    for (const klasa of Object.keys(KLASY)) {
      const k = path.join(zrzutyTestowe, kod, klasa);
      fs.mkdirSync(k, { recursive: true });
      for (const { plik: nazwa } of sumy.lokalizacje.pl[klasa]) fs.writeFileSync(path.join(k, nazwa), randomBytes(3000 + Math.floor(Math.random() * 3000)));
    }
  }
  sumyTestowe = path.join(tmp, 'sumy.json');
  const w = await uruchom('http://127.0.0.1:9', ['--generuj-sumy', zrzutyTestowe, '--sumy', sumyTestowe]);
  if (w.kod !== 0) throw new Error(w.wyjscie);
  fs.writeFileSync(path.join(tmp, 'zakup.png'), ZAKUP);
  daneTestowe = plik('dane.json', { ...dane, opisyProduktow: OPISY, zrzutZakupu: path.join(tmp, 'zakup.png') });
});

describe('docs/wydanie/zrzuty/sumy.json (M1-audytor-generalny-186)', () => {
  it('ma 34 lokalizacje z metadanych, obie klasy i 7 ramek; pliki w repo mają te same sumy MD5', () => {
    expect(LOKALIZACJE).toHaveLength(dane.lokalizacji);
    expect(Object.keys(sumy.lokalizacje).sort()).toEqual(LOKALIZACJE);
    for (const kod of LOKALIZACJE) {
      for (const klasa of Object.keys(KLASY)) {
        const lista = sumy.lokalizacje[kod][klasa] as { plik: string; bajty: number; md5: string }[];
        expect(lista.map((x) => x.plik)).toEqual(sumy.lokalizacje.pl[klasa].map((x: { plik: string }) => x.plik));
        expect(lista).toHaveLength(dane.ramekNaKlase);
        for (const x of lista) {
          expect(x.md5).toMatch(/^[0-9a-f]{32}$/);
          const wRepo = path.join(root, 'docs/wydanie/zrzuty', kod, klasa, x.plik);
          if (fs.existsSync(wRepo)) {
            const b = fs.readFileSync(wRepo);
            expect({ kod, plik: x.plik, md5: md5(b), bajty: b.length }).toEqual({ kod, plik: x.plik, md5: x.md5, bajty: x.bajty });
          }
        }
      }
    }
  });
});

describe('scripts/asc-zgloszenie.mjs na atrapie App Store Connect API (M1-audytor-generalny-186)', () => {
  jest.setTimeout(180000);

  it('przebieg na sucho na danych repo: tylko GET; 34 lokalizacje, 68 zestawów zrzutów, czekające opisy i zrzut zakupu, App Privacy poza API', async () => {
    await zAtrapa({}, async (a) => {
      const w = await uruchom(a.adres);
      expect(w.kod).toBe(0);
      expect(a.zapisy()).toEqual([]);
      expect(w.wyjscie).toContain('przebieg na sucho');
      expect(skrot(w)).toMatch(/^[0-9a-f]{64}$/);
      for (const kod of LOKALIZACJE) {
        expect(w.wyjscie).toContain(`metadane ${kod} (App Information)`);
        expect(w.wyjscie).toContain(`metadane ${kod} (wersja 1.0.0)`);
        for (const klasa of Object.keys(KLASY)) expect(w.wyjscie).toContain(`zrzuty ${kod} ${klasa}`);
      }
      expect(w.wyjscie).toMatch(/zmieni · metadane en-US \(App Information\): .*nazwa „Baker: Sourdough Bread Planner”/);
      expect(w.wyjscie).toMatch(/utworzy · metadane pl \(App Information\): nazwa „Piekarz: Chleb na zakwasie”/);
      expect((w.wyjscie.match(/utworzy · zrzuty /g) ?? []).length).toBe(LOKALIZACJE.length * 2);
      expect(w.wyjscie).toMatch(/poza API · App Privacy: „Data Not Collected”/);
      const nullOpisow = Object.values(dane.opisyProduktow as Record<string, Record<string, string | null>>).flatMap((o) => Object.values(o)).filter((x) => x == null).length;
      const brakZakupu = fs.existsSync(path.join(root, dane.zrzutZakupu)) ? 0 : 3;
      expect(czeka(w)).toBe(nullOpisow + brakZakupu);
      if (nullOpisow) expect(w.wyjscie).toMatch(/czeka · opis produktu .*decyzja właściciela/);
      if (brakZakupu) expect(w.wyjscie).toMatch(/czeka · zrzut ekranu zakupu dla App Review .*tor p9c/);
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

  it('zapis ze zgodą: metadane, zrzuty w kolejności, opisy i zrzut zakupu jak w plikach; drugi przebieg na sucho = 0 różnic', async () => {
    await zAtrapa({}, async (a) => {
      const arg = ['--dane', daneTestowe, '--sumy', sumyTestowe, '--zrzuty', zrzutyTestowe];
      const sucho = await uruchom(a.adres, arg);
      expect(sucho.kod).toBe(0);
      expect(czeka(sucho)).toBe(0);
      const z = plik('ok.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test' });
      const w = await uruchom(a.adres, [...arg, '--zgoda', z]);
      expect(w.wyjscie).toMatch(/Po zapisie: różnice 0/);
      expect(w.kod).toBe(0);

      const sumyT = JSON.parse(fs.readFileSync(sumyTestowe, 'utf8'));
      for (const kod of LOKALIZACJE) {
        const m = meta(kod);
        expect(a.lokInfo.find((l) => l.attributes.locale === kod)?.attributes).toMatchObject({ name: m.nazwa, subtitle: m.podtytul, privacyPolicyUrl: PRIVACY_URL });
        expect(a.lokWersji.find((l) => l.attributes.locale === kod)?.attributes).toMatchObject({ description: m.opis, keywords: m.slowaKluczowe, promotionalText: m.tekstPromocyjny, supportUrl: SUPPORT_URL });
        for (const [klasa, typ] of Object.entries(KLASY)) expect(a.sumyZestawu(kod, typ)).toEqual(sumyT.lokalizacje[kod][klasa].map((x: { md5: string }) => x.md5));
      }
      expect(a.lokInfo).toHaveLength(LOKALIZACJE.length);
      expect(a.zestawy).toHaveLength(LOKALIZACJE.length * 2);

      for (const [plan, id] of [['monthly', 'sub-m'], ['yearly', 'sub-y'], ['lifetime', 'iap-l']]) {
        const lok = a.lokProduktow.filter((l) => l.produkt === id);
        expect(Object.fromEntries(lok.map((l) => [l.attributes.locale, l.attributes.description]))).toEqual(OPISY[plan]);
        expect(a.zrzutyReview.find((r) => r.wlasciciel === id)?.attributes.sourceFileChecksum).toBe(md5(ZAKUP));
      }
      expect(a.zrzuty.every((x) => (x.attributes.assetDeliveryState as { state: string }).state === 'COMPLETE')).toBe(true);

      const drugi = await uruchom(a.adres, arg);
      expect(drugi.kod).toBe(0);
      expect(roznice(drugi)).toBe(0);
      const zapisyPrzed = a.zapisy().length;
      const ponownie = await uruchom(a.adres, [...arg, '--zgoda', z]);
      expect(ponownie.kod).toBe(0);
      expect(a.zapisy().length).toBe(zapisyPrzed);
    });
  });

  it('zmiana jednej ramki: zmieni tylko ten zestaw (zastąpi zrzuty), reszta bez zmian', async () => {
    await zAtrapa({}, async (a) => {
      const arg = ['--dane', daneTestowe, '--sumy', sumyTestowe, '--zrzuty', zrzutyTestowe];
      const sucho = await uruchom(a.adres, arg);
      await uruchom(a.adres, [...arg, '--zgoda', plik('ok2.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test' })]);
      const kod = LOKALIZACJE.find((k) => !fs.existsSync(path.join(root, 'docs/wydanie/zrzuty', k)))!;
      const p = path.join(zrzutyTestowe, kod, 'iphone-6.3', sumy.lokalizacje.pl['iphone-6.3'][3].plik);
      const sumyZm = path.join(tmp, 'sumy-zmiana.json');
      const katZm = path.join(tmp, 'zrzuty-zmiana');
      fs.cpSync(zrzutyTestowe, katZm, { recursive: true });
      fs.writeFileSync(path.join(katZm, path.relative(zrzutyTestowe, p)), randomBytes(4321));
      expect((await uruchom(a.adres, ['--generuj-sumy', katZm, '--sumy', sumyZm])).kod).toBe(0);
      const argZm = ['--dane', daneTestowe, '--sumy', sumyZm, '--zrzuty', katZm];
      const w = await uruchom(a.adres, argZm);
      expect(roznice(w)).toBe(1);
      expect(w.wyjscie).toMatch(new RegExp(`zmieni · zrzuty ${kod} iphone-6.3: zastąpi 7`));
      const zgodaZm = plik('ok3.json', { zapis: true, skrot: skrot(w), zgoda: '2026-10-21: test' });
      const zapis = await uruchom(a.adres, [...argZm, '--zgoda', zgodaZm]);
      expect(zapis.wyjscie).toMatch(/Po zapisie: różnice 0/);
      expect(a.sumyZestawu(kod, KLASY['iphone-6.3'])[3]).toBe(md5(fs.readFileSync(path.join(katZm, path.relative(zrzutyTestowe, p)))));
    });
  });

  it('bez plików zrzutów spoza repo: zapis metadanych, zestawy tych lokalizacji nietknięte, kod 5 z listą', async () => {
    await zAtrapa({}, async (a) => {
      const arg = ['--dane', daneTestowe, '--sumy', sumyTestowe];
      const sucho = await uruchom(a.adres, arg);
      expect(sucho.wyjscie).toMatch(/pliki poza repo/);
      const w = await uruchom(a.adres, [...arg, '--zgoda', plik('bezk.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test' })]);
      expect(w.kod).toBe(5);
      const wRepo = LOKALIZACJE.filter((k) => fs.existsSync(path.join(root, 'docs/wydanie/zrzuty', k)));
      expect(a.zestawy).toHaveLength(wRepo.length * 2);
      expect(a.lokWersji).toHaveLength(LOKALIZACJE.length);
    });
  });

  it('bez wersji iOS w stanie edycji: krok ręczny, bez zapisu metadanych wersji ani zrzutów', async () => {
    await zAtrapa({ bezWersji: true }, async (a) => {
      const w = await uruchom(a.adres);
      expect(w.kod).toBe(0);
      expect(w.wyjscie).toMatch(/ręcznie · wersja iOS 1\.0\.0/);
      expect(a.zapisy()).toEqual([]);
    });
  });

  it('numer wersji w ASC inny niż app.json (1.0 wobec 1.0.0): zmieni numer, potem metadane i zrzuty tej wersji; 0 różnic', async () => {
    await zAtrapa({ numerWersji: '1.0' }, async (a) => {
      const arg = ['--dane', daneTestowe, '--sumy', sumyTestowe, '--zrzuty', zrzutyTestowe];
      const sucho = await uruchom(a.adres, arg);
      expect(sucho.kod).toBe(0);
      expect(sucho.wyjscie).toMatch(/zmieni · numer wersji iOS w edycji: 1\.0\.0 \(teraz 1\.0/);
      expect(a.zapisy()).toEqual([]);
      const w = await uruchom(a.adres, [...arg, '--zgoda', plik('wersja.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test' })]);
      expect(w.wyjscie).toMatch(/Po zapisie: różnice 0/);
      expect(w.kod).toBe(0);
      expect(a.wersje[0].attributes.versionString).toBe('1.0.0');
      expect(a.lokWersji).toHaveLength(LOKALIZACJE.length);
      expect(a.zestawy).toHaveLength(LOKALIZACJE.length * 2);
    });
  });

  it('sumy niezgodne z plikiem w repo: kod 1, bez zapytań zapisu', async () => {
    await zAtrapa({}, async (a) => {
      const zle = JSON.parse(JSON.stringify(sumy));
      zle.lokalizacje.pl['iphone-6.9'][0].md5 = '0'.repeat(32);
      const w = await uruchom(a.adres, ['--sumy', plik('zle-sumy.json', zle)]);
      expect(w.kod).toBe(1);
      expect(w.wyjscie).toMatch(/sumy\.json.*pl.*01-plan\.png/);
      expect(a.zapisy()).toEqual([]);
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
});
