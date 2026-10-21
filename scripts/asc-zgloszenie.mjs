#!/usr/bin/env node
// ============================================================================
// Piekarz — zgłoszenie do App Store przez App Store Connect API [M1-audytor-generalny-186]
// Metadane 34 lokalizacji (App Information: nazwa, podtytuł, Privacy Policy URL; wersja iOS:
// opis, słowa kluczowe, tekst promocyjny, Support URL), zrzuty 7 ramek w dwóch klasach iPhone,
// opisy lokalizacji produktów i zrzut ekranu zakupu dla App Review. App Privacy wypisuje jako
// krok poza API. Wartości wyłącznie z plików repo:
//   docs/wydanie/metadane/*.json, docs/wydanie/zrzuty/ i docs/wydanie/zrzuty/sumy.json,
//   docs/wydanie/asc-zgloszenie.json, docs/wydanie/asc-ustawienia.json (nazwa grupy),
//   src/lib/links.ts (adresy, to samo źródło co karty ustawień), src/lib/platnosci/konfiguracja.ts,
//   app.json (Bundle ID, wersja).
//
// Użycie: node scripts/asc-zgloszenie.mjs [--zgoda docs/wydanie/asc-zgoda-zgloszenie.json] [--api URL]
//   [--zrzuty <katalog z <kod>/<klasa>/<plik> dla lokalizacji spoza repo>] [--dane P] [--sumy P]
//   node scripts/asc-zgloszenie.mjs --generuj-sumy <katalog> [--sumy P]: sumy MD5 zrzutów 34 lokalizacji
//   (plik z repo, a gdy go nie ma, z katalogu) do docs/wydanie/zrzuty/sumy.json.
//   Domyślnie przebieg na sucho: wyłącznie GET, lista „utworzy / zmieni / bez zmian” i skrót planu.
//   Zapis tylko, gdy plik zgody ma "zapis": true i "skrot" równy skrótowi planu w chwili zapisu.
//   Zrzuty lokalizacji spoza repo porównuje po sumach; wysyła je tylko, gdy pliki są w --zrzuty.
// Kody: 0 wynik; 1 błąd danych albo API; 3 zgoda na inny plan; 4 brak uprawnień klucza (403);
//   5 różnice po zapisie.
// ============================================================================

import { appendFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BladApi, BladDanych, BladZgody, klient, sekrety, zaciemnij } from './asc-ustawienia.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API_DOMYSLNE = 'https://api.appstoreconnect.apple.com';
const SUMY = 'docs/wydanie/zrzuty/sumy.json';
const META = 'docs/wydanie/metadane';

const sciezka = (p) => resolve(ROOT, p);
const json = (p) => JSON.parse(readFileSync(sciezka(p), 'utf8'));
const md5 = (b) => createHash('md5').update(b).digest('hex');
const sha = (s) => createHash('sha256').update(s).digest('hex');
const znaki = (s) => [...s].length;

/** Limity App Store Connect (instrukcja §10.3): znaki; słowa kluczowe w bajtach UTF-8. */
const LIMITY = { nazwa: 30, podtytul: 30, tekstPromocyjny: 170, opis: 4000 };

// ---------------------------------------------------------------------------
// Stan docelowy z plików repo

const kodyLokalizacji = () => readdirSync(sciezka(META)).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();

/** Pliki ramek: lista z katalogu repo, a dla lokalizacji spoza repo z katalogu zapasowego. */
function plikiRamek(kod, klasa, zapas) {
  for (const baza of [sciezka(`docs/wydanie/zrzuty/${kod}/${klasa}`), zapas && resolve(zapas, kod, klasa)].filter(Boolean)) {
    if (existsSync(baza)) return readdirSync(baza).filter((f) => f.endsWith('.png')).sort().map((f) => join(baza, f));
  }
  return [];
}

