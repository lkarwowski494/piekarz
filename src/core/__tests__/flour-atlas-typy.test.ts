/**
 * M1-audytor-generalny-091 (LB-19): atlas mąk ma polskie typy potwierdzone w rejestrze twierdzeń
 * (MAK-TYP-004, MAK-TYP-005), zdanie o normach (MAK-TYP-001/002) i dopisek przy typie 850 (MAK-TYP-003)
 * równe tekstom z docs/tresci; profile bez źródła parametrów (decyzja właściciela 2026-10-20 D-A)
 * mają flagę szacunku i widoczny dopisek; bez żytniego 1850 i typu 3000 (MAK-TYP-901).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { FLOUR_PROFILES, matchFlourProfile, FlourProfile } from '../flour-atlas';
import { FlourBlendModal } from '../../components/FlourBlendModal';
import { setLang, t } from '../../lib/i18n';

const ROOT = join(__dirname, '..', '..', '..');
const SZACUNEK = 'Szacunek: parametry przyjęte z typu {typ}, bez źródła';

/** Treść sekcji `## <nazwa>` z pliku docs/tresci, bez znacznika [T:ID]. */
function sekcja(plik: string, nazwa: string): string {
  const tekst = readFileSync(join(ROOT, 'docs', 'tresci', plik), 'utf8').replace(/\r\n/g, '\n');
  const trafienie = tekst.split(/^## /m).find((c) => c.split('\n')[0].trim() === nazwa);
  if (!trafienie) throw new Error(`Brak sekcji ${nazwa} w ${plik}`);
  return trafienie.split('\n').slice(1).join(' ').replace(/\s*\[T:[A-Z0-9-,]+\]\s*/g, ' ').trim();
}

/** Typy z listy potwierdzonej w docs/tresci/pl/maki-typy.md: [zboże, numer typu]. */
function typyPotwierdzone(): [FlourProfile['grain'], number][] {
  const lista = sekcja('pl/maki-typy.md', 'typy potwierdzone w obrocie (lista do atlasu; nazwy handlowe z tego samego źródła)');
  return [...lista.matchAll(/Mąka (pszenna|żytnia) typ (\d+)/g)].map((m) => [m[1] === 'pszenna' ? 'wheat' : 'rye', Number(m[2])]);
}

function enDla(pl: string, params?: Record<string, string | number>): string {
  setLang('en');
  try {
    return t(pl, params);
  } finally {
    setLang('pl');
  }
}

function teksty(node: renderer.ReactTestInstance): string {
  return node
    .findAll(() => true)
    .flatMap((n) => n.children.filter((c): c is string => typeof c === 'string'))
    .join(' ');
}

async function render() {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(
      React.createElement(FlourBlendModal, {
        visible: true,
        initialBlend: [{ name: 'Mąka pszenna chlebowa typ 750', percentage: 100, type: 'wheat_750' }],
        onApply: jest.fn(),
        onClose: jest.fn(),
      })
    );
  });
  return tree!;
}

