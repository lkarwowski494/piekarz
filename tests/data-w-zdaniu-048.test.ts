/**
 * Data odległa nie stoi w mianowniku po słowie („Gotowe czwartek, 12 listopada o 13:30”): stoi po dwukropku
 * („Gotowe: czwartek, 12 listopada, 13:30”), a słowo dnia zostaje w zdaniu („Gotowe jutro o 13:30”)
 * [M1-audytor-generalny-048; 09-lokalizacja-007, opcja a]. Języki z testu akceptacyjnego: pl, de, es, ru, cs.
 */
import { setLang, t, type Lang } from '../src/lib/i18n';
import { czyDzienSlowem, dzienSlownie, etykietaPlanuPrzedStartem, gotoweKiedy, gotoweNazwa, startKiedy } from '../src/lib/spirala-etykieta';
import { tekstZaPozno } from '../src/lib/plan-za-pozno';

const TERAZ = new Date(2026, 10, 9, 10, 0);
const DALEKO = new Date(2026, 10, 12, 13, 30);
const JUTRO = new Date(2026, 10, 10, 13, 30);

/** Data stoi na początku albo po „: ” / „, ”, nigdy po literze (mianownik po czasowniku). */
function poDwukropku(zdanie: string, data: string): boolean {
  const i = zdanie.indexOf(data);
  if (i < 0) return false;
  return i === 0 || /[:,]\s$/.test(zdanie.slice(0, i));
}

describe('048: data w zdaniu', () => {
  afterAll(() => setLang('pl'));
  it('czyDzienSlowem: wczoraj…pojutrze słowem, dalej data', () => {
    expect(czyDzienSlowem(JUTRO, TERAZ)).toBe(true);
    expect(czyDzienSlowem(DALEKO, TERAZ)).toBe(false);
  });
  it.each(['pl', 'de', 'es', 'ru', 'cs'] as Lang[])('%s: data odległa po dwukropku we wszystkich zdaniach', (l) => {
    setLang(l);
    const data = dzienSlownie(DALEKO, TERAZ);
    const zdania = [
      gotoweKiedy(DALEKO, TERAZ, true),
      gotoweKiedy(DALEKO, TERAZ, false),
      gotoweNazwa('Chleb', DALEKO, TERAZ),
      startKiedy(DALEKO, TERAZ),
      etykietaPlanuPrzedStartem({ liczbaKrokow: 3, gotowe: DALEKO, teraz: TERAZ }),
      tekstZaPozno({ zaPozno: true, startMs: DALEKO.getTime() - 3_600_000, najwczesniejMs: DALEKO.getTime() } as never, TERAZ.getTime())!.tresc,
    ];
    for (const z of zdania) expect([z, poDwukropku(z, data)]).toEqual([z, true]);
  });
  it('pl: słowo dnia zostaje w zdaniu', () => {
    setLang('pl');
    expect(gotoweKiedy(JUTRO, TERAZ, true)).toBe('Gotowe jutro o 13:30.');
    expect(startKiedy(JUTRO, TERAZ)).toBe('Start jutro o 13:30');
    expect(gotoweNazwa('Chleb', DALEKO, TERAZ)).toBe(`Chleb — gotowe: ${dzienSlownie(DALEKO, TERAZ)}, 13:30`);
    expect(t('Gotowe: {dzien}, {godzina}', { dzien: 'X', godzina: 'Y' })).toBe('Gotowe: X, Y');
    expect(t('Plan musiałby się zacząć: {dzienStartu}, {godzinaStartu}. Najwcześniej chleb będzie gotowy: {dzienGotowe}, {godzinaGotowe}.', { dzienStartu: 'a', godzinaStartu: 'b', dzienGotowe: 'c', godzinaGotowe: 'd' })).toContain('zacząć: a, b');
  });
});
