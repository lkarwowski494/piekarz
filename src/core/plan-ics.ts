// ============================================================================
// Piekarz — plan wypieku jako plik .ics (BR-KAL-011; D-092, STOP 3 pkt 3) [M3 D8]
// Czysty moduł (RFC 5545): jedno wydarzenie na cały plan, kroki w opisie. Czasy w UTC z „Z”, więc zmiana czasu nie
// przesuwa wydarzenia; bez dostępu do kalendarza telefonu (OG-08), bez danych osobowych.
// ============================================================================

export interface WydarzenieIcs {
  /** Stabilny identyfikator wypieku (plan zapisany: id wypieku; plan niezapisany: z receptury i startu). */
  id: string;
  tytul: string;
  /** Wiersze opisu (kroki z godzinami); łączone znakiem nowej linii. */
  opis: readonly string[];
  startMs: number;
  koniecMs: number;
  /** Chwila utworzenia pliku (DTSTAMP). */
  stempelMs: number;
}

export type WynikIcs = { ok: true; ics: string } | { ok: false; powod: 'czas' | 'id' };

const CRLF = '\r\n';
const LIMIT_OKTETOW = 75;

/** Chwila w UTC: RRRRMMDDTGGMMSSZ. */
export function czasUtc(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Tekst RFC 5545 (§3.3.11): ukośnik, średnik, przecinek i nowa linia. */
export function ucieknijTekst(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r\n|\r|\n/g, '\\n');
}

const oktety = (znak: string) => new TextEncoder().encode(znak).length;

/** Zawijanie linii do 75 oktetów (RFC 5545 §3.1): kolejne wiersze zaczynają się spacją; znak UTF-8 nie jest dzielony. */
export function zawin(linia: string): string {
  const wiersze: string[] = [];
  let biezacy = '';
  let rozmiar = 0;
  for (const znak of linia) {
    const o = oktety(znak);
    const limit = wiersze.length === 0 ? LIMIT_OKTETOW : LIMIT_OKTETOW - 1; // spacja początkowa liczy się do limitu
    if (rozmiar + o > limit) {
      wiersze.push(biezacy);
      biezacy = '';
      rozmiar = 0;
    }
    biezacy += znak;
    rozmiar += o;
  }
  wiersze.push(biezacy);
  return wiersze.join(CRLF + ' ');
}

/** UID: id wypieku bez znaków spoza [A-Za-z0-9_-]; stały dla tego samego wypieku. */
export function uidWydarzenia(id: string): string | null {
  const czyste = id.replace(/[^A-Za-z0-9_-]/g, '-');
  return /[A-Za-z0-9]/.test(czyste) ? `${czyste}@piekarz` : null;
}

export function zbudujIcs(w: WydarzenieIcs): WynikIcs {
  if (![w.startMs, w.koniecMs, w.stempelMs].every(Number.isFinite) || w.koniecMs <= w.startMs) return { ok: false, powod: 'czas' };
  const uid = uidWydarzenia(w.id);
  if (uid === null) return { ok: false, powod: 'id' };
  const linie = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Apps4Brew//Piekarz//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${czasUtc(w.stempelMs)}`,
    `DTSTART:${czasUtc(w.startMs)}`,
    `DTEND:${czasUtc(w.koniecMs)}`,
    `SUMMARY:${ucieknijTekst(w.tytul)}`,
    `DESCRIPTION:${ucieknijTekst(w.opis.join('\n'))}`,
    // Wydarzenie obejmuje cały plan, także noc: nie oznacza użytkownika jako zajętego
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return { ok: true, ics: linie.map(zawin).join(CRLF) + CRLF };
}

/** Podpis kroków planu: zmiana godziny któregokolwiek kroku zmienia podpis (BR-KAL-011, scenariusz 2). */
export function podpisPlanu(kroki: readonly { plannedStart: number | null; plannedEnd: number | null }[]): string {
  return kroki.map((k) => `${k.plannedStart ?? ''}-${k.plannedEnd ?? ''}`).join(',');
}
