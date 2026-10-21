// ============================================================================
// Piekarz — atrapa App Store Connect API dla testu scripts/asc-ustawienia.mjs
// [M1-audytor-generalny-181]. Lokalny serwer HTTP ze stanem w pamięci: tylko
// zasoby i relacje, których używa skrypt, w kształcie JSON:API z dokumentacji
// Apple (data / included / links.next). Sprawdza podpis JWT ES256 kluczem
// publicznym z testu. Stronicuje po 50, żeby skrypt musiał iść za links.next.
// ============================================================================

import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';
import { KeyObject, verify } from 'node:crypto';

type Atrybuty = Record<string, unknown>;
type Zasob = { type: string; id: string; attributes?: Atrybuty; relationships?: Record<string, { data: unknown }> };
type Cena = { id: string; wlasciciel: string; punkt: string; terytorium: string };

export type OpcjeAtrapy = {
  terytoria: string[];
  bundleId: string;
  kluczPubliczny: KeyObject;
  kluczId: string;
  wystawca: string;
  /** Kwoty punktów cenowych, których atrapa nie ma: `${terytorium}:${kwota}`. */
  bezPunktow?: string[];
  /** Każde zapytanie inne niż GET dostaje 403 FORBIDDEN_ERROR. */
  zabronZapis?: boolean;
};

export type Zapytanie = { metoda: string; sciezka: string };

const KWOTY = ['0.99', '1.99', '4.99', '6.99', '7.99', '9.99', '14.99', '17.99', '19', '19.99', '22.99', '29.99', '79.99', '149', '299'];
const STRONA = 50;

export class AtrapaAsc {
  readonly zapytania: Zapytanie[] = [];
  readonly grupy: Zasob[] = [];
  readonly lokGrup: (Zasob & { grupa: string })[] = [];
  readonly subskrypcje: (Zasob & { grupa: string })[] = [];
  readonly lokSub: (Zasob & { sub: string })[] = [];
  readonly dostSub = new Map<string, { id: string; nowe: boolean; terytoria: string[] }>();
  readonly cenySub: Cena[] = [];
  readonly oferty: (Zasob & { sub: string; terytorium: string })[] = [];
  readonly iap: Zasob[] = [];
  readonly lokIap: (Zasob & { iap: string })[] = [];
  readonly dostIap = new Map<string, { id: string; nowe: boolean; terytoria: string[] }>();
  readonly planyCenIap = new Map<string, { id: string; baza: string; reczne: Cena[] }>();
  dostApp: { id: string; nowe: boolean; terytoria: { id: string; terytorium: string; dostepne: boolean }[] } | null = null;
  readonly wiek: Zasob = { type: 'ageRatingDeclarations', id: 'wiek-1', attributes: {} };
  private licznik = 0;
  private serwer: Server | null = null;
  adres = '';

  constructor(private readonly o: OpcjeAtrapy) {}

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

  zapisy(): Zapytanie[] {
    return this.zapytania.filter((z) => z.metoda !== 'GET');
  }

  private nowyId(p: string): string {
    this.licznik += 1;
    return `${p}-${this.licznik}`;
  }

  private punkt(rodzaj: 's' | 'i', wlasciciel: string, terytorium: string, kwota: string): Zasob {
    return {
      type: rodzaj === 's' ? 'subscriptionPricePoints' : 'inAppPurchasePricePoints',
      id: `pp~${rodzaj}~${wlasciciel}~${terytorium}~${kwota}`,
      attributes: { customerPrice: kwota },
      relationships: { territory: { data: { type: 'territories', id: terytorium } } },
    };
  }

  private punktyTerytorium(rodzaj: 's' | 'i', wlasciciel: string, terytorium: string): Zasob[] {
    return KWOTY.filter((k) => !(this.o.bezPunktow ?? []).includes(`${terytorium}:${k}`)).map((k) => this.punkt(rodzaj, wlasciciel, terytorium, k));
  }

  private kwotaPunktu(id: string): string {
    return id.split('~')[4];
  }

