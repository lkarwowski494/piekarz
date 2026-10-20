/**
 * Format czasu trwania (design-spec §11c „116”, test akceptacyjny 3): „35 h 40 min”, „30 min”, „4 h”, spacje
 * niełamiące U+00A0, bez ułamków godzin; etykieta VoiceOver w pełnych słowach z formami liczby.
 * [M1-audytor-generalny-116; 04-studio-projektowe-034]
 */
import { czasTrwania } from '../czas-trwania';
import { setLang } from '../i18n';

const NBSP = ' ';
const spacjeNielamiace = (s: string) => s.split(' ').join(NBSP);

describe('czasTrwania (§11c 116)', () => {
  afterEach(() => setLang('pl'));

  it('PL: 0,5 h → „30 min”, 4 h → „4 h”, bez ułamków godzin', () => {
    setLang('pl');
    expect(czasTrwania(0.5 * 60).tekst).toBe(spacjeNielamiace('30 min'));
    expect(czasTrwania(4 * 60).tekst).toBe(spacjeNielamiace('4 h'));
    for (const min of [5, 61, 2140.2, 240]) expect(czasTrwania(min).tekst).not.toMatch(/[.,]\d/);
  });

  it('PL: etykieta VoiceOver z formami liczby', () => {
    setLang('pl');
    expect(czasTrwania(35 * 60 + 40).etykieta).toBe('35 godzin 40 minut');
    expect(czasTrwania(61).etykieta).toBe('1 godzina 1 minuta');
    expect(czasTrwania(2 * 60 + 22).etykieta).toBe('2 godziny 22 minuty');
    expect(czasTrwania(30).etykieta).toBe('30 minut');
  });

  it('EN: symbole jednostek jak w PL, etykieta “1 hour 1 minute”', () => {
    setLang('en');
    expect(czasTrwania(4 * 60).tekst).toBe(spacjeNielamiace('4 h'));
    expect(czasTrwania(61).etykieta).toBe('1 hour 1 minute');
    expect(czasTrwania(35 * 60 + 40).etykieta).toBe('35 hours 40 minutes');
  });
});
