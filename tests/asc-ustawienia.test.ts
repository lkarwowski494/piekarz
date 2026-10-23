/**
 * @jest-environment node
 *
 * Zapis ustawień App Store Connect przez API: scripts/asc-ustawienia.mjs na atrapie API [M1-audytor-generalny-181].
 * - przebieg na sucho wysyła wyłącznie GET i wypisuje listę „utworzy / zmieni / bez zmian” ze skrótem planu;
 * - zapis tylko ze zgodą (docs/wydanie/asc-zgoda.json, "zapis": true) i ze skrótem identycznym z planem w chwili zapisu;
 * - po zapisie stan = docs/wydanie/ceny.json (DEC-01 d, D-038), D-057 (174 storefronty bez CHN), D-058 (ankieta wieku),
 *   bez oferty wprowadzającej (D-112; istniejąca = „ręcznie”, Z-1), Family Sharing (D-039); drugi przebieg na sucho: 0 różnic;
 * - brak punktu cenowego z ceny.json = stop bez zapisu ceny; 403 = komunikat o roli klucza; w wyjściu nie ma klucza ani tokenu.
 * Dlaczego test: produkty i ceny ustawiane ręcznie w 175 storefrontach rozjeżdżają się z decyzjami, a zapis w App Store Connect
 * jest działaniem zewnętrznym, więc każdy błąd skryptu trzeba złapać tutaj, nie na koncie właściciela.
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFile } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
import { AtrapaAsc, OpcjeAtrapy } from './atrapa-asc';
import { PRODUKTY } from '../src/lib/platnosci/konfiguracja';

const root = path.join(__dirname, '..');
const SKRYPT = path.join(root, 'scripts', 'asc-ustawienia.mjs');
const ceny = JSON.parse(fs.readFileSync(path.join(root, 'docs/wydanie/ceny.json'), 'utf8'));
const ustawienia = JSON.parse(fs.readFileSync(path.join(root, 'docs/wydanie/asc-ustawienia.json'), 'utf8'));
const storefronty: { iso: string }[] = JSON.parse(fs.readFileSync(path.join(root, 'docs/wydanie/storefronty.json'), 'utf8')).storefronty;
const TERYTORIA = storefronty.map((s) => s.iso);
const DOSTEPNE = TERYTORIA.filter((t) => t !== 'CHN').sort();

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const PEM = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const KLUCZ_ID = 'ATRAPA7KEY';
const WYSTAWCA = '6a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'asc-ustawienia-'));

type Wynik = { kod: number; wyjscie: string };

function uruchom(api: string, argumenty: string[] = [], env: Record<string, string> = {}): Promise<Wynik> {
  return new Promise((ok) => {
    execFile(
      process.execPath,
      [SKRYPT, '--api', api, ...argumenty],
      {
        env: { NODE_ENV: 'test', PATH: process.env.PATH ?? '', ASC_KEY_ID: KLUCZ_ID, ASC_ISSUER_ID: WYSTAWCA, ASC_KEY_P8: Buffer.from(PEM).toString('base64'), ...env },
        maxBuffer: 32 * 1024 * 1024,
      },
      (blad: Error | null, stdout: string, stderr: string) => ok({ kod: blad ? Number((blad as { code?: number }).code ?? 1) : 0, wyjscie: `${stdout}\n${stderr}` }),
    );
  });
}

const skrot = (w: Wynik) => /Skrót planu: ([0-9a-f]{64})/.exec(w.wyjscie)?.[1] ?? '';
const roznice = (w: Wynik) => Number(/Różnice: (\d+)/.exec(w.wyjscie)?.[1] ?? 'NaN');

function zgoda(nazwa: string, tresc: unknown): string {
  const p = path.join(tmp, nazwa);
  fs.writeFileSync(p, JSON.stringify(tresc));
  return p;
}

async function zAtrapa<T>(opcje: Partial<OpcjeAtrapy>, f: (a: AtrapaAsc) => Promise<T>): Promise<T> {
  const a = new AtrapaAsc({ terytoria: TERYTORIA, bundleId: 'com.apps4brew.baker', kluczPubliczny: publicKey, kluczId: KLUCZ_ID, wystawca: WYSTAWCA, ...opcje });
  await a.start();
  try {
    return await f(a);
  } finally {
    await a.stop();
  }
}

/** Kwota obecnej ceny produktu w terytorium w atrapie (id punktu: pp~rodzaj~właściciel~terytorium~kwota). */
const kwota = (punkt: string) => punkt.split('~')[4];

