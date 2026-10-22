#!/usr/bin/env node
// ============================================================================
// Piekarz — ustawienia App Store Connect przez App Store Connect API [M1-audytor-generalny-181]
// Grupa subskrypcji, subskrypcja miesięczna i roczna, zakup dożywotni, lokalizacje nazw,
// Family Sharing, ceny (DEC-01 d, D-038), dostępność (D-057), oferta wprowadzająca
// i ankieta wieku (D-058). Wartości wyłącznie z plików repo:
//   docs/wydanie/asc-ustawienia.json, docs/wydanie/ceny.json, docs/wydanie/storefronty.json,
//   src/lib/platnosci/konfiguracja.ts (ID produktów), app.json (Bundle ID).
//
// Użycie: node scripts/asc-ustawienia.mjs [--zgoda docs/wydanie/asc-zgoda.json] [--api URL]
//   Domyślnie przebieg na sucho: wyłącznie GET, lista „utworzy / zmieni / bez zmian” i skrót planu.
//   Zapis tylko, gdy plik zgody ma "zapis": true i "skrot" równy skrótowi planu w chwili zapisu
//   (zmiana w ASC albo w danych po pokazaniu listy = odmowa). Po zapisie drugi przebieg na sucho.
//   Klucz: ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8 (PEM albo base64 PEM). Do logu nie trafia klucz,
//   token, identyfikator klucza, wystawca ani identyfikatory zasobów ASC (repo publiczne).
// Kody: 0 wynik; 1 błąd danych albo API; 3 zgoda na inny plan; 4 brak uprawnień klucza (403);
//   5 różnice po zapisie.
// ============================================================================

import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { createHash, createPrivateKey, sign } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API_DOMYSLNE = 'https://api.appstoreconnect.apple.com';

// Eksporty klienta i błędów używa też scripts/asc-zgloszenie.mjs [M1-audytor-generalny-186].
export class BladDanych extends Error {}
export class BladApi extends Error {
  constructor(metoda, sciezka, status, kod, tytul) {
    super(`${metoda} ${sciezka}: ${status} ${kod} ${tytul}`);
    this.status = status;
  }
}
export class BladZgody extends Error {}

// ---------------------------------------------------------------------------
// Stan docelowy z plików repo

const czytaj = (p) => readFileSync(join(ROOT, p), 'utf8');
const json = (p) => JSON.parse(czytaj(p));

/** Free Trial i długość z ceny.json → wartości enum API (subscriptionIntroductoryOffers). */
const TRYB_OFERTY = { 'Free Trial': 'FREE_TRIAL' };
const CZAS_OFERTY = { '3 Days': 'THREE_DAYS', '1 Week': 'ONE_WEEK', '2 Weeks': 'TWO_WEEKS', '1 Month': 'ONE_MONTH' };

export function stanDocelowy() {
  const u = json('docs/wydanie/asc-ustawienia.json');
  const ceny = json('docs/wydanie/ceny.json');
  const sf = json('docs/wydanie/storefronty.json');
  const bundleId = json('app.json').expo?.ios?.bundleIdentifier;
  if (!bundleId) throw new BladDanych('app.json: brak expo.ios.bundleIdentifier');
  const id = {};
  for (const m of czytaj('src/lib/platnosci/konfiguracja.ts').matchAll(/^\s*(monthly|yearly|lifetime): '([^']+)'/gm)) id[m[1]] = m[2];
  for (const p of ['monthly', 'yearly', 'lifetime']) if (!id[p]) throw new BladDanych(`konfiguracja.ts: brak ID produktu ${p}`);

  const wszystkie = sf.storefronty.map((s) => s.iso);
  const terytoria = wszystkie.filter((t) => !u.dostepnosc.bez.includes(t)).sort();
  if (terytoria.length !== u.dostepnosc.liczba) throw new BladDanych(`dostępność: ${terytoria.length} storefrontów, a asc-ustawienia.json mówi ${u.dostepnosc.liczba}`);
  if (ceny.bazowy !== 'USA') throw new BladDanych('ceny.json: storefront bazowy inny niż USA');
  for (const t of Object.keys(ceny.reczne)) if (!terytoria.includes(t)) throw new BladDanych(`ceny.json: storefront ${t} poza dostępnością`);

  // D-112: bez oferty wprowadzającej (pole usunięte z ceny.json, M3 P-a-fix); gdyby wróciła, musi być znana
  const oferta = ceny.ofertaWprowadzajaca ?? null;
  const tryb = oferta ? TRYB_OFERTY[oferta.typ] : null;
  const czas = oferta ? CZAS_OFERTY[oferta.czas] : null;
  if (oferta && (!tryb || !czas)) throw new BladDanych(`ceny.json: nieznana oferta wprowadzająca „${oferta.typ}” / „${oferta.czas}”`);

  const produkt = (plan) => ({
    plan,
    productId: id[plan],
    nazwa: u.produkty[plan].referenceName,
    lokalizacje: u.produkty[plan].lokalizacje,
    familySharable: ceny.familySharing.includes(plan),
    reczne: Object.fromEntries(Object.entries(ceny.reczne).map(([t, w]) => [t, w[plan]])),
  });
  return {
    bundleId,
    grupa: { nazwa: u.grupa.referenceName, lokalizacje: u.grupa.lokalizacje },
    subskrypcje: ['monthly', 'yearly'].map((plan) => ({
      ...produkt(plan),
      okres: u.produkty[plan].okres,
      poziom: u.poziomWGrupie,
      oferta: oferta && oferta.produkty.includes(plan) ? { offerMode: tryb, duration: czas, numberOfPeriods: 1 } : null,
    })),
    dozywotni: { ...produkt('lifetime'), typ: u.produkty.lifetime.typ },
    notatka: u.notatkaDlaRecenzji,
    terytoria,
    wszystkie,
    noweKraje: u.dostepnosc.noweKraje,
    wiek: u.ankietaWieku.odpowiedzi,
  };
}

