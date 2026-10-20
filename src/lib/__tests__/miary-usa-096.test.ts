/**
 * M1-audytor-generalny-096 (DEC-06 b, D-044, F-38; design-spec §7): miary USA.
 * Jeden wybór „gramy, °C” / „uncje, °F”, domyślnie według regionu urządzenia (US → imperialne), baza metryczna.
 * Masa: ≥ 16 oz → „1 lb 14.0 oz”, 1–16 oz jedno miejsce, < 1 oz dwa miejsca; temperatura: °F całkowite.
 */
import {
  domyslnyUkladJednostek,
  formatWeight,
  formatDoseWeight,
  formatTemperature,
  formatTextUnits,
  initUnitSystem,
  getUnitSystem,
  setUnitSystem,
  _resetUnitSystemForTests,
  temperaturaZPola,
  krokTemperatury,
} from '../unit-converter';
import { setLang, t, ustawPrzeliczanieTekstu } from '../i18n';
import { _resetMemStore, setAppSetting, getAppSetting } from '../../data/sqlite-store';

const mockLocales = jest.fn(() => [{ languageTag: 'pl-PL', languageCode: 'pl', regionCode: 'PL', measurementSystem: 'metric' }]);
jest.mock('expo-localization', () => ({ getLocales: () => mockLocales() }));

describe('096: domyślny układ jednostek według regionu (D-044)', () => {
  it.each([
    ['US', 'us', 'imperial'],
    ['PL', 'metric', 'metric'],
    ['DE', 'metric', 'metric'],
    // GB: measurementSystem „uk” (mile i pinty), w kuchni gramy i °C → metryczne
    ['GB', 'uk', 'metric'],
    // LR i MM: system podaje „us” (iOS Locale.measurementSystem) → imperialne jak w USA
    ['LR', 'us', 'imperial'],
    ['MM', 'us', 'imperial'],
  ] as const)('region %s (measurementSystem %s) → %s', (regionCode, measurementSystem, wynik) => {
    expect(domyslnyUkladJednostek({ regionCode, measurementSystem })).toBe(wynik);
  });

  it('bez measurementSystem (web): region US → imperialne, inny albo brak → metryczne', () => {
    expect(domyslnyUkladJednostek({ regionCode: 'US', measurementSystem: null })).toBe('imperial');
    expect(domyslnyUkladJednostek({ regionCode: 'FR', measurementSystem: null })).toBe('metric');
    expect(domyslnyUkladJednostek(undefined)).toBe('metric');
  });

  beforeEach(() => {
    _resetUnitSystemForTests();
    _resetMemStore();
  });

  it('bez zapisanego wyboru: urządzenie z USA → imperialne, bez zapisu w bazie', async () => {
    mockLocales.mockReturnValueOnce([{ languageTag: 'en-US', languageCode: 'en', regionCode: 'US', measurementSystem: 'us' }]);
    expect(await initUnitSystem()).toBe('imperial');
    expect(getUnitSystem()).toBe('imperial');
    expect(await getAppSetting('unit_system')).toBeUndefined();
  });

  it('zapisany wybór „metric” na urządzeniu z USA zostaje (nie nadpisujemy wyboru)', async () => {
    await setAppSetting('unit_system', 'metric');
    mockLocales.mockReturnValueOnce([{ languageTag: 'en-US', languageCode: 'en', regionCode: 'US', measurementSystem: 'us' }]);
    expect(await initUnitSystem()).toBe('metric');
  });

  it('zmiana w ustawieniach zapisuje wybór', async () => {
    setUnitSystem('imperial');
    await Promise.resolve();
    expect(await getAppSetting('unit_system')).toBe('imperial');
  });
});

