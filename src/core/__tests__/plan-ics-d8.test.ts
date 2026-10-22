/**
 * Plik .ics planu wypieku (BR-KAL-011; M3 D8): RFC 5545, czas w UTC, escape, zawijanie 75 oktetów, CRLF, stabilny UID.
 */
import { czasUtc, podpisPlanu, uidWydarzenia, ucieknijTekst, zawin, zbudujIcs, type WydarzenieIcs, type WynikIcs } from '../plan-ics';

const w = (nadpisz: Partial<WydarzenieIcs> = {}): WydarzenieIcs => ({
  id: 'bake_1790000000000',
  tytul: 'Wiejski chleb: Plan wypieku',
  opis: ['pt. 23, 21:00 Dokarmianie', 'sob. 24, 09:00 Mieszanie'],
  startMs: Date.UTC(2026, 9, 23, 19, 0),
  koniecMs: Date.UTC(2026, 9, 25, 9, 0),
  stempelMs: Date.UTC(2026, 9, 22, 15, 30, 5),
  ...nadpisz,
});
const ics = (x: WydarzenieIcs) => {
  const r: WynikIcs = zbudujIcs(x);
  if (!r.ok) throw new Error('oczekiwano ok');
  return r.ics;
};

describe('BR-KAL-011 plik .ics: format RFC 5545', () => {
  it('BR-KAL-011 wektor: VCALENDAR z jednym VEVENT, CRLF po każdej linii, UTC z „Z”', () => {
    expect(ics(w())).toBe(
      [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Apps4Brew//Piekarz//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:bake_1790000000000@piekarz',
        'DTSTAMP:20261022T153005Z',
        'DTSTART:20261023T190000Z',
        'DTEND:20261025T090000Z',
        'SUMMARY:Wiejski chleb: Plan wypieku',
        'DESCRIPTION:pt. 23\\, 21:00 Dokarmianie\\nsob. 24\\, 09:00 Mieszanie',
        'TRANSP:TRANSPARENT',
        'END:VEVENT',
        'END:VCALENDAR',
        '',
      ].join('\r\n')
    );
  });

  it('BR-KAL-011 żadna linia nie kończy się samym LF (tylko CRLF)', () => {
    const tekst = ics(w({ opis: ['a', 'b', 'c'] }));
    expect(tekst.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  });

  it('BR-KAL-011 UTC: godzina lokalna z DST nie przesuwa wydarzenia (zmiana czasu w Europie 2027-03-28)', () => {
    // 27.03.2027 21:00 CET (UTC+1) = 20:00Z; 28.03.2027 08:00 CEST (UTC+2) = 06:00Z; 11 h na zegarze, 10 h w rzeczywistości
    const start = new Date('2027-03-27T21:00:00+01:00').getTime();
    const koniec = new Date('2027-03-28T08:00:00+02:00').getTime();
    const tekst = ics(w({ startMs: start, koniecMs: koniec }));
    expect(tekst).toContain('DTSTART:20270327T200000Z');
    expect(tekst).toContain('DTEND:20270328T060000Z');
    // jesienią (2026-10-25 3:00 CEST → 2:00 CET) dwie godziny „2:30” to dwie różne chwile UTC
    expect(czasUtc(new Date('2026-10-25T02:30:00+02:00').getTime())).toBe('20261025T003000Z');
    expect(czasUtc(new Date('2026-10-25T02:30:00+01:00').getTime())).toBe('20261025T013000Z');
  });

  it('BR-KAL-011 wynik nie zależy od strefy procesu (czas w ms to UTC)', () => {
    const a = ics(w());
    const staraStrefa = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      expect(ics(w())).toBe(a);
    } finally {
      if (staraStrefa === undefined) delete process.env.TZ;
      else process.env.TZ = staraStrefa;
    }
  });

  it('BR-KAL-011 UID stabilny: ten sam wypiek daje ten sam UID, inny wypiek inny; znaki spoza [A-Za-z0-9_-] zastąpione', () => {
    expect(uidWydarzenia('bake_17')).toBe('bake_17@piekarz');
    expect(uidWydarzenia('bake_17')).toBe(uidWydarzenia('bake_17'));
    expect(uidWydarzenia('bake_18')).not.toBe(uidWydarzenia('bake_17'));
    expect(uidWydarzenia('plan: żytni, 5')).toBe('plan---ytni--5@piekarz');
    expect(ics(w({ id: 'plan_a' }))).toContain('UID:plan_a@piekarz\r\n');
  });

  it('BR-KAL-011 błędy: koniec nie po starcie, brak liczby, id bez znaków → wynik z powodem, bez pliku', () => {
    expect(zbudujIcs(w({ koniecMs: Date.UTC(2026, 9, 23, 19, 0) }))).toEqual({ ok: false, powod: 'czas' });
    expect(zbudujIcs(w({ startMs: Number.NaN }))).toEqual({ ok: false, powod: 'czas' });
    expect(zbudujIcs(w({ id: '' }))).toEqual({ ok: false, powod: 'id' });
    expect(zbudujIcs(w({ id: '§§' }))).toEqual({ ok: false, powod: 'id' });
  });
});