export function generujSumy(katalog, cel, klasy) {
  const lokalizacje = {};
  for (const kod of kodyLokalizacji()) {
    lokalizacje[kod] = {};
    for (const klasa of Object.keys(klasy)) {
      const pliki = plikiRamek(kod, klasa, katalog);
      if (!pliki.length) throw new BladDanych(`brak zrzutów ${kod}/${klasa} w repo i w ${katalog}`);
      lokalizacje[kod][klasa] = pliki.map((p) => {
        const b = readFileSync(p);
        return { plik: p.split(/[\\/]/).pop(), bajty: b.length, md5: md5(b) };
      });
    }
  }
  const tresc = {
    opis: 'Sumy MD5 zrzutów App Store wszystkich lokalizacji z docs/wydanie/metadane [M1-audytor-generalny-186]: pl, en-US i nl-NL leżą w repo, pozostałe poza gitem (docs/wydanie/zrzuty/README.md). scripts/asc-zgloszenie.mjs porównuje po nich zrzuty w App Store Connect (sourceFileChecksum), także bez plików. Generuje: node scripts/asc-zgloszenie.mjs --generuj-sumy <katalog zrzutów spoza repo>.',
    lokalizacje,
  };
  writeFileSync(cel, `${JSON.stringify(tresc, null, 2)}\n`);
  return Object.keys(lokalizacje).length;
}

export function stanDocelowy({ dane = 'docs/wydanie/asc-zgloszenie.json', sumy = SUMY, zrzuty = null } = {}) {
  const z = json(dane);
  const app = json('app.json').expo ?? {};
  if (!app.ios?.bundleIdentifier || !app.version) throw new BladDanych('app.json: brak expo.ios.bundleIdentifier albo expo.version');
  const linki = readFileSync(sciezka('src/lib/links.ts'), 'utf8');
  const adres = (nazwa) => {
    const m = new RegExp(`export const ${nazwa} = '([^']+)'`).exec(linki);
    if (!m) throw new BladDanych(`src/lib/links.ts: brak ${nazwa}`);
    return m[1];
  };
  const privacyPolicyUrl = adres('PRIVACY_URL');
  const supportUrl = adres('SUPPORT_URL');
  const id = {};
  for (const m of readFileSync(sciezka('src/lib/platnosci/konfiguracja.ts'), 'utf8').matchAll(/^\s*(monthly|yearly|lifetime): '([^']+)'/gm)) id[m[1]] = m[2];
  const s = json(sumy).lokalizacje ?? {};

  const kody = kodyLokalizacji();
  if (kody.length !== z.lokalizacji) throw new BladDanych(`${META}: ${kody.length} lokalizacji, a asc-zgloszenie.json mówi ${z.lokalizacji}`);
  const lokalizacje = kody.map((kod) => {
    const m = json(`${META}/${kod}.json`);
    if (m.lokalizacja !== kod) throw new BladDanych(`${META}/${kod}.json: pole lokalizacja „${m.lokalizacja}”`);
    for (const [pole, limit] of Object.entries(LIMITY)) {
      if (typeof m[pole] !== 'string' || !m[pole].trim() || znaki(m[pole]) > limit) throw new BladDanych(`${META}/${kod}.json: ${pole} pusty albo ponad ${limit} znaków`);
    }
    if (Buffer.byteLength(m.slowaKluczowe ?? '', 'utf8') > 100 || !m.slowaKluczowe) throw new BladDanych(`${META}/${kod}.json: słowa kluczowe puste albo ponad 100 bajtów`);
    const ramki = {};
    for (const klasa of Object.keys(z.klasyZrzutow)) {
      const lista = s[kod]?.[klasa];
      if (!Array.isArray(lista) || lista.length !== z.ramekNaKlase) throw new BladDanych(`${sumy}: ${kod}/${klasa} ma ${lista?.length ?? 0} ramek, a powinno ${z.ramekNaKlase}`);
      ramki[klasa] = lista.map((r) => {
        const wRepo = sciezka(`docs/wydanie/zrzuty/${kod}/${klasa}/${r.plik}`);
        const wZapasie = zrzuty ? resolve(zrzuty, kod, klasa, r.plik) : null;
        const p = existsSync(wRepo) ? wRepo : wZapasie && existsSync(wZapasie) ? wZapasie : null;
        if (p) {
          const b = readFileSync(p);
          if (md5(b) !== r.md5 || b.length !== r.bajty) throw new BladDanych(`${sumy} nieaktualne: ${kod}/${klasa}/${r.plik} ma inną sumę niż plik; wygeneruj sumy ponownie (--generuj-sumy)`);
        }
        return { ...r, sciezka: p };
      });
    }
    return {
      kod,
      info: { name: m.nazwa, subtitle: m.podtytul, privacyPolicyUrl },
      wersja: { description: m.opis, keywords: m.slowaKluczowe, promotionalText: m.tekstPromocyjny, supportUrl },
      ramki,
    };
  });

  const plikZakupu = z.zrzutZakupu ? resolve(ROOT, z.zrzutZakupu) : null;
  const zakup = plikZakupu && existsSync(plikZakupu) ? (() => {
    const b = readFileSync(plikZakupu);
    return { sciezka: plikZakupu, plik: plikZakupu.split(/[\\/]/).pop(), bajty: b.length, md5: md5(b) };
  })() : null;

  return {
    bundleId: app.ios.bundleIdentifier,
    wersja: app.version,
    grupa: json('docs/wydanie/asc-ustawienia.json').grupa.referenceName,
    produkty: ['monthly', 'yearly', 'lifetime'].map((plan) => {
      if (!id[plan]) throw new BladDanych(`konfiguracja.ts: brak ID produktu ${plan}`);
      // Limit opisu In-App Purchase: 45 znaków (App Store Connect Help); dla subskrypcji limitu nie podano, więc ten sam.
      for (const [loc, opis] of Object.entries(z.opisyProduktow?.[plan] ?? {})) {
        if (opis != null && (typeof opis !== 'string' || !opis.trim() || znaki(opis) > 45)) throw new BladDanych(`${dane}: opis produktu ${plan} ${loc} pusty albo ponad 45 znaków`);
      }
      return { plan, productId: id[plan], opisy: z.opisyProduktow?.[plan] ?? {} };
    }),
    klasy: z.klasyZrzutow,
    lokalizacje,
    zakup,
    zrzutZakupu: z.zrzutZakupu,
    prywatnosc: z.prywatnosc,
  };
}

