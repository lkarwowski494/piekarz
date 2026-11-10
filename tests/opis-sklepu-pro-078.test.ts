/**
 * Strona produktu oznacza funkcje płatne przy funkcji [M1-audytor-generalny-078; 02-monetyzacja-001, 10-wydanie-005].
 * DEC-05 a (D-286): „(Pro)” przy funkcjach płatnych w tekście promocyjnym i w sekcjach opisu, 34 lokalizacje.
 * Wytyczna 2.3.2 (odczyt 2026-11-09): „make sure your app description, screenshots, and previews clearly indicate
 * whether any featured items, levels, subscriptions, etc. require additional purchases”.
 * Trwała kontrola (Z-8, `docs/monetyzacja.md`): każda funkcja Pro z `src/lib/platnosci/konfiguracja.ts` ma wzorzec
 * wzmianki PL i EN (Record<Funkcja, …> — nowa funkcja bez wpisu nie przejdzie typecheck); zdanie tekstu
 * promocyjnego, opisu albo podpisu ramki, które ją wymienia, niesie oznaczenie (ramka: plakietka w podpisy.json,
 * tests/zrzuty-sklepu.test.ts). Pozostałe 32 lokalizacje: tyle samo oznaczeń w każdej sekcji co źródło (pl albo
 * en-US) i oznaczenie w tekście promocyjnym. Dlaczego: przekład bez kontroli gubi oznaczenia, a skarga „ukryty
 * paywall” to recenzje 1★ u konkurencji (02-monetyzacja-001).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { BASIC, type Funkcja } from '../src/lib/platnosci/konfiguracja';

const root = path.join(__dirname, '..');
const KAT = path.join(root, 'docs/wydanie/metadane');
type Meta = { tekstPromocyjny: string; opis: string; ramki: { naglowek: string; podtytul: string }[] };
const meta = (kod: string): Meta => JSON.parse(fs.readFileSync(path.join(KAT, `${kod}.json`), 'utf8'));
const KODY = fs.readdirSync(KAT).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();

/** Oznaczenie: nawias kończący się „Pro” — „(Pro)”, „(zaczyn: Pro)”, „（Pro）”. */
const ZNAK = /[(（][^()（）\n]*Pro[)）]/g;
const ile = (s: string) => (s.match(ZNAK) ?? []).length;

/** Wzmianka funkcji w tekście PL i EN; null = funkcja Basic (D-112, D-113, D-116). */
const WZMIANKI: Record<Funkcja, { pl: RegExp; en: RegExp } | null> = {
  historia: null,
  dane: null,
  import: null,
  kalkulator: null,
  harmonogram: null,
  stolnica: null,
  zakwas: null,
  doktor: null,
  receptury: null,
  akademia: null,
  'plan-wstecz': { pl: /plan wstecz|liczy wstecz|godzin\w* gotowości|„gotowe”/i, en: /plans? (every step )?back|works back|ready time|"ready"/i },
  'plany-przyszle': { pl: /przyszł\w* dni|na kolejne dni/i, en: /future days/i },
  'dwa-wypieki': { pl: /dwa wypieki/i, en: /two bakes/i },
  'kalendarz-telefonu': { pl: /kalendarz/i, en: /calendar/i },
  miesiac: { pl: /widok miesiąca/i, en: /month view/i },
  rytm: { pl: /rytm/i, en: /rhythm/i },
  'staly-dzien': { pl: /stały dzień/i, en: /fixed (fridge )?(feeding )?day/i },
  zaczyn: { pl: /zaczyn|poolish|biga/i, en: /preferment|poolish|biga/i },
  lod: { pl: /(?<!\p{L})(lód|lodu)(?!\p{L})/iu, en: /\bice\b/i },
  'przypomnienia-zakwasu': { pl: /przypomnienie po|przypomni o nim/i, en: /reminder after|reminds you/i },
  'proporcje-zakwasu': { pl: /1:2:2/, en: /1:2:2/ },
  'gotowosc-zakwasu': { pl: /podwoi/i, en: /doubled/i },
  'budzenie-zakwasu': { pl: /budzen/i, en: /wak(e|ing)/i },
  'kolejny-zakwas': { pl: /kilka zakwasów|więcej zakwasów/i, en: /several starters|more starters/i },
  'receptury-ponad-limit': { pl: /więcej (własnych )?receptur/i, en: /more (of your own )?recipes/i },
  porownanie: { pl: /statystyk/i, en: /statistics/i },
  druk: { pl: /druk/i, en: /\bprint/i },
  'qr-wysylanie': { pl: /\bQR\b/, en: /\bQR\b/ },
  spizarnia: { pl: /spiżarni/i, en: /pantry/i },
  'akademia-dalej': { pl: /Akademi/i, en: /Academy/i },
};
const PRO = (Object.keys(WZMIANKI) as Funkcja[]).filter((f) => !BASIC.includes(f));

