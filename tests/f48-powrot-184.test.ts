/**
 * M1-audytor-generalny-184 (M2-koordynator-napraw-103, DEC-24 a): po usunięciu martwego akordeonu
 * (zadanie 149) strata piecowa F-48 nie ma miejsca w interfejsie. Kontrakt zakresu opisuje drogę
 * powrotu (nowe wejście na ekranie receptury przez wpis ZM), a lista kluczy poza przekładem
 * nie wskazuje usuniętych plików. Dlaczego: powrót przez samo `true` w wejscia-pozniej.ts
 * niczego by nie pokazał, a martwe ścieżki mylą przy odsłanianiu funkcji.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..');
const kontrakt = fs.readFileSync(path.join(root, 'docs/scope-contract.md'), 'utf8').replace(/\r\n/g, '\n');
const lista = JSON.parse(fs.readFileSync(path.join(root, 'docs/lokalizacja/pozniej-poza-przekladem.json'), 'utf8')) as {
  pliki: Record<string, string[]>;
};

describe('F-48: droga powrotu i lista poza przekładem (184)', () => {
  it('każda ścieżka w pozniej-poza-przekladem.json istnieje', () => {
    const brak = Object.entries(lista.pliki).flatMap(([f, p]) => p.filter((x) => !fs.existsSync(path.join(root, x))).map((x) => `${f}: ${x}`));
    expect(brak).toEqual([]);
  });

  it('wiersz F-48 opisuje powrót przez nowe wejście na ekranie receptury i wpis ZM (DEC-24 a)', () => {
    const wiersz = kontrakt.split('\n').find((l) => l.startsWith('| F-48 strata piecowa |')) ?? '';
    expect(wiersz).not.toBe('');
    const powrot = wiersz.split('|').slice(-2)[0];
    expect(powrot).toMatch(/ekran(ie)? receptury/);
    expect(powrot).toMatch(/ZM/);
    expect(powrot).toMatch(/DEC-24 a/);
  });
});
