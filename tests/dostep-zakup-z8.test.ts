/**
 * Z-8 (KO-025, właściciel 2026-11-10): akapit „Dostęp i zakup” opisu sklepu w każdej z 34 lokalizacji i zgłoszenie
 * wszystkich 34 lokalizacji; notatka dla App Review mówi wprost, że subskrypcja nie ma oferty wprowadzającej ani
 * bezpłatnej próby, i podaje stałą wartość Pro (docs/monetyzacja.md: D-112, D-113, „Pro musi dawać stałą wartość”).
 *
 * Stan na 2047ab00: przekład akapitu w 29 lokalizacjach był już w plikach (de0c510e, M3 a5, 2026-10-23), a dokumenty
 * wydania nadal podawały „29 lokalizacji bez przekładu” — test pilnuje obu stron: akapitu w plikach (z kontrolą
 * negatywną na kopii bez akapitu, bo stanu sprzed przekładu nie ma już w drzewie) i prawdziwości dokumentów.
 * Dlaczego: wytyczna App Review 2.3 (opis zgodny z aplikacją) i 3.1.2 (subskrypcja); opis bez akapitu albo z obietnicą
 * próby w jednej lokalizacji to tekst nieprawdziwy w tym sklepie.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..');
const KAT = path.join(root, 'docs/wydanie/metadane');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const KODY = fs.readdirSync(KAT).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();
type Meta = { nazwa: string; podtytul: string; slowaKluczowe: string; tekstPromocyjny: string; opis: string; ramki: Array<{ naglowek: string; podtytul: string }> };
const meta = (kod: string): Meta => JSON.parse(fs.readFileSync(path.join(KAT, `${kod}.json`), 'utf8'));
const EULA = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
/** Limit App Store Connect dla opisu: 4000 znaków (jak scripts/sprawdz-metadane.mjs i sprawdz-wydanie.mjs). */
const LIMIT_OPISU = 4000;
/** Znaki i rdzenie tylko polskie (ć i ó są też w hr/hu, więc ich tu nie ma). */
const POLSKIE = /[ąęłńśźżĄĘŁŃŚŹŻ]|zakwas|darmow|subskrypc|dożywot|próbn/i;

/** Błędy akapitu „Dostęp i zakup”: przedostatni blok opisu, trzy linie jak w PL/EN (nagłówek, treść, EULA). */
function bledyAkapitu(opis: string): string[] {
  const bloki = opis.split('\n\n');
  const linie = (bloki[bloki.length - 2] ?? '').split('\n');
  const b: string[] = [];
  if (linie.length !== 3) b.push(`akapit ma ${linie.length} linii zamiast 3`);
  const [naglowek = '', tresc = '', eula = ''] = linie;
  if (!naglowek || naglowek !== naglowek.toLocaleUpperCase()) b.push('brak nagłówka wielkimi literami');
  // „App Stor”: cs i sl odmieniają nazwę sklepu („v App Storu”), tak jak hr („u App Storeu”)
  for (const slowo of ['Basic', 'Pro', 'App Stor']) if (!tresc.includes(slowo)) b.push(`treść bez „${slowo}”`);
  // samo „1” wolno: ja „1回限り”, ko „1회성” = jednorazowy; cena (0,99) albo próba (14 dni) ma inną cyfrę albo dwie
  if (/\d{2,}|[02-9]/.test(tresc)) b.push('treść z liczbą (cena albo długość próby)');
  if (!/[:：]\s*https:/.test(eula) || !eula.endsWith(EULA)) b.push('ostatnia linia akapitu to nie EULA z etykietą');
  if ([...opis].length > LIMIT_OPISU) b.push(`opis ${[...opis].length} znaków > ${LIMIT_OPISU}`);
  return b;
}

