// ============================================================================
// Piekarz (Crust) — Unit Converter (Metric / Imperial — DEC-21 & NFR-I18N)
// Obsługa jednostek metrycznych (°C, g) i imperialnych (°F, oz, lbs)
// 100% Offline-First, Zero Telemetry
// ============================================================================

import { useState, useEffect } from 'react';
import { getAppSetting, setAppSetting } from '../data/sqlite-store';

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
  } catch {}
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
    return `${celsiusToFahrenheit(celsius)}°F`;
  }
  return `${Number(celsius.toFixed(1))}°C`;
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
      if (lbs > 0 && remainingOz > 0) {
        return `${lbs} lb ${remainingOz} oz`;
      }
      if (lbs > 0 && remainingOz === 0) {
        return `${lbs} lb`;
      }
      return `${remainingOz} oz`;
    }
    return `${gramsToOunces(grams)} oz`;
  }
  return `${Math.round(grams)} g`;
}

/**
 * Formatuje małą wagę składnika (sól, drożdże, zakwas)
 */
export function formatDoseWeight(grams: number, unitSystem: UnitSystem = currentUnitSystem): string {
  if (unitSystem === 'imperial') {
    return `${gramsToOunces(grams)} oz`;
  }
  return `${Number(grams.toFixed(1))} g`;
}
