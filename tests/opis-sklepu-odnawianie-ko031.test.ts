/**
 * KO-031 (właściciel 2026-11-10): akapit „Dostęp i zakup” opisu sklepu w każdej z 34 lokalizacji mówi, że subskrypcja
 * odnawia się automatycznie do anulowania, gdzie ją anulować, i wskazuje „Przywróć zakupy” w aplikacji
 * (luki G-1 P2 i G-2 P3 z docs/dowody-09-z8/tlumaczenie-zwrotne.md; kontrakt: docs/monetyzacja.md „Ujawnienia” pkt 2).
 *
 * Wzorzec per język bierzemy ze słownika aplikacji, nie z listy w teście: zdanie o odnawianiu i etykieta przycisku
 * muszą być dosłownie te same co na ekranie Pro w tym języku. Dlaczego: opis i aplikacja mają nazywać Ustawienia,
 * Subskrypcje i przycisk tak samo (spójność, wytyczna App Review 2.3), a zmiana słownika bez zmiany opisu (albo
 * odwrotnie) ma pęknąć w teście.
 *
 * Do tego poprawki P3 z tej samej kontroli: en-* „no trial” jak PL (R-1), ms jednoznacznie „dożywotni” (R-2),
 * ko „App Store” przed obiema formami zakupu (R-3).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LADOWANIE_SLOWNIKOW } from '../src/lib/i18n-slowniki';
import { EN_3 } from '../src/lib/i18n-en/czesc-3';
import { EN_4 } from '../src/lib/i18n-en/czesc-4';

const root = path.join(__dirname, '..');
const KAT = path.join(root, 'docs/wydanie/metadane');
const KODY = fs.readdirSync(KAT).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();
const opis = (kod: string): string => JSON.parse(fs.readFileSync(path.join(KAT, `${kod}.json`), 'utf8')).opis;
const LIMIT_OPISU = 4000;

const ODNAWIANIE =
  'Subskrypcja odnawia się sama, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.';
const PRZYWROC = 'Przywróć zakupy';
/** Kod lokalizacji App Store Connect → słownik aplikacji (src/lib/i18n-slowniki). */
const SLOWNIK_DLA: Record<string, string> = {
  'de-DE': 'de', 'es-ES': 'es', 'es-MX': 'es-419', 'fr-CA': 'fr', 'fr-FR': 'fr', 'nl-NL': 'nl', no: 'nb', 'pt-PT': 'pt',
};

function wzorzec(kod: string): { odnawianie: string; przywroc: string } {
  if (kod === 'pl') return { odnawianie: ODNAWIANIE, przywroc: PRZYWROC };
  if (kod.startsWith('en-')) return { odnawianie: EN_4[ODNAWIANIE], przywroc: EN_3[PRZYWROC] };
  const s = LADOWANIE_SLOWNIKOW[SLOWNIK_DLA[kod] ?? kod]();
  return { odnawianie: s[ODNAWIANIE], przywroc: s[PRZYWROC] };
}

/** Treść akapitu „Dostęp i zakup”: środkowa linia przedostatniego bloku opisu (układ pilnuje dostep-zakup-z8). */
const tresc = (o: string): string => {
  const bloki = o.split('\n\n');
  return (bloki[bloki.length - 2] ?? '').split('\n')[1] ?? '';
};

function bledy(kod: string, o: string): string[] {
  const { odnawianie, przywroc } = wzorzec(kod);
  const t = tresc(o);
  const b: string[] = [];
  if (!odnawianie || !przywroc) b.push('brak zdania albo etykiety w słowniku aplikacji');
  if (odnawianie && !t.includes(odnawianie)) b.push('akapit bez zdania aplikacji o automatycznym odnawianiu i anulowaniu');
  if (przywroc && !t.includes(przywroc)) b.push(`akapit bez etykiety „${przywroc}”`);
  if ([...o].length > LIMIT_OPISU) b.push(`opis ${[...o].length} znaków > ${LIMIT_OPISU}`);
  return b;
}