// ---------------------------------------------------------------------------
// Odczyt stanu ASC

const e = encodeURIComponent;
/** Stany wersji, w których App Store Connect przyjmuje zmiany metadanych i zrzutów. */
const EDYTOWALNE = ['PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED', 'INVALID_BINARY'];

async function mapaLokalizacji(k, sciezkaListy) {
  const { data } = await k.wszystkie(`${sciezkaListy}?limit=200`);
  return Object.fromEntries(data.map((l) => [l.attributes?.locale, { id: l.id, atr: l.attributes ?? {} }]));
}

const plikAsc = (x) => x && { id: x.id, plik: x.attributes?.fileName, md5: x.attributes?.sourceFileChecksum ?? null, stan: x.attributes?.assetDeliveryState?.state ?? null };
/** Plik przyjęty: przetworzony albo w przetwarzaniu po wysłaniu (Apple przetwarza zrzuty po PATCH uploaded). */
const przyjety = (x) => ['COMPLETE', 'UPLOAD_COMPLETE'].includes(x?.stan);

export async function stanAsc(k, cel) {
  const apps = (await k.wszystkie(`/v1/apps?filter[bundleId]=${e(cel.bundleId)}&limit=200`)).data;
  if (apps.length !== 1) throw new BladDanych(`App Store Connect: aplikacji ${cel.bundleId} nie znaleziono`);
  const app = apps[0].id;
  const stan = { app, info: null, wersja: null, produkty: {} };

  const infos = (await k.wszystkie(`/v1/apps/${e(app)}/appInfos?limit=200`)).data;
  const info = infos.find((i) => !['READY_FOR_DISTRIBUTION', 'REPLACED_WITH_NEW_INFO'].includes(i.attributes?.state ?? i.attributes?.appStoreState)) ?? null;
  if (info) stan.info = { id: info.id, lok: await mapaLokalizacji(k, `/v1/appInfos/${e(info.id)}/appInfoLocalizations`) };

  const wersje = (await k.wszystkie(`/v1/apps/${e(app)}/appStoreVersions?filter[platform]=IOS&limit=200`)).data;
  const w = wersje.find((x) => EDYTOWALNE.includes(x.attributes?.appStoreState ?? x.attributes?.appVersionState));
  if (w) {
    const lok = await mapaLokalizacji(k, `/v1/appStoreVersions/${e(w.id)}/appStoreVersionLocalizations`);
    for (const l of Object.values(lok)) {
      const { data, included } = await k.wszystkie(`/v1/appStoreVersionLocalizations/${e(l.id)}/appScreenshotSets?include=appScreenshots&limit=200`);
      const pliki = new Map(included.filter((x) => x.type === 'appScreenshots').map((x) => [x.id, x]));
      l.zestawy = Object.fromEntries(data.map((z) => [z.attributes?.screenshotDisplayType, { id: z.id, zrzuty: (z.relationships?.appScreenshots?.data ?? []).map((r) => plikAsc(pliki.get(r.id) ?? { id: r.id })) }]));
    }
    stan.wersja = { id: w.id, versionString: w.attributes?.versionString, lok };
  }

  const grupa = (await k.wszystkie(`/v1/apps/${e(app)}/subscriptionGroups?limit=200`)).data.find((g) => g.attributes?.referenceName === cel.grupa);
  const subs = grupa ? (await k.wszystkie(`/v1/subscriptionGroups/${e(grupa.id)}/subscriptions?limit=200`)).data : [];
  for (const p of cel.produkty) {
    const sub = p.plan !== 'lifetime';
    const z = sub
      ? subs.find((x) => x.attributes?.productId === p.productId)
      : (await k.wszystkie(`/v1/apps/${e(app)}/inAppPurchasesV2?filter[productId]=${e(p.productId)}&limit=200`)).data.find((x) => x.attributes?.productId === p.productId);
    if (!z) continue;
    const baza = sub ? `/v1/subscriptions/${e(z.id)}` : `/v2/inAppPurchases/${e(z.id)}`;
    stan.produkty[p.plan] = {
      id: z.id,
      lok: await mapaLokalizacji(k, `${baza}/${sub ? 'subscriptionLocalizations' : 'inAppPurchaseLocalizations'}`),
      review: plikAsc(await k.jeden(`${baza}/appStoreReviewScreenshot`)),
    };
  }
  return stan;
}