  private autoryzacja(req: IncomingMessage): boolean {
    const m = /^Bearer ([\w-]+)\.([\w-]+)\.([\w-]+)$/.exec(req.headers.authorization ?? '');
    if (!m) return false;
    const naglowek = JSON.parse(Buffer.from(m[1], 'base64url').toString('utf8'));
    const tresc = JSON.parse(Buffer.from(m[2], 'base64url').toString('utf8'));
    const podpisOk = verify('sha256', Buffer.from(`${m[1]}.${m[2]}`), { key: this.o.kluczPubliczny, dsaEncoding: 'ieee-p1363' }, Buffer.from(m[3], 'base64url'));
    const teraz = Math.floor(Date.now() / 1000);
    return (
      podpisOk &&
      naglowek.alg === 'ES256' &&
      naglowek.kid === this.o.kluczId &&
      tresc.iss === this.o.wystawca &&
      tresc.aud === 'appstoreconnect-v1' &&
      tresc.exp > teraz &&
      tresc.exp - tresc.iat <= 1200
    );
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
    const ids = new Set(strona.flatMap((z) => Object.values(z.relationships ?? {}).map((r) => (r.data as { id?: string } | null)?.id)));
    this.wyslij(res, 200, { data: strona, included: dolaczone.filter((d) => ids.has(d.id)), links });
  }

  private zasobCeny(c: Cena, typ: string, relPunktu: string): Zasob {
    return {
      type: typ,
      id: c.id,
      attributes: { startDate: null },
      relationships: { [relPunktu]: { data: { id: c.punkt } }, territory: { data: { type: 'territories', id: c.terytorium } } },
    };
  }

  private obsluz(req: IncomingMessage, res: ServerResponse): void {
    let tekst = '';
    req.on('data', (c) => (tekst += c));
    req.on('end', () => {
      const url = new URL(req.url ?? '/', this.adres);
      const metoda = req.method ?? 'GET';
      this.zapytania.push({ metoda, sciezka: url.pathname });
      if (!this.autoryzacja(req)) return this.wyslij(res, 401, { errors: [{ status: '401', code: 'NOT_AUTHORIZED', title: 'Authentication credentials are missing or invalid.' }] });
      if (metoda !== 'GET' && this.o.zabronZapis) {
        return this.wyslij(res, 403, { errors: [{ status: '403', code: 'FORBIDDEN_ERROR', title: 'This request is forbidden for security reasons', detail: "The API key in use does not allow this request" }] });
      }
      try {
        const cialo = tekst ? JSON.parse(tekst) : null;
        if (metoda === 'GET') this.odczyt(res, url);
        else this.zapis(res, metoda, url.pathname, cialo);
      } catch (e) {
        this.wyslij(res, 500, { errors: [{ status: '500', code: 'ATRAPA', title: String(e) }] });
      }
    });
  }

