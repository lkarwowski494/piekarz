// Etykieta VoiceOver spirali według design-spec §2 i §11b (058), PL i EN [M1-audytor-generalny-058]
import { setLang } from '../i18n';
import {
  czasSlownie,
  dzienSlownie,
  etykietaPlanuWypieku,
  etykietaPlanuPrzedStartem,
  etykietaZakwasu,
} from '../spirala-etykieta';

const TERAZ = new Date(2026, 9, 20, 10, 57);
const JUTRO_935 = new Date(2026, 9, 21, 9, 35);

afterEach(() => setLang('pl'));

describe('czasSlownie i dzienSlownie', () => {
  it('PL: godziny i minuty słownie z liczbą mnogą', () => {
    setLang('pl');
    expect([1, 2, 5, 18, 22].map(czasSlownie)).toEqual(['1 minuta', '2 minuty', '5 minut', '18 minut', '22 minuty']);
    expect(czasSlownie(60)).toBe('1 godzina');
    expect(czasSlownie(120)).toBe('2 godziny');
    expect(czasSlownie(80)).toBe('1 godzina 20 minut');
    expect(czasSlownie(380)).toBe('6 godzin 20 minut');
    expect(czasSlownie(0)).toBe('0 minut');
  });

  it('EN: hours and minutes', () => {
    setLang('en');
    expect(czasSlownie(1)).toBe('1 minute');
    expect(czasSlownie(18)).toBe('18 minutes');
    expect(czasSlownie(80)).toBe('1 hour 20 minutes');
    expect(czasSlownie(720)).toBe('12 hours');
  });

  it('dzień: dziś, jutro, pojutrze, dalej data', () => {
    setLang('pl');
    expect(dzienSlownie(new Date(2026, 9, 20, 23, 0), TERAZ)).toBe('dziś');
    expect(dzienSlownie(JUTRO_935, TERAZ)).toBe('jutro');
    expect(dzienSlownie(new Date(2026, 9, 22, 1, 0), TERAZ)).toBe('pojutrze');
    expect(dzienSlownie(new Date(2026, 9, 24, 8, 0), TERAZ)).toBe('24.10');
    setLang('en');
    expect(dzienSlownie(JUTRO_935, TERAZ)).toBe('tomorrow');
    expect(dzienSlownie(new Date(2026, 9, 20, 12, 0), TERAZ)).toBe('today');
  });
});

describe('etykieta planu wypieku (prowadzenie, Dziś)', () => {
  const dane = { krok: 4, liczbaKrokow: 13, nazwa: 'Składanie 2 z 4', pozostaloMin: 18, gotowe: JUTRO_935, teraz: TERAZ };

  it('PL według wzoru z tabeli §11b', () => {
    setLang('pl');
    expect(etykietaPlanuWypieku(dane)).toBe('Plan wypieku, krok 4 z 13: Składanie 2 z 4, zostało 18 minut. Gotowe jutro o 09:35.');
  });

  it('EN według wzoru z tabeli §11b', () => {
    setLang('en');
    expect(etykietaPlanuWypieku({ ...dane, nazwa: 'Fold 2 of 4' })).toBe(
      'Bake plan, step 4 of 13: Fold 2 of 4, 18 minutes left. Ready tomorrow at 09:35 AM.',
    );
  });

  it('brak czasu kroku albo godziny „gotowe” zostaje brakiem (bez zgadywania)', () => {
    setLang('pl');
    expect(etykietaPlanuWypieku({ ...dane, pozostaloMin: null })).toBe('Plan wypieku, krok 4 z 13: Składanie 2 z 4. Gotowe jutro o 09:35.');
    expect(etykietaPlanuWypieku({ ...dane, gotowe: null })).toBe('Plan wypieku, krok 4 z 13: Składanie 2 z 4, zostało 18 minut.');
    setLang('en');
    expect(etykietaPlanuWypieku({ ...dane, nazwa: 'Mix', pozostaloMin: null, gotowe: null })).toBe('Bake plan, step 4 of 13: Mix.');
  });
});

describe('etykieta planu przed startem i karty zakwasu', () => {
  it('PL: liczba kroków z liczbą mnogą', () => {
    setLang('pl');
    expect(etykietaPlanuPrzedStartem({ liczbaKrokow: 13, gotowe: JUTRO_935, teraz: TERAZ })).toBe('Plan wypieku: 13 kroków. Gotowe jutro o 09:35.');
    expect(etykietaPlanuPrzedStartem({ liczbaKrokow: 2, gotowe: null, teraz: TERAZ })).toBe('Plan wypieku: 2 kroki.');
    expect(etykietaPlanuPrzedStartem({ liczbaKrokow: 1, gotowe: null, teraz: TERAZ })).toBe('Plan wypieku: 1 krok.');
  });

  it('EN', () => {
    setLang('en');
    expect(etykietaPlanuPrzedStartem({ liczbaKrokow: 13, gotowe: JUTRO_935, teraz: TERAZ })).toBe('Bake plan: 13 steps. Ready tomorrow at 09:35 AM.');
    expect(etykietaPlanuPrzedStartem({ liczbaKrokow: 1, gotowe: null, teraz: TERAZ })).toBe('Bake plan: 1 step.');
  });

  it('zakwas: czas od dokarmienia z odstępu (OP-38: 12 h)', () => {
    setLang('pl');
    expect(etykietaZakwasu({ mineloMin: 380, odstepMin: 720 })).toBe('Od dokarmienia minęło 6 godzin 20 minut z 12 godzin.');
    setLang('en');
    expect(etykietaZakwasu({ mineloMin: 380, odstepMin: 720 })).toBe('6 hours 20 minutes of 12 hours since feeding.');
  });
});
