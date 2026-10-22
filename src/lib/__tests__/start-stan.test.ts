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

// Przepisane z kontraktu D-038 [M3 P-a]: stan „tylko historia” (F-67, po próbie bez zakupu) odpadł — Basic działa
// zawsze (D-112), więc stan Startu zależy tylko od trwającego wypieku
describe('stanStartu', () => {
  it('trwający wypiek ma pierwszeństwo', () => {
    expect(stanStartu({ trwaWypiek: true })).toBe('trwa-wypiek');
  });
  it('bez trwającego wypieku: wybór czynności, także bez Pro i z własnymi danymi (dawniej „tylko historia”, F-67)', () => {
    expect(stanStartu({ trwaWypiek: false })).toBe('wybor');
  });
  it('wymiar StanStartu: dwa stany makiety Startu', () => {
    const stany: StanStartu[] = ['wybor', 'trwa-wypiek'];
    const wyniki = new Set<StanStartu>([true, false].map((trwaWypiek) => stanStartu({ trwaWypiek })));
    expect([...wyniki].sort()).toEqual([...stany].sort());
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
