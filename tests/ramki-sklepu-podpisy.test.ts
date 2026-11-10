/**
 * Strażnik podpisów ramek zrzutów App Store (KO-033, właściciel 2026-11-10: „Ma byc jak w treningu”; D-363, D-364). Wzór: trening
 * `tests/audit-m1-2026-10-27-037-podpisy-zrzutow.test.ts` @ 2e4b0f8. Podpis ramki = `ramki[i].naglowek` z docs/wydanie/metadane/<kod>.json
 * (krok „ramki”: scripts/ci/store-frames.sh, scripts/ci/store-caption-layout.mjs, konfiguracja docs/wydanie/zrzuty/ramki-sklepu.json).
 * Pilnuje: każda lokalizacja sklepu ma podpis każdego z 7 ekranów, najwyżej `maxZnakow` znaków, bez cen, bez powtórzeń, bez znaków,
 * które ImageMagick `label:` interpretuje („@” na początku czyta plik, „%” rozwija); oznaczenie Pro = t('wymaga Piekarz Pro') w języku
 * lokalizacji na ekranach płatnych (jak podpisy.json); kolory = tokeny motywu; grupa kroju zgodna z krojem tytułów aplikacji; znaki
 * podpisów i oznaczenia są w pliku kroju ramki (brak dałby puste prostokąty). Rodzaje: dane, języki, strażnik.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { setLang, t, type Lang } from '../src/lib/i18n';
import { kolory } from '../src/ui/tokeny';
import { JEZYKI_POZA_KROJEM_TYTULOW, JEZYKI_CYRYLICY_BEZ_FORM_KROJU } from '../src/ui/kroj-tytulow';

const root = path.join(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
type Cfg = {
  maxZnakow: number; ekrany: string[]; motyw: Record<string, 'jasny' | 'ciemny'>; pro: string[];
  kolory: Record<'jasny' | 'ciemny', Record<string, string>>; kroje: { cjk: string[]; noto: string[] }; oznaczenie: Record<string, string>;
};
const cfg: Cfg = JSON.parse(read('docs/wydanie/zrzuty/ramki-sklepu.json'));
const kody = fs.readdirSync(path.join(root, 'docs/wydanie/metadane')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
const meta = (kod: string): { jezyk: string; naglowki: unknown[] } => {
  const m: unknown = JSON.parse(read(`docs/wydanie/metadane/${kod}.json`));
  const pole = (k: string): unknown => (typeof m === 'object' && m !== null ? Reflect.get(m, k) : undefined);
  const ramki = pole('ramki');
  const jezyk = pole('jezyk');
  return {
    jezyk: typeof jezyk === 'string' ? jezyk : '',
    naglowki: Array.isArray(ramki) ? ramki.map((r: unknown) => (typeof r === 'object' && r !== null ? Reflect.get(r, 'naglowek') : undefined)) : [],
  };
};

/** Znaki obecne w czcionce TrueType (tabela cmap, podtabele formatu 4 i 12) — kopia czytnika z Treningu. */
function cmapChars(file: string): Set<number> {
  const b = fs.readFileSync(file); const n = b.readUInt16BE(4); let cmap = -1;
  for (let i = 0; i < n; i++) { const o = 12 + i * 16; if (b.toString('latin1', o, o + 4) === 'cmap') cmap = b.readUInt32BE(o + 8); }
  if (cmap < 0) throw new Error('brak tabeli cmap');
  const out = new Set<number>(); const subs = b.readUInt16BE(cmap + 2);
  for (let i = 0; i < subs; i++) {
    const off = cmap + b.readUInt32BE(cmap + 4 + i * 8 + 4); const fmt = b.readUInt16BE(off);
    if (fmt === 4) {
      const seg = b.readUInt16BE(off + 6) / 2; const ends = off + 14, starts = ends + seg * 2 + 2, deltas = starts + seg * 2, ranges = deltas + seg * 2;
      for (let s = 0; s < seg; s++) {
        const end = b.readUInt16BE(ends + s * 2), start = b.readUInt16BE(starts + s * 2), delta = b.readInt16BE(deltas + s * 2), ro = b.readUInt16BE(ranges + s * 2);
        for (let ch = start; ch <= end && ch !== 0xffff; ch++) {
          const g = ro === 0 ? (ch + delta) & 0xffff : b.readUInt16BE(ranges + s * 2 + ro + (ch - start) * 2);
          if (g !== 0) out.add(ch);
        }
      }
    } else if (fmt === 12) {
      const groups = b.readUInt32BE(off + 12);
      for (let g = 0; g < groups; g++) { const o = off + 16 + g * 12; for (let ch = b.readUInt32BE(o); ch <= b.readUInt32BE(o + 4); ch++) out.add(ch); }
    }
  }
  return out;
}

