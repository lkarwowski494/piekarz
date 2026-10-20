/**
 * Strona produktu w 34 lokalizacjach App Store (D-054) z jednego źródła roli 10: docs/wydanie/metadane/<kod ASC>.json
 * [M1-audytor-generalny-095]. Skrypt scripts/sprawdz-metadane.mjs pilnuje limitów pól, słów kluczowych, nazwy według
 * D-053 (bez „Crust”), funkcji OG-05 w języku lokalizacji, 7 ramek (D-055) i reguły prawdy (język released).
 * Ten test uruchamia skrypt, sprawdza go kontrolą negatywną i wiąże pliki z tabelą §5 oraz z polami PL i EN
 * w docs/app-store-metadata-v2.md (źródło przekładu).
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.join(__dirname, '..');
const KAT = path.join(root, 'docs/wydanie/metadane');
const SKRYPT = path.join(root, 'scripts/sprawdz-metadane.mjs');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const uruchom = (...a: string[]) => spawnSync(process.execPath, [SKRYPT, ...a], { encoding: 'utf8' });

type Ramka = { naglowek: string; podtytul: string };
type Meta = {
  lokalizacja: string;
  jezyk: string;
  status: string;
  nazwa: string;
  podtytul: string;
  slowaKluczowe: string;
  tekstPromocyjny: string;
  opis: string;
  ramki: Ramka[];
};
const meta = (kod: string): Meta => JSON.parse(fs.readFileSync(path.join(KAT, `${kod}.json`), 'utf8'));

/** §5 docs/app-store-metadata-v2.md: kolejność wierszy tabeli lokalizacji (34, D-054). */
const KODY = [
  'en-US', 'en-GB', 'en-AU', 'en-CA', 'de-DE', 'nl-NL', 'fr-FR', 'fr-CA', 'it', 'es-ES', 'es-MX', 'pt-BR', 'pt-PT', 'pl',
  'cs', 'sk', 'hu', 'hr', 'sl', 'ro', 'sv', 'no', 'da', 'fi', 'ru', 'uk', 'el', 'tr', 'ja', 'ko', 'zh-Hant', 'id', 'ms', 'vi',
];

