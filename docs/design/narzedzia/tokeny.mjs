// tokeny.mjs — z docs/design/tokeny.json generuje tokeny.ts (propozycja modułu motywu) i kontrast.md (tabela kontrastu we wszystkich wariantach).
// Użycie: node docs/design/narzedzia/tokeny.mjs  (kod wyjścia 1, gdy którakolwiek para nie spełnia progu)
// Wzory luminancji i kontrastu: WCAG 2.2, definicje „relative luminance” i „contrast ratio” (jak kontrast.mjs).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const t = JSON.parse(readFileSync(resolve(dir, 'tokeny.json'), 'utf8'));
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const warianty = Object.keys(t.kolory);
let fail = 0;
let md = `# Tabela kontrastu (wygenerowana)\n\nŹródło: \`tokeny.json\`; skrypt: \`narzedzia/tokeny.mjs\`; data: ${new Date().toISOString().slice(0, 10)}. Próg 4,5 dla tekstu, 3 dla grafiki z danymi i obwódek (WCAG 2.2, 1.4.3 i 1.4.11). Nie edytuj ręcznie.\n\n| Para | Użycie | Próg | ${warianty.join(' | ')} |\n|---|---|---|${warianty.map(() => '---').join('|')}|\n`;
for (const [fg, bg, min, opis] of t.pary) {
  const kom = warianty.map((w) => {
    const a = t.kolory[w][fg], b = t.kolory[w][bg];
    const r = ratio(a, b); if (r < min) fail++;
    return `${r >= min ? '' : '**BRAK** '}${r.toFixed(2).replace('.', ',')} (${a} / ${b})`;
  });
  md += `| ${fg} / ${bg} | ${opis} | ${String(min).replace('.', ',')} | ${kom.join(' | ')} |\n`;
}
md += `\nWynik: ${fail ? fail + ' par poniżej progu' : 'wszystkie pary spełniają progi'} (${t.pary.length} par × ${warianty.length} warianty).\n`;
writeFileSync(resolve(dir, 'kontrast.md'), md);
const ts = `// Propozycja modułu motywu Piekarza (kierunek A „Koszyk spiralny”, D-049, D-050).\n// WYGENEROWANE z docs/design/tokeny.json przez docs/design/narzedzia/tokeny.mjs — nie edytuj ręcznie.\n// Wdrożenie: partia 5 (rola 08), np. src/ui/theme.ts; warianty wybiera useColorScheme() i AccessibilityInfo (Zwiększ kontrast).\n\nexport type WariantMotywu = ${warianty.map((w) => `'${w}'`).join(' | ')};\n\nexport const kolory = ${JSON.stringify(t.kolory, null, 2)} as const;\n\nexport const typografia = ${JSON.stringify(t.typografia, null, 2)} as const;\n\nexport const odstepy = ${JSON.stringify(t.odstepy)} as const;\n\nexport const promienie = ${JSON.stringify(t.promienie)} as const;\n\nexport const cele = ${JSON.stringify(t.cele)} as const;\n\nexport const ruch = ${JSON.stringify(t.ruch, null, 2)} as const;\n\nexport const haptyka = ${JSON.stringify(t.haptyka, null, 2)} as const;\n`;
writeFileSync(resolve(dir, 'tokeny.ts'), ts);
console.log(`kontrast.md i tokeny.ts zapisane; par poniżej progu: ${fail}`);
process.exit(fail ? 1 : 0);
