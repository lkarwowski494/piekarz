// kontrola-003.mjs — kontrola BRD dla 01-odkrywanie-003 (faza zakwasu z okna szczytu bez źródła).
// node kontrola-003.mjs [repo=.]  → kod 0 gdy BRD opisuje aktualny kod i zakazuje fazy z okna bez RD; 1 w przeciwnym razie.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const repo = process.argv[2] || '.';
const czytaj = (p) => readFileSync(join(repo, p), 'utf8');
const bledy = [];
const op39 = czytaj('docs/brd/README.md').split('\n').find((l) => l.startsWith('| OP-39 |')) || '';
if (/do 2 h, do 5 h|głodny po 14 h/.test(op39)) bledy.push('OP-39 opisuje wycofane progi 2/5/9/14 h (ZAK-SZC-901), nie aktualny kod');
if (!/6,0–8,5 h/.test(op39) || !/starter-peak-predictor\.ts/.test(op39)) bledy.push('OP-39 nie opisuje okna predyktora 6,0–8,5 h z mnożnikami (src/core/starter-peak-predictor.ts)');
const zakw = czytaj('docs/brd/wymagania-zakwas.md');
const br = zakw.slice(zakw.indexOf('### BR-ZAKW-003'), zakw.indexOf('### BR-ZAKW-004'));
const scen = br.slice(br.indexOf('Scenariusz: Przewidywanie z godzin'));
if (!/nie widzi[^\n]*(okn[ao] szczytu|szacowan)/.test(scen)) bledy.push('BR-ZAKW-003 „Przewidywanie z godzin”: brak zakazu fazy z okna szczytu („nie widzi … okna szczytu”)');
const reg = czytaj('docs/brd/reguly.md');
if (/progi faz zakwasu w godzinach \(`src\/core\/sourdough-physics\.ts`\)/.test(reg)) bledy.push('reguly.md: wpis „bez źródła” wskazuje progi faz w sourdough-physics.ts zamiast okna predyktora');
if (!/\| ER-79 \|[^\n]*01-odkrywanie-003/.test(czytaj('docs/brd/errata.md'))) bledy.push('errata: brak wpisu ER-79 dla 01-odkrywanie-003');
for (const b of bledy) console.log('BŁĄD', b);
console.log(bledy.length ? `kontrola-003: ${bledy.length} błędów` : 'kontrola-003: OK');
process.exit(bledy.length ? 1 : 0);
