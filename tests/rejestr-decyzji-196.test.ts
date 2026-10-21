/**
 * M1-audytor-generalny-196: każdy wpis `### [D-nnn]` w docs/decyzje.md ma najwyżej
 * jedną linię „Zależy od”. Dlaczego: linia doklejona przy scalaniu przypisała D-066
 * fałszywą zależność od parametrów pâte fermentée (D-060).
 */
import * as fs from 'fs';
import * as path from 'path';

const plik = path.join(__dirname, '..', 'docs', 'decyzje.md');

function wpisy(tekst: string): { id: string; tresc: string }[] {
  const czesci = tekst.split(/\n(?=### \[D-\d+\])/);
  return czesci
    .filter((c) => c.startsWith('### [D-'))
    .map((c) => ({ id: c.slice(5, c.indexOf(']')), tresc: c }));
}

describe('rejestr decyzji: jedna zależność na wpis (M1-audytor-generalny-196)', () => {
  const tekst = fs.readFileSync(plik, 'utf8').replace(/\r\n/g, '\n');
  const lista = wpisy(tekst);

  it('rejestr ma wpisy D-nnn', () => {
    expect(lista.length).toBeGreaterThan(10);
  });

  it('każdy wpis ma najwyżej jedną linię „Zależy od”', () => {
    const zle = lista
      .map((w) => ({ id: w.id, ile: (w.tresc.match(/^- \*\*Zależy od:\*\*/gm) ?? []).length }))
      .filter((w) => w.ile > 1);
    expect(zle).toEqual([]);
  });

  it('D-066 nie zależy od parametrów pâte fermentée', () => {
    const d066 = lista.find((w) => w.id === 'D-066');
    expect(d066).toBeDefined();
    expect(d066!.tresc).not.toMatch(/pâte fermentée \(np\. wybór użytkownika\)/);
  });
});