const zdania = (s: string) => s.split(/(?<=[.!?。])\s+|\n/).filter((z) => z.trim());
/**
 * Zdania z wymienioną funkcją Pro bez oznaczenia; sekcja z „(Pro)” w nagłówku obejmuje całą sekcję. Akapit dostępu
 * i zakupu (z linkiem EULA) opisuje samo Pro słowami kontraktu (`tests/oferta-dokumenty.test.ts`, D-112), więc nie
 * potrzebuje oznaczenia.
 */
function bezOznaczenia(tekst: string, jezyk: 'pl' | 'en'): string[] {
  return tekst.split('\n\n').flatMap((sekcja) => {
    if (sekcja.includes('stdeula')) return [];
    const [naglowek] = sekcja.split('\n');
    const bezZnaku = naglowek.replace(ZNAK, '');
    if (sekcja.includes('\n') && ile(naglowek) > 0 && bezZnaku === bezZnaku.toUpperCase()) return [];
    return zdania(sekcja).flatMap((z) =>
      PRO.filter((f) => WZMIANKI[f]![jezyk].test(z) && ile(z) === 0).map((f) => `${f}: ${z}`),
    );
  });
}

describe('strona produktu: funkcje Pro oznaczone przy funkcji (078)', () => {
  it('każda funkcja Pro z konfiguracja.ts ma wzorzec wzmianki PL i EN', () => {
    expect(PRO.length).toBeGreaterThan(10);
    expect(PRO.filter((f) => WZMIANKI[f] === null)).toEqual([]);
  });

  it.each([
    ['pl', 'pl'],
    ['en-US', 'en'],
    ['en-GB', 'en'],
    ['en-AU', 'en'],
    ['en-CA', 'en'],
  ] as const)('%s: każde zdanie promocji i opisu z funkcją Pro ma „(Pro)”', (kod, jezyk) => {
    const m = meta(kod);
    expect({ kod, promocja: bezOznaczenia(m.tekstPromocyjny, jezyk), opis: bezOznaczenia(m.opis, jezyk) }).toEqual({ kod, promocja: [], opis: [] });
  });

  it.each([
    ['pl', 'pl'],
    ['en-US', 'en'],
  ] as const)('%s: ramka z funkcją Pro ma plakietkę Pro w podpisy.json (zrzut zgodny z tekstem)', (kod, jezyk) => {
    const podpisy = JSON.parse(fs.readFileSync(path.join(root, `docs/wydanie/zrzuty/${kod}/podpisy.json`), 'utf8'));
    const zle = meta(kod)
      .ramki.map((r, i) => ({ i: i + 1, tekst: `${r.naglowek} ${r.podtytul}`, oznaczenie: podpisy.ramki[i].oznaczenie }))
      .filter((r) => PRO.some((f) => WZMIANKI[f]![jezyk].test(r.tekst)) && !r.oznaczenie);
    expect(zle).toEqual([]);
  });

  it.each(KODY)('%s: tekst promocyjny ma oznaczenie Pro, a każda sekcja opisu tyle oznaczeń co źródło', (kod) => {
    const m = meta(kod);
    const zrodlo = meta(kod.startsWith('en-') ? 'en-US' : 'pl');
    const sekcje = (s: string) => s.split('\n\n').map(ile);
    expect({ kod, promocja: ile(m.tekstPromocyjny) > 0, sekcje: sekcje(m.opis) }).toEqual({ kod, promocja: true, sekcje: sekcje(zrodlo.opis) });
  });

  it('pl i en-US: te same sekcje z oznaczeniem poza zdaniem wstępu (EN nazywa w nim plan wstecz)', () => {
    const pl = meta('pl').opis.split('\n\n').map(ile);
    const en = meta('en-US').opis.split('\n\n').map(ile);
    expect(en.slice(1)).toEqual(pl.slice(1));
    // zaczyn, nagłówek planu, opieka nad zakwasem, statystyki (sekcja maszyny dochodzi w 080)
    expect(pl.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(4);
  });
});
