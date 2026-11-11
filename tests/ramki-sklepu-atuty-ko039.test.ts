/**
 * Test akceptacyjny KO-039 (właściciel 2026-11-11: „Popraw 3 nagłówki (Recommended)”; D-367): nagłówki ramek zrzutów 1, 3 i 7 mówią o atutach,
 * które aplikacja ma naprawdę. Podpis na obrazie = `ramki[i].naglowek` z docs/wydanie/metadane/<kod>.json (D-363).
 *  - ekran 3 (prowadzenie): pojęcie powiadomienia — termin z tekstu ekranu prowadzenia `ZgodaPowiadomien.tsx`
 *    („Gdy telefon śpi, powiadomienie powie…”); powiadomienie lokalne z wyzwalaczem DATE po zgodzie (src/lib/notifications.ts);
 *  - ekran 7 (offline): pojęcie reklam — termin z tekstu ustawień `StudioEcosystemSection.tsx` („…nie ma konta, reklam, analityki…”);
 *  - ekran 1 (plan): pojęcie nocy — termin z ostrzeżenia planu `SleepGuardBanner.tsx` („{krok} wypada o {godzina} w nocy”).
 * Wzorzec jak D-360: termin ze słownika aplikacji w języku lokalizacji, nie lista wyrażeń w teście. Rdzeń terminu (odmiana) stoi
 * w glosariuszu docs/lokalizacja/terminy-ramek-ko039.json; test wymaga, żeby rdzeń był w tekście aplikacji ORAZ w nagłówku — sam wpis
 * w glosariuszu niczego nie dowodzi. Porównanie bez wielkości liter (toLocaleLowerCase języka).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { setLang, t, type Lang } from '../src/lib/i18n';

const root = path.join(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
type Pojecie = 'powiadomienie' | 'reklamy' | 'noc';
type Glosariusz = { zrodla: Record<Pojecie, { klucz: string; ekran: number }>; rdzenie: Record<string, Record<Pojecie, string>> };
const g: Glosariusz = JSON.parse(read('docs/lokalizacja/terminy-ramek-ko039.json'));
const kody = fs.readdirSync(path.join(root, 'docs/wydanie/metadane')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
const meta = (kod: string): { jezyk: string; naglowki: string[] } => {
  const m = JSON.parse(read(`docs/wydanie/metadane/${kod}.json`)) as { jezyk: string; ramki: Array<{ naglowek: string }> };
  return { jezyk: m.jezyk, naglowki: m.ramki.map((r) => r.naglowek) };
};
const POJECIA: Pojecie[] = ['powiadomienie', 'reklamy', 'noc'];

describe('KO-039: nagłówki ramek 1, 3, 7 z atutami (termin ze słownika aplikacji, D-367)', () => {
  test('źródła terminów to teksty aplikacji: klucz istnieje w źródle PL i stoi w kodzie ekranu', () => {
    expect(g.zrodla.powiadomienie.ekran).toBe(3);
    expect(g.zrodla.reklamy.ekran).toBe(7);
    expect(g.zrodla.noc.ekran).toBe(1);
    expect(read('src/components/stolnica/ZgodaPowiadomien.tsx')).toContain(`t('${g.zrodla.powiadomienie.klucz}')`);
    expect(read('src/components/settings/StudioEcosystemSection.tsx')).toContain(`t('${g.zrodla.reklamy.klucz}')`);
    expect(read('src/components/harmonogram/SleepGuardBanner.tsx')).toContain(`t('${g.zrodla.noc.klucz}'`);
    setLang('pl');
    for (const p of POJECIA) expect(t(g.zrodla[p].klucz).length).toBeGreaterThan(0);
  });

  test('glosariusz obejmuje każdy język aplikacji użyty w metadanych sklepu', () => {
    const jezyki = [...new Set(kody.map((k) => meta(k).jezyk))].sort();
    expect(Object.keys(g.rdzenie).sort()).toEqual(jezyki);
  });

  test.each(kody)('%s: rdzeń terminu jest w tekście aplikacji i w nagłówku ekranu (1 noc, 3 powiadomienie, 7 reklamy)', (kod) => {
    const { jezyk, naglowki } = meta(kod);
    setLang(jezyk as Lang);
    try {
      for (const p of POJECIA) {
        const rdzen = (g.rdzenie[jezyk]?.[p] ?? '').toLocaleLowerCase(jezyk);
        const { klucz, ekran } = g.zrodla[p];
        const tekstAplikacji = t(klucz).toLocaleLowerCase(jezyk);
        const naglowek = (naglowki[ekran - 1] ?? '').toLocaleLowerCase(jezyk);
        expect({ kod, p, rdzen, wAplikacji: rdzen.length > 0 && tekstAplikacji.includes(rdzen) }).toEqual({ kod, p, rdzen, wAplikacji: true });
        expect({ kod, p, rdzen, naglowek, wNaglowku: rdzen.length > 0 && naglowek.includes(rdzen) }).toEqual({ kod, p, rdzen, naglowek, wNaglowku: true });
      }
    } finally {
      setLang('pl');
    }
  });
});