describe('096: formaty §7', () => {
  afterEach(() => setLang('pl'));

  it.each([
    [17, '0.60 oz'],
    [1, '0.04 oz'],
    [850, '1 lb 14.0 oz'],
    [100, '3.5 oz'],
    [454, '1 lb 0.0 oz'],
    [1000, '2 lb 3.3 oz'],
  ])('en: %s g → %s', (g, oz) => {
    setLang('en');
    expect(formatWeight(g, 'imperial')).toBe(oz);
    expect(formatDoseWeight(g, 'imperial')).toBe(oz);
  });

  it('pl: przecinek dziesiętny (1 lb 14,0 oz, 0,60 oz)', () => {
    setLang('pl');
    expect(formatWeight(850, 'imperial')).toBe('1 lb 14,0 oz');
    expect(formatDoseWeight(17, 'imperial')).toBe('0,60 oz');
  });

  it('20/26 °C → 68/79 °F, chipy 20, 22, 24, 26 °C → 68, 72, 75, 79 °F; woda 45 °C → 113 °F', () => {
    expect([20, 22, 24, 26].map((c) => formatTemperature(c, 'imperial'))).toEqual(['68°F', '72°F', '75°F', '79°F']);
    expect(formatTemperature(45, 'imperial')).toBe('113°F');
  });

  it('tekst: liczby z °C i g przeliczone, zakres 20–26 °C = 68–79 °F, różnica 10 °C = 18 °F', () => {
    setLang('pl');
    expect(formatTextUnits('W lodówce (4°C)', 'imperial')).toBe('W lodówce (39°F)');
    expect(formatTextUnits('ważne w 20–26 °C', 'imperial')).toBe('ważne w 68–79 °F');
    expect(formatTextUnits('10 °C niżej to około 3 razy dłużej', 'imperial')).toBe('18 °F niżej to około 3 razy dłużej');
    expect(formatTextUnits('Zaczyn (170 g)', 'imperial')).toBe('Zaczyn (6,0 oz)');
    expect(formatTextUnits('sól 17g, mąka 1,5 kg', 'imperial')).toBe('sól 0,60 oz, mąka 3 lb 4,9 oz');
    expect(formatTextUnits('po 5 godzinach, 2 głębokie misy', 'imperial')).toBe('po 5 godzinach, 2 głębokie misy');
    expect(formatTextUnits('W lodówce (4°C)', 'metric')).toBe('W lodówce (4°C)');
  });

  it('t(): w trybie imperialnym tekst przez t() ma °F i oz (komunikaty, powiadomienia, eksport)', () => {
    setLang('en');
    _resetUnitSystemForTests();
    setUnitSystem('imperial');
    expect(t('W lodówce (4°C)')).toBe('In fridge (39°F)');
    expect(t('Pozostała mąka: {g} g', { g: 850 })).not.toMatch(/\d\s?g\b|°C/);
    setUnitSystem('metric');
    expect(t('W lodówce (4°C)')).toBe('In fridge (4°C)');
  });

  it('ustawPrzeliczanieTekstu: bez przelicznika t() zwraca tekst bez zmian; przelicznik działa po parametrach', () => {
    setLang('pl');
    _resetUnitSystemForTests();
    setUnitSystem('imperial');
    ustawPrzeliczanieTekstu(null);
    expect(t('Zaczyn ({g} g)', { g: 170 })).toBe('Zaczyn (170 g)');
    ustawPrzeliczanieTekstu((s) => formatTextUnits(s));
    expect(t('Zaczyn ({g} g)', { g: 170 })).toBe('Zaczyn (6,0 oz)');
    setUnitSystem('metric');
  });
});

describe('096: wejście w °F zapisuje °C', () => {
  it('temperaturaZPola: 77 °F → 25 °C, metrycznie bez zmian', () => {
    expect(temperaturaZPola(77, 'imperial')).toBe(25);
    expect(temperaturaZPola(25, 'metric')).toBe(25);
  });

  it('krokTemperatury: imperialnie o 1 °F (wynik w °C), metrycznie o 0,5 °C', () => {
    expect(formatTemperature(krokTemperatury(25, 1, 'imperial'), 'imperial')).toBe('78°F');
    expect(formatTemperature(krokTemperatury(25, -1, 'imperial'), 'imperial')).toBe('76°F');
    expect(krokTemperatury(25, 1, 'metric')).toBe(25.5);
  });
});
