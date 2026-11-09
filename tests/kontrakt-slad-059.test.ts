/**
 * M1-audytor-generalny-059 (03-zakres-003): ślad funkcja → BR w kontrakcie zakresu jest kompletny i aktualny.
 * D-187 odkładało ID BR do „kolumny Wymagania razem z testem z ID”, ale nikt ich nie dopisywał po teście; trwała
 * kontrola: każdy wiersz F-nn tabel „Zakres” i „NIE robimy” ma BR albo H, BR jest w jednej funkcji, a ID BR, które
 * Uzasadnienie odkłada „do kolumny Wymagania”, już tam są (część mechaniki `zakres.mjs` roli 03).
 */
import * as fs from 'fs';
import * as path from 'path';
import { ZRODLA_WIEDZY } from '../src/core/zrodla-wiedzy';

const root = path.resolve(__dirname, '..');
const kontrakt = fs.readFileSync(path.join(root, 'docs/scope-contract.md'), 'utf8').replace(/\r\n/g, '\n');
const linie = kontrakt.split('\n');
const komorki = (l: string) => l.split('|').map((k) => k.trim());
/** Wiersze funkcji (10 kolumn: ID, Funkcja, Wymagania, Decyzja, …, Uzasadnienie). */
const funkcje = linie.map(komorki).filter((k) => /^F-\d{2}$/.test(k[1] ?? '') && k.length === 12);
const wiersz = (f: string) => funkcje.find((k) => k[1] === f);
const RE_BR = /\bBR-[A-Z]{2,6}-\d{3}\b/g;

describe('kontrakt zakresu: ślad funkcja → BR (059, 03-zakres-003)', () => {
  it('każdy wiersz F-nn ma w kolumnie „Wymagania” BR albo hipotezę H', () => {
    expect(funkcje.length).toBeGreaterThan(50);
    expect(funkcje.filter((k) => !/\bBR-[A-Z]{2,6}-\d{3}\b/.test(k[3]) && !/\bH-\d{2}\b/.test(k[3])).map((k) => k[1])).toEqual([]);
  });

  it('każde BR jest w jednej funkcji', () => {
    const gdzie = new Map<string, string[]>();
    for (const k of funkcje) for (const id of k[3].match(RE_BR) ?? []) gdzie.set(id, [...(gdzie.get(id) ?? []), k[1]]);
    expect([...gdzie].filter(([, f]) => f.length > 1)).toEqual([]);
  });

  it('Uzasadnienie nie odkłada ID BR „do kolumny Wymagania” (D-187 wykonane)', () => {
    expect(funkcje.filter((k) => /do kolumny „Wymagania”/.test(k[10] ?? '')).map((k) => k[1])).toEqual([]);
  });

  it.each([
    ['F-72', ['BR-MASZ-001', 'BR-MASZ-002', 'BR-MASZ-003', 'BR-MASZ-004', 'BR-MASZ-005', 'BR-MASZ-006']],
    ['F-55', ['BR-KALK-009', 'BR-KALK-010', 'BR-KALK-012']],
    ['F-26', ['BR-RECP-001', 'BR-RECP-005']],
    ['F-33', ['BR-DANE-003', 'BR-DANE-005']],
    ['F-82', ['BR-UST-004']],
    ['F-83', ['BR-UST-005']],
  ])('%s ma w kolumnie „Wymagania” %j', (f, br) => {
    expect(wiersz(f)?.[3].match(RE_BR)).toEqual(br);
    expect(wiersz(f)?.[4]).toBe('MVP');
  });

  it('F-82 podaje liczbę źródeł z ekranu „Źródła wiedzy” (src/core/zrodla-wiedzy.ts)', () => {
    const liczba = ZRODLA_WIEDZY.reduce((s, g) => s + g.zrodla.length, 0);
    expect(wiersz('F-82')?.[2]).toContain(`${liczba} źródłami`);
  });

  it('F-83 ma podłogę „prawo: OG-13”', () => {
    expect(wiersz('F-83')?.[8]).toMatch(/prawo: OG-13/);
  });
});

describe('kontrakt zakresu: model płatności Basic/Pro bez próby (059, D-112, D-116)', () => {
  const zm = kontrakt.split('## Zmiany zakresu')[1]?.split('\n## ')[0] ?? '';
  const bezHistoriiZm = kontrakt.replace(zm, '');

  it('poza historią ZM kontrakt nie mówi o próbie ani o trybie „tylko historia”', () => {
    const trafienia = bezHistoriiZm.split('\n').filter((l) => /próba|próby|próbie|tylko historia/.test(l));
    expect(trafienia.map((l) => l.slice(0, 80))).toEqual([]);
  });

  it('„Darmowe i płatne” odsyła do D-112/D-113, nie do D-038', () => {
    const l = linie.find((x) => x.startsWith('- Darmowe i płatne:')) ?? '';
    expect(l).toMatch(/D-112/);
    expect(l).toMatch(/D-113/);
    expect(l).not.toMatch(/bez zmian względem D-038/);
  });

  it('kolumna WTP każdej funkcji MVP i PÓŹNIEJ mówi, czy to Basic, Pro albo „zawsze”', () => {
    const bez = funkcje.filter((k) => ['MVP', 'PÓŹNIEJ'].includes(k[4]) && !/Basic|Pro\b|zawsze/.test(k[6])).map((k) => k[1]);
    expect(bez).toEqual([]);
  });

  it('F-37 i F-67 opisują ekran Pro i koniec Pro według BR-ZAK-003…005 (D-112, D-116)', () => {
    expect(wiersz('F-37')?.[2]).toMatch(/Ekran Pro/);
    expect(wiersz('F-37')?.[7]).toMatch(/cena.*okres.*anul/);
    expect(wiersz('F-67')?.[2]).toMatch(/koniec Pro/i);
    expect(wiersz('F-67')?.join('|')).toMatch(/D-116/);
  });
});
