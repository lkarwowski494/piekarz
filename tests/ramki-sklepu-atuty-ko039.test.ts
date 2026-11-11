/**
 * Test akceptacyjny KO-039 (właściciel 2026-11-11: „Popraw 3 nagłówki (Recommended)”; D-367): nagłówki ramek zrzutów 1, 3 i 7 mówią o atutach,
 * które aplikacja ma naprawdę. Podpis na obrazie = `ramki[i].naglowek` z docs/wydanie/metadane/<kod>.json (D-363).
 *  - ekran 3 (prowadzenie): pojęcie powiadomienia — termin z tekstu ekranu prowadzenia `ZgodaPowiadomien.tsx`
 *    („Gdy telefon śpi, powiadomienie powie…”); powiadomienie lokalne z wyzwalaczem DATE po zgodzie (src/lib/notifications.ts);
 *  - ekran 7 (offline): pojęcie reklam — termin z tekstu ustawień `StudioEcosystemSection.tsx` („…nie ma konta, reklam, analityki…”);
 *  - ekran 1 (plan): pojęcie snu (ochrona snu, KO-041) — termin z karty planu `SleepGuardBanner.tsx` („Ochrona snu aktywna”) albo
 *    `harmonogram.tsx` („Godziny snu”); nagłówek nie obiecuje planu bez kroków w nocy (recenzja P1-1, reverse-scheduler zwraca null).
 * Wzorzec jak D-360: termin ze słownika aplikacji w języku lokalizacji, nie lista wyrażeń w teście. Rdzeń terminu (odmiana) stoi
 * w glosariuszu docs/lokalizacja/terminy-ramek-ko039.json; test wymaga, żeby rdzeń był w tekście aplikacji ORAZ w nagłówku — sam wpis
 * w glosariuszu niczego nie dowodzi. Porównanie bez wielkości liter (toLocaleLowerCase języka).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { setLang, t, type Lang } from '../src/lib/i18n';

const root = path.join(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
type Pojecie = 'powiadomienie' | 'reklamy' | 'sen';
type Glosariusz = { zrodla: Record<Pojecie, { klucze: string[]; ekran: number }>; rdzenie: Record<string, Record<Pojecie, string>> };
const g: Glosariusz = JSON.parse(read('docs/lokalizacja/terminy-ramek-ko039.json'));
const kody = fs.readdirSync(path.join(root, 'docs/wydanie/metadane')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
const meta = (kod: string): { jezyk: string; naglowki: string[] } => {
  const m = JSON.parse(read(`docs/wydanie/metadane/${kod}.json`)) as { jezyk: string; ramki: Array<{ naglowek: string }> };
  return { jezyk: m.jezyk, naglowki: m.ramki.map((r) => r.naglowek) };
};
const POJECIA: Pojecie[] = ['powiadomienie', 'reklamy', 'sen'];

describe('KO-039/KO-041: nagłówki ramek 1, 3, 7 z atutami (termin ze słownika aplikacji, D-367, D-370)', () => {
  test('źródła terminów to teksty aplikacji: klucz istnieje w źródle PL i stoi w kodzie ekranu', () => {
    expect(g.zrodla.powiadomienie.ekran).toBe(3);
    expect(g.zrodla.reklamy.ekran).toBe(7);
    expect(g.zrodla.sen.ekran).toBe(1);
    expect(g.zrodla.powiadomienie.klucze).toHaveLength(1);
    expect(g.zrodla.reklamy.klucze).toHaveLength(1);
    expect(g.zrodla.sen.klucze).toHaveLength(2);
    expect(read('src/components/stolnica/ZgodaPowiadomien.tsx')).toContain(`t('${g.zrodla.powiadomienie.klucze[0]}')`);
    expect(read('src/components/settings/StudioEcosystemSection.tsx')).toContain(`t('${g.zrodla.reklamy.klucze[0]}')`);
    expect(read('src/components/harmonogram/SleepGuardBanner.tsx')).toContain(`t('${g.zrodla.sen.klucze[0]}')`);
    expect(read('app/(tabs)/receptury/harmonogram.tsx')).toContain(`t('${g.zrodla.sen.klucze[1]}')`);
    setLang('pl');
    for (const p of POJECIA) for (const k of g.zrodla[p].klucze) expect(t(k).length).toBeGreaterThan(0);
  });

  test('glosariusz obejmuje każdy język aplikacji użyty w metadanych sklepu', () => {
    const jezyki = [...new Set(kody.map((k) => meta(k).jezyk))].sort();
    expect(Object.keys(g.rdzenie).sort()).toEqual(jezyki);
  });

  test.each(kody)('%s: rdzeń terminu jest w tekście aplikacji i w nagłówku ekranu (1 sen, 3 powiadomienie, 7 reklamy)', (kod) => {
    const { jezyk, naglowki } = meta(kod);
    setLang(jezyk as Lang);
    try {
      for (const p of POJECIA) {
        const rdzen = (g.rdzenie[jezyk]?.[p] ?? '').toLocaleLowerCase(jezyk);
        const { klucze, ekran } = g.zrodla[p];
        const tekstAplikacji = klucze.map((k) => t(k).toLocaleLowerCase(jezyk)).join('\n');
        const naglowek = (naglowki[ekran - 1] ?? '').toLocaleLowerCase(jezyk);
        expect({ kod, p, rdzen, wAplikacji: rdzen.length > 0 && tekstAplikacji.includes(rdzen) }).toEqual({ kod, p, rdzen, wAplikacji: true });
        expect({ kod, p, rdzen, naglowek, wNaglowku: rdzen.length > 0 && naglowek.includes(rdzen) }).toEqual({ kod, p, rdzen, naglowek, wNaglowku: true });
      }
    } finally {
      setLang('pl');
    }
  });
});
