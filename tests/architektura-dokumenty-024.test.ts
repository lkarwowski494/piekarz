/**
 * Dokumenty architektury zgodne z kodem i ze źródłami platformy [M1-audytor-generalny-024; 05-architekt-505].
 * Wybór (b) (D-286): ADR odtworzone z kodu jako stan zastany (ADR-009 dane lokalne, ADR-010 zawieszenie w tle),
 * ADR-003 i ADR-005 zastąpione. Apple (developer.apple.com/documentation/xcode/sigkill, odczyt 2026-11-09): 0xdead10cc
 * to blokada pliku lub bazy trzymana w czasie zawieszenia; WAL ani busy_timeout jej nie zwalniają. Liczby czasu
 * bez pomiaru (np. „< 5 ms”) nie są budżetem (zasada 9 roli 05).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const adrDir = join(root, 'docs', 'adr');
const adr = (nr: string) => {
  const plik = readdirSync(adrDir).find((f) => f.startsWith(`ADR-${nr}_`));
  if (!plik) throw new Error(`brak ADR-${nr}`);
  return readFileSync(join(adrDir, plik), 'utf8');
};
const arch = () => readFileSync(join(root, 'docs', 'system-architecture.md'), 'utf8');
const sekcja = (tekst: string, od: string, doNaglowka: RegExp) => {
  const i = tekst.indexOf(od);
  if (i < 0) throw new Error(`brak sekcji ${od}`);
  const reszta = tekst.slice(i + od.length);
  const j = reszta.search(doNaglowka);
  return j < 0 ? reszta : reszta.slice(0, j);
};
// Zdanie, które przypisuje WAL albo busy_timeout ochronę przed 0xdead10cc (bez zaprzeczenia „nie”)
const OCHRONA = /^(?!.*\bnie\b).*(eliminuje|chroni|odporno|zapobiega|ochrona)[^\n]*0xdead10cc/im;
const ZDANIA_OCHRONY = /^(?!.*\bnie\b).*(WAL|busy_timeout)[^\n]*(eliminuje|chroni|zapobiega)[^\n]*/im;
const LICZBA_BEZ_POMIARU = /[<≤]\s*\d+(?:[.,]\d+)?\s*ms\b/i;

describe('024: ADR-005 i §2.1 bez fałszywej ochrony przed 0xdead10cc, z zasadą Apple i sposobem sprawdzenia', () => {
  it('ADR-005 zastąpiony przez ADR-010 i bez twierdzenia o ochronie', () => {
    const t = adr('005');
    expect(t).toMatch(/\*\*Status:\*\*[^\n]*zastąpion[^\n]*ADR-010/);
    expect(t).not.toMatch(OCHRONA);
    expect(t).not.toMatch(/100% odporność/);
  });

  it('§2.1 system-architecture.md: pragmy z kodu, bez ochrony przez WAL/busy_timeout, odsyłacz do ADR-010', () => {
    const s21 = sekcja(arch(), '### 2.1', /\n### /);
    expect(s21).not.toMatch(OCHRONA);
    expect(s21).not.toMatch(ZDANIA_OCHRONY);
    expect(s21).toContain('PRZYGOTOWANIE_MIGRACJI');
    expect(s21).toContain('ADR-010');
  });

  it('ADR-010: cytat Apple z adresem i datą odczytu, sekcja Potwierdzenie ze sposobem sprawdzenia', () => {
    const t = adr('010');
    expect(t).toContain('held on to a file lock or SQLite database lock during suspension');
    expect(t).toContain('developer.apple.com/documentation/xcode/sigkill');
    expect(t).toContain('2026-11-09');
    expect(t).toMatch(/## Potwierdzenie/);
    expect(t).toContain('ARCH-13');
  });
});

describe('024: ADR-003 zastąpione; polityka migracji z 12 krokami i testem kaskady', () => {
  it('ADR-003 zastąpiony przez ADR-009', () => {
    expect(adr('003')).toMatch(/\*\*Status:\*\*[^\n]*zastąpion[^\n]*ADR-009/);
  });

  it('ADR-009 i §5: kolejność 12 kroków (klucze OFF przed BEGIN, foreign_key_check przed COMMIT) i test kaskady', () => {
    for (const t of [adr('009'), sekcja(arch(), '## 5.', /\n## /)]) {
      const off = t.indexOf('PRAGMA foreign_keys=OFF');
      const begin = t.indexOf('BEGIN', off);
      const check = t.indexOf('PRAGMA foreign_key_check', begin);
      const commit = t.indexOf('COMMIT', check);
      expect([off, begin, check, commit].every((i) => i >= 0)).toBe(true);
      expect(t).toContain('lang_altertable.html');
      expect(t).toContain('runner-przebudowa-019.sqlite.test.ts');
      expect(t).toContain('przebudowa');
    }
  });
});

describe('024: budżety wydajności tylko z pomiarem', () => {
  it('system-architecture.md, ADR-001, ADR-009, ADR-010 bez liczb czasu bez pomiaru', () => {
    for (const [nazwa, t] of [['system-architecture.md', arch()], ['ADR-001', adr('001')], ['ADR-009', adr('009')], ['ADR-010', adr('010')]] as const) {
      expect([nazwa, LICZBA_BEZ_POMIARU.exec(t)?.[0] ?? null]).toEqual([nazwa, null]);
    }
  });
});
