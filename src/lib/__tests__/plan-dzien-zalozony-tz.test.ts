/**
 * Dzień założony planu (skrót arkusza dnia BR-KAL-015, rytm BR-KAL-014) nie zmienia się po cichu [M3 TZ]: godzina bez
 * nocy tylko w tym dniu, bez niej najwcześniejsza w tym dniu; dzień po najwcześniejszej możliwej godzinie — nieosiągalny.
 * Czyste funkcje: czas w argumentach, chwile w czasie lokalnym strefy procesu (TZ Matrix).
 */
import { celWDniu, dzienZalozony, godzinaBezNocy, godzinaPrzyOtwarciu, type CelWDniu, type KrokNocy } from '../plan-bez-nocy';

const H = 3_600_000;
const okno = { startH: 23, koniecH: 7 };
// Plan z jednym krokiem czynnym 1 h, kończącym się 2 h przed „gotowe”, i całkowitą długością 10 h
const kroki = (celMs: number): KrokNocy[] => [
  { isPassive: true, plannedStart: celMs - 10 * H, plannedEnd: celMs - 3 * H },
  { isPassive: false, plannedStart: celMs - 3 * H, plannedEnd: celMs - 2 * H },
];
const lok = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m).getTime();
const dzien = (d: number) => ({ odDniaMs: lok(d, 0), doDniaMs: lok(d + 1, 0) });

describe('celWDniu', () => {
  it('godzina domyślna zdąży i bez nocy: bez zmian', () => {
    expect(celWDniu({ najwczesniejMs: lok(23, 20), domyslnyMs: lok(24, 10), ...dzien(24), kroki, okno })).toEqual({ rodzaj: 'bez-zmian' });
  });
  it('za późno w tym dniu: najbliższa godzina bez nocy ≥ najwcześniejszej, w tym dniu', () => {
    expect(celWDniu({ najwczesniejMs: lok(24, 12), domyslnyMs: lok(24, 10), ...dzien(24), kroki, okno })).toEqual({ rodzaj: 'godzina', celMs: lok(24, 12) });
  });
  it('w tym dniu tylko godziny z krokiem w nocy: najwcześniejsza w tym dniu, nie następny dzień', () => {
    // sen od 20:00: krok czynny 3–2 h przed „gotowe” dla każdej godziny od 23:15 do 23:55 wypada w nocy
    const wczesnySen = { startH: 20, koniecH: 7 };
    const w = celWDniu({ najwczesniejMs: lok(24, 23, 15), domyslnyMs: lok(24, 10), ...dzien(24), kroki, okno: wczesnySen });
    expect(w).toEqual({ rodzaj: 'godzina', celMs: lok(24, 23, 15) });
    expect(godzinaBezNocy(lok(24, 23, 15), kroki, wczesnySen)).toBeGreaterThanOrEqual(lok(25, 0));
  });
  it('najwcześniejsza możliwa po końcu dnia: nieosiągalny (CelWDniu: godzina | bez-zmian | nieosiagalny)', () => {
    const rodzaje: CelWDniu['rodzaj'][] = ['godzina', 'bez-zmian', 'nieosiagalny'];
    expect(rodzaje).toHaveLength(3);
    expect(celWDniu({ najwczesniejMs: lok(25, 3, 15), domyslnyMs: lok(24, 10), ...dzien(24), kroki, okno })).toEqual({ rodzaj: 'nieosiagalny' });
  });
  it('godzinaBezNocy z granicą: nic przed granicą → null', () => {
    expect(godzinaBezNocy(lok(24, 23, 15), kroki, { startH: 20, koniecH: 7 }, lok(25, 0))).toBeNull();
  });
});

describe('dzienZalozony', () => {
  const teraz = lok(23, 21, 30); // piątek 21:30
  it('pierwszy dzień nieosiągalny: następny z listy (rytm + 7)', () => {
    const w = dzienZalozony({ dni: [1, 8], terazMs: teraz, najwczesniejMs: lok(25, 3, 15), hour: 10, minute: 0, kroki, okno });
    expect(w).toEqual({ dzien: 8, cel: { rodzaj: 'bez-zmian' } });
  });
  it('żaden osiągalny: null', () => {
    expect(dzienZalozony({ dni: [0], terazMs: teraz, najwczesniejMs: lok(25, 3, 15), hour: 10, minute: 0, kroki, okno })).toBeNull();
  });
});

describe('godzinaPrzyOtwarciu', () => {
  const teraz = lok(23, 21, 30);
  const baza = { terazMs: teraz, najwczesniejMs: lok(25, 3, 15), zaPozno: true, krokiNaEkranie: kroki(lok(24, 10)), kroki, okno, hour: 10, minute: 0 };
  it('rytm na sobotę nieosiągalną: sobota za tydzień (dzień, godzina bez zmian)', () => {
    expect(godzinaPrzyOtwarciu({ ...baza, skrot: null, rytm: 1 })).toEqual({ dzien: 8 });
  });
  it('rytm, którego i tydzień później nie ma w zasięgu D-108: bez propozycji, godzina jak bez rytmu', () => {
    expect(godzinaPrzyOtwarciu({ ...baza, najwczesniejMs: lok(23, 21, 30) + 20 * 86_400_000, skrot: null, rytm: 7 })).toEqual({
      rytmPoza: true,
      celMs: lok(23, 21, 30) + 20 * 86_400_000,
    });
  });
  it('skrót na dziś nieosiągalny: brak zmiany (dzień zostaje, „Nie zdążysz” na ekranie)', () => {
    expect(godzinaPrzyOtwarciu({ ...baza, skrot: 0, rytm: 1 })).toEqual({});
  });
  it('bez dnia założonego: najbliższa godzina bez nocy ≥ najwcześniejszej', () => {
    expect(godzinaPrzyOtwarciu({ ...baza, skrot: null, rytm: null })).toEqual({ celMs: lok(25, 10, 0) }); // krok czynny od 07:00
  });
  it('bez godzin planu: brak zmiany', () => {
    expect(godzinaPrzyOtwarciu({ ...baza, najwczesniejMs: null, skrot: 1, rytm: null })).toEqual({});
  });
});
