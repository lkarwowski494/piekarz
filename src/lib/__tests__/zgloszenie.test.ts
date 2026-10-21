/**
 * BR-OPIN-003 (DEC-13 a): treść wiadomości do autora z wersją aplikacji i systemu, bez danych osobowych
 * i bez treści użytkownika; wiersz kontaktu tylko przy prawdziwym adresie wsparcia. Wektory K01–K04:
 * docs/wzrost/wektory-kontakt.json [M1-audytor-generalny-083; 11-wzrost-005].
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { trescZgloszenia, czyAdresWsparcia, DaneZgloszenia } from '../zgloszenie';
import { SUPPORT_EMAIL } from '../links';
import { setLang } from '../i18n';

interface Wektor {
  id: string;
  we: DaneZgloszenia;
  oczekiwane: { temat: string; tresc_zawiera: string[]; tresc_nie_zawiera: string[] };
}
const plik = JSON.parse(
  readFileSync(join(__dirname, '../../../docs/wzrost/wektory-kontakt.json'), 'utf8')
) as { wektory: Wektor[]; miejsce_wywolania: { id: string }[] };

describe('trescZgloszenia: wektory K01–K04', () => {
  afterEach(() => setLang('pl'));

  it('plik ma wektory K01–K04 i KM01–KM05', () => {
    expect(plik.wektory.map((w) => w.id)).toEqual(['K01', 'K02', 'K03', 'K04']);
    expect(plik.miejsce_wywolania.map((m) => m.id)).toEqual(['KM01', 'KM02', 'KM03', 'KM04', 'KM05']);
  });

  it.each(plik.wektory.map((w) => [w.id, w] as const))('%s', (_id, w) => {
    setLang(w.we.jezyk);
    const { temat, tresc } = trescZgloszenia(w.we);
    expect(temat).toBe(w.oczekiwane.temat);
    for (const s of w.oczekiwane.tresc_zawiera) expect(tresc).toContain(s);
    for (const s of w.oczekiwane.tresc_nie_zawiera) expect(tresc).not.toContain(s);
  });

  it('treść zaczyna się zachętą i zostawia miejsce na tekst użytkownika przed separatorem', () => {
    const { tresc } = trescZgloszenia(plik.wektory[0].we);
    const [gora, dol] = tresc.split('\n---\n');
    expect(dol).toBeDefined();
    expect(gora.trim().length).toBeGreaterThan(0);
    expect(gora.endsWith('\n\n')).toBe(true);
    expect(dol.split('\n')[0]).toBe('Wersja aplikacji: 1.0.0 (1014)');
  });
});

describe('bez pola modelu telefonu (D-066 5a) [M2-koordynator-napraw-634 (p12c)]', () => {
  it('DaneZgloszenia i wywołanie nie mają pola modelu; treść bez wiersza telefonu', () => {
    for (const f of ['../zgloszenie.ts', '../zgloszenie-wyslanie.ts']) {
      expect(readFileSync(join(__dirname, f), 'utf8')).not.toMatch(/\bmodel\b/);
    }
    for (const w of plik.wektory) expect(Object.keys(w.we)).not.toContain('model');
    const { tresc } = trescZgloszenia(plik.wektory[0].we);
    expect(tresc).not.toContain('Telefon');
  });
});

describe('czyAdresWsparcia: wiersz tylko przy adresie e-mail (KM01)', () => {
  it('znacznik [DO USTALENIA] nie jest adresem; SUPPORT_EMAIL (od 2026-10-20) jest', () => {
    expect(czyAdresWsparcia('[DO USTALENIA: adres wsparcia od właściciela]')).toBe(false);
    expect(czyAdresWsparcia(SUPPORT_EMAIL)).toBe(true);
  });

  it('prawdziwy adres przechodzi, adres bez domeny albo ze spacją nie', () => {
    expect(czyAdresWsparcia('pomoc@example.com')).toBe(true);
    expect(czyAdresWsparcia('pomoc@example')).toBe(false);
    expect(czyAdresWsparcia('po moc@example.com')).toBe(false);
    expect(czyAdresWsparcia('[x]@example.com')).toBe(false);
  });
});
