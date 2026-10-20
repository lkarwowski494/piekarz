// ============================================================================
// Piekarz (Crust) — Unit Converter (Metric / Imperial — DEC-21 & NFR-I18N)
// Obsługa jednostek metrycznych (°C, g) i imperialnych (°F, oz, lbs)
// 100% Offline-First, Zero Telemetry
// ============================================================================

import { useState, useEffect } from 'react';
import { getAppSetting, setAppSetting } from '../data/sqlite-store';
import { formatNumber } from './format';

export type UnitSystem = 'metric' | 'imperial';

// In-memory preference with subscribers and SQLite persistence
let currentUnitSystem: UnitSystem = 'metric';
const unitListeners = new Set<(system: UnitSystem) => void>();

/**
 * Inicjalizuje układ jednostek z bazy SQLite
 */
export async function initUnitSystem(): Promise<UnitSystem> {
  try {
    const saved = await getAppSetting('unit_system');
    if (saved === 'imperial' || saved === 'metric') {
      currentUnitSystem = saved;
      unitListeners.forEach((fn) => fn(saved));
      return saved;
    }
  } catch {
    // Odczyt ustawienia nieudany: zostaje bieżący układ jednostek (domyślnie metryczny)
  }
  return currentUnitSystem;
}

/**
 * Zwraca aktualny globalny układ jednostek
 */
export function getUnitSystem(): UnitSystem {
  return currentUnitSystem;
}

/**
 * Ustawia globalny układ jednostek, zapisuje w SQLite i powiadamia subskrybentów
 */
export function setUnitSystem(system: UnitSystem): void {
  if (currentUnitSystem !== system) {
    currentUnitSystem = system;
    void setAppSetting('unit_system', system);
    unitListeners.forEach((fn) => fn(system));
  }
}

/**
 * Subskrypcja na zmiany układu jednostek
 */
export function subscribeUnitSystem(listener: (system: UnitSystem) => void): () => void {
  unitListeners.add(listener);
  return () => {
    unitListeners.delete(listener);
  };
}

/**
 * React hook do subskrybowania aktualnego układu jednostek
 */
