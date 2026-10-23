/**
 * Piekarnik zajęty (M3 D6; BR-KAL-016 „Jeden piekarnik”, RD-34; treść roli 06 M0: okno zajęcia piekarnika = od startu
 * kroku nagrzewania do końca pieczenia, bez stałej przerwy między wypiekami, PIE-ZAJ-900). Wektory RD-34-W1…W6
 * z tests/wektory/brd.json; godziny oczekiwane wpisane ręcznie z rachunku, nie liczone kodem testowanym.
 */
import * as fs from 'fs';
import * as path from 'path';
import { kolizjePiekarnika, oknaKoliduja, oknoPiekarnika, przesunKroki, sprawdzPiekarnik, type KrokPiekarnika, type SprawdzeniePiekarnika, type WynikOkna } from '../piekarnik';
import { zdarzeniaKalendarza, type DaneKalendarza } from '../kalendarz-zdarzenia';
import { liniaNastepne } from '../kalendarz-nastepne';
import { glifyDnia } from '../../lib/kalendarz-pasek';
import { etykietaDnia, opisZdarzenia } from '../../lib/kalendarz-teksty';
import { setLang } from '../../lib/i18n';
import { localDateKey, startOfLocalDay } from '../dzien-lokalny';

const wektory = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../tests/wektory/brd.json'), 'utf8')) as Array<{ regula: string; id: string }>;

const MIN = 60_000;
/** Sobota 2026-10-24, godzina lokalna urządzenia. */
const o = (h: number, m = 0) => new Date(2026, 9, 24, h, m).getTime();

/** Wypiek z krokami: mieszanie, garowanie, nagrzewanie od `nagrzewanieOd` przez `nagrzewanieMin`, pieczenie `pieczenieMin`, studzenie. */
function wypiek(nagrzewanieOd: number, nagrzewanieMin: number, pieczenieMin: number): (KrokPiekarnika & { id: string; name: string; isPassive: boolean })[] {
  const p = nagrzewanieOd + nagrzewanieMin * MIN;
  const k = p + pieczenieMin * MIN;
  return [
    { id: 'mix', name: 'Mieszanie ciasta', category: 'mix', isPassive: false, plannedStart: nagrzewanieOd - 300 * MIN, plannedEnd: nagrzewanieOd - 280 * MIN },
    { id: 'final_proof', name: 'Garowanie', category: 'final_proof', isPassive: true, plannedStart: nagrzewanieOd - 280 * MIN, plannedEnd: nagrzewanieOd },
    { id: 'preheat_oven', name: 'Nagrzewanie pieca i garnka żeliwnego', category: 'preheat_oven', isPassive: true, plannedStart: nagrzewanieOd, plannedEnd: p },
    { id: 'bake', name: 'Wypiek z parą i rumienienie', category: 'bake', isPassive: false, plannedStart: p, plannedEnd: k },
    { id: 'cool', name: 'Studzenie na kratce', category: 'cool', isPassive: true, plannedStart: k, plannedEnd: k + 120 * MIN },
  ];
}

/** Wypiek A z wektorów: okno 08:15–09:45 (nagrzewanie garnka 30 min, pieczenie 60 min). */
const A = wypiek(o(8, 15), 30, 60);
/** Wypiek B z nagrzewaniem kamienia 60 min od `h:m`, pieczenie 15 min (pizza). */
const B = (h: number, m: number) => wypiek(o(h, m), 60, 15);

