/**
 * M1-audytor-generalny-109 (04-studio-projektowe-035; design-spec §11c „109”): tytuł Ostrzeżenia według rodzaju
 * zagrożenia zamiast stałego „Bezpieczeństwo”. Jedno Ostrzeżenie na krok; tytuł sekcji o najwyższym priorytecie
 * (gorące naczynie 1, zakwas 2, surowe ciasto 3, dzieci 4), z sekcją „nieznany rodzaj” — „Uważaj w kuchni”.
 * Zdania roli 06 bez zmian. VoiceOver: „{tytuł}. {zdania}”. Test dla każdego rodzaju kroku z mapy, w PL i EN.
 */
import React from 'react';
import { readFileSync } from 'fs';
import { join } from 'path';
import renderer, { act } from 'react-test-renderer';
import {
  STEP_KIND_WARNINGS,
  STARTER_WARNINGS,
  RAW_DOUGH_WARNINGS,
  HOT_VESSEL_WARNING,
  CHILDREN_WARNING,
  UNKNOWN_KIND_WARNING,
  stepKindWarnings,
  tytulOstrzezen,
} from '../core/step-warnings';
import { StrefaKroku } from '../components/stolnica/StrefaKroku';
import type { SessionStep } from '../core/bake-steps';
import { EN } from '../lib/i18n.en';
import { setLang, t } from '../lib/i18n';

const ROOT = join(__dirname, '..', '..');

/** Tabela §11c „109”: rodzaj kroku → tytuł PL. */
const TYTUL: Record<string, string> = {
  preheat_oven: 'Gorące naczynie', bake: 'Gorące naczynie', lid_on: 'Gorące naczynie', rye_bake: 'Gorące naczynie',
  cool: 'Gorące naczynie', rye_cool: 'Gorące naczynie',
  starter_feed: 'Surowy zakwas', rye_starter: 'Surowy zakwas',
  autolyse: 'Surowe ciasto i mąka', bulk_ferment: 'Surowe ciasto i mąka', pre_shape: 'Surowe ciasto i mąka',
  final_shape: 'Surowe ciasto i mąka', rye_shape: 'Surowe ciasto i mąka',
};

const EN_TYTULY: Array<[string, string]> = [
  ['Gorące naczynie', 'Hot cookware'],
  ['Surowy zakwas', 'Raw starter'],
  ['Surowe ciasto i mąka', 'Raw dough and flour'],
  ['Dzieci w kuchni', 'Children in the kitchen'],
  ['Uważaj w kuchni', 'Take care in the kitchen'],
];

const NIEPUSTE = Object.keys(STEP_KIND_WARNINGS).filter((k) => STEP_KIND_WARNINGS[k].length > 0);

describe('109: tytuł Ostrzeżenia według rodzaju zagrożenia', () => {
  it('tabela testu obejmuje każdy rodzaj kroku z niepustą listą ostrzeżeń', () => {
    expect(NIEPUSTE.sort()).toEqual(Object.keys(TYTUL).sort());
  });

  it.each(NIEPUSTE)('%s → tytuł według tabeli', (kind) => {
    expect(tytulOstrzezen(stepKindWarnings(kind))).toBe(TYTUL[kind]);
  });

  it('rodzaj bez ostrzeżeń: brak tytułu (i brak pola)', () => {
    expect(tytulOstrzezen([])).toBeNull();
    expect(tytulOstrzezen(stepKindWarnings('mix'))).toBeNull();
  });

  it('nieznany rodzaj: „Uważaj w kuchni”, także w czasie wypieku (razem z gorącym naczyniem)', () => {
    expect(tytulOstrzezen(stepKindWarnings(null))).toBe('Uważaj w kuchni');
    expect(tytulOstrzezen(stepKindWarnings(null, { duringBake: true }))).toBe('Uważaj w kuchni');
  });

  it('priorytet sekcji: gorące naczynie > zakwas > surowe ciasto > dzieci, niezależnie od kolejności', () => {
    expect(tytulOstrzezen([CHILDREN_WARNING, ...RAW_DOUGH_WARNINGS, ...STARTER_WARNINGS, HOT_VESSEL_WARNING])).toBe('Gorące naczynie');
    expect(tytulOstrzezen([CHILDREN_WARNING, ...RAW_DOUGH_WARNINGS, ...STARTER_WARNINGS])).toBe('Surowy zakwas');
    expect(tytulOstrzezen([CHILDREN_WARNING, ...RAW_DOUGH_WARNINGS])).toBe('Surowe ciasto i mąka');
    expect(tytulOstrzezen([CHILDREN_WARNING])).toBe('Dzieci w kuchni');
    expect(tytulOstrzezen([HOT_VESSEL_WARNING, UNKNOWN_KIND_WARNING])).toBe('Uważaj w kuchni');
  });

  it.each(EN_TYTULY)('EN: „%s” → “%s”; brak tytułu ogólnego w słowniku', (pl, en) => {
    expect(EN[pl]).toBe(en);
    expect(Object.prototype.hasOwnProperty.call(EN, 'Bezpieczeństwo')).toBe(false);
  });

  it('render StrefaKroku dla kroku „bake”: jedno Ostrzeżenie (alert), tytuł, oba zdania, etykieta „{tytuł}. {zdania}” w PL i EN', () => {
    const krok: SessionStep = {
      id: 'bake', name: 'bake', category: 'bake', durationMin: 45, isPassive: false, instructions: '', plannedStart: null, plannedEnd: null,
    };
    for (const l of ['pl', 'en'] as const) {
      setLang(l);
      let tree!: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <StrefaKroku step={krok} formattedTime="10:00" unitSystem="metric" dutchOvenPhase="lid_on" isCompleted={false}
            onSwitchPhase={() => undefined} onStartPhase2AfterSteamAlert={() => undefined} ostrzezenia={stepKindWarnings('bake')} />
        );
      });
      const alerty = tree.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'alert');
      expect(alerty).toHaveLength(1);
      const tekst = (id: string) =>
        alerty[0].findAll((x) => typeof x.type === 'string' && x.props.testID === id).map((x) => x.children.join(''));
      const tytul = t('Gorące naczynie');
      const zdania = [t(HOT_VESSEL_WARNING.text), t(CHILDREN_WARNING.text)];
      expect(tekst('step-warning-title')).toEqual([tytul]);
      expect(tekst('step-warning-text')).toEqual(zdania);
      expect(alerty[0].props.accessibilityLabel).toBe(`${tytul}. ${zdania.join(' ')}`);
      act(() => tree.unmount());
    }
    setLang('pl');
    expect(t('Gorące naczynie')).toBe('Gorące naczynie');
  });

  it('„Bezpieczeństwo” nie występuje w strefie kroku ani w mapie ostrzeżeń', () => {
    for (const plik of ['src/components/stolnica/StrefaKroku.tsx', 'src/core/step-warnings.ts']) {
      expect({ plik, ma: readFileSync(join(ROOT, plik), 'utf8').includes('Bezpieczeństwo') }).toEqual({ plik, ma: false });
    }
  });
});