const doc = read('docs/app-store-metadata-v2.md');
const wiersz5 = (kod: string) => {
  const linia = doc.split('\n').find((l) => l.startsWith('| ') && l.includes(`| \`${kod}\` |`)) ?? '';
  const k = linia.split(' | ').map((c) => c.replace(/^\| |`| \|$/g, '').trim());
  return { nazwa: k[2], podtytul: k[4], slowa: k[6], bajty: Number(k[7]), status: k[10] };
};
const blok = (naglowek: RegExp) => new RegExp(naglowek.source + '[^\\n]*\\n\\n```text\\n([\\s\\S]*?)\\n```').exec(doc)?.[1] ?? '';
const pole = (re: RegExp) => doc.split('\n').map((l) => l.match(re)?.[1]).filter(Boolean) as string[];
const s3 = doc.split(/^## /m).find((s) => /^3\. /.test(s)) ?? '';
const podpisy3 = (re: RegExp) => [...s3.matchAll(re)].map((m) => m[1]);

describe('metadane 34 lokalizacji strony produktu (095)', () => {
  it('scripts/sprawdz-metadane.mjs: kod 0 dla 34 lokalizacji', () => {
    const r = uruchom();
    expect({ kod: r.status, bledy: r.stdout.split('\n').filter((l) => l.startsWith('BŁĄD')) }).toEqual({ kod: 0, bledy: [] });
    expect(r.stdout).toContain('OK: 34 lokalizacji bez błędów');
  });

  it('katalog ma dokładnie lokalizacje §5 (34), bez bg, et, lt, lv, sr (D-054)', () => {
    const pliki = fs.readdirSync(KAT).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
    expect([...pliki].sort()).toEqual([...KODY].sort());
    const w5 = doc.split('\n').filter((l) => /^\| [^|]+ \| `[\w-]+` \| `/.test(l)).map((l) => /\| `([\w-]+)` \|/.exec(l)?.[1]);
    expect(w5).toEqual(KODY);
  });

  it.each(KODY)('%s: nazwa, podtytuł, słowa kluczowe i status = wiersz §5', (kod) => {
    const m = meta(kod);
    const w = wiersz5(kod);
    expect({ nazwa: m.nazwa, podtytul: m.podtytul, slowa: m.slowaKluczowe, status: m.status }).toEqual({
      nazwa: w.nazwa,
      podtytul: w.podtytul,
      slowa: w.slowa,
      status: w.status,
    });
    expect(Buffer.byteLength(m.slowaKluczowe, 'utf8')).toBe(w.bajty);
  });

  it('pl i en: promocja, opis i podpisy ramek = §1–§3 i §5.1 dokumentu (źródło przekładu)', () => {
    const promo = pole(/^\| \*\*(?:Tekst promocyjny \(Promotional Text\)|Promotional Text)\*\* \| `([^`]*)`/);
    const plR = podpisy3(/\*\*Główny nagłówek \(PL\):\*\* \*([^*]+)\*/g).map((n, i) => ({ naglowek: n, podtytul: podpisy3(/\*\*Podtytuł \(PL\):\*\* \*([^*]+)\*/g)[i] }));
    const enR = podpisy3(/\*\*Main Headline \(EN\):\*\* \*([^*]+)\*/g).map((n, i) => ({ naglowek: n, podtytul: podpisy3(/\*\*Sub-headline \(EN\):\*\* \*([^*]+)\*/g)[i] }));
    expect([plR.length, enR.length]).toEqual([7, 7]);
    const pl = meta('pl');
    expect({ promo: pl.tekstPromocyjny, opis: pl.opis, ramki: pl.ramki }).toEqual({ promo: promo[0], opis: blok(/### 1\.2\. Pełny Opis Aplikacji/), ramki: plR });
    const us = meta('en-US');
    expect({ promo: us.tekstPromocyjny, opis: us.opis, ramki: us.ramki }).toEqual({ promo: promo[1], opis: blok(/### 2\.2\. Pełny Opis Aplikacji/), ramki: enR });
    const gb = blok(/#### 5\.1\.1\. Pełny opis en-GB, en-AU, en-CA/);
    const promo51 = (kod: string) => doc.split('\n').find((l) => l.startsWith(`| ${kod}`) && /\| \d+ \|$/.test(l))?.split(' | ')[1];
    for (const kod of ['en-GB', 'en-AU', 'en-CA']) {
      const m = meta(kod);
      expect({ kod, opis: m.opis, ramki: m.ramki }).toEqual({ kod, opis: gb, ramki: enR });
    }
    expect(meta('en-GB').tekstPromocyjny).toBe(promo51('en-GB, en-AU'));
    expect(meta('en-AU').tekstPromocyjny).toBe(promo51('en-GB, en-AU'));
    expect(meta('en-CA').tekstPromocyjny).toBe(promo51('en-CA'));
  });

  it.each(KODY.filter((k) => !/^(pl|en-)/.test(k)))('%s: przekład z nazwą lokalną (D-053) w opisie i promocji', (kod) => {
    const m = meta(kod);
    const slowo = m.nazwa.split(/:| - /)[0].trim();
    expect(m.opis).toContain(slowo);
    expect(m.opis).not.toMatch(/Crust|Piekarz|Baker\b/);
    expect(m.opis.trim().split('\n').pop()).toMatch(/35/);
  });

  it('kontrola negatywna: skrypt zgłasza złamane limity, „Crust”, OG-05, brak lokalizacji i lokalizację spoza listy', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'metadane-095-'));
    try {
      for (const f of fs.readdirSync(KAT)) fs.copyFileSync(path.join(KAT, f), path.join(tmp, f));
      const de = meta('de-DE');
      de.nazwa = 'X'.repeat(31);
      de.slowaKluczowe = `${'a'.repeat(99)},b`;
      de.opis += ' Crust';
      de.ramki[0].podtytul += ' Vorratskammer';
      de.tekstPromocyjny = 'Teig '.repeat(35);
      fs.writeFileSync(path.join(tmp, 'de-DE.json'), JSON.stringify(de));
      const ja = meta('ja');
      ja.ramki[1].naglowek += '氷';
      fs.writeFileSync(path.join(tmp, 'ja.json'), JSON.stringify(ja));
      fs.rmSync(path.join(tmp, 'fr-FR.json'));
      fs.writeFileSync(path.join(tmp, 'bg.json'), '{}');
      const r = uruchom(tmp);
      expect(r.status).toBe(1);
      for (const oczekiwany of [
        'de-DE.nazwa: 31 znaków',
        'de-DE.slowaKluczowe: 101 B > 100 B',
        'de-DE.slowaKluczowe: „b” ma najwyżej 2 znaki',
        'de-DE.opis: „Crust”',
        'de-DE.ramki[1].podtytul: funkcja PÓŹNIEJ/NIE (OG-05) „Vorratskammer”',
        'de-DE.tekstPromocyjny: 175 znaków',
        'ja.ramki[2].naglowek: funkcja PÓŹNIEJ/NIE (OG-05) „氷”',
        'fr-FR: brak pliku',
        'bg: lokalizacja spoza listy 34',
      ]) expect(r.stdout).toContain(oczekiwany);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('lista słów OG-05 każdego języka trafia w przekład terminów ze słownika aplikacji (druk, spiżarnia, przelicznik, lód, QR)', () => {
    const d = JSON.parse(read('scripts/og05-slowa.json'));
    const KLUCZE = ['Drukuj', 'Spiżarnia mąk & Stan zapasów', 'Przelicznik objętości', 'w tym lód', 'Skaner QR'];
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&');
    const slownik = (dir: string) =>
      fs.readdirSync(path.join(root, dir)).filter((f) => /^czesc-\d+\.ts$/.test(f)).map((f) => read(`${dir}/${f}`)).join('\n');
    const katalogi: Record<string, string[]> = { en: ['src/lib/i18n-en'], es: ['src/lib/i18n-slowniki/es', 'src/lib/i18n-slowniki/es-419'], pt: ['src/lib/i18n-slowniki/pt', 'src/lib/i18n-slowniki/pt-BR'] };
    const braki: string[] = [];
    for (const [j, { granica, slowa }] of Object.entries(d.jezyki as Record<string, { granica: boolean; slowa: string[] }>)) {
      const re = [...d.wspolne, ...slowa].map((s: string) => new RegExp((granica ? '(?<![\\p{L}\\p{N}])' : '') + `(?:${s})`, 'iu'));
      const terminy: string[] = [];
      if (j === 'pl') terminy.push(...KLUCZE);
      else
        for (const dir of katalogi[j] ?? [`src/lib/i18n-slowniki/${j}`]) {
          const src = slownik(dir);
          for (const k of KLUCZE) {
            const m = new RegExp(`^\\s*'${esc(k)}': '((?:[^'\\\\]|\\\\.)*)'`, 'm').exec(src);
            terminy.push(m ? m[1] : `(brak klucza ${k} w ${dir})`);
          }
        }
      for (const t of terminy) if (!re.some((r) => r.test(t))) braki.push(`${j}: ${t}`);
    }
    expect(braki).toEqual([]);
  });
});
