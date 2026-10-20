/**
 * M1-audytor-generalny-104: czyste funkcje karty zakwasu i opisu wpisu (src/lib/zakwas-widok.ts), stany brzegowe
 * komponentów karty i stanu z lodówki oraz teksty PL/EN ekranów zakwasu (design-spec §5, makieta zakwas.html).
 */
import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { setLang } from '../i18n';
import { EN } from '../i18n.en';
import { formatTime } from '../format';
import { STARTER_SIGNS } from '../../core/starter-log';
import type { StoredStarterEntry } from '../../data/db';
import { NAZWY_OBJAWOW, dzienWpisu, opisWpisu, stanKartyZakwasu, wZakladaniu, zmienGodzine } from '../zakwas-widok';
import { StarterCycleCard } from '../../components/zakwas/StarterCycleCard';
import { FridgeWakeStatus } from '../../components/zakwas/FridgeWakeStatus';

const H = 3600_000;
const dzis9 = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0).getTime();
};
const wpis = (kind: StoredStarterEntry['kind'], at: number, extra: Partial<StoredStarterEntry> = {}): StoredStarterEntry => ({
  id: `${kind}-${at}`, starterId: 's', kind, occurredAt: at, signs: [], createdAt: at, updatedAt: at, ...extra,
});
const tekst = (t: renderer.ReactTestRenderer) => t.root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');

