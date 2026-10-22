/**
 * 14 wektorów dostępu z kontraktu płatności (docs/monetyzacja.md, „Wektory dostępu”; D-112, D-113, D-116) na czystej
 * logice: decyzja o Pro, lista Basic, limity pojemności, uprzedzenie końca Pro i przypomnienia o dokarmianiu.
 * Wektory ekranowe (ekran Pro przy starcie, szósta receptura, drugi zakwas na ekranie) dodatkowo w
 * src/__tests__/basic-pro-pa.test.tsx. `T` = teraz [M3 P-a].
 */
import { decyzja, dozwolona, funkcjaLekcji, mozeDodac, zapisPamieci, type Uprawnienie } from '../platnosci/dostep';
import { BASIC, KLUCZ_PAMIECI, LIMITY_BASIC, ODBLOKOWUJA, PRODUKTY, type Funkcja, type Pojemnosc } from '../platnosci/konfiguracja';
import { liczbaZapisanych } from '../limity-basic';
import { saveRecipe } from '../../data/sqlite-store';
import { KLUCZ_KONCA_PRO, uprzedzenieKoncaPro, wygaslPro } from '../platnosci/uprzedzenie';
import { ustalDostep, pobierzStan, _resetStanu } from '../platnosci/stan';
import { przywrocZakupy } from '../app-access';
import { planFeedingNotifications, zakwasyDoPrzypomnien } from '../../core/notification-feeding';
import type { PlanStarter } from '../../core/notification-plan';
import { getAppSetting, setAppSetting } from '../../data/settings-store';
import { initDatabase, _resetMemStore } from '../../data/sqlite-store';
import { mockIap } from '../../../tests/helpers/platnosci';

const T = new Date(2026, 9, 22, 12, 0).getTime();
const H = 3600_000;
const D = 24 * H;
const PRO: readonly Funkcja[] = [
  'plan-wstecz', 'plany-przyszle', 'dwa-wypieki', 'kalendarz-telefonu', 'miesiac', 'rytm', 'staly-dzien', 'zaczyn', 'lod',
  'przypomnienia-zakwasu', 'proporcje-zakwasu', 'gotowosc-zakwasu', 'budzenie-zakwasu', 'kolejny-zakwas', 'receptury-ponad-limit',
  'porownanie', 'druk', 'qr-wysylanie', 'spizarnia', 'akademia-dalej',
];
const sklep = (uprawnienia: Uprawnienie[]) => ({ zrodlo: 'sklep' as const, uprawnienia });
const u = (produkt: string, wygasa: number | null, o: Partial<Uprawnienie> = {}): Uprawnienie => ({ produkt, wygasa, odebrane: false, ...o });
const gotowy = (id: string): PlanStarter => ({ id, name: id, storageState: 'ROOM_TEMP', lastFedAt: T - H });

