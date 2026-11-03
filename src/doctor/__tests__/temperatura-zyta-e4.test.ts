/**
 * Gumowaty miękisz: zalecenie pomiaru temperatury podaje też wartość dla chleba żytniego. Źródło DIA-TEM-001
 * (King Arthur Baking, „Using a thermometer with yeast bread”, odczyt 2026-10-22): „rye bread tends towards excessive
 * moistness, and should be baked to an internal temperature of 205°F to 210°F” — rachunek ok. 96–99 °C. Samo 88 °C
 * („większość bochenków”) prowadziło do niedopieczonego chleba żytniego [audyt-niezalezny E-4].
 */
import { diagnoseBreadDefect } from '../diagnostics';
import { formatTextUnits } from '../../lib/unit-converter';

describe('Doktor Chleba: temperatura wnętrza chleba żytniego (E-4)', () => {
  const wynik = diagnoseBreadDefect({ crumbIsWetGummyToKnife: true } as Parameters<typeof diagnoseBreadDefect>[0]);
  const pomiar = wynik.actionChecklistPl.find((z) => /termometrem/.test(z)) ?? '';

  // M3 T2 (D-123): bez atrybucji w zdaniu (źródło na ekranie „Źródła wiedzy” i w rejestrze); wartości i porządek bez zmian
  it('zdanie o pomiarze podaje dla chleba żytniego 96–99 °C (po wartości dla większości bochenków, ok. 88 °C)', () => {
    expect(wynik.defectCode).toBe('GUMMY_CRUMB');
    expect(pomiar).toMatch(/^Sprawdź termometrem[\s\S]*ok\. 88 °C, a chleb żytni[\s\S]*96–99 °C\.$/);
    expect(pomiar).not.toMatch(/King Arthur/);
  });

  it('w trybie imperialnym zakres przelicza się na °F (ok. 205–210 °F)', () => {
    expect(formatTextUnits(pomiar, 'imperial')).toMatch(/20[45]–210 °F/);
  });
});