// ---------------------------------------------------------------------------
// Wysyłanie plików (zrzuty): POST rezerwacji, PUT fragmentów pod adresy z uploadOperations, PATCH z sumą MD5

async function wyslijPlik(k, typ, relacje, plik) {
  const b = readFileSync(plik.sciezka);
  if (md5(b) !== plik.md5) throw new BladDanych(`${plik.plik}: plik zmienił się po wyliczeniu planu`);
  const r = await k.post(`/v1/${typ}`, { data: { type: typ, attributes: { fileName: plik.plik, fileSize: b.length }, relationships: relacje } });
  for (const op of r.data.attributes?.uploadOperations ?? []) {
    // Adres magazynu Apple z odpowiedzi API: bez nagłówka Authorization, tylko nagłówki z operacji.
    const naglowki = Object.fromEntries((op.requestHeaders ?? []).map((h) => [h.name, h.value]));
    const w = await fetch(op.url, { method: op.method, headers: naglowki, body: b.subarray(op.offset, op.offset + op.length) });
    if (!w.ok) throw new BladApi(op.method, `wysyłanie ${plik.plik}`, w.status, '', 'magazyn plików');
  }
  await k.patch(`/v1/${typ}/${e(r.data.id)}`, { data: { type: typ, id: r.data.id, attributes: { uploaded: true, sourceFileChecksum: plik.md5 } } });
  return r.data.id;
}

// ---------------------------------------------------------------------------
// Plan: lista operacji; `wykonaj` = null, gdy rodzic jeszcze nie istnieje albo brak plików

const BEZ = 'bez zmian';
const rel = (type, id) => ({ data: { type, id } });
const POLA = {
  name: 'nazwa', subtitle: 'podtytuł', privacyPolicyUrl: 'Privacy Policy URL',
  description: 'opis', keywords: 'słowa kluczowe', promotionalText: 'tekst promocyjny', supportUrl: 'Support URL',
};
/** Krótkie pola z wartością w liście; długie (opis, tekst promocyjny) z liczbą znaków, a pełna wartość idzie do skrótu. */
const pokaz = (kl, v) => (['description', 'promotionalText', 'keywords'].includes(kl) ? `${POLA[kl]} (${znaki(v)} zn.)` : `${POLA[kl]} „${v}”`);

