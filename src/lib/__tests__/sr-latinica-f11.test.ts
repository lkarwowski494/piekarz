/**
 * Serbski w zapisie łacińskim (iOS „Srpski (latinica)”, tag sr-Latn-RS): słownik sr jest cyrylicą, więc
 * użytkownik łacinki dostawał cyrylicę. Przejście cyrylica → łacinka według standardowej odpowiedniości liter
 * serbskiego (1:1, dwuznaki lj, nj, dž) bez nowego przekładu [audyt-niezalezny F-11]. Wpięcie w wybór języka
 * (src/lib/i18n.ts, tor p15a) opisane w raporcie toru p15b.
 */
import { cyrylicaNaLacinke, czySerbskaLacinka } from '../sr-latinica';
import { LADOWANIE_SLOWNIKOW } from '../i18n-slowniki';

describe('sr: cyrylica → łacinka (F-11)', () => {
  it('litery i dwuznaki serbskie', () => {
    expect(cyrylicaNaLacinke('Пекар')).toBe('Pekar');
    expect(cyrylicaNaLacinke('љубав њива џеп ђак ћерка жито чаша шума')).toBe('ljubav njiva džep đak ćerka žito čaša šuma');
    expect(cyrylicaNaLacinke('Љубав Њива Џеп')).toBe('Ljubav Njiva Džep');
    expect(cyrylicaNaLacinke('{n} мин на {temp}')).toBe('{n} min na {temp}');
  });

  it('cały słownik sr po przejściu nie ma cyrylicy, a parametry {…} zostają', () => {
    const sr = LADOWANIE_SLOWNIKOW.sr();
    const zle = Object.entries(sr).filter(([, v]) => /[Ѐ-ӿ]/.test(cyrylicaNaLacinke(v)));
    expect(zle).toEqual([]);
    for (const v of Object.values(sr)) expect(cyrylicaNaLacinke(v).match(/\{[^}]+\}/g) ?? []).toEqual(v.match(/\{[^}]+\}/g) ?? []);
  });

  it('rozpoznaje tag łacinki serbskiej', () => {
    expect(czySerbskaLacinka('sr-Latn-RS')).toBe(true);
    expect(czySerbskaLacinka('sr-Latn')).toBe(true);
    expect(czySerbskaLacinka('sr-Cyrl-RS')).toBe(false);
    expect(czySerbskaLacinka('sr-RS')).toBe(false);
    expect(czySerbskaLacinka('hr-HR')).toBe(false);
  });
});