// ---------------------------------------------------------------------------
// Klient API: JWT ES256, stronicowanie, 429

export function sekrety() {
  const brak = ['ASC_KEY_ID', 'ASC_ISSUER_ID', 'ASC_KEY_P8'].filter((k) => !process.env[k]);
  if (brak.length) throw new BladDanych(`brak zmiennych środowiska: ${brak.join(', ')} (sekrety GitHuba)`);
  const surowy = process.env.ASC_KEY_P8;
  const pem = surowy.includes('BEGIN PRIVATE KEY') ? surowy : Buffer.from(surowy, 'base64').toString('utf8');
  if (!pem.includes('BEGIN PRIVATE KEY')) throw new BladDanych('ASC_KEY_P8: to nie jest klucz .p8 (PEM ani base64 PEM)');
  return { kluczId: process.env.ASC_KEY_ID, wystawca: process.env.ASC_ISSUER_ID, klucz: createPrivateKey(pem) };
}

const b64u = (x) => Buffer.from(typeof x === 'string' ? x : JSON.stringify(x)).toString('base64url');

export function klient(api, { kluczId, wystawca, klucz }, tylkoOdczyt) {
  let token = '';
  let wydany = 0;
  const jwt = () => {
    const teraz = Math.floor(Date.now() / 1000);
    // Apple: token ważny najwyżej 20 min; nowy co 10 min, bo zapis cen trwa dłużej niż jeden token.
    if (token && teraz - wydany < 600) return token;
    const glowa = `${b64u({ alg: 'ES256', kid: kluczId, typ: 'JWT' })}.${b64u({ iss: wystawca, iat: teraz, exp: teraz + 1200, aud: 'appstoreconnect-v1' })}`;
    token = `${glowa}.${sign('sha256', Buffer.from(glowa), { key: klucz, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
    wydany = teraz;
    return token;
  };
  async function zadanie(metoda, sciezka, cialo) {
    if (metoda !== 'GET' && tylkoOdczyt) throw new Error(`zapis w przebiegu na sucho: ${metoda}`);
    const url = sciezka.startsWith('http') ? sciezka : api + sciezka;
    const krotka = new URL(url).pathname.replace(/\/[^/]*\d[^/]*(?=\/|$)/g, '/{id}');
    for (let proba = 0; ; proba++) {
      const r = await fetch(url, {
        method: metoda,
        headers: { Authorization: `Bearer ${jwt()}`, 'Content-Type': 'application/json' },
        body: cialo === undefined ? undefined : JSON.stringify(cialo),
      });
      if (r.status === 429 && proba < 5) {
        await new Promise((ok) => setTimeout(ok, 2000 * (proba + 1)));
        continue;
      }
      const tekst = await r.text();
      const j = tekst ? JSON.parse(tekst) : null;
      if (r.status === 404 && metoda === 'GET') return null;
      if (!r.ok) {
        const e = j?.errors?.[0] ?? {};
        throw new BladApi(metoda, krotka, r.status, e.code ?? '', e.title ?? '');
      }
      return j;
    }
  }
  async function wszystkie(sciezka) {
    const data = [];
    const included = [];
    let url = sciezka;
    while (url) {
      const j = await zadanie('GET', url);
      if (!j) break;
      data.push(...(Array.isArray(j.data) ? j.data : []));
      included.push(...(j.included ?? []));
      url = j.links?.next;
    }
    return { data, included };
  }
  return {
    jeden: async (s) => (await zadanie('GET', s))?.data ?? null,
    wszystkie,
    post: (s, c) => zadanie('POST', s, c),
    patch: (s, c) => zadanie('PATCH', s, c),
    usun: (s) => zadanie('DELETE', s),
  };
}

// ---------------------------------------------------------------------------
// Odczyt stanu ASC

const e = encodeURIComponent;
const relId = (z, k) => z.relationships?.[k]?.data?.id;
const rowne = (a, b) => Number(a) === Number(b);
const dzis = () => new Date().toISOString().slice(0, 10);
/** Obowiązujący wpis: bez daty albo z datą ≤ dziś, najpóźniejszy; bez daty końca w przeszłości. */
const obowiazuje = (a) => (!a.startDate || a.startDate <= dzis()) && (!a.endDate || a.endDate >= dzis());

async function lokalizacje(k, sciezka) {
  const { data } = await k.wszystkie(`${sciezka}?limit=200`);
  return Object.fromEntries(data.map((l) => [l.attributes.locale, { id: l.id, name: l.attributes.name }]));
}

async function dostepnosc(k, sciezkaRel, typ) {
  const d = await k.jeden(sciezkaRel);
  if (!d) return null;
  const { data } = await k.wszystkie(`/v1/${typ}/${e(d.id)}/availableTerritories?limit=200`);
  return { nowe: d.attributes?.availableInNewTerritories === true, terytoria: data.map((t) => t.id).sort() };
}

/** Mapa terytorium → { punkt, kwota } z listy cen z dołączonymi punktami cenowymi. */
function cenyZListy({ data, included }, relPunktu) {
  const kwoty = new Map(included.map((p) => [p.id, p.attributes?.customerPrice]));
  const wynik = new Map();
  const daty = new Map();
  for (const c of data) {
    if (!obowiazuje(c.attributes ?? {})) continue;
    const t = relId(c, 'territory');
    const pp = relId(c, relPunktu);
    const data0 = c.attributes?.startDate ?? '';
    if (!t || !pp || (daty.has(t) && daty.get(t) > data0)) continue;
    daty.set(t, data0);
    wynik.set(t, { punkt: pp, kwota: kwoty.get(pp) });
  }
  return wynik;
}

export async function stanAsc(k, cel) {
  const apps = (await k.wszystkie(`/v1/apps?filter[bundleId]=${e(cel.bundleId)}&limit=200`)).data;
  if (apps.length !== 1) throw new BladDanych(`App Store Connect: aplikacji ${cel.bundleId} nie znaleziono`);
  const app = apps[0].id;
  const stan = { app, grupa: null, sub: {}, iap: null, dostApp: null, wiek: null };

  const grupa = (await k.wszystkie(`/v1/apps/${e(app)}/subscriptionGroups?limit=200`)).data.find((g) => g.attributes?.referenceName === cel.grupa.nazwa);
  if (grupa) {
    stan.grupa = { id: grupa.id, lok: await lokalizacje(k, `/v1/subscriptionGroups/${e(grupa.id)}/subscriptionGroupLocalizations`) };
    const subs = (await k.wszystkie(`/v1/subscriptionGroups/${e(grupa.id)}/subscriptions?limit=200`)).data;
    for (const s of cel.subskrypcje) {
      const z = subs.find((x) => x.attributes?.productId === s.productId);
      if (!z) continue;
      const oferty = (await k.wszystkie(`/v1/subscriptions/${e(z.id)}/introductoryOffers?include=territory&limit=200`)).data.filter((o) => obowiazuje(o.attributes ?? {}));
      stan.sub[s.plan] = {
        id: z.id,
        atr: z.attributes,
        lok: await lokalizacje(k, `/v1/subscriptions/${e(z.id)}/subscriptionLocalizations`),
        dost: await dostepnosc(k, `/v1/subscriptions/${e(z.id)}/subscriptionAvailability`, 'subscriptionAvailabilities'),
        ceny: cenyZListy(await k.wszystkie(`/v1/subscriptions/${e(z.id)}/prices?include=subscriptionPricePoint,territory&limit=200`), 'subscriptionPricePoint'),
        oferty: new Map(oferty.map((o) => [relId(o, 'territory'), o.attributes])),
      };
    }
  }
  const iap = (await k.wszystkie(`/v1/apps/${e(app)}/inAppPurchasesV2?filter[productId]=${e(cel.dozywotni.productId)}&limit=200`)).data.find((x) => x.attributes?.productId === cel.dozywotni.productId);
  if (iap) {
    const h = await k.jeden(`/v2/inAppPurchases/${e(iap.id)}/iapPriceSchedule`);
    stan.iap = {
      id: iap.id,
      atr: iap.attributes,
      lok: await lokalizacje(k, `/v2/inAppPurchases/${e(iap.id)}/inAppPurchaseLocalizations`),
      dost: await dostepnosc(k, `/v2/inAppPurchases/${e(iap.id)}/inAppPurchaseAvailability`, 'inAppPurchaseAvailabilities'),
      harmonogram: h
        ? {
            baza: (await k.jeden(`/v1/inAppPurchasePriceSchedules/${e(h.id)}/baseTerritory`))?.id ?? null,
            reczne: cenyZListy(await k.wszystkie(`/v1/inAppPurchasePriceSchedules/${e(h.id)}/manualPrices?include=inAppPurchasePricePoint,territory&limit=200`), 'inAppPurchasePricePoint'),
          }
        : null,
    };
  }
  const da = await k.jeden(`/v1/apps/${e(app)}/appAvailabilityV2`);
  if (da) {
    const { data } = await k.wszystkie(`/v2/appAvailabilities/${e(da.id)}/territoryAvailabilities?include=territory&limit=200`);
    stan.dostApp = { nowe: da.attributes?.availableInNewTerritories === true, terytoria: new Map(data.map((t) => [relId(t, 'territory'), { id: t.id, dostepne: t.attributes?.available === true }])) };
  }
  const infos = (await k.wszystkie(`/v1/apps/${e(app)}/appInfos?limit=200`)).data;
  const info = infos.find((i) => !['READY_FOR_DISTRIBUTION', 'REPLACED_WITH_NEW_INFO'].includes(i.attributes?.state ?? i.attributes?.appStoreState)) ?? infos[0];
  if (info) {
    const w = await k.jeden(`/v1/appInfos/${e(info.id)}/ageRatingDeclaration`);
    if (w) stan.wiek = { id: w.id, atr: w.attributes ?? {} };
  }
  return stan;
}

// ---------------------------------------------------------------------------
// Punkty cenowe: kwota z ceny.json musi istnieć dokładnie, inaczej stop bez zapisu ceny (instrukcja §5.3)

async function punktyTerytoriow(k, sciezka, terytoria) {
  const mapa = new Map();
  const { data } = await k.wszystkie(`${sciezka}?filter[territory]=${terytoria.join(',')}&include=territory&limit=200`);
  for (const p of data) {
    const t = relId(p, 'territory');
    if (!mapa.has(t)) mapa.set(t, []);
    mapa.get(t).push({ punkt: p.id, kwota: p.attributes?.customerPrice });
  }
  return mapa;
}

function wybierz(mapa, t, kwota, produkt) {
  const p = (mapa.get(t) ?? []).find((x) => rowne(x.kwota, kwota));
  if (!p) throw new BladDanych(`brak punktu cenowego ${t} ${kwota} dla ${produkt} (instrukcja §5.3: nie wybieraj innej kwoty; pytanie do roli 02)`);
  return p;
}

/** Docelowa cena w każdym dostępnym terytorium: ręczna z ceny.json albo równoważnik Apple od ceny USA. */
export async function punkty(k, cel, stan) {
  const wynik = { sub: {}, iap: null };
  for (const s of cel.subskrypcje) {
    const z = stan.sub[s.plan];
    if (!z) continue;
    const reczne = await punktyTerytoriow(k, `/v1/subscriptions/${e(z.id)}/pricePoints`, Object.keys(s.reczne));
    const docel = new Map();
    for (const [t, kw] of Object.entries(s.reczne)) docel.set(t, { ...wybierz(reczne, t, kw, s.productId), reczna: true });
    const usa = docel.get('USA');
    const { data } = await k.wszystkie(`/v1/subscriptionPricePoints/${e(usa.punkt)}/equalizations?include=territory&limit=200`);
    for (const p of data) {
      const t = relId(p, 'territory');
      if (!docel.has(t)) docel.set(t, { punkt: p.id, kwota: p.attributes?.customerPrice, reczna: false });
    }
    for (const t of cel.terytoria) if (!docel.has(t)) throw new BladDanych(`brak równoważnika ceny w ${t} dla ${s.productId}`);
    wynik.sub[s.plan] = docel;
  }
  if (stan.iap) {
    const d = cel.dozywotni;
    const mapa = await punktyTerytoriow(k, `/v2/inAppPurchases/${e(stan.iap.id)}/pricePoints`, Object.keys(d.reczne));
    wynik.iap = new Map(Object.entries(d.reczne).map(([t, kw]) => [t, wybierz(mapa, t, kw, d.productId)]));
  }
  return wynik;
}

// ---------------------------------------------------------------------------
// Plan: lista operacji; `wykonaj` = null, gdy rodzic jeszcze nie istnieje (powstanie w poprzedniej rundzie)

const BEZ = 'bez zmian';

export function planuj(cel, stan, pp) {
  const ops = [];
  const op = (rodzaj, obiekt, opis, wykonaj = null) => ops.push({ rodzaj, obiekt, opis, wykonaj });
  const rel = (type, id) => ({ data: { type, id } });

  // Grupa i jej lokalizacje
  const g = stan.grupa;
  if (!g) op('utworzy', 'grupa', `grupa subskrypcji „${cel.grupa.nazwa}”`, (k) => k.post('/v1/subscriptionGroups', { data: { type: 'subscriptionGroups', attributes: { referenceName: cel.grupa.nazwa }, relationships: { app: rel('apps', stan.app) } } }));
  else op(BEZ, 'grupa', `grupa subskrypcji „${cel.grupa.nazwa}”`);
  lokOps(op, 'grupa', `grupa „${cel.grupa.nazwa}”`, cel.grupa.lokalizacje, g?.lok, g && ((loc, a) => ({ path: '/v1/subscriptionGroupLocalizations', type: 'subscriptionGroupLocalizations', rel: { subscriptionGroup: rel('subscriptionGroups', g.id) } })));

  // Subskrypcje
  for (const s of cel.subskrypcje) {
    const z = stan.sub[s.plan];
    const atr = { name: s.nazwa, productId: s.productId, subscriptionPeriod: s.okres, familySharable: s.familySharable, groupLevel: s.poziom, reviewNote: cel.notatka };
    const opis = `subskrypcja ${s.productId} (${s.okres}, poziom ${s.poziom}, Family Sharing: ${s.familySharable ? 'tak, nieodwracalne' : 'nie'})`;
    if (!z) op('utworzy', s.plan, opis, g ? (k) => k.post('/v1/subscriptions', { data: { type: 'subscriptions', attributes: atr, relationships: { group: rel('subscriptionGroups', g.id) } } }) : null);
    else atrOps(op, s.plan, opis, atr, z.atr, ['productId'], (zm) => (k) => k.patch(`/v1/subscriptions/${e(z.id)}`, { data: { type: 'subscriptions', id: z.id, attributes: zm } }));
    lokOps(op, s.plan, s.productId, s.lokalizacje, z?.lok, z && (() => ({ path: '/v1/subscriptionLocalizations', type: 'subscriptionLocalizations', rel: { subscription: rel('subscriptions', z.id) } })));
    dostOps(op, s.plan, s.productId, cel, z?.dost, z && ((k) => k.post('/v1/subscriptionAvailabilities', { data: { type: 'subscriptionAvailabilities', attributes: { availableInNewTerritories: cel.noweKraje }, relationships: { subscription: rel('subscriptions', z.id), availableTerritories: { data: cel.terytoria.map((t) => ({ type: 'territories', id: t })) } } } })));

    // Ceny: każde dostępne terytorium osobno (API nie ma zapisu zbiorczego)
    const docel = pp.sub[s.plan];
    for (const t of cel.terytoria) {
      const reczna = s.reczne[t];
      const d = docel?.get(t);
      const opisCeny = `cena ${s.productId} ${t}: ${d ? d.kwota : reczna ?? '?'}${reczna ? ' (ręczna, D-038)' : ` (równoważnik Apple od ${s.reczne.USA} USD)`}`;
      const obecna = z?.ceny.get(t);
      if (obecna && d && obecna.punkt === d.punkt) op(BEZ, `${s.plan}:ceny`, opisCeny);
      else op(obecna ? 'zmieni' : 'utworzy', `${s.plan}:ceny`, obecna ? `${opisCeny}; teraz ${obecna.kwota}` : opisCeny, z && d ? (k) => k.post('/v1/subscriptionPrices', { data: { type: 'subscriptionPrices', attributes: { startDate: null, preserveCurrentPrice: false }, relationships: { subscription: rel('subscriptions', z.id), subscriptionPricePoint: rel('subscriptionPricePoints', d.punkt), territory: rel('territories', t) } } }) : null);
    }
  }

  // Oferty wprowadzające po cenach (oferta wymaga ceny w storefroncie)
  for (const s of cel.subskrypcje) {
    const z = stan.sub[s.plan];
    if (!s.oferta) {
      // Bez oferty w kontrakcie (D-112): istniejąca oferta do usunięcia ręcznie w ASC (Z-1); skrypt niczego nie usuwa
      for (const [t, o] of z?.oferty ?? []) {
        op('ręcznie', `${s.plan}:oferta`, `oferta ${s.productId} ${t}: ${o.offerMode} ${o.duration} — kontrakt bez oferty wprowadzającej (D-112); usuń w ASC razem z buildem Basic/Pro (Z-1, instrukcja §4)`);
      }
      continue;
    }
    for (const t of cel.terytoria) {
      const opis = `oferta ${s.productId} ${t}: ${s.oferta.offerMode} ${s.oferta.duration}`;
      const obecna = z?.oferty.get(t);
      if (!obecna) op('utworzy', `${s.plan}:oferta`, opis, z ? (k) => k.post('/v1/subscriptionIntroductoryOffers', { data: { type: 'subscriptionIntroductoryOffers', attributes: { ...s.oferta, startDate: null, endDate: null }, relationships: { subscription: rel('subscriptions', z.id), territory: rel('territories', t) } } }) : null);
      else if (obecna.offerMode === s.oferta.offerMode && obecna.duration === s.oferta.duration && obecna.numberOfPeriods === s.oferta.numberOfPeriods) op(BEZ, `${s.plan}:oferta`, opis);
      // Apple: oferty nie da się edytować („delete it and create a new one”); skrypt niczego nie usuwa.
      else op('ręcznie', `${s.plan}:oferta`, `${opis}; teraz ${obecna.offerMode} ${obecna.duration} — usuń w ASC i uruchom ponownie (instrukcja §4.4)`);
    }
  }

  // Zakup dożywotni
  const d = cel.dozywotni;
  const zi = stan.iap;
  const atrI = { name: d.nazwa, productId: d.productId, inAppPurchaseType: d.typ, familySharable: d.familySharable, reviewNote: cel.notatka };
  const opisI = `zakup dożywotni ${d.productId} (${d.typ}, Family Sharing: ${d.familySharable ? 'tak, nieodwracalne' : 'nie'})`;
  if (!zi) op('utworzy', 'lifetime', opisI, (k) => k.post('/v2/inAppPurchases', { data: { type: 'inAppPurchases', attributes: atrI, relationships: { app: rel('apps', stan.app) } } }));
  else atrOps(op, 'lifetime', opisI, atrI, zi.atr, ['productId', 'inAppPurchaseType'], (zm) => (k) => k.patch(`/v2/inAppPurchases/${e(zi.id)}`, { data: { type: 'inAppPurchases', id: zi.id, attributes: zm } }));
  lokOps(op, 'lifetime', d.productId, d.lokalizacje, zi?.lok, zi && (() => ({ path: '/v1/inAppPurchaseLocalizations', type: 'inAppPurchaseLocalizations', rel: { inAppPurchaseV2: rel('inAppPurchases', zi.id) } })));
  dostOps(op, 'lifetime', d.productId, cel, zi?.dost, zi && ((k) => k.post('/v1/inAppPurchaseAvailabilities', { data: { type: 'inAppPurchaseAvailabilities', attributes: { availableInNewTerritories: cel.noweKraje }, relationships: { inAppPurchase: rel('inAppPurchases', zi.id), availableTerritories: { data: cel.terytoria.map((t) => ({ type: 'territories', id: t })) } } } })));
  const opisH = `harmonogram cen ${d.productId}: baza USA ${d.reczne.USA} USD; ręczne (D-038): ${Object.entries(d.reczne).filter(([t]) => t !== 'USA').map(([t, kw]) => `${t} ${kw}`).join(', ')}; pozostałe storefronty: ceny Apple od bazy`;
  const h = zi?.harmonogram;
  const hOk = h && h.baza === 'USA' && h.reczne.size === Object.keys(d.reczne).length && Object.entries(d.reczne).every(([t, kw]) => h.reczne.has(t) && rowne(h.reczne.get(t).kwota, kw));
  if (hOk) op(BEZ, 'lifetime:ceny', opisH);
  else {
    const wpisy = pp.iap ? [...pp.iap.entries()] : [];
    op(h ? 'zmieni' : 'utworzy', 'lifetime:ceny', opisH, zi && pp.iap
      ? (k) => k.post('/v1/inAppPurchasePriceSchedules', {
          data: { type: 'inAppPurchasePriceSchedules', relationships: { inAppPurchase: rel('inAppPurchases', zi.id), baseTerritory: rel('territories', 'USA'), manualPrices: { data: wpisy.map(([t]) => ({ type: 'inAppPurchasePrices', id: `\${cena-${t}}` })) } } },
          included: wpisy.map(([t, p]) => ({ type: 'inAppPurchasePrices', id: `\${cena-${t}}`, attributes: { startDate: null }, relationships: { inAppPurchaseV2: rel('inAppPurchases', zi.id), inAppPurchasePricePoint: rel('inAppPurchasePricePoints', p.punkt) } })),
        })
      : null);
  }

  // Dostępność aplikacji (D-057)
  const da = stan.dostApp;
  const opisApp = `dostępność aplikacji: ${cel.terytoria.length} storefronty bez ${cel.wszystkie.filter((t) => !cel.terytoria.includes(t)).join(', ')}, nowe kraje: ${cel.noweKraje ? 'tak' : 'nie'}`;
  if (!da) {
    op('utworzy', 'aplikacja', opisApp, (k) => k.post('/v2/appAvailabilities', {
      data: { type: 'appAvailabilities', attributes: { availableInNewTerritories: cel.noweKraje }, relationships: { app: rel('apps', stan.app), territoryAvailabilities: { data: cel.wszystkie.map((t) => ({ type: 'territoryAvailabilities', id: `\${ta-${t}}` })) } } },
      included: cel.wszystkie.map((t) => ({ type: 'territoryAvailabilities', id: `\${ta-${t}}`, attributes: { available: cel.terytoria.includes(t) }, relationships: { territory: rel('territories', t) } })),
    }));
  } else {
    let zmian = 0;
    for (const t of cel.wszystkie) {
      const chce = cel.terytoria.includes(t);
      const x = da.terytoria.get(t);
      if (!x) op('ręcznie', 'aplikacja', `dostępność aplikacji ${t}: brak wpisu w ASC — ustaw w ASC (instrukcja §6.1)`);
      else if (x.dostepne !== chce) {
        zmian++;
        op('zmieni', 'aplikacja', `dostępność aplikacji ${t}: ${chce ? 'dostępna' : 'niedostępna'}`, (k) => k.patch(`/v1/territoryAvailabilities/${e(x.id)}`, { data: { type: 'territoryAvailabilities', id: x.id, attributes: { available: chce } } }));
      }
    }
    if (da.nowe !== cel.noweKraje) op('ręcznie', 'aplikacja', `dostępność aplikacji w nowych krajach: ${cel.noweKraje ? 'tak' : 'nie'} — zaznacz w ASC (instrukcja §6.1)`);
    else if (!zmian) op(BEZ, 'aplikacja', opisApp);
  }

  // Ankieta wieku (D-058)
  if (!stan.wiek) op('ręcznie', 'wiek', 'ankieta wieku: App Store Connect nie zwrócił deklaracji — ustaw w ASC (instrukcja §8)');
  else {
    const zm = Object.fromEntries(Object.entries(cel.wiek).filter(([kl, w]) => stan.wiek.atr[kl] !== w));
    const lista = Object.entries(zm).map(([kl, w]) => `${kl}=${w}`).join(', ');
    if (!lista) op(BEZ, 'wiek', 'ankieta wieku (D-058)');
    else op(stan.wiek.atr && Object.keys(zm).every((kl) => stan.wiek.atr[kl] == null) ? 'utworzy' : 'zmieni', 'wiek', `ankieta wieku (D-058): ${lista}`, (k) => k.patch(`/v1/ageRatingDeclarations/${e(stan.wiek.id)}`, { data: { type: 'ageRatingDeclarations', id: stan.wiek.id, attributes: zm } }));
  }
  return ops;
}

function lokOps(op, obiekt, nazwa, docel, obecne, cel) {
  for (const [loc, { name }] of Object.entries(docel)) {
    const opis = `lokalizacja ${nazwa} ${loc}: „${name}”`;
    const x = obecne?.[loc];
    const c = cel ? cel() : null;
    if (!x) op('utworzy', `${obiekt}:lok`, opis, c ? (k) => k.post(c.path, { data: { type: c.type, attributes: { locale: loc, name }, relationships: c.rel } }) : null);
    else if (x.name === name) op(BEZ, `${obiekt}:lok`, opis);
    else op('zmieni', `${obiekt}:lok`, `${opis}; teraz „${x.name}”`, c ? (k) => k.patch(`${c.path}/${e(x.id)}`, { data: { type: c.type, id: x.id, attributes: { name } } }) : null);
  }
}

function atrOps(op, obiekt, opis, docel, obecne, stale, patch) {
  const rozne = Object.keys(docel).filter((kl) => obecne?.[kl] !== docel[kl]);
  const nieDoZmiany = rozne.filter((kl) => stale.includes(kl));
  if (nieDoZmiany.length) throw new BladDanych(`${opis}: pole ${nieDoZmiany.join(', ')} różni się od danych, a API go nie zmienia`);
  if (!rozne.length) return op(BEZ, obiekt, opis);
  const zm = Object.fromEntries(rozne.map((kl) => [kl, docel[kl]]));
  op('zmieni', obiekt, `${opis}: ${rozne.map((kl) => `${kl}=${JSON.stringify(docel[kl])} (teraz ${JSON.stringify(obecne?.[kl] ?? null)})`).join(', ')}`, patch(zm));
}

function dostOps(op, obiekt, nazwa, cel, obecna, wykonaj) {
  const opis = `dostępność ${nazwa}: ${cel.terytoria.length} storefronty (D-057), nowe kraje: ${cel.noweKraje ? 'tak' : 'nie'}`;
  const ok = obecna && obecna.nowe === cel.noweKraje && obecna.terytoria.join(',') === cel.terytoria.join(',');
  if (ok) op(BEZ, `${obiekt}:dost`, opis);
  else op(obecna ? 'zmieni' : 'utworzy', `${obiekt}:dost`, obecna ? `${opis}; teraz ${obecna.terytoria.length}` : opis, wykonaj || null);
}

// ---------------------------------------------------------------------------
// Raport i skrót planu

const DZIALANIA = ['utworzy', 'zmieni', 'ręcznie'];
const PRODUKTOWE = ['grupa', 'monthly', 'yearly', 'lifetime'];

export function skrot(ops) {
  const linie = ops.filter((o) => DZIALANIA.includes(o.rodzaj)).map((o) => `${o.rodzaj}|${o.obiekt}|${o.opis}`);
  return createHash('sha256').update(linie.join('\n')).digest('hex');
}

function raport(tryb, ops) {
  const ile = (r) => ops.filter((o) => o.rodzaj === r).length;
  const roznic = ops.filter((o) => DZIALANIA.includes(o.rodzaj)).length;
  const obiekty = [...new Set(ops.map((o) => o.obiekt))];
  const linie = [
    `# App Store Connect — ${tryb} (${dzis()})`,
    '',
    `Różnice: ${roznic} (utworzy ${ile('utworzy')}, zmieni ${ile('zmieni')}, ręcznie ${ile('ręcznie')}); bez zmian: ${ile(BEZ)}`,
    `Skrót planu: ${skrot(ops)}`,
    '',
    '| Obiekt | utworzy | zmieni | ręcznie | bez zmian |',
    '|---|---|---|---|---|',
    ...obiekty.map((ob) => {
      const w = ops.filter((o) => o.obiekt === ob);
      const n = (r) => w.filter((o) => o.rodzaj === r).length;
      return `| ${ob} | ${n('utworzy')} | ${n('zmieni')} | ${n('ręcznie')} | ${n(BEZ)} |`;
    }),
    '',
    '## Lista',
    ...ops.filter((o) => DZIALANIA.includes(o.rodzaj)).map((o) => `- ${o.rodzaj} · ${o.opis}`),
    '',
  ];
  return linie.join('\n');
}

