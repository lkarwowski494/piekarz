#!/usr/bin/env node
// Układ podpisów na ramkach zrzutów App Store (scripts/ci/store-frames.sh; KO-033 „jak w Treningu”, D-363). Port z repo trening
// `scripts/ci/store-caption-layout.mjs` @ 2e4b0f8: jeden rozmiar czcionki na lokalizację (największy, przy którym każdy jej podpis
// mieści się w polu w 1 albo 2 wierszach), podział na 2 wiersze tylko między słowami — ja i zh-Hant dzielone przez Intl.Segmenter;
// interpunkcja i w japońskim cząstki pisane hiraganą doklejone do poprzedniego słowa; bez podziału zaraz po jednoliterowym słowie.
// Źródło podpisów: `docs/wydanie/metadane/<kod>.json`, pole `ramki[i].naglowek` (kolejność = `ekrany` w docs/wydanie/zrzuty/ramki-sklepu.json).
// Użycie: node scripts/ci/store-caption-layout.mjs <kod lokalizacji ASC> <czcionka> <szerokość_pola> <wysokość_pola>
//   → stdout JSON {"pointsize": P, "podpisy": {"<ekran>": "wiersz 1\nwiersz 2"}}; pomiar tekstu: ImageMagick `convert … label:` przy 100 pt.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const NO_SPACES = new Set(['ja', 'zh-Hant']);
/** Znaki, od których wiersz nie może się zaczynać (interpunkcja zamykająca; japońskie i chińskie zasady łamania). */
const NO_LINE_START = /^[、。，．,.!?！？:：;；)）\]」』…・ー]+$/u;
/** Podział zaraz po przecinku, pytajniku albo myślniku ma pierwszeństwo (jeśli mieści się w rozmiarze języka) — nie rozdziela fraz. */
const AFTER_PUNCT = /[,，、?？:：;；—–]$/u;
const HIRAGANA_ONLY = /^[ぁ-ゟ]+$/u;

/** Słowa (jednostki, między którymi wolno złamać wiersz) wraz z separatorem, który je poprzedza. `lang` = język aplikacji (pole `jezyk` metadanych). */
export function tokens(lang, text) {
  if (!NO_SPACES.has(lang)) return text.split(/ +/).filter(Boolean).map((w, i) => ({ w, sep: i ? ' ' : '' }));
  const out = []; let sep = '';
  for (const { segment } of new Intl.Segmenter(lang, { granularity: 'word' }).segment(text)) {
    if (segment.trim() === '') { sep = ' '; continue; }
    const glue = out.length && !sep && (NO_LINE_START.test(segment) || (lang === 'ja' && HIRAGANA_ONLY.test(segment)));
    if (glue) out[out.length - 1].w += segment; else out.push({ w: segment, sep });
    sep = '';
  }
  return out;
}

/** Kandydaci układu: jeden wiersz i każdy podział na dwa wiersze między słowami (bez podziału po jednoliterowym słowie: „i”, „a”, „z”, „w”). */
export function layouts(toks) {
  const join2 = (a) => a.map((t, i) => (i ? t.sep : '') + t.w).join('');
  const out = [join2(toks)];
  for (let i = 1; i < toks.length; i++) if (!/^\p{L}$/u.test(toks[i - 1].w)) out.push(`${join2(toks.slice(0, i))}\n${join2(toks.slice(i))}`);
  return out;
}

/** Największy rozmiar (pt), przy którym tekst mieści się w polu W×H — pomiar przy 100 pt skaluje się liniowo. */
export const fit = ({ w, h }, W, H) => Math.floor(100 * Math.min(W / w, H / h));

/**
 * Rozmiar lokalizacji i układ każdego podpisu. `measure(text)` → {w, h} przy 100 pt. Rozmiar = najmniejszy z najlepszych rozmiarów
 * jej podpisów; przy nim podpis bierze jeden wiersz, jeśli się mieści, inaczej podział po znaku interpunkcyjnym, dalej najwęższy.
 */
export function plan(lang, captions, W, H, measure) {
  const opts = Object.fromEntries(Object.entries(captions).map(([k, text]) =>
    [k, layouts(tokens(lang, text)).map((t) => ({ t, f: fit(measure(t), W, H), w: measure(t).w }))]));
  const pointsize = Math.min(...Object.values(opts).map((o) => Math.max(...o.map((x) => x.f))));
  const podpisy = {};
  for (const [k, o] of Object.entries(opts)) {
    const ok = o.filter((x) => x.f >= pointsize);
    const poZnaku = ok.filter((x) => AFTER_PUNCT.test(x.t.split('\n')[0] ?? ''));
    podpisy[k] = (ok.find((x) => !x.t.includes('\n')) ?? (poZnaku.length ? poZnaku : ok).sort((a, b) => a.w - b.w)[0]).t;
  }
  return { pointsize, podpisy };
}

/** Podpisy lokalizacji z metadanych: { jezyk, podpisy: { ekran: nagłówek } } albo { blad }. Ekran bez nagłówka = brak (pomijany w ramkach z ostrzeżeniem). */
export function podpisyLokalizacji(kod, root = ROOT) {
  const cfg = JSON.parse(readFileSync(join(root, 'docs/wydanie/zrzuty/ramki-sklepu.json'), 'utf8'));
  let m;
  try { m = JSON.parse(readFileSync(join(root, 'docs/wydanie/metadane', `${kod}.json`), 'utf8')); } catch { return { blad: `brak metadanych ${kod}` }; }
  const ramki = Array.isArray(m.ramki) ? m.ramki : [];
  const podpisy = {};
  cfg.ekrany.forEach((e, i) => {
    const n = ramki[i]?.naglowek;
    if (typeof n === 'string' && n.trim()) podpisy[e] = n.trim();
  });
  return { jezyk: typeof m.jezyk === 'string' ? m.jezyk : kod, podpisy };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [kod, font, W, H] = process.argv.slice(2);
  const p = podpisyLokalizacji(kod);
  if (p.blad) { console.error(p.blad); process.exit(1); }
  const cache = new Map();
  const measure = (t) => {
    if (!cache.has(t)) {
      const [w, h] = execFileSync('convert', ['-font', font, '-pointsize', '100', `label:${t}`, '-format', '%w %h', 'info:'], { encoding: 'utf8' }).trim().split(' ').map(Number);
      cache.set(t, { w, h });
    }
    return cache.get(t);
  };
  process.stdout.write(JSON.stringify(plan(p.jezyk, p.podpisy, Number(W), Number(H), measure)));
}