describe('BR-KAL-011 plik .ics: tekst', () => {
  it('BR-KAL-011 escape: przecinek, średnik, ukośnik i każda nowa linia', () => {
    expect(ucieknijTekst('a,b;c\\d')).toBe('a\\,b\\;c\\\\d');
    expect(ucieknijTekst('x\ny\r\nz\rw')).toBe('x\\ny\\nz\\nw');
  });

  it('BR-KAL-011 tytuł ze średnikiem i przecinkiem trafia do SUMMARY z escape', () => {
    expect(ics(w({ tytul: 'Chleb, żytni; 70%' }))).toContain('SUMMARY:Chleb\\, żytni\\; 70%\r\n');
  });

  it('BR-KAL-011 zawijanie: linia ≤ 75 oktetów, kolejne wiersze po CRLF + spacji, znak wielobajtowy nie jest dzielony', () => {
    const dluga = `DESCRIPTION:${'ą'.repeat(100)}`; // 12 + 200 oktetów
    const zawinieta = zawin(dluga);
    const wiersze = zawinieta.split('\r\n');
    expect(wiersze.length).toBeGreaterThan(1);
    for (const [i, x] of wiersze.entries()) {
      expect(new TextEncoder().encode(x).length).toBeLessThanOrEqual(75);
      if (i > 0) expect(x.startsWith(' ')).toBe(true);
    }
    // rozwinięcie (usunięcie CRLF + spacji) oddaje linię bez zmian
    expect(zawinieta.replace(/\r\n /g, '')).toBe(dluga);
    expect(zawin('krótka linia')).toBe('krótka linia');
  });

  it('BR-KAL-011 zawijanie: linia równo 75 oktetów zostaje, 76 jest zawinięta', () => {
    expect(zawin('x'.repeat(75))).toBe('x'.repeat(75));
    expect(zawin('x'.repeat(76))).toBe(`${'x'.repeat(75)}\r\n x`);
  });

  it('BR-KAL-011 w pliku nie ma linii dłuższej niż 75 oktetów, także przy długim opisie', () => {
    const opis = Array.from({ length: 14 }, (_, i) => `sob. 24, ${9 + i}:00 Formowanie i długie garowanie końcowe w koszyku`);
    for (const linia of ics(w({ opis })).split('\r\n')) {
      expect(new TextEncoder().encode(linia).length).toBeLessThanOrEqual(75);
    }
  });

  it('BR-KAL-011 bez danych osobowych: plik zawiera tylko tytuł, opis, UID i czasy', () => {
    const tekst = ics(w());
    expect(tekst).not.toMatch(/ATTENDEE|ORGANIZER|LOCATION|GEO|@gmail|mailto/i);
  });
});

describe('BR-KAL-011 podpis planu (zmiana planu po dodaniu)', () => {
  const kroki = [
    { plannedStart: 1000, plannedEnd: 2000 },
    { plannedStart: 2000, plannedEnd: 3000 },
  ];
  it('BR-KAL-011 ten sam plan ma ten sam podpis, przesunięcie dowolnego kroku zmienia podpis', () => {
    expect(podpisPlanu(kroki)).toBe(podpisPlanu(kroki.map((k) => ({ ...k }))));
    expect(podpisPlanu([kroki[0] as (typeof kroki)[0], { plannedStart: 2000, plannedEnd: 3600 }])).not.toBe(podpisPlanu(kroki));
    expect(podpisPlanu([{ plannedStart: null, plannedEnd: null }])).not.toBe(podpisPlanu(kroki));
  });
});
