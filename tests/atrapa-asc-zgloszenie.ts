// ============================================================================
// Piekarz — atrapa App Store Connect API dla testu scripts/asc-zgloszenie.mjs
// [M1-audytor-generalny-186]. Lokalny serwer HTTP ze stanem w pamięci: aplikacja,
// App Information i wersja iOS z lokalizacjami, zestawy zrzutów, produkty po torze
// p8b (lokalizacje en-US i pl) i zrzuty dla App Review. Wysyłanie plików jak w Apple:
// POST zwraca uploadOperations, PUT fragmentów, PATCH uploaded + sourceFileChecksum
// (atrapa liczy MD5 otrzymanych bajtów i odrzuca niezgodną sumę). Sprawdza JWT ES256.
// ============================================================================

import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';
import { createHash, KeyObject, verify } from 'node:crypto';

type Atrybuty = Record<string, unknown>;
type Zasob = { type: string; id: string; attributes: Atrybuty; relationships?: Record<string, { data: unknown }> };
type Plik = Zasob & { wlasciciel: string; bajty: Buffer[] };

export type OpcjeAtrapy = {
  bundleId: string;
  kluczPubliczny: KeyObject;
  kluczId: string;
  wystawca: string;
  produkty: { monthly: string; yearly: string; lifetime: string };
  /** Bez wersji iOS w stanie edycji. */
  bezWersji?: boolean;
  /** Każde zapytanie inne niż GET dostaje 403 FORBIDDEN_ERROR. */
  zabronZapis?: boolean;
};

export type Zapytanie = { metoda: string; sciezka: string };

const STRONA = 50;
const md5 = (b: Buffer) => createHash('md5').update(b).digest('hex');

export class AtrapaZgloszenia {
  readonly zapytania: Zapytanie[] = [];
  readonly lokInfo: (Zasob & { info: string })[] = [];
  readonly wersje: Zasob[] = [];
  readonly lokWersji: (Zasob & { wersja: string })[] = [];
  readonly zestawy: (Zasob & { lok: string; kolejnosc: string[] })[] = [];
  readonly zrzuty: Plik[] = [];
  readonly zrzutyReview: Plik[] = [];
  readonly subskrypcje: Zasob[] = [];
  readonly iap: Zasob[] = [];
  readonly lokProduktow: (Zasob & { produkt: string })[] = [];
  private licznik = 0;
  private serwer: Server | null = null;
  adres = '';

  constructor(private readonly o: OpcjeAtrapy) {
    // Stan po torze p8b i po utworzeniu aplikacji w App Store Connect: App Information z lokalizacją
    // en-US (nazwa z TestFlight), wersja 1.0 w przygotowaniu z pustą lokalizacją en-US.
    this.lokInfo.push({ type: 'appInfoLocalizations', id: 'ail-0', info: 'info-1', attributes: { locale: 'en-US', name: 'Piekarz', subtitle: null, privacyPolicyUrl: null } });
    if (!o.bezWersji) {
      this.wersje.push({ type: 'appStoreVersions', id: 'ver-1', attributes: { platform: 'IOS', versionString: '1.0.0', appStoreState: 'PREPARE_FOR_SUBMISSION', appVersionState: 'PREPARE_FOR_SUBMISSION' } });
      this.lokWersji.push({ type: 'appStoreVersionLocalizations', id: 'avl-0', wersja: 'ver-1', attributes: { locale: 'en-US', description: null, keywords: null, promotionalText: null, supportUrl: null } });
    }
    const p = o.produkty;
    this.subskrypcje.push({ type: 'subscriptions', id: 'sub-m', attributes: { productId: p.monthly } }, { type: 'subscriptions', id: 'sub-y', attributes: { productId: p.yearly } });
    this.iap.push({ type: 'inAppPurchases', id: 'iap-l', attributes: { productId: p.lifetime } });
    for (const [produkt, nazwy] of [['sub-m', ['Baker Pro Monthly', 'Piekarz Pro miesięcznie']], ['sub-y', ['Baker Pro Yearly', 'Piekarz Pro rocznie']], ['iap-l', ['Baker Pro Lifetime', 'Piekarz Pro dożywotnio']]] as const) {
      this.lokProduktow.push({ type: produkt.startsWith('sub') ? 'subscriptionLocalizations' : 'inAppPurchaseLocalizations', id: `lp-${produkt}-en`, produkt, attributes: { locale: 'en-US', name: nazwy[0], description: null } });
      this.lokProduktow.push({ type: produkt.startsWith('sub') ? 'subscriptionLocalizations' : 'inAppPurchaseLocalizations', id: `lp-${produkt}-pl`, produkt, attributes: { locale: 'pl', name: nazwy[1], description: null } });
    }
  }

