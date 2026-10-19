// Sprawdza kompletność tłumaczeń (Apps4Brew T-040) i teksty na sztywno w kodzie.
// Uruchom: node scripts/check-i18n.mjs [--kod src,app] [--wyjatki scripts/i18n-wyjatki.json]
// Kod wyjścia: 0 bez błędów, 1 błędy, 2 konfiguracja albo skan kodu niewykonany.
//
// Bez --kod: każde t('…') z literałem musi mieć wpis w słowniku EN (src/lib/i18n-en/czesc-*.ts)
// z tymi samymi parametrami {…}; słowniki Tier 1 mają te same parametry.
// Z --kod: skan składnią TypeScript (moduł roli 09 i18n-expo, `skanujKod`, format projektu: klucz = tekst PL):
//   - tekst w JSX, literał w {…} w JSX, literał w propsie z listy PROPSY, literał w Alert.alert = BŁĄD;
//   - pole danych `…Pl` wyświetlane w JSX bez t() = BŁĄD (dane domenowe po polsku w każdym języku);
//   - literał w obiekcie pod kluczem z PROPSY = UWAGA; klucz dynamiczny t(x) = UWAGA;
//   - sklejanie t() z tekstem przez + = UWAGA (użyj parametru {nazwa}).
// Nazwy własne i symbole tylko przez scripts/i18n-wyjatki.json, z powodem przy każdym wpisie
// [M1-audytor-generalny-047; 09-lokalizacja-001].
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
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
      if (!['node_modules', '.expo', 'scratch', '__tests__', 'i18n-en'].includes(f)) walk(p, files);
    } else if (/\.(ts|tsx)$/.test(f) && !/i18n(\.en|\.tier1)?\.ts$/.test(f) && !/\.(test|spec)\.(ts|tsx)$/.test(f)) {
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

function scanCode(dirs, wyjatki) {
  const used = new Map();
  const teksty = [];
  const dynamiczne = [];
  const sklejenia = [];
  for (const file of dirs.flatMap((d) => walk(d))) {
    const sf = parse(file);
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

// TASK-R09-02: Weryfikacja słowników Tier 1 (DE, FR, IT, ES, JA)
const tier1Path = join(root, 'src/lib/i18n.tier1.ts');
if (existsSync(tier1Path)) {
  const tier1Src = readFileSync(tier1Path, 'utf8');
  for (const block of tier1Src.matchAll(/(\w{2}):\s*\{([^}]+)\}/g)) {
    for (const m of block[2].matchAll(/'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g)) {
      if (params(m[1]) !== params(m[2])) bledy.push(`słownik Tier 1 [${block[1]}]: różne parametry {…} w „${m[1]}”`);
    }
  }
}

if (kodArg) {
  for (const x of scan.teksty) (x.blad ? bledy : uwagi).push(`kod ${x.gdzie}: tekst na sztywno „${x.tekst}”`);
  for (const d of scan.dynamiczne) uwagi.push(`kod ${d}: klucz dynamiczny, sprawdź listę wartości`);
  for (const g of scan.sklejenia) uwagi.push(`kod ${g}: sklejanie tekstów, użyj parametru`);
}

for (const b of bledy) console.log('BŁĄD', b);
if (args.includes('--uwagi')) for (const u of uwagi) console.log('UWAGA', u);
console.log(
  `i18n: ${scan.used.size} tekstów t('…') w kodzie, ${keys.size} w słowniku EN; błędy: ${bledy.length}, uwagi: ${uwagi.length}` +
    (kodArg ? ` (skan kodu: ${kodArg}; uwagi wypisuje --uwagi)` : ' (bez skanu tekstów na sztywno)')
);
process.exit(bledy.length ? 1 : 0);