  private odczyt(res: ServerResponse, url: URL): void {
    const p = url.pathname;
    const filtrTer = (url.searchParams.get('filter[territory]') ?? '').split(',').filter(Boolean);
    let m: RegExpExecArray | null;
    if (p === '/v1/apps') {
      const dane = url.searchParams.get('filter[bundleId]') === this.o.bundleId ? [{ type: 'apps', id: 'app-1', attributes: { bundleId: this.o.bundleId } }] : [];
      return this.lista(res, url, dane);
    }
    if (p === '/v1/apps/app-1/subscriptionGroups') return this.lista(res, url, this.grupy);
    if ((m = /^\/v1\/subscriptionGroups\/([^/]+)\/subscriptionGroupLocalizations$/.exec(p))) return this.lista(res, url, this.lokGrup.filter((l) => l.grupa === m![1]));
    if ((m = /^\/v1\/subscriptionGroups\/([^/]+)\/subscriptions$/.exec(p))) return this.lista(res, url, this.subskrypcje.filter((s) => s.grupa === m![1]));
    if ((m = /^\/v1\/subscriptions\/([^/]+)\/subscriptionLocalizations$/.exec(p))) return this.lista(res, url, this.lokSub.filter((l) => l.sub === m![1]));
    if ((m = /^\/v1\/subscriptions\/([^/]+)\/subscriptionAvailability$/.exec(p))) {
      const d = this.dostSub.get(m[1]);
      return d ? this.wyslij(res, 200, { data: { type: 'subscriptionAvailabilities', id: d.id, attributes: { availableInNewTerritories: d.nowe } } }) : this.wyslij(res, 404, { errors: [{ status: '404' }] });
    }
    if ((m = /^\/v1\/(subscription|inAppPurchase)Availabilities\/([^/]+)\/availableTerritories$/.exec(p))) {
      const zrodlo = m[1] === 'subscription' ? this.dostSub : this.dostIap;
      const d = [...zrodlo.values()].find((x) => x.id === m![2]);
      return this.lista(res, url, (d?.terytoria ?? []).map((t) => ({ type: 'territories', id: t })));
    }
    if ((m = /^\/v1\/subscriptions\/([^/]+)\/prices$/.exec(p))) {
      const ceny = this.cenySub.filter((c) => c.wlasciciel === m![1]);
      const punkty = ceny.map((c) => this.punkt('s', m![1], c.terytorium, this.kwotaPunktu(c.punkt)));
      return this.lista(res, url, ceny.map((c) => this.zasobCeny(c, 'subscriptionPrices', 'subscriptionPricePoint')), punkty);
    }
    if ((m = /^\/v1\/subscriptions\/([^/]+)\/introductoryOffers$/.exec(p))) return this.lista(res, url, this.oferty.filter((o) => o.sub === m![1]));
    if ((m = /^\/v1\/subscriptions\/([^/]+)\/pricePoints$/.exec(p))) return this.lista(res, url, filtrTer.flatMap((t) => this.punktyTerytorium('s', m![1], t)));
    if ((m = /^\/v1\/subscriptionPricePoints\/([^/]+)\/equalizations$/.exec(p))) {
      const [, , wl, ter, kwota] = decodeURIComponent(m[1]).split('~');
      return this.lista(res, url, this.o.terytoria.filter((t) => t !== ter).map((t) => this.punkt('s', wl, t, kwota)));
    }
    if (p === '/v1/apps/app-1/inAppPurchasesV2') {
      const pid = url.searchParams.get('filter[productId]');
      return this.lista(res, url, this.iap.filter((i) => !pid || i.attributes?.productId === pid));
    }
    if ((m = /^\/v2\/inAppPurchases\/([^/]+)\/inAppPurchaseLocalizations$/.exec(p))) return this.lista(res, url, this.lokIap.filter((l) => l.iap === m![1]));
    if ((m = /^\/v2\/inAppPurchases\/([^/]+)\/inAppPurchaseAvailability$/.exec(p))) {
      const d = this.dostIap.get(m[1]);
      return d ? this.wyslij(res, 200, { data: { type: 'inAppPurchaseAvailabilities', id: d.id, attributes: { availableInNewTerritories: d.nowe } } }) : this.wyslij(res, 404, { errors: [{ status: '404' }] });
    }
    if ((m = /^\/v2\/inAppPurchases\/([^/]+)\/iapPriceSchedule$/.exec(p))) {
      const h = this.planyCenIap.get(m[1]);
      return h ? this.wyslij(res, 200, { data: { type: 'inAppPurchasePriceSchedules', id: h.id } }) : this.wyslij(res, 404, { errors: [{ status: '404' }] });
    }
    if ((m = /^\/v1\/inAppPurchasePriceSchedules\/([^/]+)\/baseTerritory$/.exec(p))) {
      const h = [...this.planyCenIap.values()].find((x) => x.id === m![1]);
      return this.wyslij(res, 200, { data: h ? { type: 'territories', id: h.baza } : null });
    }
    if ((m = /^\/v1\/inAppPurchasePriceSchedules\/([^/]+)\/manualPrices$/.exec(p))) {
      const h = [...this.planyCenIap.entries()].find(([, x]) => x.id === m![1]);
      const ceny = h ? h[1].reczne : [];
      const punkty = ceny.map((c) => this.punkt('i', h![0], c.terytorium, this.kwotaPunktu(c.punkt)));
      return this.lista(res, url, ceny.map((c) => this.zasobCeny(c, 'inAppPurchasePrices', 'inAppPurchasePricePoint')), punkty);
    }
    if ((m = /^\/v2\/inAppPurchases\/([^/]+)\/pricePoints$/.exec(p))) return this.lista(res, url, filtrTer.flatMap((t) => this.punktyTerytorium('i', m![1], t)));
    if (p === '/v1/apps/app-1/appAvailabilityV2') {
      const d = this.dostApp;
      return d ? this.wyslij(res, 200, { data: { type: 'appAvailabilities', id: d.id, attributes: { availableInNewTerritories: d.nowe } } }) : this.wyslij(res, 404, { errors: [{ status: '404' }] });
    }
    if ((m = /^\/v2\/appAvailabilities\/([^/]+)\/territoryAvailabilities$/.exec(p))) {
      const t = this.dostApp?.id === m[1] ? this.dostApp.terytoria : [];
      return this.lista(res, url, t.map((x) => ({ type: 'territoryAvailabilities', id: x.id, attributes: { available: x.dostepne }, relationships: { territory: { data: { type: 'territories', id: x.terytorium } } } })));
    }
    if (p === '/v1/apps/app-1/appInfos') return this.lista(res, url, [{ type: 'appInfos', id: 'info-1', attributes: { state: 'PREPARE_FOR_SUBMISSION' } }]);
    if (p === '/v1/appInfos/info-1/ageRatingDeclaration') return this.wyslij(res, 200, { data: this.wiek });
    this.wyslij(res, 404, { errors: [{ status: '404', code: 'NOT_FOUND', title: `atrapa: brak ${p}` }] });
  }

