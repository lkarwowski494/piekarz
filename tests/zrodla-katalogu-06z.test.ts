/**
 * 06z (D-126, D-247): zdanie wejścia ekranu „Źródła wiedzy” („Skąd pochodzą porady, liczby i ostrzeżenia w aplikacji.”)
 * obiecuje komplet: każde źródło twierdzenia użytego w treściach docs/tresci/pl, których tekst jest w aplikacji, ma wpis
 * na ekranie (src/core/zrodla-wiedzy.ts). Dopasowanie po domenie: adres z rejestru (docs/tresci/rejestr.json, pole
 * `zrodla[].adres`) bez protokołu, „www.” i przedrostka web.archive.org zaczyna się od adresu wpisu na ekranie.
 * Treści czekające na wpięcie (p9 roli 08) są wyjątkiem nazwanym tylko dopóty, dopóki ich tekstu nie ma w kodzie.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ZRODLA_WIEDZY } from '../src/core/zrodla-wiedzy';

const root = path.join(__dirname, '..');
const DIR = path.join(root, 'docs', 'tresci', 'pl');

interface Zrodlo { adres?: string }
interface Twierdzenie { id: string; status: string; zrodla?: Zrodlo[] }
const REJESTR: Twierdzenie[] = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'tresci', 'rejestr.json'), 'utf8'));
const WG = new Map(REJESTR.map((t) => [t.id, t]));

/**
 * D-247: treści bez tekstu w kodzie (przelicznik drożdży, maszyna; wpina rola 08 w p9). D-255 (06d): wersje drożdżowe
 * i plan drożdżowy wpięte w p9b-1b, zdjęte z listy; przelicznik wydzielony z drozdze-plan-przelicznik.md.
 */
const CZEKAJA_NA_WPIECIE = ['drozdze-przelicznik.md', 'maszyna.md'];

const ADRESY_EKRANU = ZRODLA_WIEDZY.flatMap((g) => g.zrodla.map((z) => z.adres.toLowerCase()));
const bezPrzedrostka = (adres: string) =>
  adres.replace(/^https?:\/\//, '').replace(/^web\.archive\.org\/web\/[^/]+\/(?:https?:\/\/)?/, '').replace(/^www\./, '').toLowerCase();
const naEkranie = (adres: string) => ADRESY_EKRANU.some((a) => bezPrzedrostka(adres).startsWith(a));

/** Zdania pliku treści (bez komentarzy) z ID twierdzeń ze znacznika [T:…]. */
function zdania(plik: string): { tekst: string; ids: string[] }[] {
  const t = fs.readFileSync(path.join(DIR, plik), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  return [...t.matchAll(/([^\]\n]*?)\s*\[T:([^\]]*)\]/g)].map((m) => ({
    tekst: m[1].replace(/^[-*|\s]+/, '').trim(),
    ids: m[2].split(',').map((s) => s.trim()).filter((s) => s && s !== '-'),
  }));
}

/** Domeny źródeł twierdzeń pliku, których nie ma na ekranie: `domena (ID, …)`. */
function luki(plik: string): string[] {
  const brak = new Map<string, Set<string>>();
  for (const { ids } of zdania(plik)) {
    for (const id of ids) {
      for (const z of WG.get(id)?.zrodla ?? []) {
        if (!z.adres || naEkranie(z.adres)) continue;
        const domena = bezPrzedrostka(z.adres).split(/[/?#]/)[0];
        brak.set(domena, (brak.get(domena) ?? new Set()).add(id));
      }
    }
  }
  return [...brak].map(([d, ids]) => `${plik}: ${d} (${[...ids].join(', ')})`);
}

function kodAplikacji(dir: string, out: string[] = []): string[] {
  for (const f of fs.readdirSync(path.join(root, dir))) {
    const p = path.join(dir, f);
    if (fs.statSync(path.join(root, p)).isDirectory()) {
      if (!['__tests__', 'node_modules'].includes(f)) kodAplikacji(p, out);
    } else if (/\.(ts|tsx)$/.test(f) && !/\.(test|spec)\./.test(f)) out.push(fs.readFileSync(path.join(root, p), 'utf8'));
  }
  return out;
}

const PLIKI = fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).sort();

describe('06z (D-126, D-247): ekran „Źródła wiedzy” ma każde źródło treści użytych w aplikacji', () => {
  it('katalog p8 (katalog-m3.md): każda domena źródeł użytych twierdzeń ma wpis na ekranie', () => {
    expect(zdania('katalog-m3.md').length).toBeGreaterThan(100);
    expect(luki('katalog-m3.md')).toEqual([]);
  });

  it('pozostałe treści docs/tresci/pl (poza czekającymi na wpięcie): każda domena źródeł ma wpis na ekranie', () => {
    const pliki = PLIKI.filter((f) => f !== 'katalog-m3.md' && !CZEKAJA_NA_WPIECIE.includes(f));
    expect(pliki.length).toBeGreaterThan(20);
    expect(pliki.flatMap(luki)).toEqual([]);
  });

  it('twierdzenia użyte w treściach są w rejestrze (dopasowanie domen ma na czym działać)', () => {
    const nieznane = PLIKI.flatMap((f) => zdania(f).flatMap((z) => z.ids)).filter((id) => !WG.has(id));
    expect(nieznane).toEqual([]);
  });

  it('wyjątek D-247 wygasa sam: tekstu treści czekających na wpięcie nie ma w kodzie app/ i src/', () => {
    const kod = [...kodAplikacji('app'), ...kodAplikacji('src')].join('\n');
    const wKodzie = CZEKAJA_NA_WPIECIE.flatMap((f) =>
      zdania(f).filter((z) => z.tekst.length >= 40 && kod.includes(z.tekst.slice(0, 40))).map((z) => `${f}: ${z.tekst.slice(0, 80)}`),
    );
    // Czerwony = treść wpięta: dopisz jej źródła na ekran (src/core/zrodla-wiedzy.ts) i usuń plik z CZEKAJA_NA_WPIECIE.
    expect(wKodzie).toEqual([]);
  });
});
