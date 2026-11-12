/**
 * Układ ekranu w teście: drzewo hosta z react-test-renderer (View/Text ze stylami komponentu) liczone silnikiem Yoga —
 * tym samym, którego używa React Native — z miarą tekstu z pliku kroju tytułów (D-392, sesja U).
 * Nie jest to render iOS: tekst krojem systemowym (SF) mierzy model 0,6 em na znak (CJK 1 em), krój tytułów —
 * szerokości glifów z tabeli hmtx pliku × 1,1 (pogrubienie 700; Chromium: 700/400 = 1,04–1,11 na 4 napisach, 2026-11-12).
 * Oba przybliżenia są celowo zawyżone, więc tytuł „mieszczący się” w teście mieści się także na urządzeniu.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { StyleSheet } from 'react-native';
import type { ReactTestRendererJSON } from 'react-test-renderer';
import { loadYoga } from 'yoga-layout/load';
import { typografia } from '../src/ui/tokeny';

type Yoga = Awaited<ReturnType<typeof loadYoga>>;
type YNode = ReturnType<Yoga['Node']['create']>;

const KROJ_PLIK = join(__dirname, '..', 'assets', 'fonts', 'SofiaSansSemiCondensed-wght.ttf');
const POGRUBIENIE = 1.1;
const EM_SYSTEM = 0.6;
const INTERLINIA = 1.2;

/** Szerokości glifów kroju tytułów (cmap format 4 + hmtx), w em. */
function szerokosciKroju(): Map<number, number> {
  const b = readFileSync(KROJ_PLIK);
  const tab: Record<string, number> = {};
  for (let i = 0; i < b.readUInt16BE(4); i++) tab[b.toString('latin1', 12 + i * 16, 16 + i * 16)] = b.readUInt32BE(12 + i * 16 + 8);
  const upm = b.readUInt16BE(tab.head + 18);
  const nh = b.readUInt16BE(tab.hhea + 34);
  const adv = (g: number) => b.readUInt16BE(tab.hmtx + Math.min(g, nh - 1) * 4) / upm;
  const out = new Map<number, number>();
  const cmap = tab.cmap;
  for (let i = 0; i < b.readUInt16BE(cmap + 2); i++) {
    const off = cmap + b.readUInt32BE(cmap + 4 + i * 8 + 4);
    if (b.readUInt16BE(off) !== 4) continue;
    const seg = b.readUInt16BE(off + 6) / 2;
    const end = off + 14, start = end + seg * 2 + 2, delta = start + seg * 2, ro = delta + seg * 2;
    for (let s = 0; s < seg; s++) {
      const e = b.readUInt16BE(end + s * 2), st = b.readUInt16BE(start + s * 2);
      const d = b.readInt16BE(delta + s * 2), r = b.readUInt16BE(ro + s * 2);
      for (let c = st; c <= e && c !== 0xffff; c++) {
        const g = r === 0 ? (c + d) & 0xffff : b.readUInt16BE(ro + s * 2 + r + (c - st) * 2);
        if (g !== 0) out.set(c, adv(g));
      }
    }
  }
  return out;
}
const KROJ = szerokosciKroju();

export interface StylTekstu { fontSize: number; kroj: boolean }

/** Szerokość napisu w pt (przybliżenie opisane w nagłówku). */
export function szerokoscNapisu(s: string, st: StylTekstu): number {
  let em = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0) ?? 0;
    const cjk = c >= 0x3000;
    em += st.kroj && KROJ.has(c) ? (KROJ.get(c) ?? 0) * POGRUBIENIE : cjk ? 1 : ch === ' ' ? 0.28 : EM_SYSTEM;
  }
  return em * st.fontSize;
}

/** Słowa napisu: w piśmie CJK każdy znak łamie się osobno, w pozostałych — po spacjach. */
function slowa(s: string): string[] {
  return s.split(/\s+/).filter(Boolean).flatMap((w) => (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(w) ? [...w] : [w]));
}

