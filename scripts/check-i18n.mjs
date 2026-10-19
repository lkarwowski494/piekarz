// Sprawdza kompletność tłumaczeń (Apps4Brew T-040): każde t('…') z literałem w kodzie
// musi mieć wpis w src/lib/i18n.en.ts z tymi samymi parametrami {…}.
// Uruchom: node scripts/check-i18n.mjs (kod wyjścia 1 = braki)
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const files = [];

const walk = (d) => {
  if (!existsSync(d)) return;
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.expo' && f !== 'scratch') {
        walk(p);
      }
    } else if (/\.(ts|tsx)$/.test(f) && !/i18n(\.en)?\.ts$/.test(f) && !/\.test\.(ts|tsx)$/.test(f)) {
      files.push(p);
    }
  }
};

['src', 'app'].forEach((d) => walk(join(root, d)));
if (existsSync(join(root, 'App.tsx'))) files.push(join(root, 'App.tsx'));

const unq = (s) => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
const used = new Map();

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g)) {
    used.set(unq(m[1]), f);
  }
}

// Słownik EN jest podzielony na części (limit 20 KB, CLAUDE.md): src/lib/i18n-en/czesc-*.ts
const dictPartsDir = join(root, 'src/lib/i18n-en');
const dictSrc = readdirSync(dictPartsDir)
  .filter((f) => /^czesc-\d+\.ts$/.test(f))
  .map((f) => readFileSync(join(dictPartsDir, f), 'utf8'))
  .join('\n');
const params = (k) => [...k.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

const dict = Object.fromEntries(
  [...dictSrc.matchAll(/'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g)].map((m) => [
    unq(m[1]),
    unq(m[2]),
  ])
);

const keys = new Set(Object.keys(dict));
const missing = [...used.keys()].filter((k) => !keys.has(k));
const badParams = Object.keys(dict).filter((k) => params(k) !== params(dict[k]));

// TASK-R09-02: Weryfikacja słowników Tier 1 (DE, FR, IT, ES, JA)
const tier1Path = join(root, 'src/lib/i18n.tier1.ts');
const tier1BadParams = [];
if (existsSync(tier1Path)) {
  const tier1Src = readFileSync(tier1Path, 'utf8');
  const langBlocks = [...tier1Src.matchAll(/(\w{2}):\s*\{([^}]+)\}/g)];
  for (const block of langBlocks) {
    const lang = block[1];
    const content = block[2];
    for (const m of content.matchAll(/'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g)) {
      const pl = unq(m[1]);
      const tr = unq(m[2]);
      if (params(pl) !== params(tr)) {
        tier1BadParams.push(`[${lang}] ${pl}`);
      }
    }
  }
}

console.log(`i18n: ${used.size} tekstów w kodzie, ${keys.size} w słowniku EN, słowniki Tier 1 zweryfikowane`);
if (missing.length) {
  console.log('BRAK tłumaczenia w słowniku EN:\n' + missing.map((k) => `  '${k}' (${used.get(k).replace(root, '')})`).join('\n'));
}
if (badParams.length) {
  console.log('Różne parametry {…} w PL i EN:\n' + badParams.map((k) => '  ' + k).join('\n'));
}
if (tier1BadParams.length) {
  console.log('Różne parametry {…} w słownikach Tier 1:\n' + tier1BadParams.map((k) => '  ' + k).join('\n'));
}

process.exit(missing.length || badParams.length || tier1BadParams.length ? 1 : 0);

