/**
 * 091: nazwy profili atlasu mąk w PL (mapa typów) mówią tylko to, co potwierdza rejestr: numer typu z twierdzenia
 * o mące w obrocie (MAK-TYP-004/005/006/007) i nazwa handlowa z twierdzenia (MAK-NAZ-001 — Stolarska i in. 2010,
 * MAK-TYP-004 — Szafrańska 2018); bez „Poznańska”, bez „chlebowa” przy żytniej 720 (MAK-TYP-903 otwarte) i bez typu
 * 630 orkiszowej (MAK-TYP-902 otwarte); nazwa PL każdego profilu ma wpis EN [M1-audytor-generalny-091].
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { FLOUR_PROFILES, matchFlourProfile } from '../flour-atlas';
import { EN } from '../../lib/i18n.en';
import { linie } from './helpers/tresci';

const ROOT = join(__dirname, '..', '..', '..');
const rejestr: { id: string; status: string; twierdzenie: string }[] = JSON.parse(readFileSync(join(ROOT, 'docs/tresci/rejestr.json'), 'utf8'));
const potwierdzone = (id: string) => rejestr.find((r) => r.id === id)?.status === 'potwierdzone';

/** Typy w obrocie: zboże + numer → ID twierdzenia. */
const TYPY: Record<string, string> = {
  'pszenna 405': 'MAK-TYP-004', 'pszenna 450': 'MAK-TYP-004', 'pszenna 500': 'MAK-TYP-004', 'pszenna 550': 'MAK-TYP-004',
  'pszenna 650': 'MAK-TYP-004', 'pszenna 750': 'MAK-TYP-004', 'pszenna 850': 'MAK-TYP-004', 'pszenna 1050': 'MAK-TYP-006',
  'pszenna 1850': 'MAK-TYP-004', 'pszenna 2000': 'MAK-OGL-007', 'żytnia 500': 'MAK-TYP-004', 'żytnia 720': 'MAK-TYP-004',
  'żytnia 1400': 'MAK-TYP-005', 'żytnia 2000': 'MAK-TYP-004', 'orkiszowa 2000': 'MAK-TYP-007',
};

/** Nazwy handlowe w atlasie PL z docs/tresci/pl/maki-typy.md (sekcja z MAK-NAZ-001) i listy MAK-TYP-004. */
function nazwyHandlowe(): Map<string, string> {
  const m = new Map<string, string>();
  const plik = readFileSync(join(ROOT, 'docs/tresci/pl/maki-typy.md'), 'utf8').replace(/\r\n/g, '\n');
  for (const [, typ, nazwy, ids] of plik.matchAll(/^- Mąka pszenna typ (\d+) \(([^)]+)\) \[T:([^\]]+)\]$/gm)) {
    for (const n of nazwy.split(',').map((s) => s.trim().toLowerCase())) m.set(`${n} ${typ}`, ids);
  }
  return m;
}

describe('091: nazwy atlasu PL z rejestru twierdzeń', () => {
  it('każdy numer typu w nazwie PL ma potwierdzone twierdzenie o mące w obrocie', () => {
    const zle: string[] = [];
    for (const p of FLOUR_PROFILES) {
      const m = p.namePl.match(/^Mąka (pszenna|żytnia|orkiszowa)(?: [a-ząćęłńóśźż]+)? typ (\d+)/);
      if (!/\d/.test(p.namePl)) continue;
      const id = m && TYPY[`${m[1]} ${m[2]}`];
      if (!id || !potwierdzone(id)) zle.push(p.namePl);
    }
    expect(zle).toEqual([]);
  });

  it('każda nazwa handlowa (nawias, „chlebowa”) ma potwierdzone twierdzenie dla tego typu', () => {
    const handlowe = nazwyHandlowe();
    const zle: string[] = [];
    for (const p of FLOUR_PROFILES) {
      const typ = p.namePl.match(/typ (\d+)/)?.[1];
      const slowa = [...(p.namePl.match(/\(([^)]+)\)/)?.[1].split('/').map((s) => s.trim().toLowerCase()) ?? [])];
      if (/chlebowa/.test(p.namePl)) slowa.push('chlebowa');
      for (const s of slowa) {
        const ids = handlowe.get(`${s} ${typ}`);
        if (!ids || !ids.split(',').every((id) => potwierdzone(id.trim()))) zle.push(`${p.id}: ${s}`);
      }
    }
    expect(zle).toEqual([]);
  });

  it('bez dopisków z otwartych twierdzeń: Poznańska, żytnia „chlebowa” 720, orkiszowa typ 630', () => {
    const nazwa = (id: string) => FLOUR_PROFILES.find((p) => p.id === id)!.namePl;
    expect(nazwa('wheat_500')).not.toMatch(/Pozna/);
    expect(nazwa('rye_720')).not.toMatch(/chlebow/);
    expect(nazwa('spelt_630')).not.toMatch(/630/);
  });

  it('MAK-NAZ-001 = zdanie z docs/tresci, nazwy PL mają wpis EN, dopasowanie zapisanych nazw bez zmian', () => {
    expect(potwierdzone('MAK-NAZ-001')).toBe(true);
    expect(linie('pl/maki-typy.md', 'nazwy handlowe w atlasie PL').length).toBeGreaterThan(0);
    for (const p of FLOUR_PROFILES) expect(typeof EN[p.namePl]).toBe('string');
    expect(matchFlourProfile('Mąka żytnia chlebowa typ 720').id).toBe('rye_720');
    expect(matchFlourProfile('Mąka orkiszowa jasna typ 630').id).toBe('spelt_630');
    expect(matchFlourProfile('Mąka pszenna typ 500 (Wrocławska / Poznańska)').id).toBe('wheat_500');
  });
});