describe('091: polskie typy mąki w atlasie ze źródłem', () => {
  afterEach(() => setLang('pl'));

  it('atlas ma każdy typ z listy potwierdzonej (MAK-TYP-004, MAK-TYP-005)', () => {
    const lista = typyPotwierdzone();
    expect(lista).toHaveLength(12);
    // Manitoba nie jest polskim typem (MAK-TYP-902), choć ma ashTyp 550
    const typy = FLOUR_PROFILES.filter((p) => p.id !== 'wheat_manitoba');
    const brak = lista.filter(([g, typ]) => !typy.some((p) => p.grain === g && p.ashTyp === typ));
    expect(brak).toEqual([]);
  });

  it('bez żytniego 1850 i bez typu 3000 (MAK-TYP-901)', () => {
    expect(FLOUR_PROFILES.some((p) => p.grain === 'rye' && p.ashTyp === 1850)).toBe(false);
    expect(FLOUR_PROFILES.some((p) => p.ashTyp === 3000)).toBe(false);
  });

  it('profile szacunkowe (D-A): flaga = najbliższy typ tego samego zboża, parametry skopiowane z niego', () => {
    const szacunkowe = FLOUR_PROFILES.filter((p) => p.estimatedFromTyp !== undefined).map((p) => p.id).sort();
    expect(szacunkowe).toEqual(['rye_1400', 'rye_500', 'wheat_405', 'wheat_550']);
    for (const id of szacunkowe) {
      const p = FLOUR_PROFILES.find((x) => x.id === id)!;
      const zrodlowe = FLOUR_PROFILES.filter((x) => x.grain === p.grain && x.estimatedFromTyp === undefined && x.id !== 'wheat_manitoba');
      const najblizszy = [...zrodlowe].sort((a, b) => Math.abs(a.ashTyp - p.ashTyp) - Math.abs(b.ashTyp - p.ashTyp))[0];
      expect(p.estimatedFromTyp).toBe(najblizszy.ashTyp);
      expect([p.proteinPercent, p.typicalAbsorptionPercent, p.optimalHydrationRange, p.wStrength]).toEqual([
        najblizszy.proteinPercent,
        najblizszy.typicalAbsorptionPercent,
        najblizszy.optimalHydrationRange,
        najblizszy.wStrength,
      ]);
      // Nazwa profilu prowadzi do tego profilu (obliczenia mieszanki używają jego parametrów)
      expect(matchFlourProfile(p.namePl).id).toBe(p.id);
    }
  });

  it('każdy profil szacunkowy pokazuje dopisek przy profilu w kreatorze mieszanki (PL i EN)', async () => {
    for (const jezyk of ['pl', 'en'] as const) {
      setLang(jezyk);
      const tree = await render();
      // wheat_750 jest już w mieszance, więc nie ma przycisku dodania
      for (const p of FLOUR_PROFILES.filter((x) => x.id !== 'wheat_750')) {
        const chip = tree.root.findByProps({ testID: `add-flour-${p.id}` });
        const oczekiwany = t(SZACUNEK, { typ: String(p.estimatedFromTyp) });
        if (p.estimatedFromTyp !== undefined) expect(teksty(chip)).toContain(oczekiwany);
        else expect(teksty(chip)).not.toContain(jezyk === 'pl' ? 'Szacunek' : 'Estimate');
      }
      act(() => tree.unmount());
    }
    expect(enDla(SZACUNEK, { typ: '450' })).toBe('Estimate: parameters taken from type 450, no source');
  });

  it('zdanie o normach pod nagłówkiem listy mąk = docs/tresci (MAK-TYP-001, MAK-TYP-002), PL i EN', async () => {
    const pl = sekcja('pl/maki-typy.md', 'nagłówek listy mąk (nowy tekst)');
    const en = sekcja('en/maki-typy.md', 'flour list heading (new text)');
    // Klucz t() dosłownie (macierz AST szuka kluczy w testach)
    expect(pl).toBe('Typy mąki pszennej i żytniej określają Polskie Normy PN-A-74022:2003 i PN-A-74032:2002 według zawartości popiołu.');
    expect(enDla(pl)).toBe(en);
    const tree = await render();
    expect(teksty(tree.root)).toContain(pl);
    act(() => tree.unmount());
    setLang('en');
    const treeEn = await render();
    expect(teksty(treeEn.root)).toContain(en);
    act(() => treeEn.unmount());
  });

  it('dopisek przy typie 850 = docs/tresci (MAK-TYP-003), PL i EN, reszta opisu bez zmian', () => {
    const pl = sekcja('pl/maki-typy.md', 'wheat_850.descriptionPl (dopisek na początku opisu)');
    const en = sekcja('en/maki-typy.md', 'wheat_850.descriptionPl (prefix of the description)');
    const p850 = FLOUR_PROFILES.find((p) => p.id === 'wheat_850')!;
    const reszta = 'Ciemniejsza mąka chlebowa o wyższej aktywności enzymatycznej i orzechowym aromacie.';
    expect(p850.descriptionPl).toBe(`${pl} ${reszta}`);
    expect(enDla(p850.descriptionPl)).toBe(`${en} A darker bread flour with higher enzymatic activity and a nutty aroma.`);
  });
});