export function planuj(cel, stan) {
  const ops = [];
  const op = (rodzaj, obiekt, opis, wykonaj = null, tresc = '', kod = null) => ops.push({ rodzaj, obiekt, opis, wykonaj, tresc, kod });

  if (!stan.wersja) op('ręcznie', 'wersja', `wersja iOS ${cel.wersja} w stanie edycji (Prepare for Submission): brak w App Store Connect — utwórz ją w ASC, potem uruchom ponownie (instrukcja §10.2)`);
  // Numer wersji z jednego źródła, app.json (docs/wydanie/sklep.md §1); metadane wersji dopiero po zmianie numeru (następna runda).
  else if (stan.wersja.versionString !== cel.wersja) {
    const id = stan.wersja.id;
    op('zmieni', 'wersja', `numer wersji iOS w edycji: ${cel.wersja} (teraz ${stan.wersja.versionString}; jedno źródło: app.json, docs/wydanie/sklep.md §1)`, (k) => k.patch(`/v1/appStoreVersions/${e(id)}`, { data: { type: 'appStoreVersions', id, attributes: { versionString: cel.wersja } } }));
  }
  else op(BEZ, 'wersja', `wersja iOS ${cel.wersja} w stanie edycji`);
  if (!stan.info) op('ręcznie', 'info', 'App Information w stanie edycji: brak w App Store Connect');

  for (const l of cel.lokalizacje) {
    lokOps(op, `metadane ${l.kod} (App Information)`, 'metadane', l.kod, l.info, stan.info?.lok[l.kod], stan.info && {
      utworz: (k) => k.post('/v1/appInfoLocalizations', { data: { type: 'appInfoLocalizations', attributes: { locale: l.kod, ...l.info }, relationships: { appInfo: rel('appInfos', stan.info.id) } } }),
      zmien: (id, zm) => (k) => k.patch(`/v1/appInfoLocalizations/${e(id)}`, { data: { type: 'appInfoLocalizations', id, attributes: zm } }),
    });
    const lw = stan.wersja?.lok[l.kod];
    lokOps(op, `metadane ${l.kod} (wersja ${cel.wersja})`, 'metadane', l.kod, l.wersja, lw, stan.wersja && stan.wersja.versionString === cel.wersja && {
      utworz: (k) => k.post('/v1/appStoreVersionLocalizations', { data: { type: 'appStoreVersionLocalizations', attributes: { locale: l.kod, ...l.wersja }, relationships: { appStoreVersion: rel('appStoreVersions', stan.wersja.id) } } }),
      zmien: (id, zm) => (k) => k.patch(`/v1/appStoreVersionLocalizations/${e(id)}`, { data: { type: 'appStoreVersionLocalizations', id, attributes: zm } }),
    });

    for (const [klasa, typ] of Object.entries(cel.klasy)) {
      const docel = l.ramki[klasa];
      const zestaw = lw?.zestawy?.[typ];
      const obecne = zestaw?.zrzuty ?? [];
      const opis = `zrzuty ${l.kod} ${klasa}`;
      const tresc = docel.map((r) => r.md5).join(',');
      if (obecne.length === docel.length && obecne.every((x, i) => x.md5 === docel[i].md5 && przyjety(x))) {
        // Stan przetwarzania w opisie: COMPLETE potwierdza, że Apple przyjął wymiary pliku dla tego typu ekranu.
        const stany = Object.entries(obecne.reduce((a, x) => ({ ...a, [x.stan]: (a[x.stan] ?? 0) + 1 }), {})).map(([s, n]) => `${s}×${n}`).join(', ');
        op(BEZ, 'zrzuty', `${opis}: ${docel.length} ramek (${typ}; ${stany})`, null, tresc, l.kod);
        continue;
      }
      const brakPlikow = docel.filter((r) => !r.sciezka).length;
      const dopisek = brakPlikow ? ` (pliki poza repo: ${brakPlikow} — do wysłania potrzebne --zrzuty)` : '';
      // Zestaw należy do lokalizacji wersji niezależnie od jej numeru, więc zrzuty nie czekają na zmianę numeru.
      const wykonaj = lw && !brakPlikow ? async (k) => {
        const idZestawu = zestaw?.id ?? (await k.post('/v1/appScreenshotSets', { data: { type: 'appScreenshotSets', attributes: { screenshotDisplayType: typ }, relationships: { appStoreVersionLocalization: rel('appStoreVersionLocalizations', lw.id) } } })).data.id;
        for (const x of obecne) await k.usun(`/v1/appScreenshots/${e(x.id)}`);
        const nowe = [];
        for (const r of docel) nowe.push(await wyslijPlik(k, 'appScreenshots', { appScreenshotSet: rel('appScreenshotSets', idZestawu) }, r));
        await k.patch(`/v1/appScreenshotSets/${e(idZestawu)}/relationships/appScreenshots`, { data: nowe.map((id) => ({ type: 'appScreenshots', id })) });
      } : null;
      if (!zestaw || !obecne.length) op('utworzy', 'zrzuty', `${opis}: ${docel.length} ramek (${typ})${dopisek}`, wykonaj, tresc, l.kod);
      else op('zmieni', 'zrzuty', `${opis}: zastąpi ${obecne.length} zrzutów w ASC ${docel.length} ramkami z plików${dopisek}`, wykonaj, tresc, l.kod);
    }
  }

  // Opisy lokalizacji produktów (nazwy ustawia scripts/asc-ustawienia.mjs)
  for (const p of cel.produkty) {
    const z = stan.produkty[p.plan];
    const sub = p.plan !== 'lifetime';
    for (const [loc, opis] of Object.entries(p.opisy)) {
      const nazwa = `opis produktu ${p.productId} ${loc}`;
      const x = z?.lok[loc];
      if (opis == null) op('czeka', 'produkty', `${nazwa}: brak w źródłach — decyzja właściciela (docs/wydanie/asc-zgloszenie.json, opisyProduktow)`);
      else if (!x) op('ręcznie', 'produkty', `${nazwa}: brak lokalizacji produktu w ASC — najpierw scripts/asc-ustawienia.mjs`);
      else if (x.atr.description === opis) op(BEZ, 'produkty', `${nazwa}: „${opis}”`);
      else {
        const typ = sub ? 'subscriptionLocalizations' : 'inAppPurchaseLocalizations';
        op(x.atr.description ? 'zmieni' : 'utworzy', 'produkty', `${nazwa}: „${opis}”`, (k) => k.patch(`/v1/${typ}/${e(x.id)}`, { data: { type: typ, id: x.id, attributes: { description: opis } } }));
      }
    }
  }

  // Zrzut ekranu zakupu dla App Review (Review Information produktu; instrukcja §3.8)
  for (const p of cel.produkty) {
    const z = stan.produkty[p.plan];
    const opis = `zrzut ekranu zakupu dla App Review ${p.productId}`;
    if (!cel.zakup) {
      op('czeka', 'review', `${opis}: brak pliku ${cel.zrzutZakupu}: zrzut ekranu zakupu z finalnej aplikacji (docs/wydanie/zrzuty/README.md, „Zrzut zakupu dla App Review”)`);
      continue;
    }
    const obecny = z?.review;
    if (obecny && obecny.md5 === cel.zakup.md5 && przyjety(obecny)) {
      op(BEZ, 'review', `${opis}: ${cel.zakup.plik}`, null, cel.zakup.md5);
      continue;
    }
    const sub = p.plan !== 'lifetime';
    const typ = sub ? 'subscriptionAppStoreReviewScreenshots' : 'inAppPurchaseAppStoreReviewScreenshots';
    const wykonaj = z ? async (k) => {
      if (obecny) await k.usun(`/v1/${typ}/${e(obecny.id)}`);
      await wyslijPlik(k, typ, sub ? { subscription: rel('subscriptions', z.id) } : { inAppPurchaseV2: rel('inAppPurchases', z.id) }, cel.zakup);
    } : null;
    op(obecny ? 'zmieni' : 'utworzy', 'review', `${opis}: ${cel.zakup.plik}${z ? '' : ' (produktu nie ma w ASC — najpierw scripts/asc-ustawienia.mjs)'}`, wykonaj, cel.zakup.md5);
  }

  // App Privacy: publiczne API nie ma zapisu deklaracji (odczyt dokumentacji, raport toru p8c)
  op('poza API', 'prywatnosc', `App Privacy: „${cel.prywatnosc}” — App Store Connect API tego nie zapisuje; ustaw w ASC: App Privacy → Get Started → „No, we do not collect data from this app” → Publish (instrukcja §7.1)`);
  return ops;
}