/** Najszersze słowo napisu (pt): tytuł węższy od niego łamie się wewnątrz słowa. */
export function najdluzszeSlowo(s: string, st: StylTekstu): number {
  return Math.max(...slowa(s).map((w) => szerokoscNapisu(w, st)));
}

/** Zawijanie po słowach do szerokości `max`; słowo dłuższe od wiersza łamie się po znakach (jak iOS). */
function zawin(s: string, st: StylTekstu, max: number): { szer: number; wiersze: number } {
  const spacja = szerokoscNapisu(' ', st);
  let wiersze = 1, biezacy = 0, szer = 0;
  for (const w of slowa(s)) {
    let ws = szerokoscNapisu(w, st);
    if (ws > max) {
      // słowo łamane po znakach: pełne wiersze + reszta
      if (biezacy > 0) wiersze++;
      const pelne = Math.floor(ws / max);
      wiersze += pelne; szer = max; ws -= pelne * max;
      biezacy = ws; continue;
    }
    const z = biezacy === 0 ? ws : biezacy + spacja + ws;
    if (z <= max) biezacy = z; else { wiersze++; szer = Math.max(szer, biezacy); biezacy = ws; }
  }
  return { szer: Math.max(szer, biezacy), wiersze };
}

type Styl = Record<string, unknown>;
const liczba = (v: unknown) => (typeof v === 'number' ? v : undefined);
const tekstWezla = (n: ReactTestRendererJSON | string): string =>
  typeof n === 'string' ? n : (n.children ?? []).map(tekstWezla).join('');

export interface Pudelko { x: number; y: number; w: number; h: number; tekst?: string; styl?: StylTekstu }

/**
 * Układ drzewa w kontenerze o szerokości `szerokosc` (pt). `fontScale` mnoży rozmiary tekstu (Dynamic Type).
 * Wynik: pudełka (pozycja względem kontenera) dla każdego `testID`.
 */
