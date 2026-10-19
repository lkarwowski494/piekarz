/**
 * Jeden dokument metadanych sklepu (`docs/app-store-metadata-v2.md`) i słowa kluczowe w limicie Apple
 * w każdym języku dokumentu [M1-audytor-generalny-036; 10-wydanie-004]. Decyzja właściciela 2026-10-19 („3a”):
 * teraz PL i EN; pozostałe języki dopisze 095 (partia 4) — ten test obejmie je automatycznie.
 * App Store Connect Help (odczyt 2026-10-19, role/10-wydanie): słowa kluczowe „up to 100 bytes”,
 * bez powtarzania wyrazów z nazwy aplikacji.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const META = 'docs/app-store-metadata-v2.md';

type Pole = 'name' | 'subtitle' | 'keywords';
const ETYKIETY: Record<Pole, RegExp> = {
  name: /^\| \*\*(Nazwa aplikacji \(Name\)|App Name)\*\* \| `([^`]*)` \| \*\*(\d+)\*\*/,
  subtitle: /^\| \*\*(Podtytuł \(Subtitle\)|Subtitle)\*\* \| `([^`]*)` \| \*\*(\d+)\*\*/,
  keywords: /^\| \*\*(Słowa kluczowe \(Keywords\)|Keywords)\*\* \| `([^`]*)` \| \*\*(\d+)\*\*/,
};

/** Sekcje języków: „## N. Karta Produktu App Store (…)” → pola nazwy, podtytułu i słów kluczowych. */
function jezyki() {
  const out: Array<{ sekcja: string } & Partial<Record<Pole, { tekst: string; podane: number }>>> = [];
  for (const linia of read(META).replace(/\r\n/g, '\n').split('\n')) {
    if (/^## \d+\. Karta Produktu App Store/.test(linia)) out.push({ sekcja: linia });
    for (const pole of Object.keys(ETYKIETY) as Pole[]) {
      const m = linia.match(ETYKIETY[pole]);
      if (m && out.length) out[out.length - 1][pole] = { tekst: m[2], podane: Number(m[3]) };
    }
  }
  return out;
}

const wyrazy = (s: string) => s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1);

describe('metadane sklepu: jedno źródło i słowa kluczowe w limicie (036)', () => {
  const lista = jezyki();

  it('dokument ma sekcje PL i EN z nazwą, podtytułem i słowami kluczowymi', () => {
    expect(lista.length).toBeGreaterThanOrEqual(2);
    for (const j of lista) expect([j.sekcja, !!j.name, !!j.subtitle, !!j.keywords]).toEqual([j.sekcja, true, true, true]);
  });

  it('słowa kluczowe: ≤ 100 B UTF-8 i podana liczba to liczba bajtów', () => {
    for (const j of lista) {
      const bajty = Buffer.byteLength(j.keywords!.tekst, 'utf8');
      expect({ sekcja: j.sekcja, bajty }).toEqual({ sekcja: j.sekcja, bajty: j.keywords!.podane });
      expect(bajty).toBeLessThanOrEqual(100);
    }
  });

  it('słowa kluczowe nie powtarzają wyrazów z nazwy ani podtytułu i nie powtarzają się', () => {
    for (const j of lista) {
      const zNazwy = new Set([...wyrazy(j.name!.tekst), ...wyrazy(j.subtitle!.tekst)]);
      const frazy = j.keywords!.tekst.split(',').map((s) => s.trim().toLowerCase());
      expect({ sekcja: j.sekcja, powtorzone: frazy.flatMap(wyrazy).filter((w) => zNazwy.has(w)) }).toEqual({ sekcja: j.sekcja, powtorzone: [] });
      expect(new Set(frazy).size).toBe(frazy.length);
    }
  });

  it('pola sklepu są tylko w jednym dokumencie (docs/15-app-store.md odsyła do niego)', () => {
    const doc15 = read('docs/15-app-store.md');
    expect(doc15).not.toMatch(/\|\s*\*\*(Słowa kluczowe|Keywords|Tekst promocyjny|Promotional Text|Podtytuł|Subtitle)\*\*/);
    expect(doc15).toContain(META);
  });
});