describe('zakwas-widok (104)', () => {
  afterEach(() => setLang('pl'));

  it('wZakladaniu: start bez końca zakładania', () => {
    expect(wZakladaniu({ setupStartedAt: 1 })).toBe(true);
    expect(wZakladaniu({ setupStartedAt: 1, setupCompletedAt: 2 })).toBe(false);
    expect(wZakladaniu({})).toBe(false);
  });

  it('stanKartyZakwasu: brak dokarmienia zostaje brakiem; odstęp 24 h w dniach 1–2, potem 12 h; postęp i „gotowy” ≤ 8 h', () => {
    const now = dzis9() + 6 * H;
    expect(stanKartyZakwasu({}, [], now)).toEqual({ dokarmionoAt: null, mineloMin: null, odstepMin: 720, nastepneAt: null, postep: 0, gotowy: false, dzien: null });
    const fed = now - 6 * H;
    const dojrzaly = stanKartyZakwasu({}, [wpis('feeding', fed)], now);
    expect(dojrzaly).toEqual({ dokarmionoAt: fed, mineloMin: 360, odstepMin: 720, nastepneAt: fed + 12 * H, postep: 0.5, gotowy: false, dzien: null });
    expect(stanKartyZakwasu({ setupStartedAt: now - H }, [wpis('feeding', fed)], now)).toEqual(expect.objectContaining({ dzien: 1, odstepMin: 1440, postep: 0.25 }));
    expect(stanKartyZakwasu({ setupStartedAt: now - 2 * 24 * H }, [wpis('feeding', fed)], now)).toEqual(expect.objectContaining({ dzien: 3, odstepMin: 720 }));
    const gotowy = stanKartyZakwasu({}, [wpis('feeding', fed), wpis('observation', fed + 5 * H, { signs: ['doubled'] })], now);
    expect(gotowy.gotowy).toBe(true);
    expect(stanKartyZakwasu({}, [wpis('feeding', now - 20 * H)], now).postep).toBe(1);
  });

  it('dzienWpisu i opisWpisu: dziś, wczoraj, data; dokarmienie z proporcją i bez, obserwacja z nazwami objawów', () => {
    const now = dzis9();
    expect(dzienWpisu(now - H, now)).toBe('Dziś');
    expect(dzienWpisu(now - 24 * H, now)).toBe('Wczoraj');
    expect(dzienWpisu(now - 3 * 24 * H, now)).not.toMatch(/Dziś|Wczoraj/);
    const at = now - 24 * H;
    expect(opisWpisu(wpis('feeding', at, { feedRatio: '1:2:2' }), now)).toBe(`Wczoraj ${formatTime(at)}: Dokarmienie 1:2:2`);
    expect(opisWpisu(wpis('feeding', now), now)).toBe(`Dziś ${formatTime(now)}: Dokarmienie`);
    expect(opisWpisu(wpis('observation', now, { signs: ['bubbles', 'rose'] }), now)).toBe(`Dziś ${formatTime(now)}: Obserwacja: Bąbelki, Urósł od kreski`);
    setLang('en');
    expect(opisWpisu(wpis('observation', now, { signs: ['doubled'] }), now)).toBe(`Today ${formatTime(now)}: Observation: Doubled in volume`);
  });

  it('zmienGodzine: ten sam dzień, nowa godzina; wartość spoza zakresu → null', () => {
    const at = dzis9() + 9 * H; // 18:00
    expect(new Date(zmienGodzine(at, 8, 0)!).getHours()).toBe(8);
    expect(zmienGodzine(at, 8, 0)).toBe(at - 10 * H);
    expect(zmienGodzine(at, 24, 0)).toBeNull();
    expect(zmienGodzine(at, 8, 60)).toBeNull();
    expect(zmienGodzine(at, 7.5, 0)).toBeNull();
  });

  it('NAZWY_OBJAWOW: każdy kod obserwacji ma nazwę z makiety zakwas.html', () => {
    expect(Object.keys(NAZWY_OBJAWOW).sort()).toEqual([...STARTER_SIGNS].sort());
    expect(NAZWY_OBJAWOW).toEqual({
      bubbles: 'Bąbelki',
      rose: 'Urósł od kreski',
      doubled: 'Podwoił objętość',
      no_activity: 'Nic się nie dzieje',
      mold_signs: 'Kolorowe plamy albo puszysty nalot',
    });
  });

  it('karta bez wpisu dokarmienia: co zrobić zamiast liczb; „Podwoił objętość” nieaktywne', async () => {
    let t!: renderer.ReactTestRenderer;
    await act(async () => {
      t = renderer.create(
        <StarterCycleCard stan={stanKartyZakwasu({}, [], Date.now())} opisMiejsca="w lodówce" onPodwoil={jest.fn()} onDokarm={jest.fn()} onNiepokoi={jest.fn()} />
      );
    });
    expect(tekst(t)).toContain('Nie ma jeszcze wpisu dokarmienia. Zapisz dokarmienie, gdy dokarmisz zakwas.');
    expect(t.root.findAll((n) => n.props?.testID === 'zakwas-podwoil-btn' && n.props.disabled === true).length).toBeGreaterThan(0);
    act(() => t.unmount());
  });

  it('stan z lodówki: czekamy do 8 h po dokarmieniu; gotowy i brak dokarmienia bez pola', async () => {
    const until = dzis9() + 8 * H;
    let t!: renderer.ReactTestRenderer;
    await act(async () => {
      t = renderer.create(<FridgeWakeStatus wynik={{ kind: 'waiting', checkUntil: until }} now={dzis9()} />);
    });
    expect(tekst(t)).toBe(`Sprawdź, czy podwoi objętość do ${formatTime(until)}.`);
    await act(async () => {
      t.update(<FridgeWakeStatus wynik={{ kind: 'ready' }} now={dzis9()} />);
    });
    expect(t.toJSON()).toBeNull();
    act(() => t.unmount());
  });

  it('teksty ekranów zakwasu: PL klucz → EN (słownik §5, makieta teksty.js zk.*, nowe teksty §8)', () => {
    const PARY: [string, string][] = [
      ['Podwoił objętość', 'Doubled in volume'],
      ['Coś mnie niepokoi', 'Something Looks Off'],
      ['Przywróć', 'Restore'],
      ['Ostatnie wpisy', 'Recent Entries'],
      ['Co dziś zrobić', 'What to do today'],
      ['Co widzisz?', 'What do you see?'],
      ['Zostaw zapis i wróć', 'Keep Entry and Go Back'],
      ['Dzień {n}', 'Day {n}'],
      ['Zapisz dzień {n}', 'Save Day {n}'],
      ['dokarmiony o {godzina}, następne o {nastepne}', 'fed at {godzina}, next at {nastepne}'],
      ['{czas} od dokarmienia', '{czas} since feeding'],
      ['Nie ma jeszcze wpisu dokarmienia. Zapisz dokarmienie, gdy dokarmisz zakwas.', 'No feeding logged yet. Log Feeding when you feed the starter.'],
      ['Edytuj wpis', 'Edit Entry'],
      ['Edytuj wpis: {opis}', 'Edit entry: {opis}'],
      ['Usuń wpis: {opis}', 'Delete entry: {opis}'],
      ['Usunięto wpis', 'Entry deleted'],
      ['Godzina', 'Hour'],
      ['Minuta', 'Minute'],
      ['Sprawdź, czy podwoi objętość do {godzina}.', 'Check whether it doubles by {godzina}.'],
      ['Proponowane mieszanie ciasta: {dzien} o {godzina}.', 'Suggested time to mix the dough: {dzien} at {godzina}.'],
      ['Doktor zakwasu', 'Starter Doctor'],
      ['Godzina od 0 do 23, minuty od 0 do 59.', 'Hour from 0 to 23, minutes from 0 to 59.'],
      ['Dzień {n} zakładania zakwasu', 'Day {n} of making the starter'],
      ['Następne dokarmienie: {dzien} o {godzina}.', 'Next feeding: {dzien} at {godzina}.'],
      ['w lodówce, {proporcja}', 'in the fridge, {proporcja}'],
      ['na blacie, {proporcja}', 'on the counter, {proporcja}'],
    ];
    for (const [pl, en] of PARY) expect([pl, EN[pl]]).toEqual([pl, en]);
  });
});