/** Lokalizacja z polami: brak → utworzy (wszystkie pola), różne pola → zmieni (tylko one). */
function lokOps(op, opis, obiekt, kod, docel, obecna, akcje) {
  const tresc = JSON.stringify(docel);
  if (!obecna) {
    op('utworzy', obiekt, `${opis}: ${Object.entries(docel).map(([kl, v]) => pokaz(kl, v)).join(', ')}`, akcje ? akcje.utworz : null, tresc, kod);
    return;
  }
  const rozne = Object.keys(docel).filter((kl) => (obecna.atr[kl] ?? null) !== docel[kl]);
  if (!rozne.length) return op(BEZ, obiekt, opis, null, tresc, kod);
  const zm = Object.fromEntries(rozne.map((kl) => [kl, docel[kl]]));
  op('zmieni', obiekt, `${opis}: ${rozne.map((kl) => pokaz(kl, docel[kl])).join(', ')}`, akcje ? akcje.zmien(obecna.id, zm) : null, tresc, kod);
}

// ---------------------------------------------------------------------------
// Raport i skrót planu

const DZIALANIA = ['utworzy', 'zmieni', 'ręcznie'];
const RODZAJE = [...DZIALANIA, 'czeka', 'poza API'];

/** Skrót obejmuje każdą pozycję poza „bez zmian”, z pełną treścią pól (sha256), nie tylko z listy. */
export function skrot(ops) {
  const linie = ops.filter((o) => o.rodzaj !== BEZ).map((o) => `${o.rodzaj}|${o.obiekt}|${o.opis}|${sha(o.tresc ?? '')}`);
  return sha(linie.join('\n'));
}

