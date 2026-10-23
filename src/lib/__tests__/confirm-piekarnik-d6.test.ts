/**
 * Pytania o piekarnik (M3 D6; BR-KAL-016, RD-34; teksty roli 04 a2 `piekarnik-1-uklad-planu`): „Piekarnik zajęty
 * o {godzina}” z propozycją „Przesuń start” jako przyciskiem domyślnym, druga akcja bez zmiany i „Anuluj”; plan bez
 * kroku nagrzewania (RD-34-W6) — kolizji nie liczy się, pytanie prosi o krok nagrzewania.
 */
import { Alert } from 'react-native';
import { confirmPiekarnikBezNagrzewania, confirmPiekarnikZajety } from '../confirm';
import { setLang } from '../i18n';

type Przycisk = { text: string; style?: string; isPreferred?: boolean; onPress?: () => void };
const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
const ostatni = () => alertSpy.mock.calls[alertSpy.mock.calls.length - 1] as [string, string | undefined, Przycisk[]];

describe('D6: pytania o piekarnik', () => {
  beforeEach(() => {
    setLang('pl');
    alertSpy.mockClear();
  });

  it('BR-KAL-016 Jeden piekarnik: tytuł z godziną, treść z oknem pierwszego i propozycją, „Przesuń start” domyślne', () => {
    const przesun = jest.fn();
    const bez = jest.fn();
    confirmPiekarnikZajety(
      { godzina: '8:30', pierwszy: 'Chleb', od: '8:15', do: '9:45', drugi: 'Pizza', minuty: 75, pieczenie: '10:45', gotowe: '11:00' },
      { przesun, bezZmiany: { tekst: 'Zapisz bez zmiany', onPress: bez } }
    );
    const [tytul, tresc, przyciski] = ostatni();
    expect(tytul).toBe('Piekarnik zajęty o 8:30');
    expect(tresc).toBe('Chleb piecze się od 8:15 do 9:45. Przesuń start: Pizza o 75 min, pieczenie od 10:45, gotowe o 11:00.');
    expect(przyciski.map((b) => b.text)).toEqual(['Przesuń start: Pizza o 75 min', 'Zapisz bez zmiany', 'Anuluj']);
    expect(przyciski[0].isPreferred).toBe(true);
    expect(przyciski.some((b) => b.style === 'destructive')).toBe(false);
    przyciski[0].onPress?.();
    przyciski[1].onPress?.();
    expect(przesun).toHaveBeenCalledTimes(1);
    expect(bez).toHaveBeenCalledTimes(1);
  });

  it('RD-34-W6: plan bez kroku nagrzewania — pytanie prosi o krok nagrzewania, zapis dopiero po decyzji', () => {
    const dalej = jest.fn();
    confirmPiekarnikBezNagrzewania({ tekst: 'Zaplanuj mimo to', onPress: dalej });
    const [tytul, tresc, przyciski] = ostatni();
    expect(tytul).toBe('Nie sprawdzę piekarnika');
    expect(tresc).toBe('Ten plan nie ma kroku nagrzewania, więc nie wiem, od kiedy zajmie piekarnik. Porównaj godziny pieczenia obu wypieków.');
    expect(przyciski.map((b) => b.text)).toEqual(['Anuluj', 'Zaplanuj mimo to']);
    expect(dalej).not.toHaveBeenCalled();
    przyciski[1].onPress?.();
    expect(dalej).toHaveBeenCalledTimes(1);
  });
});