  start(): Promise<string> {
    return new Promise((ok) => {
      this.serwer = createServer((req, res) => this.obsluz(req, res));
      this.serwer.listen(0, '127.0.0.1', () => {
        this.adres = `http://127.0.0.1:${(this.serwer!.address() as AddressInfo).port}`;
        ok(this.adres);
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((ok) => (this.serwer ? this.serwer.close(() => ok()) : ok()));
  }

  /** Zapytania zmieniające stan ASC (bez PUT fragmentów do magazynu plików). */
  zapisy(): Zapytanie[] {
    return this.zapytania.filter((z) => z.metoda !== 'GET');
  }

  /** Sumy MD5 zrzutów w zestawie, w kolejności zestawu. */
  sumyZestawu(locale: string, typ: string): string[] {
    const lok = this.lokWersji.find((l) => l.attributes.locale === locale);
    const z = this.zestawy.find((s) => s.lok === lok?.id && s.attributes.screenshotDisplayType === typ);
    return (z?.kolejnosc ?? []).map((id) => this.zrzuty.find((x) => x.id === id)!.attributes.sourceFileChecksum as string);
  }

  private nowyId(p: string): string {
    this.licznik += 1;
    return `${p}-${this.licznik}`;
  }

  private autoryzacja(req: IncomingMessage): boolean {
    const m = /^Bearer ([\w-]+)\.([\w-]+)\.([\w-]+)$/.exec(req.headers.authorization ?? '');
    if (!m) return false;
    const naglowek = JSON.parse(Buffer.from(m[1], 'base64url').toString('utf8'));
    const tresc = JSON.parse(Buffer.from(m[2], 'base64url').toString('utf8'));
    const podpisOk = verify('sha256', Buffer.from(`${m[1]}.${m[2]}`), { key: this.o.kluczPubliczny, dsaEncoding: 'ieee-p1363' }, Buffer.from(m[3], 'base64url'));
    const teraz = Math.floor(Date.now() / 1000);
    return podpisOk && naglowek.alg === 'ES256' && naglowek.kid === this.o.kluczId && tresc.iss === this.o.wystawca && tresc.aud === 'appstoreconnect-v1' && tresc.exp > teraz;
  }

  private wyslij(res: ServerResponse, kod: number, cialo?: unknown): void {
    res.writeHead(kod, { 'Content-Type': 'application/json' });
    res.end(cialo === undefined ? '' : JSON.stringify(cialo));
  }

  private lista(res: ServerResponse, url: URL, dane: Zasob[], dolaczone: Zasob[] = []): void {
    const od = Number(url.searchParams.get('cursor') ?? '0');
    const strona = dane.slice(od, od + STRONA);
    const links: Record<string, string> = { self: url.toString() };
    if (od + STRONA < dane.length) {
      const nast = new URL(url.toString());
      nast.searchParams.set('cursor', String(od + STRONA));
      links.next = nast.toString();
    }
    this.wyslij(res, 200, { data: strona.map(({ type, id, attributes, relationships }) => ({ type, id, attributes, relationships })), included: dolaczone, links });
  }

  private obsluz(req: IncomingMessage, res: ServerResponse): void {
    const kawalki: Buffer[] = [];
    req.on('data', (c: Buffer) => kawalki.push(c));
    req.on('end', () => {
      const url = new URL(req.url ?? '/', this.adres);
      const metoda = req.method ?? 'GET';
      const bajty = Buffer.concat(kawalki);
      // Magazyn plików Apple: adres z uploadOperations, bez nagłówka Authorization.
      const mu = /^\/magazyn\/([^/]+)$/.exec(url.pathname);
      if (mu) {
        const plik = [...this.zrzuty, ...this.zrzutyReview].find((z) => z.id === mu[1]);
        if (metoda !== 'PUT' || !plik || req.headers.authorization) return this.wyslij(res, 400, {});
        plik.bajty.push(bajty);
        return this.wyslij(res, 200);
      }
      this.zapytania.push({ metoda, sciezka: url.pathname });
      if (!this.autoryzacja(req)) return this.wyslij(res, 401, { errors: [{ status: '401', code: 'NOT_AUTHORIZED', title: 'Authentication credentials are missing or invalid.' }] });
      if (metoda !== 'GET' && this.o.zabronZapis) return this.wyslij(res, 403, { errors: [{ status: '403', code: 'FORBIDDEN_ERROR', title: 'This request is forbidden for security reasons' }] });
      try {
        const cialo = bajty.length ? JSON.parse(bajty.toString('utf8')) : null;
        if (metoda === 'GET') this.odczyt(res, url);
        else this.zapis(res, metoda, url.pathname, cialo);
      } catch (e) {
        this.wyslij(res, 500, { errors: [{ status: '500', code: 'ATRAPA', title: String(e) }] });
      }
    });
  }

  private zasobPliku(p: Plik): Zasob {
    return { type: p.type, id: p.id, attributes: p.attributes };
  }

  private odczyt(res: ServerResponse, url: URL): void {
    const p = url.pathname;
    let m: RegExpExecArray | null;
    if (p === '/v1/apps') return this.lista(res, url, url.searchParams.get('filter[bundleId]') === this.o.bundleId ? [{ type: 'apps', id: 'app-1', attributes: { bundleId: this.o.bundleId } }] : []);
    if (p === '/v1/apps/app-1/appInfos') return this.lista(res, url, [{ type: 'appInfos', id: 'info-1', attributes: { state: 'PREPARE_FOR_SUBMISSION' } }]);
    if (p === '/v1/appInfos/info-1/appInfoLocalizations') return this.lista(res, url, this.lokInfo);
    if (p === '/v1/apps/app-1/appStoreVersions') {
      const platforma = url.searchParams.get('filter[platform]');
      return this.lista(res, url, this.wersje.filter((w) => !platforma || w.attributes.platform === platforma));
    }
    if ((m = /^\/v1\/appStoreVersions\/([^/]+)\/appStoreVersionLocalizations$/.exec(p))) return this.lista(res, url, this.lokWersji.filter((l) => l.wersja === m![1]));
    if ((m = /^\/v1\/appStoreVersionLocalizations\/([^/]+)\/appScreenshotSets$/.exec(p))) {
      const zestawy = this.zestawy.filter((z) => z.lok === m![1]).map((z) => ({ ...z, relationships: { appScreenshots: { data: z.kolejnosc.map((id) => ({ type: 'appScreenshots', id })) } } }));
      const dolaczone = url.searchParams.get('include') === 'appScreenshots' ? zestawy.flatMap((z) => z.kolejnosc.map((id) => this.zasobPliku(this.zrzuty.find((x) => x.id === id)!))) : [];
      return this.lista(res, url, zestawy, dolaczone);
    }
    if (p === '/v1/apps/app-1/inAppPurchasesV2') {
      const pid = url.searchParams.get('filter[productId]');
      return this.lista(res, url, this.iap.filter((i) => !pid || i.attributes.productId === pid));
    }
    if (p === '/v1/apps/app-1/subscriptionGroups') return this.lista(res, url, [{ type: 'subscriptionGroups', id: 'grupa-1', attributes: { referenceName: 'Piekarz Pro' } }]);
    if (p === '/v1/subscriptionGroups/grupa-1/subscriptions') return this.lista(res, url, this.subskrypcje);
    if ((m = /^\/v1\/subscriptions\/([^/]+)\/subscriptionLocalizations$/.exec(p)) || (m = /^\/v2\/inAppPurchases\/([^/]+)\/inAppPurchaseLocalizations$/.exec(p))) return this.lista(res, url, this.lokProduktow.filter((l) => l.produkt === m![1]));
    if ((m = /^\/v1\/subscriptions\/([^/]+)\/appStoreReviewScreenshot$/.exec(p)) || (m = /^\/v2\/inAppPurchases\/([^/]+)\/appStoreReviewScreenshot$/.exec(p))) {
      const z = this.zrzutyReview.find((x) => x.wlasciciel === m![1]);
      return z ? this.wyslij(res, 200, { data: this.zasobPliku(z) }) : this.wyslij(res, 404, { errors: [{ status: '404' }] });
    }
    this.wyslij(res, 404, { errors: [{ status: '404', code: 'NOT_FOUND', title: `atrapa: brak ${p}` }] });
  }

  private nowyPlik(typ: string, wlasciciel: string, a: Atrybuty): Plik {
    const id = this.nowyId(typ);
    const rozmiar = Number(a.fileSize);
    const polowa = Math.ceil(rozmiar / 2);
    // Dwa fragmenty, żeby skrypt musiał wysłać plik w częściach według offset/length.
    const operacje = [
      { method: 'PUT', url: `${this.adres}/magazyn/${id}`, length: polowa, offset: 0, requestHeaders: [{ name: 'Content-Type', value: 'image/png' }] },
      { method: 'PUT', url: `${this.adres}/magazyn/${id}`, length: rozmiar - polowa, offset: polowa, requestHeaders: [{ name: 'Content-Type', value: 'image/png' }] },
    ].filter((o) => o.length > 0);
    return { type: typ, id, wlasciciel, bajty: [], attributes: { fileName: a.fileName, fileSize: rozmiar, sourceFileChecksum: null, uploadOperations: operacje, assetDeliveryState: { state: 'AWAITING_UPLOAD' } } };
  }

  private zapis(res: ServerResponse, metoda: string, p: string, cialo: { data: Zasob & { relationships: Record<string, { data: any }> } } | null): void {
    const d = cialo?.data;
    const a = d?.attributes ?? {};
    const rel = (k: string) => d?.relationships?.[k]?.data;
    let m: RegExpExecArray | null;
    if (metoda === 'POST' && p === '/v1/appInfoLocalizations') {
      if (rel('appInfo')?.id !== 'info-1' || this.lokInfo.some((l) => l.attributes.locale === a.locale)) return this.wyslij(res, 409, {});
      const z = { type: 'appInfoLocalizations', id: this.nowyId('ail'), info: 'info-1', attributes: { ...a } };
      this.lokInfo.push(z);
      return this.wyslij(res, 201, { data: z });
    }
    if (metoda === 'POST' && p === '/v1/appStoreVersionLocalizations') {
      const w = rel('appStoreVersion')?.id;
      if (!this.wersje.some((x) => x.id === w) || this.lokWersji.some((l) => l.wersja === w && l.attributes.locale === a.locale)) return this.wyslij(res, 409, {});
      const z = { type: 'appStoreVersionLocalizations', id: this.nowyId('avl'), wersja: w, attributes: { ...a } };
      this.lokWersji.push(z);
      return this.wyslij(res, 201, { data: z });
    }
    if (metoda === 'PATCH' && ((m = /^\/v1\/(appInfoLocalizations|appStoreVersionLocalizations|subscriptionLocalizations|inAppPurchaseLocalizations)\/([^/]+)$/.exec(p)))) {
      const zbior = ({ appInfoLocalizations: this.lokInfo, appStoreVersionLocalizations: this.lokWersji, subscriptionLocalizations: this.lokProduktow, inAppPurchaseLocalizations: this.lokProduktow } as Record<string, Zasob[]>)[m[1]];
      const z = zbior.find((x) => x.id === m![2]);
      if (!z) return this.wyslij(res, 404, {});
      if ('locale' in a) return this.wyslij(res, 409, { errors: [{ status: '409', title: 'locale nie do zmiany' }] });
      Object.assign(z.attributes, a);
      return this.wyslij(res, 200, { data: z });
    }
    if (metoda === 'POST' && p === '/v1/appScreenshotSets') {
      const lok = rel('appStoreVersionLocalization')?.id;
      if (!this.lokWersji.some((l) => l.id === lok) || this.zestawy.some((z) => z.lok === lok && z.attributes.screenshotDisplayType === a.screenshotDisplayType)) return this.wyslij(res, 409, {});
      const z = { type: 'appScreenshotSets', id: this.nowyId('set'), lok, kolejnosc: [] as string[], attributes: { ...a } };
      this.zestawy.push(z);
      return this.wyslij(res, 201, { data: { type: z.type, id: z.id, attributes: z.attributes } });
    }
    if (metoda === 'POST' && (p === '/v1/appScreenshots' || p === '/v1/subscriptionAppStoreReviewScreenshots' || p === '/v1/inAppPurchaseAppStoreReviewScreenshots')) {
      if (p === '/v1/appScreenshots') {
        const zestaw = this.zestawy.find((z) => z.id === rel('appScreenshotSet')?.id);
        if (!zestaw) return this.wyslij(res, 409, {});
        const plik = this.nowyPlik('appScreenshots', zestaw.id, a);
        this.zrzuty.push(plik);
        zestaw.kolejnosc.push(plik.id);
        return this.wyslij(res, 201, { data: this.zasobPliku(plik) });
      }
      const wl = (rel('subscription') ?? rel('inAppPurchaseV2'))?.id;
      if (!wl || this.zrzutyReview.some((z) => z.wlasciciel === wl)) return this.wyslij(res, 409, {});
      const plik = this.nowyPlik(p.includes('subscription') ? 'subscriptionAppStoreReviewScreenshots' : 'inAppPurchaseAppStoreReviewScreenshots', wl, a);
      this.zrzutyReview.push(plik);
      return this.wyslij(res, 201, { data: this.zasobPliku(plik) });
    }
    if (metoda === 'PATCH' && (m = /^\/v1\/(appScreenshots|subscriptionAppStoreReviewScreenshots|inAppPurchaseAppStoreReviewScreenshots)\/([^/]+)$/.exec(p))) {
      const plik = [...this.zrzuty, ...this.zrzutyReview].find((z) => z.id === m![2]);
      if (!plik) return this.wyslij(res, 404, {});
      const calosc = Buffer.concat(plik.bajty);
      if (a.uploaded !== true || calosc.length !== plik.attributes.fileSize || md5(calosc) !== a.sourceFileChecksum) {
        return this.wyslij(res, 409, { errors: [{ status: '409', title: 'suma albo rozmiar pliku niezgodne z wysłanymi bajtami' }] });
      }
      Object.assign(plik.attributes, { sourceFileChecksum: a.sourceFileChecksum, uploadOperations: null, assetDeliveryState: { state: 'COMPLETE' } });
      return this.wyslij(res, 200, { data: this.zasobPliku(plik) });
    }
    if (metoda === 'DELETE' && (m = /^\/v1\/(appScreenshots|subscriptionAppStoreReviewScreenshots|inAppPurchaseAppStoreReviewScreenshots)\/([^/]+)$/.exec(p))) {
      const zbior = m[1] === 'appScreenshots' ? this.zrzuty : this.zrzutyReview;
      const i = zbior.findIndex((z) => z.id === m![2]);
      if (i < 0) return this.wyslij(res, 404, {});
      zbior.splice(i, 1);
      for (const z of this.zestawy) z.kolejnosc = z.kolejnosc.filter((id) => id !== m![2]);
      return this.wyslij(res, 204);
    }
    if (metoda === 'PATCH' && (m = /^\/v1\/appScreenshotSets\/([^/]+)\/relationships\/appScreenshots$/.exec(p))) {
      const zestaw = this.zestawy.find((z) => z.id === m![1]);
      const ids = ((cialo as unknown as { data: { id: string }[] }).data ?? []).map((x) => x.id);
      if (!zestaw || ids.length !== zestaw.kolejnosc.length || ids.some((id) => !zestaw.kolejnosc.includes(id))) return this.wyslij(res, 409, {});
      zestaw.kolejnosc = ids;
      return this.wyslij(res, 204);
    }
    this.wyslij(res, 404, { errors: [{ status: '404', code: 'NOT_FOUND', title: `atrapa: brak ${metoda} ${p}` }] });
  }
}
