/**
 * p9b-2: reguły trybu maszyny do chleba z wektorami z tests/wektory/brd.json (RD-37 granice, RD-38 opóźniony start,
 * RD-39 podpowiedź programu), kolejność wkładania (BR-MASZ-003) i godzina startu programu (BR-MASZ-005). Logika czysta,
 * czas jako argument [M3 p9b2].
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  makaMaszyny,
  opoznionyStart,
  podpowiedzProgramu,
  kolejnoscWkladania,
  startProgramu,
  udzialPelnoziarnistychIZytnich,
  PROG_PELNOZIARNISTY_PROC,
  type SkladnikMaszyny,
  type ProgramMaszyny,
  type SkladnikPsujacy,
  type WynikMaki,
  type WynikOpoznienia,
  type WynikStartu,
} from '../maszyna';
import { WSP_SWIEZE_NA_SUCHE } from '../domain-rules';

type Wektor = { regula: string; id: string; wejscie: Record<string, unknown>; oczekiwane: Record<string, unknown> };
const wektory = (JSON.parse(fs.readFileSync(path.join(__dirname, '../../../tests/wektory/brd.json'), 'utf8')) as Wektor[]).filter((w) => /^RD-3[789]$/.test(w.regula));
const liczbaLubNull = (v: unknown): number | null => (typeof v === 'number' ? v : null);

describe('RD-37: ilości pod granice maszyny (wektory W1…W7)', () => {
  const rd37 = wektory.filter((w) => w.regula === 'RD-37');
  it('w brd.json jest 7 wektorów RD-37', () => expect(rd37.map((w) => w.id)).toEqual(['RD-37-W1', 'RD-37-W2', 'RD-37-W3', 'RD-37-W4', 'RD-37-W5', 'RD-37-W6', 'RD-37-W7']));
  it.each(rd37.map((w) => [w.id, w] as const))('%s', (_id, w) => {
    const we = w.wejscie;
    const wynik = makaMaszyny(
      Number(we['Mwyb [g]']),
      Number(we['Σp [-]']),
      liczbaLubNull(we['py [-]']),
      { makaMaxG: liczbaLubNull(we['Mmax [g]']), ciastoMaxG: liczbaLubNull(we['Cmax [g]']), drozdzeSucheMaxG: liczbaLubNull(we['Ymax [g]']) },
    );
    const ocz = w.oczekiwane['M [g]'];
    if (ocz === 'błąd danych') expect(wynik).toEqual({ ok: false, blad: 'brak-granicy-maki' });
    else expect(wynik.ok && wynik.makaG).toBe(ocz);
  });
  it('ograniczenie mówi, która granica przycięła ilość (komunikat BR-MASZ-002 W3)', () => {
    expect(makaMaszyny(500, 0.65, null, { makaMaxG: 620, ciastoMaxG: null, drozdzeSucheMaxG: null })).toEqual({ ok: true, makaG: 500, ograniczenie: null });
    expect(makaMaszyny(621, 0.65, null, { makaMaxG: 620, ciastoMaxG: null, drozdzeSucheMaxG: null })).toEqual({ ok: true, makaG: 620, ograniczenie: 'maka' });
    expect(makaMaszyny(620, 0.837, null, { makaMaxG: 620, ciastoMaxG: 1000, drozdzeSucheMaxG: null })).toEqual({ ok: true, makaG: 544, ograniczenie: 'ciasto' });
    expect(makaMaszyny(620, 0.65, 0.071, { makaMaxG: 620, ciastoMaxG: null, drozdzeSucheMaxG: 10 })).toEqual({ ok: true, makaG: 402, ograniczenie: 'drozdze' });
  });
  it('granice włączne: ciasto i drożdże po przycięciu nie przekraczają granic', () => {
    const r = makaMaszyny(620, 0.837, null, { makaMaxG: 620, ciastoMaxG: 1000, drozdzeSucheMaxG: null });
    expect(r.ok && r.makaG * 1.837).toBeLessThanOrEqual(1000);
    const y = makaMaszyny(620, 0.65, 0.071, { makaMaxG: 620, ciastoMaxG: null, drozdzeSucheMaxG: 10 });
    expect(y.ok && y.makaG * 0.071 * 0.35).toBeLessThanOrEqual(10);
  });
  it('złe dane (masa ≤ 0, granica ≤ 0) dają błąd, nie liczbę', () => {
    expect(makaMaszyny(0, 0.65, null, { makaMaxG: 620, ciastoMaxG: null, drozdzeSucheMaxG: null })).toEqual({ ok: false, blad: 'zle-dane' });
    expect(makaMaszyny(500, 0.65, null, { makaMaxG: -1, ciastoMaxG: null, drozdzeSucheMaxG: null })).toEqual({ ok: false, blad: 'zle-dane' });
  });
});

describe('RD-38: blokada opóźnionego startu (wektory W1…W10)', () => {
  // Nazwy składników z wektorów → rodzaje reguły (słownik testu; reguła działa na rodzajach, nie na napisach)
  const RODZAJ: Record<string, SkladnikMaszyny> = {
    mąka: 'maka', woda: 'woda', sól: 'sol', drożdże: 'drozdze', jajka: 'jajka', mleko: 'mleko', 'mleko w proszku': 'mleko_w_proszku',
    twaróg: 'ser', jogurt: 'jogurt', 'świeże jabłka': 'owoce', 'sok pomarańczowy': 'sok', 'starta marchew': 'warzywa',
  };
  const rd38 = wektory.filter((w) => w.regula === 'RD-38');
  it('w brd.json jest 10 wektorów RD-38', () => expect(rd38).toHaveLength(10));
  it.each(rd38.map((w) => [w.id, w] as const))('%s', (_id, w) => {
    const tekst = String(w.wejscie['Składniki [-]']);
    const skladniki = tekst === 'brak' ? [] : tekst.split(', ').map((n) => {
      const r = RODZAJ[n];
      if (!r) throw new Error(`brak rodzaju dla ${n}`);
      return r;
    });
    const wynik = opoznionyStart(skladniki);
    const ocz = w.oczekiwane['opóźniony start [-]'];
    if (ocz === 'błąd danych') expect(wynik).toEqual({ ok: false, blad: 'brak-skladnikow' });
    else expect(wynik.ok && wynik.dostepny).toBe(ocz === 'dostępny');
  });
  it('przy blokadzie wynik podaje, które składniki ją powodują (zdanie wyjaśnienia)', () => {
    expect(opoznionyStart(['maka', 'mleko', 'jajka', 'cukier', 'mleko'])).toEqual({ ok: true, dostepny: false, psujace: ['mleko', 'jajka'] });
    expect(opoznionyStart(null)).toEqual({ ok: false, blad: 'brak-skladnikow' });
  });
});

describe('RD-39: podpowiedź programu (wektory W1…W8)', () => {
  const PROGRAM: Record<string, ProgramMaszyny> = { ciasto: 'ciasto', słodki: 'slodki', pełnoziarnisty: 'pelnoziarnisty', francuski: 'francuski', podstawowy: 'podstawowy' };
  const tak = (v: unknown): boolean | null => (typeof v === 'number' ? v > 0 : null);
  const rd39 = wektory.filter((w) => w.regula === 'RD-39');
  it('w brd.json jest 8 wektorów RD-39; próg 50% (MAS-042, D-179)', () => {
    expect(rd39).toHaveLength(8);
    expect(PROG_PELNOZIARNISTY_PROC).toBe(50);
  });
  it.each(rd39.map((w) => [w.id, w] as const))('%s', (_id, w) => {
    const we = w.wejscie;
    const kat = String(we['Kategoria [-]']);
    if (kat !== 'pizza' && kat !== 'sweet' && kat !== 'sourdough' && kat !== 'rye' && kat !== 'yeast') throw new Error(kat);
    const wynik = podpowiedzProgramu({
      pozaForma: we['Kształt [-]'] === 'poza formą',
      kategoria: kat,
      upzProc: liczbaLubNull(we['Upż [%]']),
      maCukier: tak(we['Cukier [%]']),
      maTluszcz: tak(we['Tłuszcz [%]']),
    });
    const ocz = String(w.oczekiwane['program [-]']);
    if (ocz === 'błąd danych') expect(wynik).toEqual({ ok: false, blad: 'brak-maki' });
    else expect(wynik).toEqual({ ok: true, program: PROGRAM[ocz] });
  });
  it('nieznany cukier albo tłuszcz poniżej progu: podstawowy, nie francuski (brak zostaje brakiem)', () => {
    expect(podpowiedzProgramu({ pozaForma: false, kategoria: 'yeast', upzProc: 10, maCukier: null, maTluszcz: false })).toEqual({ ok: true, program: 'podstawowy' });
  });
  it('Upż: mąki żytnie i pełnoziarniste (typ ≥ 1850) liczone raz; brak mąk = null', () => {
    expect(udzialPelnoziarnistychIZytnich([{ name: 'Mąka pszenna typ 650', percentage: 50 }, { name: 'Mąka żytnia typ 720', percentage: 50 }])).toBe(50);
    expect(udzialPelnoziarnistychIZytnich([{ name: 'Mąka pszenna typ 750', percentage: 40 }, { name: 'Mąka pszenna graham typ 1850', percentage: 60 }])).toBe(60);
    expect(udzialPelnoziarnistychIZytnich([{ name: 'Mąka żytnia typ 2000', percentage: 100 }])).toBe(100);
    expect(udzialPelnoziarnistychIZytnich([])).toBeNull();
  });
});

describe('BR-MASZ-003: kolejność wkładania w jednym z dwóch układów', () => {
  const lista = [
    { id: 'maka', rodzaj: 'sucha' as const },
    { id: 'woda', rodzaj: 'plyn' as const },
    { id: 'sol', rodzaj: 'sucha' as const },
    { id: 'drozdze', rodzaj: 'drozdze' as const },
  ];
  it('płyny najpierw: płyny, potem suche, drożdże na końcu (MAS-005)', () => {
    expect(kolejnoscWkladania(lista, 'plyny_najpierw')?.map((x) => x.id)).toEqual(['woda', 'maka', 'sol', 'drozdze']);
  });
  it('drożdże najpierw: drożdże, suche, płyn na końcu (MAS-031)', () => {
    expect(kolejnoscWkladania(lista, 'drozdze_najpierw')?.map((x) => x.id)).toEqual(['drozdze', 'maka', 'sol', 'woda']);
  });
  it('bez układu: brak kolejności (ekran prosi o wybór)', () => {
    expect(kolejnoscWkladania(lista, null)).toBeNull();
  });
});

describe('BR-MASZ-005: godzina startu programu z godziny gotowości i czasu programu', () => {
  const H = 3_600_000;
  const teraz = Date.UTC(2026, 10, 4, 20, 0); // 20:00
  const gotowe = Date.UTC(2026, 10, 5, 7, 0); // jutro 7:00
  it('program 3 h 10 min, gotowe jutro o 7:00 → start jutro o 3:50; od teraz do gotowości 11 h (RD-38-W1 w BR-MASZ-005)', () => {
    expect(startProgramu(gotowe, 190, teraz)).toEqual({ ok: true, startMs: Date.UTC(2026, 10, 5, 3, 50), doGotowosciMin: 660 });
  });
  it('gotowe za 2 h przy programie 3 h 10 min: nie zdąży, najwcześniejsza godzina gotowości = teraz + czas programu', () => {
    expect(startProgramu(teraz + 2 * H, 190, teraz)).toEqual({ ok: false, blad: 'za-wczesnie', najwczesniejGotoweMs: teraz + 190 * 60_000 });
  });
  it('start dokładnie teraz jest dozwolony (granica włączna); zły czas programu = błąd', () => {
    expect(startProgramu(teraz + 190 * 60_000, 190, teraz)).toEqual({ ok: true, startMs: teraz, doGotowosciMin: 190 });
    expect(startProgramu(gotowe, 0, teraz)).toEqual({ ok: false, blad: 'zly-czas-programu' });
  });
});

describe('Typy wyników trybu maszyny i przelicznik RD-19', () => {
  it('WSP_SWIEZE_NA_SUCHE = 0,35 (D-172); wyniki to unie z ok/błąd', () => {
    expect(WSP_SWIEZE_NA_SUCHE).toBe(0.35);
    const maka: WynikMaki = makaMaszyny(500, 0.65, null, { makaMaxG: null, ciastoMaxG: null, drozdzeSucheMaxG: null });
    const opoz: WynikOpoznienia = opoznionyStart(['maka', 'jogurt']);
    const psujacy: SkladnikPsujacy = 'jogurt';
    const start: WynikStartu = startProgramu(0, -1, 0);
    expect([maka.ok, opoz.ok && !opoz.dostepny && opoz.psujace[0] === psujacy, start.ok]).toEqual([false, true, false]);
  });
});
