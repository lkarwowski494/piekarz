/**
 * M1-audytor-generalny-015 (01-odkrywanie-001, 03-zakres-002; DEC-04 a, D-286): ekran Pro nie obiecuje funkcji bez
 * wejścia w 1.0. Każde zdanie „Co daje Pro”, opis pod tytułem i nazwa każdej blokady Pro (BlokadaFunkcji) są
 * porównywane ze słowami funkcji PÓŹNIEJ / NIE / TEST z kontraktu zakresu i z wejść ukrytych (`wejscia-pozniej`).
 * Mapa słów musi obejmować każdy taki wiersz kontraktu i każde ukryte wejście, więc nowa funkcja odłożona po 1.0
 * bez słowa w mapie czerwieni test (trwała kontrola przeciw powrotowi obietnicy bez kodu).
 */
import * as fs from 'fs';
import * as path from 'path';
import { nazwaBlokady } from '../src/lib/platnosci/nazwy-pro';
import type { Funkcja } from '../src/lib/platnosci/konfiguracja';
import { WEJSCIA_WIDOCZNE, type WejsciePozniej } from '../src/lib/wejscia-pozniej';

const root = path.resolve(__dirname, '..');
const kontrakt = fs.readFileSync(path.join(root, 'docs/scope-contract.md'), 'utf8').replace(/\r\n/g, '\n');
const paywall = fs.readFileSync(path.join(root, 'src/components/PaywallModal.tsx'), 'utf8');
const monetyzacja = fs.readFileSync(path.join(root, 'docs/monetyzacja.md'), 'utf8').replace(/\r\n/g, '\n');

/** Słowa (PL, klucze tekstów) funkcji bez wejścia w 1.0: wiersz kontraktu → wzorzec. */
const SLOWA_FUNKCJI: Record<string, RegExp> = {
  'F-30': /spiżarn/i,
  'F-63': /porówn/i,
  'F-45': /objętoś|szklan/i,
  'F-08': /\bQR\b/,
  'F-50': /druk|etykiet/i,
  'F-70': /synchroniz|iPad/i,
  'F-53': /\blodu\b|\blód\b/i,
  'F-15': /gotowoś\S* ciasta|palc/i,
  'F-79': /widżet/i,
};

/** Słowa wejść ukrytych (`WEJSCIA_WIDOCZNE` = false). */
const SLOWA_WEJSC: Record<WejsciePozniej, RegExp> = {
  'slownik-mak': /słownik|odpowiednik/i,
  'odrzut-zakwasu': /odrzut/i,
  'strata-piecowa': /strat\S* piec/i,
  'konwerter-zakwasu': /konwerter/i,
  druk: /druk/i,
  qr: /\bQR\b/,
  'rodzina-apps4craft': /Apps4Craft/i,
  spizarnia: /spiżarn/i,
  'przelicznik-objetosci': /objętoś|szklan/i,
  akademia: /Akademi/i,
  'test-palca': /palc/i,
  'protokoly-ratunkowe': /protokoł/i,
};

/** Funkcje Pro strażnika dostępu (konfiguracja.ts, typ Funkcja bez listy BASIC). */
const FUNKCJE_PRO: Funkcja[] = [
  'plan-wstecz',
  'plany-przyszle',
  'dwa-wypieki',
  'kalendarz-telefonu',
  'miesiac',
  'rytm',
  'staly-dzien',
  'zaczyn',
  'lod',
  'przypomnienia-zakwasu',
  'proporcje-zakwasu',
  'gotowosc-zakwasu',
  'budzenie-zakwasu',
  'kolejny-zakwas',
  'receptury-ponad-limit',
  'porownanie',
  'druk',
  'qr-wysylanie',
  'spizarnia',
  'akademia-dalej',
];

/** Wiersze funkcji kontraktu z decyzją inną niż MVP (tabele „Zakres” i „NIE robimy”). */
function odlozoneWKontrakcie(): string[] {
  return kontrakt
    .split('\n')
    .map((l) => l.split('|').map((k) => k.trim()))
    .filter((k) => /^F-\d{2}$/.test(k[1] ?? '') && ['PÓŹNIEJ', 'NIE', 'TEST'].includes(k[4] ?? ''))
    .map((k) => k[1]);
}

