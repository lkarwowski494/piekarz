/**
 * Jeden dokument metadanych sklepu (`docs/app-store-metadata-v2.md`) i słowa kluczowe w limicie Apple
 * w każdym języku dokumentu [M1-audytor-generalny-036; 10-wydanie-004]. Decyzja właściciela 2026-10-19 („3a”):
 * teraz PL i EN; pozostałe języki dopisze 095 (partia 4) — ten test obejmie je automatycznie.
 * App Store Connect Help (odczyt 2026-10-19, role/10-wydanie): słowa kluczowe „up to 100 bytes”,
 * bez powtarzania wyrazów z nazwy aplikacji.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { setLang, t } from '../src/lib/i18n';
import { parseAndValidateBackup } from '../src/lib/backup';

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

/**
 * Notatki dla App Review [M1-audytor-generalny-078; 10-wydanie-008]: po angielsku (UI recenzenta), krok po kroku
 * do ścieżki importu kopii i innych nieoczywistych funkcji 1.0, nazwy przycisków jak w słowniku EN; bez QR i
 * skanowania (F-08 PÓŹNIEJ) i bez funkcji z ukrytym wejściem (src/lib/wejscia-pozniej.ts) ani PÓŹNIEJ (druk, spiżarnia).
 */
describe('notatki dla App Review (078)', () => {
  const en = (pl: string, params?: Record<string, string | number>) => {
    setLang('en');
    try {
      return t(pl, params);
    } finally {
      setLang('pl');
    }
  };
  const doc = read(META).replace(/\r\n/g, '\n');
  const sekcja = doc.split(/^### /m).find((s) => /^4\.3\. .*Review Notes/.test(s)) ?? '';
  const notatki = /```text\n([\s\S]*?)```/.exec(sekcja)?.[1] ?? '';

  it('są po angielsku i mieszczą się w limicie 4000 znaków App Store Connect', () => {
    expect(notatki.length).toBeGreaterThan(200);
    expect(notatki.length).toBeLessThanOrEqual(4000);
    expect(notatki.match(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g) ?? []).toEqual([]);
  });

  it('prowadzą krok po kroku do eksportu i importu kopii przyciskami z interfejsu EN', () => {
    for (const pl of ['Ustawienia', 'Kopia zapasowa', 'Eksportuj kopię', 'Importuj kopię', 'Wklej zawartość pliku JSON kopii zapasowej:', 'Zatwierdź import']) {
      expect({ pl, jest: notatki.includes(en(pl)) }).toEqual({ pl, jest: true });
    }
    const kroki = ['Ustawienia', 'Importuj kopię', 'Zatwierdź import'].map((pl) => notatki.indexOf(en(pl)));
    expect([...kroki].sort((a, b) => a - b)).toEqual(kroki);
  });

  it('przykładowa kopia w notatkach to poprawny plik kopii (jeden zakwas, nic pominiętego)', () => {
    const json = notatki.split('\n').find((l) => l.startsWith('{"format":"piekarz-backup"'));
    expect(json).toBeDefined();
    const kopia = parseAndValidateBackup(json!);
    expect([kopia.state.starters.length, kopia.state.bakes.length, kopia.state.customRecipes.length, kopia.skippedRows]).toEqual([1, 0, 0, 0]);
  });

  it('opisują inne nieoczywiste funkcje 1.0: okres próbny, przywracanie zakupów, Harmonogram, Stolnica, Doktor', () => {
    for (const [pl, params] of [
      ['Wypróbuj {dni} dni', { dni: 14 }],
      ['Przywróć zakupy', undefined],
      ['Zakupy', undefined],
      ['Kalkulator', undefined],
      ['Harmonogram', undefined],
      ['Stolnica', undefined],
      ['Zakwas', undefined],
      ['Doktor', undefined],
      ['Doktor Chleba', undefined],
      ['Akademia', undefined],
    ] as const) {
      expect({ pl, jest: notatki.includes(en(pl, params)) }).toEqual({ pl, jest: true });
    }
    expect(notatki).toMatch(/Sleep Guard/);
    expect(notatki).toMatch(/introductory offer/i);
  });

  it('nie wspominają QR, skanowania ani funkcji PÓŹNIEJ i ukrytych', () => {
    expect(notatki).not.toMatch(/\bQR\b|scan/i);
    expect(notatki).not.toMatch(/print|pantry|flour equivalent|discard|bake loss|converter|Apps4Craft/i);
  });
});