describe('RD-34: zajętość piekarnika przy dwóch wypiekach', () => {
  it('wektory RD-34-W1…W6 są w tests/wektory/brd.json', () => {
    expect(wektory.filter((w) => w.regula === 'RD-34').map((w) => w.id)).toEqual(['RD-34-W1', 'RD-34-W2', 'RD-34-W3', 'RD-34-W4', 'RD-34-W5', 'RD-34-W6']);
  });

  it('okno = [start kroku nagrzewania, koniec kroku pieczenia): A 08:15–09:45', () => {
    expect(oknoPiekarnika(A)).toEqual({ ok: true, okno: { od: o(8, 15), do: o(9, 45) } });
  });

  it('oknaKoliduja: część wspólna to kolizja, styk nie (granica RD-34-W2 i RD-34-W5)', () => {
    const a = { od: o(8, 15), do: o(9, 45) };
    expect(oknaKoliduja(a, { od: o(9, 44), do: o(10, 0) })).toBe(true);
    expect(oknaKoliduja(a, { od: o(9, 45), do: o(10, 0) })).toBe(false);
    expect(oknaKoliduja({ od: o(7, 0), do: o(8, 15) }, a)).toBe(false);
  });

  it('wynik bez okna i bez kolizji ma typ z powodem (WynikOkna, SprawdzeniePiekarnika)', () => {
    const bezCzasu: WynikOkna = oknoPiekarnika(A.map((k) => ({ ...k, plannedStart: null, plannedEnd: null })));
    expect(bezCzasu).toEqual({ ok: false, powod: 'bez-czasu' });
    const wolny: SprawdzeniePiekarnika = sprawdzPiekarnik(A.map((k) => ({ ...k, plannedStart: null, plannedEnd: null })), [{ nazwa: 'Chleb', kroki: A }]);
    expect(wolny).toEqual({ stan: 'wolny' });
  });

  it('RD-34-W1: nagrzewanie B o 11:00 — brak kolizji', () => {
    expect(sprawdzPiekarnik(B(11, 0), [{ nazwa: 'Chleb', kroki: A }])).toEqual({ stan: 'wolny' });
  });

  it('RD-34-W2 granica: nagrzewanie B dokładnie o 09:45 (koniec pieczenia A) — brak kolizji', () => {
    expect(sprawdzPiekarnik(B(9, 45), [{ nazwa: 'Chleb', kroki: A }])).toEqual({ stan: 'wolny' });
  });

  it('RD-34-W3: nagrzewanie B o 09:30 — kolizja; propozycja: start nagrzewania B o 09:45 (przesunięcie 15 min)', () => {
    const r = sprawdzPiekarnik(B(9, 30), [{ nazwa: 'Chleb', kroki: A }]);
    expect(r.stan).toBe('zajety');
    if (r.stan !== 'zajety') return;
    expect(r.przesuniecieMs).toBe(15 * MIN);
    expect(r.kolizje).toEqual([{ wypiek: 'Chleb', okno: { od: o(8, 15), do: o(9, 45) }, od: o(9, 30), do: o(9, 45) }]);
    const nagrzewanie = przesunKroki(B(9, 30), r.przesuniecieMs).find((k) => k.category === 'preheat_oven');
    expect(nagrzewanie?.plannedStart).toBe(o(9, 45));
  });

  it('RD-34-W4: nagrzewanie B o 09:44 — kolizja (minuta przed końcem okna A)', () => {
    const r = sprawdzPiekarnik(B(9, 44), [{ nazwa: 'Chleb', kroki: A }]);
    expect(r.stan).toBe('zajety');
    if (r.stan === 'zajety') expect(r.przesuniecieMs).toBe(1 * MIN);
  });

  it('RD-34-W5: nagrzewanie B o 07:00, pieczenie B do 08:15 (start okna A) — brak kolizji', () => {
    const b = wypiek(o(7, 0), 60, 15);
    expect(oknoPiekarnika(b)).toEqual({ ok: true, okno: { od: o(7, 0), do: o(8, 15) } });
    expect(sprawdzPiekarnik(b, [{ nazwa: 'Chleb', kroki: A }])).toEqual({ stan: 'wolny' });
  });

  it('RD-34-W6: plan B bez kroku nagrzewania — kolizji nie liczy się, plan prosi o krok nagrzewania', () => {
    const bezNagrzewania = B(9, 30).filter((k) => k.category !== 'preheat_oven');
    expect(oknoPiekarnika(bezNagrzewania)).toEqual({ ok: false, powod: 'brak-nagrzewania' });
    expect(sprawdzPiekarnik(bezNagrzewania, [{ nazwa: 'Chleb', kroki: A }])).toEqual({ stan: 'brak-nagrzewania' });
  });

  it('plan bez pieczenia nie zajmuje piekarnika (np. sam zaczyn) — brak kolizji i brak prośby o nagrzewanie', () => {
    const bezPieca = B(9, 30).filter((k) => k.category !== 'preheat_oven' && k.category !== 'bake');
    expect(oknoPiekarnika(bezPieca)).toEqual({ ok: false, powod: 'bez-pieczenia' });
    expect(sprawdzPiekarnik(bezPieca, [{ nazwa: 'Chleb', kroki: A }])).toEqual({ stan: 'wolny' });
  });

  it('drugi wypiek bez kroku nagrzewania (stary zapis) nie daje kolizji z nowym planem', () => {
    const innyBez = A.filter((k) => k.category !== 'preheat_oven');
    expect(sprawdzPiekarnik(B(9, 30), [{ nazwa: 'Chleb', kroki: innyBez }])).toEqual({ stan: 'wolny' });
  });

  it('propozycja omija kolejne okno: przesunięcie za pierwszy wolny odstęp, nie w następną kolizję', () => {
    // A 08:15–09:45, C 10:00–11:00; B (okno 75 min) od 09:30: po A (09:45) nachodzi na C, więc start B o 11:00
    const C = wypiek(o(10, 0), 30, 30);
    const r = sprawdzPiekarnik(B(9, 30), [{ nazwa: 'Chleb', kroki: A }, { nazwa: 'Bagietka', kroki: C }]);
    expect(r.stan).toBe('zajety');
    if (r.stan === 'zajety') expect(r.przesuniecieMs).toBe(90 * MIN);
  });
});