/** Teksty ekranu Pro: zdania „Co daje Pro” i opis pod tytułem (klucze PL w t('…')). */
function tekstyEkranuPro(): string[] {
  const coDaje = paywall.split('function CoDajePro')[1]?.split('\nexport function')[0] ?? '';
  const zdania = [...coDaje.matchAll(/t\('([^']+)'\)/g)].map((m) => m[1]).filter((s) => s !== 'Co daje Pro');
  const opis = [...paywall.matchAll(/t\('(Basic zostaje[^']+)'\)/g)].map((m) => m[1]);
  return [...zdania, ...opis];
}

describe('ekran Pro obiecuje tylko funkcje z wejściem w 1.0 (015)', () => {
  it('mapa słów obejmuje każdy wiersz PÓŹNIEJ / NIE / TEST kontraktu i każde ukryte wejście', () => {
    const odlozone = odlozoneWKontrakcie();
    expect(odlozone.length).toBeGreaterThan(0);
    expect(odlozone.filter((f) => !SLOWA_FUNKCJI[f])).toEqual([]);
    const ukryte = (Object.keys(WEJSCIA_WIDOCZNE) as WejsciePozniej[]).filter((w) => !WEJSCIA_WIDOCZNE[w]);
    expect(ukryte.filter((w) => !SLOWA_WEJSC[w])).toEqual([]);
  });

  it('zdania „Co daje Pro” i opis pod tytułem nie nazywają funkcji bez wejścia w 1.0', () => {
    const teksty = tekstyEkranuPro();
    expect(teksty.length).toBeGreaterThanOrEqual(5);
    const wzorce = [
      ...odlozoneWKontrakcie().map((f) => [f, SLOWA_FUNKCJI[f]] as const),
      ...(Object.keys(WEJSCIA_WIDOCZNE) as WejsciePozniej[]).filter((w) => !WEJSCIA_WIDOCZNE[w]).map((w) => [w, SLOWA_WEJSC[w]] as const),
    ];
    const naruszenia = teksty.flatMap((s) => wzorce.filter(([, r]) => r.test(s)).map(([id]) => `${id}: ${s}`));
    expect(naruszenia).toEqual([]);
  });

  it('nazwy blokad funkcji Pro nie nazywają funkcji bez wejścia w 1.0 (Dziennik: „Porównanie i statystyki”)', () => {
    const wzorce = odlozoneWKontrakcie().map((f) => [f, SLOWA_FUNKCJI[f]] as const);
    const naruszenia = FUNKCJE_PRO.flatMap((f) => wzorce.filter(([, r]) => r.test(nazwaBlokady(f))).map(([id]) => `${f} → ${id}: ${nazwaBlokady(f)}`));
    expect(naruszenia).toEqual([]);
  });

  // Przekazanie roli 03 (commit e8345215) do roli 02: kontrakt płatności nie obiecuje porównania jako funkcji Pro;
  // wzmianka o porównaniu wolna tylko jako F-63 PÓŹNIEJ (poza ofertą Pro 1.0, DEC-04 a) [M1-audytor-generalny-015]
  it('docs/monetyzacja.md nie wymienia porównania wypieków jako funkcji Pro (lista Pro, tabela Basic/Pro, przepływ PR-06)', () => {
    const wiersze = monetyzacja.split('\n').filter((l) => /porównani/i.test(l));
    expect(wiersze.filter((l) => !(/F-63/.test(l) && /PÓŹNIEJ/.test(l)))).toEqual([]);
    const pro = monetyzacja.split('\n').find((l) => l.startsWith('- **Pro:**')) ?? '';
    expect(pro).toMatch(/statystyki/);
    expect(pro).not.toMatch(/porówn/i);
    const pr06 = monetyzacja.split('\n').find((l) => l.startsWith('| PR-06')) ?? '';
    expect(pr06).toMatch(/statystyki: ekran Pro/);
    expect(pr06).not.toMatch(/porówn/i);
  });
});