describe('Z-8: akapit „Dostęp i zakup” w 34 lokalizacjach (KO-025)', () => {
  it('34 lokalizacje', () => {
    expect(KODY).toHaveLength(34);
  });

  it.each(KODY)('%s: akapit jak w PL/EN (nagłówek, Basic/Pro/App Store bez liczb, EULA) i opis w limicie', (kod) => {
    expect({ kod, bledy: bledyAkapitu(meta(kod).opis) }).toEqual({ kod, bledy: [] });
  });

  it.each(KODY.filter((k) => k !== 'pl'))('%s: brak polskich słów i znaków w polach sklepu', (kod) => {
    const m = meta(kod);
    const pola = [m.nazwa, m.podtytul, m.slowaKluczowe, m.tekstPromocyjny, m.opis, ...m.ramki.flatMap((r) => [r.naglowek, r.podtytul])];
    expect({ kod, polskie: pola.filter((p) => POLSKIE.test(p)).map((p) => p.match(POLSKIE)![0]) }).toEqual({ kod, polskie: [] });
  });

  it('akapit pl i en-US = źródło PL/EN (docs/app-store-metadata-v2.md §1.2, §2.2)', () => {
    const zrodlo = read('docs/app-store-metadata-v2.md');
    for (const kod of ['pl', 'en-US']) {
      const bloki = meta(kod).opis.split('\n\n');
      expect(zrodlo).toContain(bloki[bloki.length - 2]);
    }
  });

  it('kontrola negatywna: opis bez akapitu, z ceną albo z długością próby, z ucięciem EULA i ponad limit daje błędy', () => {
    const de = meta('de-DE').opis;
    const bloki = de.split('\n\n');
    const bez = [...bloki.slice(0, -2), bloki[bloki.length - 1]].join('\n\n');
    expect(bledyAkapitu(bez).length).toBeGreaterThan(0);
    expect(bledyAkapitu(de.replace('ohne Probezeitraum', '14 Tage kostenlos testen'))).toContain('treść z liczbą (cena albo długość próby)');
    expect(bledyAkapitu(de.replace(EULA, ''))).toContain('ostatnia linia akapitu to nie EULA z etykietą');
    expect(bledyAkapitu(de.replace('ZUGANG UND KAUF', 'Zugang und Kauf'))).toContain('brak nagłówka wielkimi literami');
    expect(bledyAkapitu(de + 'x'.repeat(LIMIT_OPISU))[0]).toMatch(/> 4000/);
    expect(bledyAkapitu(de.replace('ohne Probezeitraum', 'für 0,99 €'))).toContain('treść z liczbą (cena albo długość próby)');
    expect(POLSKIE.test('Pro dodaje opiekę nad zakwasem')).toBe(true);
    expect(POLSKIE.test(meta('hr').opis)).toBe(false);
  });
});

describe('Z-8: dokumenty wydania zgłaszają 34 lokalizacje (KO-025)', () => {
  it.each(['docs/wydanie/droga-do-app-store.md', 'docs/wydanie/plan-wydania-1.0.md', 'docs/monetyzacja.md'])(
    '%s nie podaje już „29 lokalizacji” bez przekładu akapitu',
    (f) => {
      expect(read(f)).not.toMatch(/29 lokalizacji bez przekładu|przekład akapitu „Dostęp i zakup” w 29 lokalizacjach|zostaje: przekład tego akapitu/);
    },
  );

  it('plan wydania §1 pkt 6 i droga D2: wszystkie 34 lokalizacje w pierwszym zgłoszeniu (KO-025)', () => {
    const plan = read('docs/wydanie/plan-wydania-1.0.md').split('\n').find((l) => l.startsWith('6. **Opis i metadane:**'))!;
    expect(plan).toMatch(/34 lokalizacj/);
    expect(plan).toMatch(/KO-025/);
    const d2 = read('docs/wydanie/droga-do-app-store.md').split('\n').find((l) => l.startsWith('| D2 |'))!;
    expect(d2).toMatch(/34 lokalizacj/);
  });
});

describe('Z-8: notatka dla App Review — bez oferty wprowadzającej i próby, stała wartość Pro (KO-025)', () => {
  const notatki = read('docs/app-store-metadata-v2.md').split(/^### /m).find((s) => /^4\.3\. .*Review Notes/.test(s)) ?? '';

  it('mówi wprost: no introductory offer, no free trial (D-112)', () => {
    expect(notatki).toMatch(/no introductory offer/i);
    expect(notatki).toMatch(/no free trial/i);
  });

  it('podaje stałą wartość Pro (3.1.2(a) „ongoing value”, monetyzacja.md)', () => {
    expect(notatki).toMatch(/Ongoing value of the subscription:/);
  });
});