describe('wektory dostępu z kontraktu D-112/D-113 (14)', () => {
  beforeEach(async () => {
    _resetMemStore();
    mockIap.reset();
    _resetStanu();
    await initDatabase();
  });

  it('W-01 nowy użytkownik: brak zakupów → Basic w całości; funkcje Pro zamknięte, z Pro otwarte', () => {
    const d = decyzja(sklep([]), null, T, ODBLOKOWUJA);
    expect(d.dostep).toBe(false);
    expect([...BASIC].sort()).toEqual(['akademia', 'dane', 'doktor', 'harmonogram', 'historia', 'import', 'kalkulator', 'receptury', 'stolnica', 'zakwas']);
    for (const f of BASIC) expect({ f, bez: dozwolona(f, false) }).toEqual({ f, bez: true });
    for (const f of PRO) expect({ f, bez: dozwolona(f, false), z: dozwolona(f, true) }).toEqual({ f, bez: false, z: true });
  });

  it('W-02 Pro miesięczne aktywne: sklep monthly, wygasa T+1 → Pro', () => {
    expect(decyzja(sklep([u(PRODUKTY.monthly, T + 1)]), null, T, ODBLOKOWUJA).dostep).toBe(true);
  });

  it('W-03 dożywotni: sklep lifetime → Pro bez końca', () => {
    const d = decyzja(sklep([u(PRODUKTY.lifetime, null)]), null, T, ODBLOKOWUJA);
    expect(d).toEqual({ dostep: true, powod: 'sklep', pamiec: { produkty: [PRODUKTY.lifetime], wygasa: null } });
  });

  it('W-04 szósta receptura bez Pro: przy 5 własnych dodanie zamknięte, przy 4 otwarte; z Pro zawsze', () => {
    expect(LIMITY_BASIC.wlasneReceptury).toBe(5);
    expect(mozeDodac('wlasneReceptury', 5, false)).toBe(false);
    expect(mozeDodac('wlasneReceptury', 4, false)).toBe(true);
    expect(mozeDodac('wlasneReceptury', 5, true)).toBe(true);
    // Zapisane działają w całości: odczyt, edycja i „Piecz ponownie” to funkcje Basic, nie dodanie
    expect([dozwolona('receptury', false), dozwolona('historia', false), dozwolona('kalkulator', false)]).toEqual([true, true, true]);
  });

  it('W-05 drugi zakwas bez Pro: przy 1 zakwasie dodanie zamknięte, pierwszy wolny', () => {
    expect(LIMITY_BASIC.zakwasy).toBe(1);
    expect(mozeDodac('zakwasy', 1, false)).toBe(false);
    expect(mozeDodac('zakwasy', 0, false)).toBe(true);
    expect(mozeDodac('zakwasy', 1, true)).toBe(true);
  });

  it('W-06 import kopii: 8 receptur, 3 zakwasy bez Pro → import działa, kolejne dodanie zamknięte, przypomnienia o dokarmianiu nieaktywne', () => {
    expect(dozwolona('import', false)).toBe(true);
    expect(mozeDodac('wlasneReceptury', 8, false)).toBe(false);
    expect(mozeDodac('zakwasy', 3, false)).toBe(false);
    expect(zakwasyDoPrzypomnien([gotowy('a'), gotowy('b'), gotowy('c')], false)).toEqual([]);
  });

  it('W-07 Pro wygasło: sklep pusto, pamięć yearly T−1 → Basic, przypomnienia o dokarmianiu wyłączone, komunikat wygaśnięcia raz', async () => {
    const pamiec = { produkty: [PRODUKTY.yearly], wygasa: T - 1 };
    const d = decyzja(sklep([]), pamiec, T, ODBLOKOWUJA);
    expect(d).toEqual({ dostep: false, powod: 'brak', pamiec: null });
    expect(wygaslPro(pamiec, d, 'sklep')).toBe(true);
    expect(wygaslPro(null, d, 'sklep')).toBe(false); // po wyczyszczeniu pamięci drugi raz nie
    expect(wygaslPro(pamiec, d, 'blad')).toBe(false); // błąd odczytu to nie wygaśnięcie
    expect(zakwasyDoPrzypomnien([gotowy('a')], false)).toEqual([]);
    // Ścieżka stanu: znacznik komunikatu zapisany raz, pamięć wyczyszczona
    await setAppSetting(KLUCZ_PAMIECI, zapisPamieci(pamiec));
    await ustalDostep(sklep([]), T);
    expect(await getAppSetting(KLUCZ_KONCA_PRO)).toBe('1');
    await setAppSetting(KLUCZ_KONCA_PRO, ''); // komunikat pokazany
    await ustalDostep(sklep([]), T + H);
    expect(await getAppSetting(KLUCZ_KONCA_PRO)).toBe('');
  });

  it('W-08 uprzedzenie: subskrypcja bez odnowienia wygasa T+3 dni → jeden komunikat 3 dni przed; drugi raz nie', () => {
    const upr = [u(PRODUKTY.yearly, T + 3 * D, { odnawia: false })];
    expect(uprzedzenieKoncaPro({ uprawnienia: upr, pokazanoDla: null, teraz: T })).toEqual({ koniec: T + 3 * D });
    expect(uprzedzenieKoncaPro({ uprawnienia: upr, pokazanoDla: T + 3 * D, teraz: T })).toBeNull();
  });

  it('W-09 wypiek z planem Pro trwa w chwili wygaśnięcia → prowadzi się do końca razem z zapisem wyniku (Stolnica i Dziennik w Basic)', () => {
    expect([dozwolona('stolnica', false), dozwolona('historia', false), dozwolona('doktor', false)]).toEqual([true, true, true]);
  });

  it('W-10 zakładanie zakwasu bez Pro, dzień 4 z 7–10 → przypomnienia zakładania działają; po „gotowy” tylko z Pro', () => {
    const zakladany: PlanStarter = { ...gotowy('z'), setupStartedAt: T - 3 * D, lastFedAt: T - 2 * H };
    expect(zakwasyDoPrzypomnien([zakladany, gotowy('g')], false).map((s) => s.id)).toEqual(['z']);
    expect(planFeedingNotifications(zakwasyDoPrzypomnien([zakladany], false), T)).toHaveLength(1);
    const zalozony: PlanStarter = { ...zakladany, setupCompletedAt: T - H };
    expect(zakwasyDoPrzypomnien([zalozony], false)).toEqual([]);
    expect(zakwasyDoPrzypomnien([zalozony], true).map((s) => s.id)).toEqual(['z']);
  });

  it('W-11 brak sieci po zakupie: błąd odczytu, pamięć lifetime → Pro z pamięci', () => {
    const d = decyzja({ zrodlo: 'blad' }, { produkty: [PRODUKTY.lifetime], wygasa: null }, T, ODBLOKOWUJA);
    expect(d).toMatchObject({ dostep: true, powod: 'pamiec' });
  });

  it('W-12 zwrot: lifetime odebrane → Basic, pamięć wyczyszczona, dane zostają (usunięcie danych to nie Pro)', () => {
    const d = decyzja(sklep([u(PRODUKTY.lifetime, null, { odebrane: true })]), { produkty: [PRODUKTY.lifetime], wygasa: null }, T, ODBLOKOWUJA);
    expect(d).toEqual({ dostep: false, powod: 'brak', pamiec: null });
    expect(dozwolona('dane', false)).toBe(true);
  });

  it('W-13 członek rodziny: yearly przez Family Sharing → Pro; odebranie → Basic', () => {
    expect(decyzja(sklep([u(PRODUKTY.yearly, T + 300 * D)]), null, T, ODBLOKOWUJA).dostep).toBe(true);
    expect(decyzja(sklep([u(PRODUKTY.yearly, T + 300 * D, { odebrane: true })]), null, T, ODBLOKOWUJA).dostep).toBe(false);
  });

  it('liczbaZapisanych: własne receptury bez bazowych i zakwasy z bazy w chwili dodawania (W-04, W-05)', async () => {
    const rodzaje: Pojemnosc[] = ['wlasneReceptury', 'zakwasy'];
    expect(await Promise.all(rodzaje.map((r) => liczbaZapisanych(r)))).toEqual([0, 1]); // zakwas pokazowy w pamięci
    for (let n = 1; n <= 5; n++) {
      await saveRecipe({ id: `r${n}`, name: `R${n}`, isBuiltIn: false, createdAt: n, targetDDT: 25,
        formula: { flours: [{ name: 'M', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 900 } });
    }
    expect(await liczbaZapisanych('wlasneReceptury')).toBe(5);
    expect(mozeDodac('wlasneReceptury', (await liczbaZapisanych('wlasneReceptury')) ?? 0, false)).toBe(false);
  });

  it('Akademia (BR-NAUK-001): pierwszy poziom w Basic, dalsze w Pro', () => {
    expect(LIMITY_BASIC.poziomyAkademii).toBe(1);
    expect([1, 2, 6].map((p) => funkcjaLekcji(p))).toEqual(['akademia', 'akademia-dalej', 'akademia-dalej']);
    expect(dozwolona(funkcjaLekcji(1), false)).toBe(true);
    expect(dozwolona(funkcjaLekcji(2), false)).toBe(false);
  });

  it('W-14 przywracanie bez zakupów: sklep pusto → komunikat (false), Basic', async () => {
    mockIap.entitlements = [];
    expect(await przywrocZakupy()).toBe(false);
    expect(mockIap.restoreCalls).toBe(1);
    expect(pobierzStan().decyzja.dostep).toBe(false);
    expect(dozwolona('kalkulator', pobierzStan().decyzja.dostep)).toBe(true);
  });
});