describe('BR-KAL-016: dwa wypieki prowadzone naraz — piekarnik', () => {
  it('BR-KAL-016 Jeden piekarnik: A 08:15–09:45, B z nagrzewaniem od 09:30 — piekarnik zajęty i propozycja: nagrzewanie B o 09:45', () => {
    const r = sprawdzPiekarnik(B(9, 30), [{ nazwa: 'Chleb', kroki: A }]);
    expect(r.stan).toBe('zajety');
    if (r.stan !== 'zajety') return;
    expect(przesunKroki(B(9, 30), r.przesuniecieMs).find((k) => k.category === 'preheat_oven')?.plannedStart).toBe(o(9, 45));
  });

  it('BR-KAL-016 Drugi wypiek z pełnym nagrzewaniem: po przesunięciu B ma pełny krok nagrzewania ze swojego planu, bez stałej przerwy', () => {
    const przed = B(9, 30);
    const r = sprawdzPiekarnik(przed, [{ nazwa: 'Chleb', kroki: A }]);
    if (r.stan !== 'zajety') throw new Error('oczekiwana kolizja');
    const po = przesunKroki(przed, r.przesuniecieMs);
    const dlugosc = (k: KrokPiekarnika | undefined) => (k?.plannedEnd ?? 0) - (k?.plannedStart ?? 0);
    // pełne nagrzewanie: 60 min jak w planie B, każdy krok tej samej długości co przed przesunięciem
    expect(dlugosc(po.find((k) => k.category === 'preheat_oven'))).toBe(60 * MIN);
    expect(po.map(dlugosc)).toEqual(przed.map(dlugosc));
    // bez przerwy: nagrzewanie B zaczyna się dokładnie o końcu pieczenia A, a po przesunięciu kolizji nie ma
    expect(po.find((k) => k.category === 'preheat_oven')?.plannedStart).toBe(A.find((k) => k.category === 'bake')?.plannedEnd);
    expect(sprawdzPiekarnik(po, [{ nazwa: 'Chleb', kroki: A }])).toEqual({ stan: 'wolny' });
  });

  it('BR-KAL-016 Wypieki jeden po drugim: A kończy pieczenie o 09:45, B nagrzewa od 09:45 — bez kolizji (RD-34-W2)', () => {
    expect(sprawdzPiekarnik(B(9, 45), [{ nazwa: 'Chleb', kroki: A }])).toEqual({ stan: 'wolny' });
    expect(kolizjePiekarnika([{ id: 'a', nazwa: 'Chleb', kroki: A }, { id: 'b', nazwa: 'Pizza', kroki: B(9, 45) }])).toEqual([]);
  });
});

