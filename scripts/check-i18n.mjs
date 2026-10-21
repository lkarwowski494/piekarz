// Sprawdza kompletność tłumaczeń (Apps4Brew T-040) i teksty na sztywno w kodzie.
// Uruchom: node scripts/check-i18n.mjs [--kod src,app] [--wyjatki scripts/i18n-wyjatki.json]
// Kod wyjścia: 0 bez błędów, 1 błędy, 2 konfiguracja albo skan kodu niewykonany.
//
// Bez --kod: każde t('…') z literałem musi mieć wpis w słowniku EN (src/lib/i18n-en/czesc-*.ts)
// z tymi samymi parametrami {…}. Słowniki Tier 1 usunięte (rejestr języków DEC-06, docs/lokalizacja/jezyki.md)
// [M1-audytor-generalny-073; 09-lokalizacja-008].
// Z --kod: skan składnią TypeScript (moduł roli 09 i18n-expo, `skanujKod`, format projektu: klucz = tekst PL):
//   - tekst w JSX, literał w {…} w JSX, literał w propsie z listy PROPSY, literał w Alert.alert = BŁĄD;
//   - pole danych `…Pl` wyświetlane w JSX bez t() = BŁĄD (dane domenowe po polsku w każdym języku);
//   - literał w obiekcie pod kluczem z PROPSY = UWAGA; klucz dynamiczny t(x) = UWAGA;
//   - sklejanie t() z tekstem przez + = UWAGA (użyj parametru {nazwa}).
// Kontekst: docs/lokalizacja/pl.kontekst.json ma wpis dla każdego klucza EN z aktualnymi miejscami użycia;
// klucz „tekst|kontekst” (ten sam tekst w dwóch znaczeniach) i jego tekst bazowy mają opis. Zapis pliku tylko
// przez `npm run i18n:kontekst` (--zapisz-kontekst), nigdy w `npm run verify`.
// Słowniki 33 języków (src/lib/i18n-slowniki, --slowniki <katalog> do testu): każdy klucz EN poza PÓŹNIEJ
// (docs/lokalizacja/pozniej-poza-przekladem.json) i „czeka na przekład” (docs/lokalizacja/czeka-na-przeklad.json),
// parametry, pusty tekst, formy CLDR liczby mnogiej [M1-audytor-generalny-093].
// Nazwy własne i symbole tylko przez scripts/i18n-wyjatki.json, z powodem przy każdym wpisie
// [M1-audytor-generalny-047; 09-lokalizacja-001].
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { createRequire } from 'node:module';

const root = fileURLToPath(new URL('..', import.meta.url));
const PROPSY = new Set(['title', 'label', 'placeholder', 'accessibilityLabel', 'accessibilityHint', 'headerTitle', 'tabBarLabel', 'body', 'subtitle', 'message', 'text', 'aria-label']);
const POLE_PL = /[a-z0-9]Pl$/;

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

let ts;
try {
  ts = createRequire(join(root, 'package.json'))('typescript');
} catch {
  console.log('BŁĄD konfiguracji: brak pakietu typescript w projekcie');
  process.exit(2);
}

const walk = (d, files = []) => {
  if (!existsSync(d)) return files;
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) {
      if (!['node_modules', '.expo', 'scratch', '__tests__', 'i18n-en', 'i18n-slowniki'].includes(f)) walk(p, files);
    } else if (/\.(ts|tsx)$/.test(f) && !/i18n(\.en)?\.ts$/.test(f) && !/\.(test|spec)\.(ts|tsx)$/.test(f)) {
      files.push(p);
    }
  }
  return files;
};

const parse = (file) =>
  ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
const isLit = (n) => !!n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n));