describe('ramki sklepu: podpisy z metadanych, oznaczenie Pro, kolory i kroje (KO-033, D-363, D-364)', () => {
  test('7 ekranów w kolejności podpisy.json (D-055), jeden ciemny (03, jak scena), oznaczenie Pro tam, gdzie podpisy.json', () => {
    const p: { ramki: Array<{ plik: string; oznaczenie: string | null }> } = JSON.parse(read('docs/wydanie/zrzuty/pl/podpisy.json'));
    expect(cfg.ekrany).toEqual(p.ramki.map((r) => r.plik.replace(/\.png$/, '')));
    expect(cfg.ekrany.filter((e) => cfg.motyw[e] === 'ciemny')).toEqual(['03-prowadzenie-ciemny']);
    expect(cfg.ekrany.every((e) => cfg.motyw[e] === 'jasny' || cfg.motyw[e] === 'ciemny')).toBe(true);
    expect(cfg.pro).toEqual(p.ramki.filter((r) => r.oznaczenie !== null).map((r) => r.plik.replace(/\.png$/, '')));
    expect(cfg.maxZnakow).toBe(40);
  });

  test.each(kody)('%s: nagłówek każdego ekranu, ≤ maxZnakow, bez cen, bez powtórzeń, bez „@” na początku i „%”', (kod) => {
    const { naglowki } = meta(kod);
    expect(naglowki).toHaveLength(cfg.ekrany.length);
    for (const [i, v] of naglowki.entries()) {
      const ok = typeof v === 'string' && v.trim().length > 0 && [...v.trim()].length <= cfg.maxZnakow;
      expect({ ekran: cfg.ekrany[i], ok }).toEqual({ ekran: cfg.ekrany[i], ok: true });
      const s = typeof v === 'string' ? v.trim() : '';
      expect({ ekran: cfg.ekrany[i], cena: /\d+[.,]\d{2}|[$€£¥₩]|\bzł\b/.test(s), label: /^@|%|\\/.test(s) }).toEqual({ ekran: cfg.ekrany[i], cena: false, label: false });
    }
    expect(new Set(naglowki).size).toBe(cfg.ekrany.length);
  });

  test('oznaczenie Pro: każda lokalizacja sklepu, równe t("wymaga Piekarz Pro") w jej języku', () => {
    expect(Object.keys(cfg.oznaczenie).sort()).toEqual(kody);
    for (const kod of kody) {
      setLang(meta(kod).jezyk as Lang);
      const oczekiwane = t('wymaga Piekarz Pro');
      expect({ kod, ozn: cfg.oznaczenie[kod] }).toEqual({ kod, ozn: oczekiwane });
      expect({ kod, label: /^@|%|\\/.test(oczekiwane) }).toEqual({ kod, label: false });
    }
    setLang('pl');
  });

  test('kolory ramki = tokeny motywu (tło, tusz, tusz2, obwódka, linia)', () => {
    for (const m of ['jasny', 'ciemny'] as const) {
      expect(cfg.kolory[m]).toEqual({
        tlo: kolory[m].tlo, tekst: kolory[m].tusz, oznaczenie: kolory[m].tusz2, obwodkaOznaczenia: kolory[m].obwodka, obwodkaZrzutu: kolory[m].linia,
      });
    }
  });

  test('grupa kroju: języki sklepu poza krojem tytułów aplikacji (kroj-tytulow.ts) — CJK albo Noto Sans; reszta Sofia Sans', () => {
    const jezyki = new Set(kody.map((k) => meta(k).jezyk));
    const poza = [...JEZYKI_POZA_KROJEM_TYTULOW, ...JEZYKI_CYRYLICY_BEZ_FORM_KROJU].filter((l) => jezyki.has(l)).sort();
    expect([...cfg.kroje.cjk, ...cfg.kroje.noto].sort()).toEqual(poza);
    expect(cfg.kroje.cjk.sort()).toEqual(['ja', 'ko', 'zh-Hant']);
  });

  test('znaki podpisów i oznaczenia są w pliku kroju ramki (Sofia Sans albo Noto Sans z repo; CJK: Noto Sans CJK w CI)', () => {
    const sofia = cmapChars(path.join(root, 'assets/fonts/SofiaSansSemiCondensed-wght.ttf'));
    const noto = cmapChars(path.join(root, 'docs/design/fonty/NotoSans-wdth-wght.ttf'));
    expect(sofia.has(0x41) && sofia.has(0x105) && noto.has(0x1ec7)).toBe(true); /* A, ą, ệ — kontrola czytnika */
    const braki: string[] = [];
    for (const kod of kody) {
      const { jezyk, naglowki } = meta(kod);
      if (cfg.kroje.cjk.includes(jezyk)) continue;
      const have = cfg.kroje.noto.includes(jezyk) ? noto : sofia;
      for (const v of [...naglowki, cfg.oznaczenie[kod]]) {
        for (const ch of typeof v === 'string' ? v : '') if (ch !== ' ' && !have.has(ch.codePointAt(0) ?? 0)) braki.push(`${kod}: „${ch}”`);
      }
    }
    expect([...new Set(braki)]).toEqual([]);
  });

  test('workflow: ramki z tych plików kroju (instancja Bold, fonttools przypięty), store-frames.sh po zadaniu zbierz', () => {
    const wf = read('.github/workflows/zrzuty-sklepu.yml');
    expect(wf).toContain('assets/fonts/SofiaSansSemiCondensed-wght.ttf wght=700');
    expect(wf).toContain('docs/design/fonty/NotoSans-wdth-wght.ttf wght=700 wdth=100');
    expect(wf).toMatch(/fonttools==\d+\.\d+\.\d+/);
    expect(wf).toMatch(/fonts-noto-cjk/);
    expect(wf).toContain('bash scripts/ci/store-frames.sh sklep-zrzuty sklep-ramki');
    expect(wf).toMatch(/\n {2}ramki:\n[\s\S]*?needs: \[?zbierz/);
  });
});