describe('D6: piekarnik zajęty w kalendarzu i w arkuszu dnia', () => {
  beforeAll(() => setLang('pl'));
  const now = o(6, 0) - 2 * 86_400_000; // czwartek 22.10 06:00
  const dane: DaneKalendarza = {
    wypieki: [], zakwasy: [], wpisyZakwasow: [], dziennik: [], pominiecia: [],
    zaplanowane: [{ id: 'chleb', recipeName: 'Chleb', steps: A }, { id: 'pizza', recipeName: 'Pizza', steps: B(8, 30) }],
    dostep: { terminyKarmienia: true, przyszleWypieki: true },
  };

  it('kolizjePiekarnika: para wypieków z częścią wspólną okien (od 08:30 do 09:45), drugi = ten, który zaczyna później', () => {
    expect(kolizjePiekarnika([{ id: 'chleb', nazwa: 'Chleb', kroki: A }, { id: 'pizza', nazwa: 'Pizza', kroki: B(8, 30) }])).toEqual([
      { pierwszy: { id: 'chleb', nazwa: 'Chleb' }, drugi: { id: 'pizza', nazwa: 'Pizza' }, od: o(8, 30), do: o(9, 45) },
    ]);
  });

  it('BR-KAL-016 Jeden piekarnik w kalendarzu: zdarzenie „piekarnik zajęty” o 08:30 w sobotę, przed krokami o tej samej godzinie', () => {
    const z = zdarzeniaKalendarza(dane, now);
    const piec = z.filter((x) => x.rodzaj === 'piekarnik-zajety');
    expect(piec).toHaveLength(1);
    expect(piec[0]).toEqual(expect.objectContaining({ at: o(8, 30), dzien: localDateKey(o(8, 30)), nazwa: 'Chleb', piekarnik: { drugi: 'Pizza', doAt: o(9, 45) }, zalegle: false }));
    const o830 = z.filter((x) => x.at === o(8, 30));
    expect(o830[0]?.rodzaj).toBe('piekarnik-zajety');
    // słowo „Piekarnik zajęty” w opisie wiersza arkusza dnia (tekst roli 04 a2)
    expect(opisZdarzenia(piec[0], { now, wieleWypiekow: true })).toBe('Piekarnik zajęty: Chleb i Pizza pieką się w tym samym czasie');
    // „Następne” zostaje zdaniem o zadaniach: piekarnik nie jest zadaniem do odhaczenia
    expect(liniaNastepne(z, now).wszystkiePrzyszle.some((x) => x.rodzaj === 'piekarnik-zajety')).toBe(false);
  });

  it('bez kolizji (B od 09:45) kalendarz nie ma zdarzenia piekarnika', () => {
    const z = zdarzeniaKalendarza({ ...dane, zaplanowane: [dane.zaplanowane[0], { id: 'pizza', recipeName: 'Pizza', steps: B(9, 45) }] }, now);
    expect(z.some((x) => x.rodzaj === 'piekarnik-zajety')).toBe(false);
  });

  it('pasek: dzień z kolizją ma glif piekarnika pierwszy; VoiceOver dnia zaczyna się od „Piekarnik zajęty”', () => {
    const z = zdarzeniaKalendarza(dane, now);
    const dzien = localDateKey(o(8, 30));
    expect(glifyDnia(z, dzien, ['chleb', 'pizza']).glify[0]).toBe('piekarnik');
    const etykieta = etykietaDnia(z.filter((x) => x.dzien === dzien), { ms: startOfLocalDay(o(8, 30)), dzis: false }, { now, wieleWypiekow: true });
    expect(etykieta.split('. ')[1]).toMatch(/^Piekarnik zajęty/);
  });
});