  private zapis(res: ServerResponse, metoda: string, p: string, cialo: { data: Zasob & { relationships: Record<string, { data: any }> }; included?: Zasob[] }): void {
    const d = cialo.data;
    const a = d.attributes ?? {};
    const rel = (k: string) => d.relationships?.[k]?.data;
    const utworz = (typ: string) => ({ type: typ, id: this.nowyId(typ), attributes: { ...a } });
    let m: RegExpExecArray | null;
    if (metoda === 'POST' && p === '/v1/subscriptionGroups') {
      if (rel('app')?.id !== 'app-1') return this.wyslij(res, 409, {});
      const z = utworz('subscriptionGroups');
      this.grupy.push(z);
      return this.wyslij(res, 201, { data: z });
    }
    if (metoda === 'POST' && p === '/v1/subscriptionGroupLocalizations') {
      const z = { ...utworz('subscriptionGroupLocalizations'), grupa: rel('subscriptionGroup').id };
      this.lokGrup.push(z);
      return this.wyslij(res, 201, { data: z });
    }
    if (metoda === 'POST' && p === '/v1/subscriptions') {
      const z = { ...utworz('subscriptions'), grupa: rel('group').id };
      this.subskrypcje.push(z);
      return this.wyslij(res, 201, { data: z });
    }
    if (metoda === 'POST' && p === '/v1/subscriptionLocalizations') {
      const z = { ...utworz('subscriptionLocalizations'), sub: rel('subscription').id };
      this.lokSub.push(z);
      return this.wyslij(res, 201, { data: z });
    }
    if (metoda === 'POST' && (p === '/v1/subscriptionAvailabilities' || p === '/v1/inAppPurchaseAvailabilities')) {
      const sub = p.includes('subscription');
      const wl = rel(sub ? 'subscription' : 'inAppPurchase').id;
      const z = { id: this.nowyId('dost'), nowe: a.availableInNewTerritories === true, terytoria: (rel('availableTerritories') as { id: string }[]).map((t) => t.id) };
      (sub ? this.dostSub : this.dostIap).set(wl, z);
      return this.wyslij(res, 201, { data: { type: sub ? 'subscriptionAvailabilities' : 'inAppPurchaseAvailabilities', id: z.id } });
    }
    if (metoda === 'POST' && p === '/v1/subscriptionPrices') {
      const sub = rel('subscription').id;
      const punkt = rel('subscriptionPricePoint').id;
      const ter = rel('territory')?.id ?? punkt.split('~')[3];
      if (punkt.split('~')[3] !== ter) return this.wyslij(res, 409, { errors: [{ status: '409', title: 'punkt z innego terytorium' }] });
      const stare = this.cenySub.findIndex((c) => c.wlasciciel === sub && c.terytorium === ter);
      if (stare >= 0) this.cenySub.splice(stare, 1);
      const c = { id: this.nowyId('cena'), wlasciciel: sub, punkt, terytorium: ter };
      this.cenySub.push(c);
      return this.wyslij(res, 201, { data: { type: 'subscriptionPrices', id: c.id } });
    }
    if (metoda === 'POST' && p === '/v1/subscriptionIntroductoryOffers') {
      const terytorium: string = rel('territory').id;
      const z = { ...utworz('subscriptionIntroductoryOffers'), sub: rel('subscription').id, terytorium, relationships: { territory: { data: { type: 'territories', id: terytorium } } } };
      this.oferty.push(z);
      return this.wyslij(res, 201, { data: z });
    }
    if (metoda === 'POST' && p === '/v2/inAppPurchases') {
      const z = utworz('inAppPurchases');
      this.iap.push(z);
      return this.wyslij(res, 201, { data: z });
    }
    if (metoda === 'POST' && p === '/v1/inAppPurchaseLocalizations') {
      const z = { ...utworz('inAppPurchaseLocalizations'), iap: rel('inAppPurchaseV2').id };
      this.lokIap.push(z);
      return this.wyslij(res, 201, { data: z });
    }
    if (metoda === 'POST' && p === '/v1/inAppPurchasePriceSchedules') {
      const iap = rel('inAppPurchase').id;
      const wpisy = (rel('manualPrices') as { id: string }[]).map((r) => cialo.included!.find((i) => i.id === r.id)!);
      const reczne = wpisy.map((w) => {
        const punkt = (w.relationships!.inAppPurchasePricePoint.data as { id: string }).id;
        return { id: this.nowyId('cena'), wlasciciel: iap, punkt, terytorium: punkt.split('~')[3] };
      });
      const h = { id: this.nowyId('harm'), baza: rel('baseTerritory').id, reczne };
      this.planyCenIap.set(iap, h);
      return this.wyslij(res, 201, { data: { type: 'inAppPurchasePriceSchedules', id: h.id } });
    }
    if (metoda === 'POST' && p === '/v2/appAvailabilities') {
      const wpisy = (rel('territoryAvailabilities') as { id: string }[]).map((r) => cialo.included!.find((i) => i.id === r.id)!);
      this.dostApp = {
        id: this.nowyId('appdost'),
        nowe: a.availableInNewTerritories === true,
        terytoria: wpisy.map((w) => ({ id: this.nowyId('ta'), terytorium: (w.relationships!.territory.data as { id: string }).id, dostepne: w.attributes!.available === true })),
      };
      return this.wyslij(res, 201, { data: { type: 'appAvailabilities', id: this.dostApp.id } });
    }
    if (metoda === 'PATCH' && (m = /^\/v1\/territoryAvailabilities\/([^/]+)$/.exec(p))) {
      const t = this.dostApp?.terytoria.find((x) => x.id === m![1]);
      if (!t) return this.wyslij(res, 404, {});
      t.dostepne = a.available === true;
      return this.wyslij(res, 200, { data: { type: 'territoryAvailabilities', id: t.id } });
    }
    if (metoda === 'PATCH' && p === `/v1/ageRatingDeclarations/${this.wiek.id}`) {
      Object.assign(this.wiek.attributes!, a);
      return this.wyslij(res, 200, { data: this.wiek });
    }
    if (metoda === 'PATCH' && (m = /^\/(v1\/subscriptions|v1\/subscriptionGroupLocalizations|v1\/subscriptionLocalizations|v2\/inAppPurchases|v1\/inAppPurchaseLocalizations)\/([^/]+)$/.exec(p))) {
      const zbior = { 'v1/subscriptions': this.subskrypcje, 'v1/subscriptionGroupLocalizations': this.lokGrup, 'v1/subscriptionLocalizations': this.lokSub, 'v2/inAppPurchases': this.iap, 'v1/inAppPurchaseLocalizations': this.lokIap }[m[1]] as Zasob[];
      const z = zbior.find((x) => x.id === m![2]);
      if (!z) return this.wyslij(res, 404, {});
      Object.assign(z.attributes!, a);
      return this.wyslij(res, 200, { data: z });
    }
    this.wyslij(res, 404, { errors: [{ status: '404', code: 'NOT_FOUND', title: `atrapa: brak ${metoda} ${p}` }] });
  }
}
