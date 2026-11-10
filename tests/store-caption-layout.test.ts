/* Układ podpisów na ramkach zrzutów App Store (scripts/ci/store-caption-layout.mjs, store-frames.sh; KO-033, D-363). Port testu z repo
 * trening `tests/store-caption-layout.test.ts` @ 2e4b0f8 (przegląd ramek Treningu 29.10.2026: różny rozmiar czcionki w języku, słowo
 * w trzecim wierszu, japoński cięty w środku słowa, chiński wiersz od „、”). Pomiar tekstu w teście zastępczy (szerokość ∝ liczbie znaków,
 * CJK ×2) — ImageMagick tylko w CI. Podpisy: nagłówki z docs/wydanie/metadane/<kod>.json (wszystkie 34 lokalizacje). */
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

const root = path.join(__dirname, '..');
const mod = path.join(root, 'scripts/ci/store-caption-layout.mjs');
const run = (code: string) => {
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', `import * as L from ${JSON.stringify(mod)}; ${code}`], { encoding: 'utf8', cwd: root });
  if (r.status !== 0) throw new Error(r.stderr);
  return JSON.parse(r.stdout);
};
/* 100 pt: znak łaciński 55 px, CJK/hangul 100 px; wiersz 120 px. */
const FAKE = `const measure = t => { const ls = t.split('\\n'); const w = l => [...l].reduce((s, c) => s + (/[\\u3000-\\u9fff\\uac00-\\ud7af\\uff00-\\uffef]/.test(c) ? 100 : 55), 0); return { w: Math.max(...ls.map(w)), h: 120 * ls.length }; };`;
const kody = fs.readdirSync(path.join(root, 'docs/wydanie/metadane')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
const NO_LINE_START = /^[、。，．,.!?！？:：;；)）\]」』…・ーァィゥェォッャュョヮ]/u;

describe('podpisy ramek: łamanie wierszy i rozmiar czcionki (port z Treningu)', () => {
  test('japoński: słowa całe, cząstki i interpunkcja przy poprzednim słowie; chiński: „、” nie zaczyna słowa; spacje dzielą inne języki', () => {
    const ja = run(`console.log(JSON.stringify(L.tokens('ja', '全履歴をアカウントも広告もなしで').map(t => t.w)))`);
    expect(ja).toContain('アカウントも');
    for (const w of ja) expect(w).not.toMatch(/^[をもで]/u);
    for (const w of run(`console.log(JSON.stringify(L.tokens('zh-Hant', '完整紀錄，免帳號、無廣告').map(t => t.w)))`)) expect(w).not.toMatch(NO_LINE_START);
    expect(run(`console.log(JSON.stringify(L.tokens('pl', 'Chleb gotowy na twoją godzinę').map(t => t.w)))`)).toEqual(['Chleb', 'gotowy', 'na', 'twoją', 'godzinę']);
  });

  test('podpisyLokalizacji: nagłówki z metadanych w kolejności ekranów, język aplikacji z pola `jezyk`', () => {
    const p = run(`console.log(JSON.stringify(L.podpisyLokalizacji('no')))`);
    expect(p.jezyk).toBe('nb');
    const meta = JSON.parse(fs.readFileSync(path.join(root, 'docs/wydanie/metadane/pl.json'), 'utf8'));
    const pl = run(`console.log(JSON.stringify(L.podpisyLokalizacji('pl')))`);
    expect(Object.values(pl.podpisy)).toEqual(meta.ramki.map((r: { naglowek: string }) => r.naglowek));
    expect(Object.keys(pl.podpisy)[2]).toBe('03-prowadzenie-ciemny');
    expect(run(`console.log(JSON.stringify(L.podpisyLokalizacji('xx')))`)).toEqual({ blad: 'brak metadanych xx' });
    /* „@” na początku i „%” nie trafiają do pomiaru (label: czytałby plik) — katalog tymczasowy z metadanymi testowymi */
    const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'pod-'));
    fs.mkdirSync(path.join(tmp, 'docs/wydanie/metadane'), { recursive: true }); fs.mkdirSync(path.join(tmp, 'docs/wydanie/zrzuty'), { recursive: true });
    fs.copyFileSync(path.join(root, 'docs/wydanie/zrzuty/ramki-sklepu.json'), path.join(tmp, 'docs/wydanie/zrzuty/ramki-sklepu.json'));
    fs.writeFileSync(path.join(tmp, 'docs/wydanie/metadane/pl.json'), JSON.stringify({ jezyk: 'pl', ramki: [{ naglowek: '@/etc/passwd' }, { naglowek: '100% chleba' }, { naglowek: 'Dobry' }] }));
    expect(run(`console.log(JSON.stringify(L.podpisyLokalizacji('pl', ${JSON.stringify(tmp)}).podpisy))`)).toEqual({ '03-prowadzenie-ciemny': 'Dobry' });
  });

  test('każda lokalizacja sklepu: jeden rozmiar dla wszystkich podpisów, najwyżej 2 wiersze, bez wiersza od interpunkcji, tekst bez zmian', () => {
    for (const kod of kody) {
      const p = run(`${FAKE} const c = L.podpisyLokalizacji(${JSON.stringify(kod)}); console.log(JSON.stringify({ c: c.podpisy, p: L.plan(c.jezyk, c.podpisy, 1135, 387, measure) }))`);
      expect({ kod, ok: Number.isInteger(p.p.pointsize) && p.p.pointsize > 0 }).toEqual({ kod, ok: true });
      expect(Object.keys(p.p.podpisy)).toHaveLength(7);
      for (const [k, t] of Object.entries(p.p.podpisy as Record<string, string>)) {
        const lines = t.split('\n');
        expect({ kod, k, lines: lines.length <= 2 }).toEqual({ kod, k, lines: true });
        for (const l of lines) expect({ kod, k, l, start: NO_LINE_START.test(l) }).toEqual({ kod, k, l, start: false });
        if (lines.length === 2) expect({ kod, k, l: lines[0], jednaLitera: / \p{L}$/u.test(lines[0]) }).toEqual({ kod, k, l: lines[0], jednaLitera: false });
        expect(t.replace(/\s+/g, '')).toBe(p.c[k].replace(/\s+/g, ''));
        for (const l of lines) expect({ kod, k, l, wTekscie: p.c[k].includes(l) }).toEqual({ kod, k, l, wTekscie: true });
      }
    }
  });

  test('dwa wiersze — po przecinku, gdy się mieści; bez pojedynczego słowa w drugim wierszu', () => {
    const p = run(`${FAKE} console.log(JSON.stringify(L.plan('de', { a: 'Sätze schnell eintragen, auch an der Uhr', b: 'Woche und Monat an einem Ort' }, 1135, 430, measure)))`);
    expect(p.podpisy.a).toBe('Sätze schnell eintragen,\nauch an der Uhr');
    expect(p.podpisy.b.split('\n').every((l: string) => l.split(' ').length >= 2)).toBe(true);
  });

  test('store-frames.sh: stały rozmiar lokalizacji (label + pointsize z planu), bez caption:, odrzuca „@” i „%”, PNG bez alfy', () => {
    const sh = fs.readFileSync(path.join(root, 'scripts/ci/store-frames.sh'), 'utf8');
    expect(sh).toContain('scripts/ci/store-caption-layout.mjs');
    expect(sh).toMatch(/-pointsize "\$PT" label:"\$text"/);
    expect(sh).not.toMatch(/caption:/);
    expect(sh).toMatch(/@\*\|\*%\*\) echo "::error::/);
    expect(sh).toMatch(/-alpha remove -alpha off -depth 8 -define png:color-type=2/);
  });
});