describe('KO-031: odnawianie i anulowanie subskrypcji w opisie sklepu, 34 lokalizacje', () => {
  it('34 lokalizacje, każda ze słownikiem aplikacji', () => {
    expect(KODY).toHaveLength(34);
    for (const kod of KODY) expect({ kod, ...wzorzec(kod) }).toEqual({ kod, odnawianie: expect.any(String), przywroc: expect.any(String) });
  });

  it.each(KODY)('%s: zdanie o odnawianiu i „Przywróć zakupy” jak w aplikacji, opis ≤ 4000 znaków', (kod) => {
    expect({ kod, bledy: bledy(kod, opis(kod)) }).toEqual({ kod, bledy: [] });
  });

  it('źródło PL i EN (docs/app-store-metadata-v2.md) ma to samo zdanie co pl.json i en-US.json', () => {
    const zrodlo = fs.readFileSync(path.join(root, 'docs/app-store-metadata-v2.md'), 'utf8');
    for (const kod of ['pl', 'en-US']) expect(zrodlo).toContain(tresc(opis(kod)));
  });

  it('kontrola negatywna: akapit bez zdania, ze zdaniem innego języka albo ponad limit daje błędy', () => {
    const de = opis('de-DE');
    const { odnawianie } = wzorzec('de-DE');
    expect(bledy('de-DE', de.replace(odnawianie, ''))).toContain('akapit bez zdania aplikacji o automatycznym odnawianiu i anulowaniu');
    expect(bledy('de-DE', de.replace(odnawianie, wzorzec('nl-NL').odnawianie))).toContain(
      'akapit bez zdania aplikacji o automatycznym odnawianiu i anulowaniu',
    );
    expect(bledy('de-DE', de.replace('Käufe wiederherstellen', 'Kaufen'))).toContain('akapit bez etykiety „Käufe wiederherstellen”');
    expect(bledy('de-DE', de + 'x'.repeat(LIMIT_OPISU)).some((e) => /> 4000/.test(e))).toBe(true);
  });
});

describe('KO-032: miejsce na dopisek — dwa zdania usunięte w 34 lokalizacjach i w źródle PL/EN', () => {
  // Właściciel 2026-11-10 (KO-032, D-359): „Usuń 2 zdania wszędzie”. Zdania usunięte (cofanie kroku w „Prowadzeniu”,
  // brak zgody na powiadomienia w „Warto wiedzieć”) zapisane per lokalizacja w dowodzie; nie mogą wrócić, bo bez nich
  // 10 lokalizacji z dopiskiem KO-031 przekracza 4000 znaków.
  const usuniete: Record<string, { prowadzenie: string; wartoWiedziec: string }> = JSON.parse(
    fs.readFileSync(path.join(root, 'docs/dowody-09-odnawianie/usuniete-zdania-ko032.json'), 'utf8'),
  );
  it('dowód obejmuje 34 lokalizacje', () => {
    expect(Object.keys(usuniete).sort()).toEqual(KODY);
  });
  it.each(KODY)('%s: opis bez usuniętych zdań', (kod) => {
    const o = opis(kod);
    expect({ kod, prowadzenie: o.includes(usuniete[kod].prowadzenie), warto: o.includes(usuniete[kod].wartoWiedziec) }).toEqual({
      kod, prowadzenie: false, warto: false,
    });
  });
  it('źródło PL/EN bez usuniętych zdań', () => {
    const zrodlo = fs.readFileSync(path.join(root, 'docs/app-store-metadata-v2.md'), 'utf8');
    for (const kod of ['pl', 'en-US']) for (const z of Object.values(usuniete[kod])) expect(zrodlo).not.toContain(z);
  });
});

describe('KO-031: poprawki P3 z kontroli tłumaczeniem zwrotnym (R-1, R-2, R-3)', () => {
  it.each(['en-AU', 'en-CA', 'en-GB', 'en-US'])('%s: Basic bez okresu próbnego, jak PL (R-1)', (kod) => {
    expect(tresc(opis(kod))).toMatch(/^Basic is free forever, with no trial period\./);
  });

  it('ms: zakup dożywotni nazwany jednoznacznie, bez „sekali seumur hidup” (R-2)', () => {
    const t = tresc(opis('ms'));
    expect(t).not.toMatch(/pembelian sekali seumur hidup/);
    expect(t).toMatch(/akses seumur hidup/);
  });

  it('ko: „App Store” określa subskrypcję i zakup dożywotni, nie tylko zakup (R-3)', () => {
    const t = tresc(opis('ko'));
    expect(t).not.toMatch(/또는 App Store의 1회성/);
    expect(t).toMatch(/Pro는 App Store에서/);
  });
});
