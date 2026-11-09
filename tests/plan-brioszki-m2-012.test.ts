/**
 * M2-012 (D-308 pkt 2, D-309; PIE-BRI-002, PIE-BRI-900): plan i prowadzenie brioszki w keksówce mają kroki ze źródła
 * receptury, nie szablon bochenka w koszyku. Test akceptacyjny na wektorze roli 06
 * (docs/tresci/wektory/plan-brioszki-2026-11-09.json): kolejność, kategorie i czasy kroków, brak kroków bochenka;
 * nazwy i instrukcje dosłownie z docs/tresci/pl/plan-brioszki.md (EN: docs/tresci/en/plan-brioszki.md); Q10 nie
 * przelicza brioche_cold, a czas w lodówce (coldRetardHours) i podpowiedź kolizji ze snem działają na brioche_cold;
 * plan (Harmonogram) i prowadzenie (wypiek bez migawki) biorą kroki z jednego miejsca; „Po co ten krok” bez zdań
 * o krokach, których brioszka nie ma (składanie, koszyk, garnek, nacięcie, lodówka przy rośnięciu w cieple).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CATALOG_RECIPES } from '../src/recipes/katalog';
import { calculateReverseSchedule, autoResolveSleepCollision, DEFAULT_STAGE_TEMPLATES, type ScheduleOptions } from '../src/core/reverse-scheduler';
import { stepsFromSchedule, planBakeSteps, type SessionStep } from '../src/core/bake-steps';
import { pieczenieDlaId, pieczenieDlaPlanu } from '../src/lib/pieczenie-planu';
import type { RecepturaPlanu } from '../src/lib/plan-receptury';
import { stepsForBake } from '../src/data/bake-session-store';
import { poCoTenKrok } from '../src/core/po-co-ten-krok';
import { EN } from '../src/lib/i18n.en';
import { BRIOCHE_COLD_STAGE_ID, BRIOCHE_STAGE_IDS, BRIOCHE_STAGE_TEMPLATES, briocheTemplates } from '../src/core/brioche-stages';

const root = path.join(__dirname, '..');
const ID = 'lievito_madre_panettone_brioche';

interface KrokWektora { id: string; kategoria: string; czasMin: number; minCzasMin?: number; maxCzasMin?: number }
const WEKTOR: { kroki: KrokWektora[]; nieobecne: string[] } = JSON.parse(
  fs.readFileSync(path.join(root, 'docs', 'tresci', 'wektory', 'plan-brioszki-2026-11-09.json'), 'utf8'),
);

/** Sekcje pliku treści: id kroku → nazwa i instrukcja (zdania bez znacznika [T:…], złączone spacją). */
function tresc(jezyk: 'pl' | 'en'): Record<string, { name?: string; instructions?: string }> {
  const plik = fs.readFileSync(path.join(root, 'docs', 'tresci', jezyk, 'plan-brioszki.md'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const out: Record<string, { name?: string; instructions?: string }> = {};
  for (const blok of plik.split('\n## ').slice(1)) {
    const [naglowek, ...linie] = blok.split('\n');
    const m = /(?:krok|step) (\w+)\b.*\((namePl|instructionsPl)/.exec(naglowek ?? '');
    if (!m) throw new Error(`nagłówek bez kroku: ${naglowek}`);
    const tekst = linie.filter((l) => l.trim()).map((l) => l.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim()).join(' ');
    out[m[1]!] = { ...out[m[1]!], [m[2] === 'namePl' ? 'name' : 'instructions']: tekst };
  }
  return out;
}
const PL = tresc('pl');
const EN_TRESC = tresc('en');

/** BEZ-SUR-001, BEZ-SUR-002: dwa ostatnie zdania kroku mieszania (wypiek-bezpieczenstwo.md, RD-22-W1). */
const BEZ_SUR_PL = 'Nie próbuj surowego ciasta ani mąki. Po pracy z ciastem umyj ręce mydłem pod bieżącą wodą.';
const BEZ_SUR_EN = 'Do not taste raw dough or flour. After handling dough, wash your hands with soap under running water.';

const CEL = new Date(2026, 10, 12, 10, 0);
const brioszka = CATALOG_RECIPES.find((r) => r.id === ID)!;
const opcje = (o: ScheduleOptions = {}): ScheduleOptions => ({ pieczenie: pieczenieDlaId(ID, false), ...o });
const plan = (o: ScheduleOptions = {}) => stepsFromSchedule(calculateReverseSchedule(CEL, opcje(o)));
/** Krok planu o tym id; brak kroku = asercja (czerwień z właściwego powodu, nie TypeError). */
function krok(kroki: SessionStep[], id: string): SessionStep {
  const s = kroki.find((k) => k.id === id);
  expect({ id, ids: s ? id : kroki.map((k) => k.id) }).toEqual({ id, ids: id });
  return s!;
}

describe('M2-012 (D-309): plan brioszki = wektor roli 06', () => {
  it('brioszka piecze w keksówce na zakwasie (recommendedVessel bread_pan) i ma plan zakwasowy', () => {
    expect(brioszka.recommendedVessel).toBe('bread_pan');
    expect(brioszka.formula.starterPercentage).toBeGreaterThan(0);
  });

  it('kroki planu w kolejności wektora, z kategoriami i czasami wektora', () => {
    expect(plan().map((s) => [s.id, s.category, s.durationMin])).toEqual(WEKTOR.kroki.map((k) => [k.id, k.kategoria, k.czasMin]));
  });

  it('plan brioszki nie ma kroków szablonu bochenka w koszyku', () => {
    const ids = plan().map((s) => s.id);
    for (const id of WEKTOR.nieobecne) expect({ id, jest: ids.includes(id) }).toEqual({ id, jest: false });
  });

  it.each(['brioche_mix', 'brioche_cold', 'brioche_shape', 'brioche_proof'])('%s: nazwa i instrukcja dosłownie z plan-brioszki.md', (id) => {
    const s = krok(plan(), id);
    const oczekiwana = id === 'brioche_mix' ? `${PL[id]!.instructions} ${BEZ_SUR_PL}` : PL[id]!.instructions;
    expect({ name: s.name, instructions: s.instructions }).toEqual({ name: PL[id]!.name, instructions: oczekiwana });
  });

  it.each(['brioche_mix', 'brioche_cold', 'brioche_shape', 'brioche_proof'])('%s: wpis EN dosłownie z en/plan-brioszki.md', (id) => {
    const s = krok(plan(), id);
    const oczekiwana = id === 'brioche_mix' ? `${EN_TRESC[id]!.instructions} ${BEZ_SUR_EN}` : EN_TRESC[id]!.instructions;
    expect({ name: EN[s.name], instructions: EN[s.instructions] }).toEqual({ name: EN_TRESC[id]!.name, instructions: oczekiwana });
  });

  it('starter_feed i cool z szablonu bez zmian; nagrzewanie i pieczenie z danych receptury (D-304)', () => {
    const kroki = plan();
    for (const id of ['starter_feed', 'cool']) {
      const tp = DEFAULT_STAGE_TEMPLATES.find((t) => t.id === id)!;
      expect(krok(kroki, id)).toMatchObject({ name: tp.namePl, instructions: tp.instructionsPl, durationMin: tp.durationMinutes });
    }
    expect(krok(kroki, 'bake_forma').durationMin).toBe(brioszka.bakeTimeSteamMinutes + brioszka.bakeTimeBrowningMinutes);
  });

  it('brioche_cold: zakres czasu 480–1440 min z wektora', () => {
    const w = WEKTOR.kroki.find((k) => k.id === 'brioche_cold')!;
    expect([w.minCzasMin, w.maxCzasMin]).toEqual([480, 1440]);
    expect(krok(plan({ coldRetardHours: 8 }), 'brioche_cold').durationMin).toBe(480);
  });
});

describe('M2-012: lodówka, temperatura i noc w planie brioszki', () => {
  it('temperatura kuchni (Q10) nie przelicza brioche_cold ani innych kroków brioszki', () => {
    for (const t of [16, 20, 28]) expect(plan({ ambientTemperatureC: t }).map((s) => s.durationMin)).toEqual(WEKTOR.kroki.map((k) => k.czasMin));
  });

  it('czas w lodówce (coldRetardHours) ustawia brioche_cold', () => {
    expect(krok(plan({ coldRetardHours: 10 }), 'brioche_cold').durationMin).toBe(600);
    expect(krok(plan({ coldRetardHours: 20 }), 'brioche_cold').durationMin).toBe(1200);
  });

  it('podpowiedź kolizji ze snem zmienia czas brioche_cold i usuwa kolizję', () => {
    // „gotowe” o 22:00: przy 14 h w lodówce wyrabianie (przed lodówką) wypada o 3:52, w oknie snu 23–7
    const cel = new Date(2026, 10, 12, 22, 0);
    const o = opcje({ sleepStartHour: 23, sleepEndHour: 7, coldRetardHours: 14 });
    expect(calculateReverseSchedule(cel, o).hasSleepCollision).toBe(true);
    const r = autoResolveSleepCollision(cel, o);
    expect(r).not.toBeNull();
    expect(r!.adjustedColdRetardHours).not.toBe(14);
    const zimny = krok(stepsFromSchedule(r!.resolvedSchedule), 'brioche_cold');
    expect(zimny.durationMin).toBe(Math.round(r!.adjustedColdRetardHours * 60));
    expect(r!.resolvedSchedule.hasSleepCollision).toBe(false);
  });
});

describe('M2-012: jedno źródło kroków dla planu i prowadzenia', () => {
  it('Harmonogram („Ułóż plan”) dostaje kroki brioszki', () => {
    const r = { recipeId: ID, wersja: 'zakwas', calculatedRecipe: { isHighRye: false } } as unknown as RecepturaPlanu;
    const kroki = stepsFromSchedule(calculateReverseSchedule(CEL, { pieczenie: pieczenieDlaPlanu(r) }));
    expect(kroki.map((s) => s.id)).toEqual(WEKTOR.kroki.map((k) => k.id));
  });

  it('prowadzenie bez migawki planu (start z receptury) ma te same kroki co plan', () => {
    const startAt = new Date(2026, 10, 11, 8, 0).getTime();
    const zPlanu = planBakeSteps({ startAt, isHighRye: false, pieczenie: pieczenieDlaId(ID, false) });
    const zWypieku = stepsForBake({ id: 'b', recipeName: 'Brioszka', recipeId: ID, startedAt: startAt, currentStageId: '' });
    expect(zWypieku).toEqual(zPlanu);
    expect(zWypieku.map((s) => [s.id, s.durationMin])).toEqual(WEKTOR.kroki.map((k) => [k.id, k.czasMin]));
    expect(zWypieku[0]!.plannedStart).toBe(startAt);
  });

  it('receptura w keksówce na zakwasie bez żyta w katalogu to dziś tylko brioszka (wybór kroków po naczyniu, D-309)', () => {
    // Żyto > 50% (ZYT-GRA-001) ma etapy żytnie (rye-stages.ts), nie plan zakwasowy z pieczeniem receptury
    const zytnia = (r: (typeof CATALOG_RECIPES)[number]) =>
      r.formula.flours.filter((f) => f.type?.startsWith('zytnia')).reduce((a, f) => a + f.percentage, 0) > 50;
    const wKeksowce = CATALOG_RECIPES.filter((r) => !zytnia(r) && pieczenieDlaId(r.id, false)?.naczynie === 'bread_pan');
    expect(wKeksowce.map((r) => r.id)).toEqual([ID]);
  });

  it('plan bez receptury i receptura w garnku: szablon bochenka bez zmian', () => {
    const ids = DEFAULT_STAGE_TEMPLATES.map((t) => t.id);
    expect(stepsFromSchedule(calculateReverseSchedule(CEL)).map((s) => s.id)).toEqual(ids);
    expect(stepsFromSchedule(calculateReverseSchedule(CEL, { pieczenie: pieczenieDlaId('country_loaf_72', false) })).map((s) => s.id)).toEqual(ids);
  });
});

describe('M2-012: „Po co ten krok” tylko dla kroków, które plan brioszki ma', () => {
  const zdania = (s: SessionStep) => (poCoTenKrok(s) ?? []).map((z) => z.tekst);
  const NIE_DLA_BRIOSZKI = [/Składanie/, /Koszyk/, /Garnek/, /Nacięcie/, /Chłód lodówki/];

  it.each(WEKTOR.kroki.map((k) => k.id))('%s: bez zdań o składaniu, koszyku, garnku, nacięciu i lodówce przy rośnięciu w cieple', (id) => {
    const s = krok(plan(), id);
    for (const r of NIE_DLA_BRIOSZKI) {
      if (id === 'brioche_cold' && r.source === 'Chłód lodówki') continue;
      expect({ id, zdania: zdania(s).filter((z) => r.test(z)) }).toEqual({ id, zdania: [] });
    }
  });

  it('dokarmienie, wyrabianie, fermentacja, rośnięcie i studzenie zachowują zdania swoich kroków', () => {
    const kroki = plan();
    expect(zdania(krok(kroki, 'starter_feed')).length).toBe(2);
    expect(zdania(krok(kroki, 'brioche_mix'))).toEqual(['Wyrabianie rozwija gluten, dzięki czemu ciasto zatrzymuje gaz z drożdży i rośnie.']);
    expect(zdania(krok(kroki, 'brioche_cold'))[0]).toMatch(/^W czasie fermentacji powstają kwasy/);
    expect(zdania(krok(kroki, 'brioche_proof'))).toEqual(['To ostatnie rośnięcie ciasta przed pieczeniem.']);
    expect(zdania(krok(kroki, 'cool')).length).toBe(2);
  });

  it('plan bochenka w garnku bez zmian (zdania składania, koszyka, garnka i nacięcia zostają)', () => {
    const kroki = stepsFromSchedule(calculateReverseSchedule(CEL, { pieczenie: pieczenieDlaId('country_loaf_72', false) }));
    const wszystkie = kroki.flatMap(zdania).join(' ');
    for (const r of [/Składanie/, /Koszyk/, /Garnek/, /Nacięcie/, /Chłód lodówki/]) expect(wszystkie).toMatch(r);
  });
});

describe('M2-012: szablon brioszki (src/core/brioche-stages.ts)', () => {
  it('BRIOCHE_STAGE_TEMPLATES i BRIOCHE_STAGE_IDS: cztery kroki brioszki wektora; BRIOCHE_COLD_STAGE_ID = krok w lodówce', () => {
    const wlasne = WEKTOR.kroki.filter((k) => k.id.startsWith('brioche_'));
    expect(BRIOCHE_STAGE_TEMPLATES.map((t) => [t.id, t.category, t.durationMinutes])).toEqual(wlasne.map((k) => [k.id, k.kategoria, k.czasMin]));
    expect(BRIOCHE_STAGE_IDS).toEqual(wlasne.map((k) => k.id));
    expect(BRIOCHE_COLD_STAGE_ID).toBe('brioche_cold');
  });

  it('briocheTemplates: dokarmienie, kroki brioszki, nagrzewanie, pieczenie i studzenie z szablonu planu', () => {
    expect(briocheTemplates(DEFAULT_STAGE_TEMPLATES).map((t) => t.category)).toEqual(
      ['starter_feed', 'mix', 'bulk_ferment', 'final_shape', 'final_proof', 'preheat_oven', 'bake', 'cool'],
    );
  });
});