export function useUnitSystem(): UnitSystem {
  const [unitSystem, setLocalUnitSystem] = useState<UnitSystem>(currentUnitSystem);

  useEffect(() => {
    let isMounted = true;
    void initUnitSystem().then((sys) => {
      if (isMounted) setLocalUnitSystem(sys);
    });
    const unsubscribe = subscribeUnitSystem((newSystem) => {
      if (isMounted) setLocalUnitSystem(newSystem);
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return unitSystem;
}

/**
 * Resetuje stan modułu (dla testów jednostkowych)
 */
export function _resetUnitSystemForTests(): void {
  currentUnitSystem = 'metric';
  unitListeners.clear();
}

/**
 * Przelicza stopnie Celsjusza na Fahrenheita
 */
export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/**
 * Przelicza stopnie Fahrenheita na Celsjusza
 */
export function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

/**
 * Przelicza gramy na uncje wagowe (oz)
 */
export function gramsToOunces(g: number): number {
  return parseFloat((g * 0.03527396195).toFixed(2));
}

/**
 * Przelicza uncje wagowe (oz) na gramy
 */
export function ouncesToGrams(oz: number): number {
  return Math.round(oz / 0.03527396195);
}

/**
 * Przelicza gramy na funty (lbs)
 */
export function gramsToPounds(g: number): number {
  return parseFloat((g * 0.00220462262).toFixed(2));
}

/**
 * Przelicza funty (lbs) na gramy
 */
export function poundsToGrams(lbs: number): number {
  return Math.round(lbs / 0.00220462262);
}

/**
 * Formatuje temperaturę zgodnie z wybranym układem jednostek
 */
export function formatTemperature(celsius: number, unitSystem: UnitSystem = currentUnitSystem): string {
  if (unitSystem === 'imperial') {
    return `${formatNumber(celsiusToFahrenheit(celsius))}°F`;
  }
  // Wyświetlanie przez Intl według języka (PL 26,5°C) [M1-audytor-generalny-070]
  return `${formatNumber(celsius, undefined, { maximumFractionDigits: 1 })}°C`;
}

/**
 * Formatuje wagę składnika (gramy lub uncje/funty)
 */
export function formatWeight(grams: number, unitSystem: UnitSystem = currentUnitSystem): string {
  if (unitSystem === 'imperial') {
    if (grams >= 454) {
      // Pokaż funty i uncje dla większych wag (np. ciasto, mąka)
      const totalOz = grams * 0.03527396195;
      const lbs = Math.floor(totalOz / 16);
      const remainingOz = parseFloat((totalOz % 16).toFixed(1));
      const oz = formatNumber(remainingOz, undefined, { maximumFractionDigits: 1 });
      if (lbs > 0 && remainingOz > 0) {
        return `${lbs} lb ${oz} oz`;
      }
      if (lbs > 0 && remainingOz === 0) {
        return `${lbs} lb`;
      }
      return `${oz} oz`;
    }
    return `${formatNumber(gramsToOunces(grams), undefined, { maximumFractionDigits: 2 })} oz`;
  }
  return `${formatNumber(Math.round(grams), undefined, { maximumFractionDigits: 0 })} g`;
}

/**
 * Formatuje małą wagę składnika (sól, drożdże, zakwas)
 */
export function formatDoseWeight(grams: number, unitSystem: UnitSystem = currentUnitSystem): string {
  if (unitSystem === 'imperial') {
    return `${formatNumber(gramsToOunces(grams), undefined, { maximumFractionDigits: 2 })} oz`;
  }
  return `${formatNumber(grams, undefined, { maximumFractionDigits: 1 })} g`;
}

/**
 * Konwertuje wystąpienia temperatur w tekście na jednostki wybranego systemu
 */
export function formatTextUnits(text: string, unitSystem: UnitSystem = currentUnitSystem): string {
  if (unitSystem !== 'imperial' || !text) return text;
  return text.replace(/(\d+(?:[.,]\d+)?)\s*°C/g, (_, numStr) => {
    const val = parseFloat(numStr.replace(',', '.'));
    return formatTemperature(val, 'imperial');
  });
}

/**
 * Zaokrągla liczbę do zadanej liczby miejsc po przecinku
 */
export function roundTo(val: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

/**
 * RD-ENG-01 & BR-TEST-005: Konwersja wejściowa bez dryfu zaokrągleń (wInKeep)
 * Zachowuje dokładną wartość bazową prevBase, jeżeli sformatowana liczba w jednostce wyświetlania
 * zgadza się po zaokrągleniu do 0.1 z liczbą wpisaną przez użytkownika.
 */
export function wInKeep(txt: string, unit: string, prevBase?: number): number {
  if (typeof txt !== 'string') return prevBase ?? 0;
  const normalized = txt.replace(',', '.').trim();
  const xIn = parseFloat(normalized);
  if (isNaN(xIn) || !isFinite(xIn)) {
    return prevBase ?? 0;
  }

  const u = unit.toLowerCase().trim();
  let cu: number;
  const isFahrenheit = u === '°f' || u === 'f';

  if (u === 'lb' || u === 'lbs') {
    cu = 2.20462262185;
  } else if (u === 'oz') {
    cu = 0.03527396195;
  } else if (u === 'fl oz' || u === 'floz') {
    cu = 0.0338140227;
  } else {
    cu = 1;
  }

  if (prevBase !== undefined && prevBase > 0) {
    if (isFahrenheit) {
      const fPrev = roundTo((prevBase * 9) / 5 + 32, 1);
      if (roundTo(xIn, 1) === fPrev) {
        return prevBase;
      }
      return roundTo(((xIn - 32) * 5) / 9, 2);
    } else {
      const fPrev = roundTo(prevBase * cu, 1);
      if (roundTo(xIn, 1) === fPrev) {
        return prevBase;
      }
      return roundTo(xIn / cu, 2);
    }
  }

  if (isFahrenheit) {
    return roundTo(((xIn - 32) * 5) / 9, 2);
  }
  return roundTo(xIn / cu, 2);
}