export async function uklad(json: ReactTestRendererJSON, szerokosc: number, fontScale = 1): Promise<Map<string, Pudelko>> {
  const Y = await loadYoga();
  const wezly: { id: string; n: YNode; tekst?: string; styl?: StylTekstu }[] = [];
  const zbuduj = (el: ReactTestRendererJSON, kroj: boolean): YNode => {
    const n = Y.Node.create();
    const s = (StyleSheet.flatten(el.props.style as never) ?? {}) as Styl;
    const set = (v: unknown, f: (x: number | `${number}%`) => void) => {
      if (typeof v === 'number' || (typeof v === 'string' && v.endsWith('%'))) f(v as never);
    };
    n.setFlexDirection({ row: Y.FLEX_DIRECTION_ROW, column: Y.FLEX_DIRECTION_COLUMN }[String(s.flexDirection ?? 'column')] ?? Y.FLEX_DIRECTION_COLUMN);
    if (s.flexWrap === 'wrap') n.setFlexWrap(Y.WRAP_WRAP);
    const al: Record<string, number> = { 'flex-start': Y.ALIGN_FLEX_START, center: Y.ALIGN_CENTER, 'flex-end': Y.ALIGN_FLEX_END, stretch: Y.ALIGN_STRETCH, baseline: Y.ALIGN_BASELINE };
    n.setAlignItems(al[String(s.alignItems ?? 'stretch')] ?? Y.ALIGN_STRETCH);
    n.setAlignContent(Y.ALIGN_FLEX_START);
    if (s.alignSelf) n.setAlignSelf(al[String(s.alignSelf)] ?? Y.ALIGN_AUTO);
    const ju: Record<string, number> = { 'flex-start': Y.JUSTIFY_FLEX_START, center: Y.JUSTIFY_CENTER, 'flex-end': Y.JUSTIFY_FLEX_END, 'space-between': Y.JUSTIFY_SPACE_BETWEEN, 'space-around': Y.JUSTIFY_SPACE_AROUND };
    n.setJustifyContent(ju[String(s.justifyContent ?? 'flex-start')] ?? Y.JUSTIFY_FLEX_START);
    if (liczba(s.flex) !== undefined) n.setFlex(s.flex as number);
    if (liczba(s.flexGrow) !== undefined) n.setFlexGrow(s.flexGrow as number);
    if (liczba(s.flexShrink) !== undefined) n.setFlexShrink(s.flexShrink as number);
    set(s.flexBasis, (v) => n.setFlexBasis(v));
    set(s.width, (v) => n.setWidth(v)); set(s.height, (v) => n.setHeight(v));
    set(s.minWidth, (v) => n.setMinWidth(v)); set(s.maxWidth, (v) => n.setMaxWidth(v));
    set(s.minHeight, (v) => n.setMinHeight(v));
    const krawedzie: [string, number][] = [['Left', Y.EDGE_LEFT], ['Right', Y.EDGE_RIGHT], ['Top', Y.EDGE_TOP], ['Bottom', Y.EDGE_BOTTOM], ['Horizontal', Y.EDGE_HORIZONTAL], ['Vertical', Y.EDGE_VERTICAL], ['', Y.EDGE_ALL]];
    for (const [k, e] of krawedzie) {
      set(s[`padding${k}`], (v) => n.setPadding(e, v));
      set(s[`margin${k}`], (v) => n.setMargin(e, v));
    }
    if (liczba(s.borderWidth) !== undefined) n.setBorder(Y.EDGE_ALL, s.borderWidth as number);
    if (liczba(s.gap) !== undefined) n.setGap(Y.GUTTER_ALL, s.gap as number);
    if (liczba(s.rowGap) !== undefined) n.setGap(Y.GUTTER_ROW, s.rowGap as number);
    if (liczba(s.columnGap) !== undefined) n.setGap(Y.GUTTER_COLUMN, s.columnGap as number);
    const id = typeof el.props.testID === 'string' ? el.props.testID : '';
    if (el.type === 'Text') {
      const tekst = tekstWezla(el);
      const styl = { fontSize: (liczba(s.fontSize) ?? 14) * fontScale, kroj: typeof s.fontFamily === 'string' || (kroj && s.fontFamily === undefined) };
      n.setMeasureFunc((w, wm) => {
        const max = wm === Y.MEASURE_MODE_UNDEFINED ? Infinity : w;
        const z = zawin(tekst, styl, max);
        return { width: Math.ceil(z.szer), height: Math.ceil(z.wiersze * styl.fontSize * INTERLINIA) };
      });
      wezly.push({ id, n, tekst, styl });
      return n;
    }
    wezly.push({ id, n });
    let i = 0;
    for (const c of el.children ?? []) if (typeof c !== 'string') n.insertChild(zbuduj(c, kroj), i++);
    return n;
  };
  const korzen = zbuduj(json, false);
  korzen.setWidth(szerokosc);
  korzen.calculateLayout(szerokosc, undefined, Y.DIRECTION_LTR);
  const wynik = new Map<string, Pudelko>();
  const pozycja = (n: YNode): { x: number; y: number } => {
    const p = n.getParent();
    const o = p ? pozycja(p) : { x: 0, y: 0 };
    return { x: o.x + n.getComputedLeft(), y: o.y + n.getComputedTop() };
  };
  for (const { id, n, tekst, styl } of wezly) {
    if (!id) continue;
    const { x, y } = pozycja(n);
    wynik.set(id, { x, y, w: n.getComputedWidth(), h: n.getComputedHeight(), tekst, styl });
  }
  korzen.freeRecursive();
  return wynik;
}

/** Rozmiar treści karty systemowej (tytul2 − 2) — do sprawdzeń w teście. */
export const ROZMIAR_TYTULU_KARTY = typografia.style.tytul2.pt - 2;