function wypisz(tekst) {
  console.log(tekst);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${tekst}\n`);
}

// ---------------------------------------------------------------------------
// Przebieg

function zgodaZPliku(argv) {
  const i = argv.indexOf('--zgoda');
  if (i < 0) return null;
  const p = argv[i + 1];
  if (!p || !existsSync(p)) return null;
  const z = JSON.parse(readFileSync(p, 'utf8'));
  if (z.zapis !== true) return null;
  if (!/^[0-9a-f]{64}$/.test(z.skrot ?? '') || !/^\d{4}-\d{2}-\d{2}: \S/.test(z.zgoda ?? '')) throw new BladZgody('plik zgody: "skrot" (64 znaki hex) i "zgoda" („RRRR-MM-DD: słowa właściciela”) są wymagane');
  return z;
}

async function plan(k, cel) {
  const stan = await stanAsc(k, cel);
  return planuj(cel, stan, await punkty(k, cel, stan));
}

async function main(argv) {
  const ia = argv.indexOf('--api');
  const api = ia >= 0 ? argv[ia + 1] : API_DOMYSLNE;
  const cel = stanDocelowy();
  const zgoda = zgodaZPliku(argv);
  const tajne = sekrety();
  const odczyt = klient(api, tajne, true);
  const ops = await plan(odczyt, cel);
  const dzialania = ops.filter((o) => DZIALANIA.includes(o.rodzaj));
  if (!zgoda || !dzialania.length) {
    wypisz(raport(zgoda ? 'przebieg na sucho (zgoda w pliku, ale nie ma nic do zapisu)' : 'przebieg na sucho', ops));
    return 0;
  }
  if (zgoda.skrot !== skrot(ops)) {
    wypisz(raport('przebieg na sucho', ops));
    throw new BladZgody(`Skrót planu nie zgadza się ze zgodą (${zgoda.skrot.slice(0, 12)}…): stan ASC albo dane zmieniły się po pokazaniu listy; pokaż właścicielowi nową listę`);
  }
  wypisz(raport('zapis — plan zatwierdzony', ops));
  const zapis = klient(api, tajne, false);
  let wykonane = 0;
  // Rundy: dzieci (lokalizacje, ceny, oferty) dostają identyfikator rodzica dopiero po jego utworzeniu.
  for (let runda = 1; runda <= 4; runda++) {
    const biezace = runda === 1 ? ops : await plan(odczyt, cel);
    // Ceny i oferty dopiero, gdy istnieją wszystkie produkty: wtedy punkty() sprawdziło kwoty każdego produktu
    // i brak kwoty zatrzymuje przebieg przed zapisem jakiejkolwiek ceny.
    const saProdukty = !biezace.some((o) => o.rodzaj === 'utworzy' && PRODUKTOWE.includes(o.obiekt));
    const doWykonania = biezace.filter((o) => o.wykonaj && o.rodzaj !== 'ręcznie' && (saProdukty || !/:(ceny|oferta)$/.test(o.obiekt)));
    if (!doWykonania.length) break;
    for (const o of doWykonania) {
      await o.wykonaj(zapis);
      wykonane++;
    }
  }
  const po = await plan(odczyt, cel);
  const reszta = po.filter((o) => DZIALANIA.includes(o.rodzaj));
  wypisz(`Zapisano operacji: ${wykonane}\n\nPo zapisie: różnice ${reszta.length}\n\n${raport('drugi przebieg na sucho po zapisie', po)}`);
  return reszta.length ? 5 : 0;
}

/** Bez sekretów i identyfikatorów w komunikacie błędu. */
export function zaciemnij(tekst) {
  let t = String(tekst);
  for (const k of ['ASC_KEY_ID', 'ASC_ISSUER_ID']) if (process.env[k]) t = t.split(process.env[k]).join('<ukryte>');
  return t.replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '<token>').replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<id>');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2)).then(
    (kod) => process.exit(kod),
    (blad) => {
      if (blad instanceof BladApi && blad.status === 403) {
        console.error(`BŁĄD: App Store Connect odmówił dostępu (403): ${zaciemnij(blad.message)}\nKlucz API ma za niską rolę. Produkty, ceny i dostępność wymagają klucza z rolą Admin albo App Manager: utwórz go w App Store Connect (Users and Access → Integrations) i wpisz w sekretach GitHuba ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8.`);
        process.exit(4);
      }
      if (blad instanceof BladZgody) {
        console.error(`BŁĄD: ${blad.message}`);
        process.exit(3);
      }
      console.error(`BŁĄD: ${zaciemnij(blad instanceof BladDanych || blad instanceof BladApi ? blad.message : blad?.stack ?? blad)}`);
      process.exit(1);
    },
  );
}
