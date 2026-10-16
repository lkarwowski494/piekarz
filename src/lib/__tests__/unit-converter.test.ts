import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  gramsToOunces,
  ouncesToGrams,
  gramsToPounds,
  poundsToGrams,
  formatTemperature,
  formatWeight,
  formatDoseWeight,
  getUnitSystem,
  setUnitSystem,
  subscribeUnitSystem,
  _resetUnitSystemForTests,
} from '../unit-converter';

describe('unit-converter', () => {
  beforeEach(() => {
    _resetUnitSystemForTests();
  });

  describe('temperature conversions', () => {
    it('converts celsius to fahrenheit correctly', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
      expect(celsiusToFahrenheit(25)).toBe(77);
      expect(celsiusToFahrenheit(100)).toBe(212);
      expect(celsiusToFahrenheit(250)).toBe(482);
    });

    it('converts fahrenheit to celsius correctly', () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
      expect(fahrenheitToCelsius(77)).toBe(25);
      expect(fahrenheitToCelsius(212)).toBe(100);
      expect(fahrenheitToCelsius(482)).toBe(250);
    });

    it('formats temperature in metric and imperial', () => {
      expect(formatTemperature(25, 'metric')).toBe('25°C');
      expect(formatTemperature(25.5, 'metric')).toBe('25.5°C');
      expect(formatTemperature(25, 'imperial')).toBe('77°F');
    });
  });

  describe('weight conversions', () => {
    it('converts grams to ounces correctly', () => {
      expect(gramsToOunces(100)).toBeCloseTo(3.53, 1);
      expect(gramsToOunces(500)).toBeCloseTo(17.64, 1);
    });

    it('converts ounces to grams correctly', () => {
      expect(ouncesToGrams(3.53)).toBe(100);
      expect(ouncesToGrams(17.64)).toBe(500);
    });

    it('converts grams to pounds correctly', () => {
      expect(gramsToPounds(454)).toBeCloseTo(1.0, 1);
      expect(gramsToPounds(1000)).toBeCloseTo(2.2, 1);
    });

    it('converts pounds to grams correctly', () => {
      expect(poundsToGrams(1.0)).toBe(454);
      expect(poundsToGrams(2.2)).toBe(998);
    });

    it('formats weight in metric and imperial', () => {
      expect(formatWeight(500, 'metric')).toBe('500 g');
      expect(formatWeight(500, 'imperial')).toContain('1 lb');
      expect(formatWeight(250, 'imperial')).toContain('oz');
    });

    it('formats small dose weights', () => {
      expect(formatDoseWeight(10, 'metric')).toBe('10 g');
      expect(formatDoseWeight(10, 'imperial')).toBe('0.35 oz');
    });
  });

  describe('unit system reactive state', () => {
    it('defaults to metric', () => {
      expect(getUnitSystem()).toBe('metric');
    });

    it('notifies subscribers when changing unit system', () => {
      const listener = jest.fn();
      const unsubscribe = subscribeUnitSystem(listener);

      setUnitSystem('imperial');
      expect(getUnitSystem()).toBe('imperial');
      expect(listener).toHaveBeenCalledWith('imperial');

      unsubscribe();
      setUnitSystem('metric');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('formats with global unit system by default', () => {
      setUnitSystem('metric');
      expect(formatTemperature(24)).toBe('24°C');
      expect(formatWeight(300)).toBe('300 g');

      setUnitSystem('imperial');
      expect(formatTemperature(24)).toBe('75°F');
      expect(formatWeight(300)).toContain('oz');
    });
  });
});