describe('scripts/asc-ustawienia.mjs na atrapie App Store Connect API (M1-audytor-generalny-181)', () => {
  jest.setTimeout(120000);

  it('przebieg na sucho na pustym koncie: tylko GET, pełna lista „utworzy”, skrót planu', async () => {
    await zAtrapa({}, async (a) => {
      const w = await uruchom(a.adres);
      expect(w.kod).toBe(0);
      expect(a.zapisy()).toEqual([]);
      expect(a.zapytania.length).toBeGreaterThan(0);
      expect(w.wyjscie).toContain('przebieg na sucho');
      expect(skrot(w)).toMatch(/^[0-9a-f]{64}$/);
      expect(roznice(w)).toBeGreaterThan(0);
      for (const id of Object.values(PRODUKTY)) expect(w.wyjscie).toContain(id);
      expect(w.wyjscie).toMatch(/utworzy · grupa subskrypcji „Piekarz Pro”/);
      expect(w.wyjscie).toMatch(/utworzy · .*Family Sharing/);
      expect(w.wyjscie).toMatch(/utworzy · .*174 storefronty/);
    });
  });

  it('bez zgody w pliku (zapis: false) skrypt nie zapisuje', async () => {
    await zAtrapa({}, async (a) => {
      const w = await uruchom(a.adres, ['--zgoda', zgoda('bez.json', { zapis: false, skrot: null })]);
      expect(w.kod).toBe(0);
      expect(a.zapisy()).toEqual([]);
    });
  });

  it('zgoda na inny plan (inny skrót) = odmowa bez zapisu, kod 3', async () => {
    await zAtrapa({}, async (a) => {
      const w = await uruchom(a.adres, ['--zgoda', zgoda('inny.json', { zapis: true, skrot: '0'.repeat(64), zgoda: '2026-10-21: test' })]);
      expect(w.kod).toBe(3);
      expect(a.zapisy()).toEqual([]);
      expect(w.wyjscie).toMatch(/Skrót planu nie zgadza się ze zgodą/);
    });
  });

  it('zapis ze zgodą na pokazany plan: stan zgodny z decyzjami, drugi przebieg na sucho = 0 różnic', async () => {
    await zAtrapa({}, async (a) => {
      const sucho = await uruchom(a.adres);
      const z = zgoda('ok.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test' });
      const w = await uruchom(a.adres, ['--zgoda', z]);
      expect(w.wyjscie).toContain('zapis');
      expect(w.kod).toBe(0);
      expect(w.wyjscie).toMatch(/Po zapisie: różnice 0/);

      // Grupa i produkty (instrukcja §3, D-039)
      expect(a.grupy.map((g) => g.attributes?.referenceName)).toEqual(['Piekarz Pro']);
      expect(a.lokGrup.map((l) => `${l.attributes?.locale}=${l.attributes?.name}`).sort()).toEqual(['en-US=Baker Pro', 'pl=Piekarz Pro']);
      const sub = (plan: 'monthly' | 'yearly') => a.subskrypcje.find((s) => s.attributes?.productId === PRODUKTY[plan])!;
      expect(sub('monthly').attributes).toMatchObject({ subscriptionPeriod: 'ONE_MONTH', familySharable: true, groupLevel: 1, name: 'Piekarz Pro miesięcznie' });
      expect(sub('yearly').attributes).toMatchObject({ subscriptionPeriod: 'ONE_YEAR', familySharable: true, groupLevel: 1, name: 'Piekarz Pro rocznie' });
      expect(a.iap).toHaveLength(1);
      expect(a.iap[0].attributes).toMatchObject({ productId: PRODUKTY.lifetime, inAppPurchaseType: 'NON_CONSUMABLE', familySharable: true, name: 'Piekarz Pro dożywotnio' });
      expect(a.lokSub.filter((l) => l.sub === sub('monthly').id).map((l) => `${l.attributes?.locale}=${l.attributes?.name}`).sort()).toEqual(['en-US=Baker Pro Monthly', 'pl=Piekarz Pro miesięcznie']);
      expect(a.lokIap.map((l) => `${l.attributes?.locale}=${l.attributes?.name}`).sort()).toEqual(['en-US=Baker Pro Lifetime', 'pl=Piekarz Pro dożywotnio']);

      // Dostępność: 174 storefronty bez CHN, nowe kraje (D-057)
      for (const plan of ['monthly', 'yearly'] as const) {
        const d = a.dostSub.get(sub(plan).id)!;
        expect([...d.terytoria].sort()).toEqual(DOSTEPNE);
        expect(d.nowe).toBe(true);
      }
      expect([...a.dostIap.get(a.iap[0].id)!.terytoria].sort()).toEqual(DOSTEPNE);
      expect(a.dostApp!.nowe).toBe(true);
      expect(a.dostApp!.terytoria.filter((t) => t.dostepne).map((t) => t.terytorium).sort()).toEqual(DOSTEPNE);
      expect(a.dostApp!.terytoria.find((t) => t.terytorium === 'CHN')?.dostepne ?? false).toBe(false);

      // Ceny subskrypcji: każdy dostępny storefront, ręczne z ceny.json (D-038), reszta = równoważnik ceny USA
      for (const plan of ['monthly', 'yearly'] as const) {
        const c = a.cenySub.filter((x) => x.wlasciciel === sub(plan).id);
        expect(c.map((x) => x.terytorium).sort()).toEqual(DOSTEPNE);
        for (const [ter, wiersz] of Object.entries(ceny.reczne) as [string, Record<string, string>][]) {
          expect(Number(kwota(c.find((x) => x.terytorium === ter)!.punkt))).toBe(Number(wiersz[plan]));
        }
        expect(Number(kwota(c.find((x) => x.terytorium === 'NOR')!.punkt))).toBe(Number(ceny.reczne.USA[plan]));
      }
      // Dożywotni: baza USA + ręczne storefronty z ceny.json
      const h = a.planyCenIap.get(a.iap[0].id)!;
      expect(h.baza).toBe('USA');
      expect(h.reczne.map((x) => x.terytorium).sort()).toEqual(Object.keys(ceny.reczne).sort());
      for (const x of h.reczne) expect(Number(kwota(x.punkt))).toBe(Number(ceny.reczne[x.terytorium].lifetime));

      // Przepisane z kontraktu D-038 (Free Trial 2 Weeks) [M3 P-a-fix, P1-5]: bez oferty wprowadzającej (D-112) skrypt
      // nie tworzy żadnej oferty
      expect(ceny.ofertaWprowadzajaca).toBeUndefined();
      expect(a.oferty).toEqual([]);

      // Ankieta wieku (D-058)
      expect(a.wiek.attributes).toEqual(ustawienia.ankietaWieku.odpowiedzi);

      const drugi = await uruchom(a.adres);
      expect(drugi.kod).toBe(0);
      expect(roznice(drugi)).toBe(0);
      const zapisyPrzed = a.zapisy().length;
      const ponownie = await uruchom(a.adres, ['--zgoda', z]);
      expect(ponownie.kod).toBe(0);
      expect(a.zapisy().length).toBe(zapisyPrzed);
    });
  });

  // M3 P-a-fix (P1-5, Z-1): oferta „Free Trial 2 Weeks” z D-038 została w App Store Connect — skrypt jej nie tworzy na nowo
  // ani nie usuwa sam; wypisuje ją jako „ręcznie” do usunięcia, a zapis ze zgodą nic przy ofercie nie robi
  it('oferta wprowadzająca w ASC (stan sprzed Z-1): „ręcznie” do usunięcia, zapis jej nie tworzy ani nie usuwa', async () => {
    await zAtrapa({}, async (a) => {
      const sucho = await uruchom(a.adres);
      await uruchom(a.adres, ['--zgoda', zgoda('ok2.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-22: test' })]);
      const roczna = a.subskrypcje.find((s) => s.attributes?.productId === PRODUKTY.yearly)!;
      a.oferty.push({ type: 'subscriptionIntroductoryOffers', id: 'stara_oferta', attributes: { offerMode: 'FREE_TRIAL', duration: 'TWO_WEEKS', numberOfPeriods: 1 }, sub: roczna.id, terytorium: 'POL', relationships: { territory: { data: { type: 'territories', id: 'POL' } } } } as never);
      const w = await uruchom(a.adres);
      expect(w.kod).toBe(0);
      expect(w.wyjscie).toMatch(/ręcznie · .*oferta .*POL.*bez oferty wprowadzającej \(D-112\)/);
      expect(w.wyjscie).not.toMatch(/utworzy · .*oferta/);
      const zapisyPrzed = a.zapisy().length;
      await uruchom(a.adres, ['--zgoda', zgoda('ok3.json', { zapis: true, skrot: skrot(w), zgoda: '2026-10-22: test' })]);
      expect(a.zapisy().length).toBe(zapisyPrzed);
      expect(a.oferty).toHaveLength(1);
    });
  });

  it('brak punktu cenowego z ceny.json: kod ≠ 0, żadna cena nie zapisana', async () => {
    await zAtrapa({ bezPunktow: ['POL:29.99'] }, async (a) => {
      const sucho = await uruchom(a.adres);
      const w = await uruchom(a.adres, ['--zgoda', zgoda('pol.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test' })]);
      expect(w.kod).not.toBe(0);
      expect(w.wyjscie).toMatch(/POL.*29\.99/);
      expect(a.cenySub).toEqual([]);
      expect(a.planyCenIap.size).toBe(0);
      expect(a.oferty).toEqual([]);
    });
  });

  it('403 przy zapisie: kod 4 i komunikat o roli klucza (Admin albo App Manager)', async () => {
    await zAtrapa({ zabronZapis: true }, async (a) => {
      const sucho = await uruchom(a.adres);
      const w = await uruchom(a.adres, ['--zgoda', zgoda('403.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test' })]);
      expect(w.kod).toBe(4);
      expect(w.wyjscie).toMatch(/Admin albo App Manager/);
      expect(a.zapisy()).toHaveLength(1);
    });
  });

  it('w wyjściu nie ma klucza, tokenu JWT, identyfikatora klucza ani wystawcy; klucz PEM też działa', async () => {
    await zAtrapa({}, async (a) => {
      const w = await uruchom(a.adres, [], { ASC_KEY_P8: PEM });
      expect(w.kod).toBe(0);
      const sucho = await uruchom(a.adres);
      await uruchom(a.adres, ['--zgoda', zgoda('jawne.json', { zapis: true, skrot: skrot(sucho), zgoda: '2026-10-21: test' })]);
      for (const x of [w, sucho]) {
        expect(x.wyjscie).not.toContain(KLUCZ_ID);
        expect(x.wyjscie).not.toContain(WYSTAWCA);
        expect(x.wyjscie).not.toMatch(/eyJ[\w-]+\.[\w-]+\./);
        expect(x.wyjscie).not.toMatch(/PRIVATE KEY|MIG/);
      }
    });
  });

  it('bez sekretów: kod 1 z nazwą brakującej zmiennej, bez zapytań do API', async () => {
    await zAtrapa({}, async (a) => {
      const w = await uruchom(a.adres, [], { ASC_KEY_ID: '' });
      expect(w.kod).toBe(1);
      expect(w.wyjscie).toMatch(/ASC_KEY_ID/);
      expect(a.zapytania).toEqual([]);
    });
  });
});
