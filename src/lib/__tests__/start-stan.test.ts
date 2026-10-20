// Start „Co dziś robisz?”: stan ekranu, cele czynności, przekazanie rodzaju receptur i trasy z powiadomień
// [M1-audytor-generalny-101; BR-START-001, F-58, F-67, D-047, D-051 2a]
import {
  CZYNNOSCI_STARTU,
  celCzynnosci,
  odbierzRodzajReceptur,
  stanStartu,
  subskrybujRodzajReceptur,
  ustawRodzajReceptur,
  type CzynnoscStartu,
  type RodzajReceptur,
  type StanStartu,
} from '../start-stan';
import { trasaZPowiadomienia, type TrasaPowiadomienia } from '../../core/notification-plan';

describe('stanStartu', () => {
  it('trwający wypiek ma pierwszeństwo przed wszystkim', () => {
    expect(stanStartu({ trwaWypiek: true, dostep: false, maDane: true })).toBe('trwa-wypiek');
    expect(stanStartu({ trwaWypiek: true, dostep: true, maDane: false })).toBe('trwa-wypiek');
  });
  it('bez uprawnienia z własnymi danymi: tylko historia (F-67)', () => {
    expect(stanStartu({ trwaWypiek: false, dostep: false, maDane: true })).toBe('tylko-historia');
  });
  it('wymiar StanStartu: trzy stany makiety Startu', () => {
    const stany: StanStartu[] = ['wybor', 'trwa-wypiek', 'tylko-historia'];
    const wyniki = new Set<StanStartu>();
    for (const trwaWypiek of [true, false]) for (const dostep of [true, false]) for (const maDane of [true, false]) wyniki.add(stanStartu({ trwaWypiek, dostep, maDane }));
    expect([...wyniki].sort()).toEqual([...stany].sort());
  });
  it('pierwsze uruchomienie (bez danych, bez zakupu) i powrót z dostępem: wybór czynności bez kłódek', () => {
    expect(stanStartu({ trwaWypiek: false, dostep: false, maDane: false })).toBe('wybor');
    expect(stanStartu({ trwaWypiek: false, dostep: true, maDane: true })).toBe('wybor');
  });
});

describe('celCzynnosci', () => {
  it('trzy czynności w kolejności BR-START-001 prowadzą do przepływów bez oferty (D-047)', () => {
    const czynnosci: CzynnoscStartu[] = ['zakladam-zakwas', 'pieke-na-zakwasie', 'pieke-na-drozdzach'];
    expect(CZYNNOSCI_STARTU).toEqual(czynnosci);
    const rodzaje: Array<RodzajReceptur | null> = CZYNNOSCI_STARTU.map((c) => celCzynnosci(c).rodzaj);
    expect(rodzaje).toEqual([null, 'sourdough', 'yeast']);
    expect(celCzynnosci('zakladam-zakwas')).toEqual({ trasa: '/zakwasy', rodzaj: null });
    expect(celCzynnosci('pieke-na-zakwasie')).toEqual({ trasa: '/receptury', rodzaj: 'sourdough' });
    expect(celCzynnosci('pieke-na-drozdzach')).toEqual({ trasa: '/receptury', rodzaj: 'yeast' });
  });
});

describe('przekazanie rodzaju receptur', () => {
  it('bez zamontowanej zakładki rodzaj czeka i jest odbierany raz', () => {
    ustawRodzajReceptur('sourdough');
    expect(odbierzRodzajReceptur()).toBe('sourdough');
    expect(odbierzRodzajReceptur()).toBeNull();
  });
  it('zamontowana zakładka dostaje rodzaj od razu, nic nie czeka', () => {
    const odebrane: string[] = [];
    const off = subskrybujRodzajReceptur((r) => odebrane.push(r));
    ustawRodzajReceptur('yeast');
    off();
    expect(odebrane).toEqual(['yeast']);
    expect(odbierzRodzajReceptur()).toBeNull();
  });
});

describe('trasaZPowiadomienia', () => {
  it('nowe trasy i trasy z powiadomień poprzedniej wersji prowadzą w to samo miejsce', () => {
    const trasy: TrasaPowiadomienia[] = ['/stolnica', '/zakwasy'];
    for (const t of trasy) expect(trasaZPowiadomienia(t)).toBe(t);
    expect(trasaZPowiadomienia('/stolnica')).toBe('/stolnica');
    expect(trasaZPowiadomienia('/(tabs)/stolnica')).toBe('/stolnica');
    expect(trasaZPowiadomienia('/zakwasy')).toBe('/zakwasy');
    expect(trasaZPowiadomienia('/(tabs)/zakwas')).toBe('/zakwasy');
  });
  it('inna wartość z danych powiadomienia → brak nawigacji', () => {
    expect(trasaZPowiadomienia('/(tabs)/doktor')).toBeNull();
    expect(trasaZPowiadomienia(undefined)).toBeNull();
    expect(trasaZPowiadomienia(42)).toBeNull();
  });
});
