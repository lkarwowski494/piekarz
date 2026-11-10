/**
 * Wymagania BRD bez okresu próbnego: model D-112 (Basic darmowy na zawsze, Pro bez próby) [M1-audytor-generalny-034;
 * 01-odkrywanie-002]. Trwała kontrola: scenariusze i przepływy BR/PR nie mówią o próbie, chyba że wpis jest wycofany.
 */
import fs from 'fs';
import path from 'path';

const KAT = path.join(__dirname, '..', 'docs', 'brd');
const PLIKI = fs.readdirSync(KAT).filter((f) => /^wymagania.*\.md$/.test(f));
const PROBA = /(?<![\p{L}])(?:prób(?:a|y|ie|ę|ą)|próbn\p{L}*|wypróbować|14 dni próby)(?![\p{L}])/iu;

/** Sekcje „### …” z treścią; sekcja wycofana (Status: wycofane) jest pomijana. */
function sekcje(tekst: string): { naglowek: string; tresc: string }[] {
  return tekst.split(/^(?=### )/m).map((s) => ({ naglowek: s.split('\n')[0], tresc: s }));
}

describe('034: BRD bez okresu próbnego (D-112)', () => {
  it('żadna aktywna sekcja wymagań nie opisuje próby', () => {
    const zle: string[] = [];
    for (const f of PLIKI) {
      for (const s of sekcje(fs.readFileSync(path.join(KAT, f), 'utf8'))) {
        if (/Status:\s*wycofane/i.test(s.tresc)) continue;
        s.tresc.split('\n').forEach((linia, i) => {
          // Dowód potrzeby cytuje recenzje i historię modelu; „opis próby” to test gotowości ciasta (BR-ETAP-003)
          if (/^\s*- Dowód potrzeby/.test(linia) || /opis próby/.test(linia)) return;
          if (PROBA.test(linia) && !/poprzednio|wycofan|bez próby|bez okresu próbnego|ER-74/i.test(linia)) zle.push(`${f} ${s.naglowek} [${i}]: ${linia.trim()}`);
        });
      }
    }
    expect(zle).toEqual([]);
  });
  it('BR-RECP-003: przegląd historii bez Pro pozwala dodać wpis (Dziennik w Basic, D-112, D-116)', () => {
    const t = fs.readFileSync(path.join(KAT, 'wymagania-dziennik.md'), 'utf8');
    expect(t).not.toContain('nie może dodać nowego');
  });
});