function raport(tryb, ops) {
  const ile = (r, w = ops) => w.filter((o) => o.rodzaj === r).length;
  const obiekty = [...new Set(ops.map((o) => o.obiekt))];
  return [
    `# App Store Connect — zgłoszenie — ${tryb} (${new Date().toISOString().slice(0, 10)})`,
    '',
    `Różnice: ${ops.filter((o) => DZIALANIA.includes(o.rodzaj)).length} (utworzy ${ile('utworzy')}, zmieni ${ile('zmieni')}, ręcznie ${ile('ręcznie')}); czeka ${ile('czeka')}; poza API ${ile('poza API')}; bez zmian: ${ile(BEZ)}`,
    `Skrót planu: ${skrot(ops)}`,
    '',
    '| Obiekt | utworzy | zmieni | ręcznie | czeka | poza API | bez zmian |',
    '|---|---|---|---|---|---|---|',
    ...obiekty.map((ob) => {
      const w = ops.filter((o) => o.obiekt === ob);
      return `| ${ob} | ${[...RODZAJE, BEZ].map((r) => ile(r, w)).join(' | ')} |`;
    }),
    '',
    '## Lista',
    ...ops.filter((o) => o.rodzaj !== BEZ).map((o) => `- ${o.rodzaj} · ${o.opis}`),
    '',
    // Zrzuty bez zmian ze stanem przetwarzania: dowód, że Apple przyjął typ ekranu (COMPLETE) albo jeszcze przetwarza.
    ...(ops.some((o) => o.rodzaj === BEZ && o.obiekt === 'zrzuty') ? ['## Zrzuty bez zmian', ...ops.filter((o) => o.rodzaj === BEZ && o.obiekt === 'zrzuty').map((o) => `- ${o.opis}`), ''] : []),
  ].join('\n');
}