// Słownik EN jest podzielony na części (limit 20 KB, CLAUDE.md): src/lib/i18n-en/czesc-*.ts
function readDictionary(dir) {
  const dict = {};
  for (const f of readdirSync(dir).filter((x) => /^czesc-\d+\.ts$/.test(x))) {
    const visit = (n) => {
      if (ts.isPropertyAssignment(n) && isLit(n.initializer) && (ts.isStringLiteral(n.name) || ts.isIdentifier(n.name))) {
        dict[n.name.text] = n.initializer.text;
      }
      ts.forEachChild(n, visit);
    };
    visit(parse(join(dir, f)));
  }
  return dict;
}

const params = (k) => [...k.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
const isT = (n) =>
  ts.isCallExpression(n) &&
  (ts.isIdentifier(n.expression) ? n.expression.text === 't' : ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 't');

function loadExceptions(path) {
  if (!path) return { wartosci: [], pola: [] };
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const bad = [...(raw.wartosci || []), ...(raw.pola || [])].filter(
    (w) => typeof w !== 'object' || !(w.tekst || w.nazwa) || !String(w.powod || '').trim()
  );
  if (bad.length) {
    console.log(`BŁĄD konfiguracji: wpisy bez tekstu albo powodu w ${path}: ${JSON.stringify(bad)}`);
    process.exit(2);
  }
  return { wartosci: (raw.wartosci || []).map((w) => w.tekst), pola: (raw.pola || []).map((w) => w.nazwa) };
}

// Kontekst dla tłumacza bez numerów linii (stabilny przy edycji): najbliższy prop JSX albo pole obiektu,
// Alert.alert, tekst w JSX, inaczej kod [M1-audytor-generalny-074; 09-lokalizacja-009].
const rodzaj = (n) => {
  for (let p = n.parent; p && !ts.isSourceFile(p); p = p.parent) {
    if (ts.isJsxAttribute(p) || ts.isPropertyAssignment(p)) return p.name.getText();
    if (ts.isCallExpression(p) && /Alert\.alert$/.test(p.expression.getText())) return 'Alert.alert';
    if (ts.isJsxExpression(p) && !ts.isJsxAttribute(p.parent)) return 'tekst w JSX';
    if (ts.isFunctionLike(p)) return 'kod';
  }
  return 'kod';
};
const miejsca = new Map();
// Teksty tłumaczone dynamicznie (t(zmienna)): miejsce, gdzie literał PL stoi w danych, np. „src/core/x.ts (dane: namePl)”
const literaly = new Map();
const dodajMiejsce = (mapa, k, m) => (mapa.get(k) || mapa.set(k, new Set()).get(k)).add(m);

function scanCode(dirs, wyjatki) {
  const used = new Map();
  const teksty = [];
  const dynamiczne = [];
  const sklejenia = [];
  for (const file of dirs.flatMap((d) => walk(d))) {
    const sf = parse(file);
    const plik = relative(root, file).split('\\').join('/');
    const where = (n) => `${relative(root, file)}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;
    const st = (n) =>
      !n ? [] : ts.isJsxExpression(n) || ts.isParenthesizedExpression(n) ? st(n.expression)
        : ts.isConditionalExpression(n) ? [...st(n.whenTrue), ...st(n.whenFalse)]
        : ts.isBinaryExpression(n) && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.AmpersandAmpersandToken].includes(n.operatorToken.kind) ? [...st(n.left), ...st(n.right)]
        : isLit(n) ? [n.text]
        : ts.isTemplateExpression(n) ? [[n.head, ...n.templateSpans.map((x) => x.literal)].map((x) => x.text).join('…')] : [];
    const isText = (s) => /\p{L}{2,}/u.test(s) && !wyjatki.wartosci.includes(s.trim());
    const add = (n, s, blad) => teksty.push({ gdzie: where(n), tekst: s.trim(), blad });
    // Pola danych …Pl wyświetlane bez t(): szukamy w wyrażeniu, pomijając wnętrza wywołań t() i argumenty funkcji
    const plFields = (n, out = []) => {
      if (!n || isT(n)) return out;
      // warunek (x.fooPl ? … : …, x.fooPl && …) nie jest wyświetlany
      if (ts.isConditionalExpression(n)) return plFields(n.whenFalse, plFields(n.whenTrue, out));
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return plFields(n.right, out);
      const pole = (x) => POLE_PL.test(x) && !wyjatki.pola.includes(x);
      if (ts.isPropertyAccessExpression(n) && pole(n.name.text)) out.push(n.name.text);
      else if (ts.isIdentifier(n) && pole(n.text)) out.push(n.text);
      // wywołanie innej funkcji (np. formatowanie jednostek): pole …Pl w argumencie też musi przejść przez t()
      if (ts.isCallExpression(n)) {
        n.arguments.forEach((a) => plFields(a, out));
        return out;
      }
      if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isArrowFunction(n)) return out;
      ts.forEachChild(n, (c) => plFields(c, out));
      return out;
    };
    const visit = (n) => {
      const name = (ts.isJsxAttribute(n) || ts.isPropertyAssignment(n)) && n.name.getText(sf);
      if (isLit(n) && !(n.parent && isT(n.parent) && n.parent.arguments[0] === n)) dodajMiejsce(literaly, n.text, `${plik} (dane: ${rodzaj(n)})`);
      if (ts.isJsxText(n) && isText(n.text)) add(n, n.text, true);
      if (ts.isJsxExpression(n) && !ts.isJsxAttribute(n.parent)) {
        for (const s of st(n)) if (isText(s)) add(n, s, true);
        for (const f of plFields(n.expression)) add(n, `{…${f}} bez t()`, true);
      }
      if (name && PROPSY.has(name)) {
        for (const s of st(n.initializer)) if (isText(s)) add(n, s, ts.isJsxAttribute(n));
        if (ts.isJsxAttribute(n)) for (const f of plFields(n.initializer)) add(n, `${name}={…${f}} bez t()`, true);
      }
      if (ts.isCallExpression(n) && /Alert\.alert$/.test(n.expression.getText(sf))) {
        // Alert.alert pokazuje tekst użytkownikowi jak JSX = BŁĄD [M1-audytor-generalny-075]
        for (const a of n.arguments) for (const s of st(a)) if (isText(s)) add(a, s, true);
      }
      if (isT(n)) {
        const a = n.arguments[0];
        if (isLit(a)) {
          if (!used.has(a.text)) used.set(a.text, where(n));
          dodajMiejsce(miejsca, a.text, `${plik} (${rodzaj(n)})`);
        } else if (a) dynamiczne.push(`${where(n)} t(${a.getText(sf)})`);
      }
      if (
        ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.PlusToken &&
        [n.left, n.right].some(isT) && [n.left, n.right].some((x) => isT(x) || (isLit(x) && isText(x.text)))
      ) sklejenia.push(where(n));
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  return { used, teksty, dynamiczne, sklejenia };
}

const dict = readDictionary(join(root, 'src/lib/i18n-en'));
const keys = new Set(Object.keys(dict));
const bledy = [];
const uwagi = [];

const kodArg = opt('kod');
const dirs = (kodArg || 'src,app').split(',').map((d) => resolve(root, d));
const brakKat = dirs.filter((d) => !existsSync(d));
if (brakKat.length) {
  console.log(`BŁĄD konfiguracji: brak katalogu ${brakKat.join(', ')}; skan kodu niewykonany`);
  process.exit(2);
}
const wyjatki = loadExceptions(kodArg ? opt('wyjatki') || join(root, 'scripts/i18n-wyjatki.json') : undefined);
const scan = scanCode(dirs, wyjatki);

for (const [k, g] of scan.used) if (!keys.has(k)) bledy.push(`kod ${g}: brak tłumaczenia EN dla „${k}”`);
for (const k of keys) if (params(k) !== params(dict[k])) bledy.push(`słownik EN: różne parametry {…} w „${k}”`);

// Słowniki 33 języków przekładu 093 (src/lib/i18n-slowniki/<kod>/czesc-*.ts) [M1-audytor-generalny-093]:
// każdy klucz EN poza funkcjami PÓŹNIEJ i wpisami „czeka na przekład” (z datą i powodem), te same parametry,
// niepusty tekst, formy liczby mnogiej każdej kategorii CLDR języka (klucz `<forma one PL>#<kategoria>`).
// Brak wpisu w aplikacji = tekst EN, więc brak to BŁĄD, a dozwolony brak to UWAGA.
const czytajJson = (p) => (existsSync(join(root, p)) ? JSON.parse(readFileSync(join(root, p), 'utf8')) : null);
const pozniej = new Set((czytajJson('docs/lokalizacja/pozniej-poza-przekladem.json')?.klucze ?? []).map((x) => x.klucz));
const czeka = czytajJson('docs/lokalizacja/czeka-na-przeklad.json')?.klucze ?? [];
const czekaBad = czeka.filter((x) => !x.klucz || !String(x.powod || '').trim() || !/^\d{4}-\d{2}-\d{2}$/.test(String(x.od || '')));
if (czekaBad.length) bledy.push(`docs/lokalizacja/czeka-na-przeklad.json: wpisy bez klucza, powodu albo daty „od”: ${JSON.stringify(czekaBad)}`);
const czekaMap = new Map(czeka.map((x) => [x.klucz, x.jezyki ?? null]));
const grupyMnogie = [];
for (const file of dirs.flatMap((d) => walk(d))) {
  const v = (n) => {
    if (ts.isObjectLiteralExpression(n)) {
      const o = {};
      for (const pr of n.properties) if (ts.isPropertyAssignment(pr) && ts.isIdentifier(pr.name) && isLit(pr.initializer)) o[pr.name.text] = pr.initializer.text;
      if (o.one && o.other && (o.few || o.many)) grupyMnogie.push(o.one);
    }
    ts.forEachChild(n, v);
  };
  v(parse(file));
}
const slownikiDir = opt('slowniki') ? resolve(root, opt('slowniki')) : join(root, 'src/lib/i18n-slowniki');
const jezyki = existsSync(slownikiDir) ? readdirSync(slownikiDir).filter((f) => statSync(join(slownikiDir, f)).isDirectory()).sort() : [];
let dozwoloneBraki = 0;
for (const kod of jezyki) {
  const d = readDictionary(join(slownikiDir, kod));
  const e = (k, m) => bledy.push(`${kod} „${k}”: ${m}`);
  for (const [k, v] of Object.entries(d)) {
    if (!String(v).trim()) e(k, 'pusty tekst');
    const baza = k.includes('#') ? k.slice(0, k.lastIndexOf('#')) : k;
    if (params(baza) !== params(v)) e(baza, `parametry {${params(v)}} ≠ klucz {${params(baza)}}`);
  }
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(d, k)) continue;
    const cz = czekaMap.get(k);
    if (pozniej.has(k) || (czekaMap.has(k) && (!cz || cz.includes(kod)))) dozwoloneBraki++;
    else e(k, 'brak tłumaczenia');
  }
  const kategorie = new Intl.PluralRules(kod === 'pt' ? 'pt-PT' : kod).resolvedOptions().pluralCategories;
  // Grupa liczby mnogiej „czeka na przekład” (jak klucz bez przekładu): w aplikacji formy PL→EN, więc to UWAGA, nie BŁĄD
  // [M1-audytor-generalny-162]
  for (const g of new Set(grupyMnogie)) {
    const cz = czekaMap.get(g);
    const czeka = czekaMap.has(g) && (!cz || cz.includes(kod));
    for (const kat of kategorie) {
      if (Object.prototype.hasOwnProperty.call(d, `${g}#${kat}`)) continue;
      if (czeka) dozwoloneBraki++;
      else e(g, `brak formy liczby mnogiej #${kat}`);
    }
  }
}
if (dozwoloneBraki) uwagi.push(`języki przekładu: ${dozwoloneBraki} braków dozwolonych (PÓŹNIEJ albo czeka na przekład) — w aplikacji tekst EN`);


// Plik kontekstu: każdy klucz słownika EN → miejsca użycia (generowane) + opis (ręczny, zachowywany).
// Zapis tylko osobną komendą `npm run i18n:kontekst`; sprawdzenie nie aktualizuje pliku samo.
const kontekstPath = join(root, 'docs/lokalizacja/pl.kontekst.json');
const stary = existsSync(kontekstPath) ? JSON.parse(readFileSync(kontekstPath, 'utf8')) : null;
const kontekst = {};
for (const k of [...keys].sort()) {
  kontekst[k] = { gdzie: [...(miejsca.get(k) || literaly.get(k) || [])].sort() };
  if (stary?.[k]?.opis) kontekst[k].opis = stary[k].opis;
}
// Miejsca użycia porównujemy tylko przy skanie całego kodu (src i app); skan jednego katalogu sprawdza resztę bramki.
const pelnySkan = dirs.map((d) => relative(root, d).split('\\').join('/')).sort().join(',') === 'app,src';
if (!pelnySkan) {
  if (args.includes('--zapisz-kontekst')) bledy.push('kontekst: zapis tylko przy skanie --kod src,app');
} else if (args.includes('--zapisz-kontekst')) {
  writeFileSync(kontekstPath, JSON.stringify(kontekst, null, 2) + '\n');
  console.log(`zapisano ${relative(root, kontekstPath)}: ${keys.size} kluczy`);
} else if (!stary) {
  bledy.push(`brak pliku kontekstu ${relative(root, kontekstPath)} (npm run i18n:kontekst)`);
} else {
  for (const k of keys) {
    if (!stary[k]) bledy.push(`kontekst: brak wpisu dla „${k}” (npm run i18n:kontekst)`);
    else if (JSON.stringify(stary[k].gdzie) !== JSON.stringify(kontekst[k].gdzie)) bledy.push(`kontekst: nieaktualne miejsca „${k}” (npm run i18n:kontekst)`);
  }
  for (const k of Object.keys(stary)) if (!keys.has(k)) bledy.push(`kontekst: wpis „${k}” bez klucza w słowniku EN`);
}
const bezMiejsca = Object.keys(kontekst).filter((k) => !kontekst[k].gdzie.length);
if (bezMiejsca.length) uwagi.push(`kontekst: ${bezMiejsca.length} kluczy EN bez miejsca w kodzie (sieroty albo tekst z szablonu), np. „${bezMiejsca[0]}”`);
// Ten sam tekst w dwóch znaczeniach: klucz „tekst|kontekst” i jego tekst bazowy wymagają opisu dla tłumacza
for (const k of keys) {
  if (!k.includes('|')) continue;
  for (const x of [k, k.split('|')[0]]) if (keys.has(x) && !kontekst[x].opis) bledy.push(`kontekst: „${x}” bez opisu (tekst w dwóch znaczeniach)`);
}

if (kodArg) {
  for (const x of scan.teksty) (x.blad ? bledy : uwagi).push(`kod ${x.gdzie}: tekst na sztywno „${x.tekst}”`);
  for (const d of scan.dynamiczne) uwagi.push(`kod ${d}: klucz dynamiczny, sprawdź listę wartości`);
  for (const g of scan.sklejenia) uwagi.push(`kod ${g}: sklejanie tekstów, użyj parametru`);
}

for (const b of bledy) console.log('BŁĄD', b);
if (args.includes('--uwagi')) for (const u of uwagi) console.log('UWAGA', u);
console.log(
  `i18n: ${scan.used.size} tekstów t('…') w kodzie, ${keys.size} w słowniku EN, języki przekładu: ${jezyki.length}; błędy: ${bledy.length}, uwagi: ${uwagi.length}` +
    (kodArg ? ` (skan kodu: ${kodArg}; uwagi wypisuje --uwagi)` : ' (bez skanu tekstów na sztywno)')
);
process.exit(bledy.length ? 1 : 0);
