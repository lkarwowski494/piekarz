// Menu „Więcej” receptury i receptura przekazana do planu wypieku (design-spec §11b „057”, słownik §5)
// [M1-audytor-generalny-057]
import { ActionSheetIOS, Alert, Platform } from 'react-native';
import type { DoughRecipeResult } from '../../core/domain-rules';
import {
  pozycjeMenuReceptury,
  zarejestrujMenuReceptury,
  biezaceMenuReceptury,
  pokazMenuReceptury,
  IdPozycjiMenuReceptury,
  AkcjeMenuReceptury,
} from '../menu-receptury';
import { ustawRecepturePlanu, recepturaPlanu } from '../plan-receptury';

const akcje = (): AkcjeMenuReceptury => ({ kopiuj: jest.fn(), udostepnijPlik: jest.fn(), udostepnijQr: jest.fn(), drukuj: jest.fn() });

describe('pozycjeMenuReceptury', () => {
  it('in 1.0 the menu has exactly Copy as Text and Share Recipe File, in this order', () => {
    const a = akcje();
    const p = pozycjeMenuReceptury(a);
    const ids: IdPozycjiMenuReceptury[] = p.map((x) => x.id);
    expect(ids).toEqual(['copy-recipe-btn', 'export-recipe-json-btn']);
    expect(p.map((x) => x.etykieta)).toEqual(['Kopiuj jako tekst', 'Udostępnij plik receptury']);
    p[0].akcja();
    p[1].akcja();
    expect(a.kopiuj).toHaveBeenCalledTimes(1);
    expect(a.udostepnijPlik).toHaveBeenCalledTimes(1);
  });

  it('QR (F-08) and print (F-50) come back as menu items only when their entry is visible', () => {
    jest.isolateModules(() => {
      jest.doMock('../wejscia-pozniej', () => ({ wejscieWidoczne: () => true }));
      const { pozycjeMenuReceptury: zWejsciami } = require('../menu-receptury') as typeof import('../menu-receptury');
      const a = akcje();
      const p = zWejsciami(a);
      expect(p.map((x) => x.id)).toEqual(['copy-recipe-btn', 'export-recipe-json-btn', 'share-recipe-qr-btn', 'print-menu-btn']);
      p[2].akcja();
      p[3].akcja();
      expect(a.udostepnijQr).toHaveBeenCalledTimes(1);
      expect(a.drukuj).toHaveBeenCalledTimes(1);
    });
  });
});

describe('zarejestrujMenuReceptury / pokazMenuReceptury', () => {
  afterEach(() => jest.restoreAllMocks());

  it('without a recipe screen there are no items and no menu opens', () => {
    const sheet = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => undefined);
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    expect(biezaceMenuReceptury()).toEqual([]);
    pokazMenuReceptury();
    expect(sheet).not.toHaveBeenCalled();
    expect(alert).not.toHaveBeenCalled();
  });

  it('the registered screen provides the items; unregistering an older screen keeps the newer one', () => {
    const a = akcje();
    const b = akcje();
    const pierwszy = zarejestrujMenuReceptury(() => pozycjeMenuReceptury(a));
    const drugi = zarejestrujMenuReceptury(() => pozycjeMenuReceptury(b));
    pierwszy();
    biezaceMenuReceptury()[0].akcja();
    expect(b.kopiuj).toHaveBeenCalledTimes(1);
    expect(a.kopiuj).not.toHaveBeenCalled();
    drugi();
    expect(biezaceMenuReceptury()).toEqual([]);
  });

  it('outside iOS the same items open in an alert with Cancel', () => {
    const os = Platform.OS;
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const a = akcje();
    const wyrejestruj = zarejestrujMenuReceptury(() => pozycjeMenuReceptury(a));
    pokazMenuReceptury();
    const [tytul, , przyciski] = alert.mock.calls[0];
    expect(tytul).toBe('Więcej działań: receptura');
    expect(przyciski!.map((x) => x.text)).toEqual(['Kopiuj jako tekst', 'Udostępnij plik receptury', 'Anuluj']);
    przyciski![1].onPress?.();
    expect(a.udostepnijPlik).toHaveBeenCalledTimes(1);
    wyrejestruj();
    Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
  });
});

describe('ustawRecepturePlanu / recepturaPlanu', () => {
  it('keeps the recipe from "Make a Plan" for the bake plan', () => {
    const r = {
      recipeName: 'Chleb',
      calculatedRecipe: { targetDoughWeightGrams: 900, isHighRye: false } as unknown as DoughRecipeResult,
      recipeFormula: { flours: [{ name: 'Mąka', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 900 },
    };
    ustawRecepturePlanu(r);
    expect(recepturaPlanu()).toBe(r);
  });
});