function wypisz(tekst) {
  console.log(tekst);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${tekst}\n`);
}

// ---------------------------------------------------------------------------
// Przebieg

const arg = (argv, nazwa) => {
  const i = argv.indexOf(nazwa);
  return i >= 0 ? argv[i + 1] : undefined;
};

function zgodaZPliku(p) {
  if (!p || !existsSync(p)) return null;
  const z = JSON.parse(readFileSync(p, 'utf8'));
  if (z.zapis !== true) return null;
  if (!/^[0-9a-f]{64}$/.test(z.skrot ?? '') || !/^\d{4}-\d{2}-\d{2}: \S/.test(z.zgoda ?? '')) throw new BladZgody('plik zgody: "skrot" (64 znaki hex) i "zgoda" („RRRR-MM-DD: słowa właściciela”) są wymagane');
  return z;
}

/**
 * Zakres z pliku zgody, także przy "zapis": false: {"lokalizacja": "pl", "obiekty": ["zrzuty"]} zawęża plan, listę i skrót
 * (np. próbny zapis zrzutów jednej lokalizacji). Bez zakresu: całe zgłoszenie.
 */
function zakresZPliku(p, cel) {
  if (!p || !existsSync(p)) return null;
  const z = JSON.parse(readFileSync(p, 'utf8')).zakres;
  if (z == null) return null;
  const obiekty = ['wersja', 'info', 'metadane', 'zrzuty', 'produkty', 'review', 'prywatnosc'];
  if (!Array.isArray(z.obiekty) || !z.obiekty.length || z.obiekty.some((o) => !obiekty.includes(o))) throw new BladZgody(`plik zgody: "zakres.obiekty" z listy ${obiekty.join(', ')}`);
  if (z.lokalizacja != null && !cel.lokalizacje.some((l) => l.kod === z.lokalizacja)) throw new BladZgody(`plik zgody: lokalizacja „${z.lokalizacja}” spoza ${META}`);
  return z;
}

async function main(argv) {
  const opcje = { dane: arg(argv, '--dane'), sumy: arg(argv, '--sumy'), zrzuty: arg(argv, '--zrzuty') ?? null };
  for (const kl of ['dane', 'sumy']) if (!opcje[kl]) delete opcje[kl];
  const generuj = arg(argv, '--generuj-sumy');
  if (generuj) {
    const n = generujSumy(resolve(generuj), resolve(opcje.sumy ?? sciezka(SUMY)), json(opcje.dane ?? 'docs/wydanie/asc-zgloszenie.json').klasyZrzutow);
    console.log(`Sumy zrzutów: ${n} lokalizacji → ${opcje.sumy ?? SUMY}`);
    return 0;
  }
  const api = arg(argv, '--api') ?? API_DOMYSLNE;
  const cel = stanDocelowy(opcje);
  const zgoda = zgodaZPliku(arg(argv, '--zgoda'));
  const zakres = zakresZPliku(arg(argv, '--zgoda'), cel);
  const tajne = sekrety();
  const odczyt = klient(api, tajne, true);
  const wZakresie = (o) => !zakres || (zakres.obiekty.includes(o.obiekt) && (zakres.lokalizacja == null || o.kod === zakres.lokalizacja));
  const plan = async () => planuj(cel, await stanAsc(odczyt, cel)).filter(wZakresie);
  const ops = await plan();
  const dzialania = ops.filter((o) => DZIALANIA.includes(o.rodzaj));
  if (zakres) wypisz(`Zakres planu z pliku zgody: ${zakres.lokalizacja ?? 'wszystkie lokalizacje'}; obiekty: ${zakres.obiekty.join(', ')}\n`);
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
  // Rundy: zestawy zrzutów potrzebują lokalizacji wersji, która może powstać dopiero w tej samej rundzie.
  for (let runda = 1; runda <= 3; runda++) {
    const biezace = runda === 1 ? ops : await plan();
    const doWykonania = biezace.filter((o) => o.wykonaj && DZIALANIA.includes(o.rodzaj));
    if (!doWykonania.length) break;
    for (const o of doWykonania) {
      await o.wykonaj(zapis);
      wykonane++;
    }
  }
  const po = await plan();
  const reszta = po.filter((o) => DZIALANIA.includes(o.rodzaj));
  wypisz(`Zapisano operacji: ${wykonane}\n\nPo zapisie: różnice ${reszta.length}\n\n${raport('drugi przebieg na sucho po zapisie', po)}`);
  return reszta.length ? 5 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2)).then(
    (kod) => process.exit(kod),
    (blad) => {
      if (blad instanceof BladApi && blad.status === 403) {
        console.error(`BŁĄD: App Store Connect odmówił dostępu (403): ${zaciemnij(blad.message)}\nKlucz API ma za niską rolę. Metadane, zrzuty i produkty wymagają klucza z rolą Admin albo App Manager: utwórz go w App Store Connect (Users and Access → Integrations) i wpisz w sekretach GitHuba ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8.`);
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
