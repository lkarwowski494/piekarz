// ============================================================================
// Piekarz (Crust) — Unit Converter (Metric / Imperial — DEC-21 & NFR-I18N)
// Obsługa jednostek metrycznych (°C, g) i imperialnych (°F, oz, lbs)
// 100% Offline-First, Zero Telemetry
// ============================================================================

import { useState, useEffect } from 'react';
import { getLocales } from 'expo-localization';
import { getAppSetting, setAppSetting } from '../data/sqlite-store';
import { formatFixed, formatNumber } from './format';
import { ustawPrzeliczanieTekstu } from './i18n';
import { guardSave } from './save-guard';
import { tekstSerbski } from './sr-latinica';

export type UnitSystem = 'metric' | 'imperial';

// In-memory preference with subscribers and SQLite persistence
let currentUnitSystem: UnitSystem = 'metric';
const unitListeners = new Set<(system: UnitSystem) => void>();

/** Region urządzenia z expo-localization (getLocales()[0]); null na web albo bez danych. */
export interface RegionJednostek {
  regionCode?: string | null;
  measurementSystem?: string | null;
}

/**
 * Domyślny układ, gdy użytkownik nie wybrał (D-044: „US → imperialne, pozostałe regiony → metryczne”): region
 * urządzenia US → imperialne; inny region → metryczne, także GB (measurementSystem „uk”) oraz LR i MM, choć system
 * podaje dla nich „us” — decyzja mówi o regionie US. Bez regionu: measurementSystem „us” → imperialne, inaczej metryczne.
 */
export function domyslnyUkladJednostek(region: RegionJednostek | null | undefined): UnitSystem {
  if (region?.regionCode) return region.regionCode.toUpperCase() === 'US' ? 'imperial' : 'metric';
  return region?.measurementSystem === 'us' ? 'imperial' : 'metric';
}

function regionUrzadzenia(): RegionJednostek | undefined {
  try {
    return getLocales()[0];
  } catch {
    return undefined;
  }
}

/**
 * Inicjalizuje układ jednostek z bazy SQLite; bez zapisanego wyboru — domyślny według regionu urządzenia
 * (D-044), bez zapisu w bazie, żeby nie nadpisywać przyszłego wyboru użytkownika [M1-audytor-generalny-096]
 */
export async function initUnitSystem(): Promise<UnitSystem> {
  let next: UnitSystem = currentUnitSystem;
  try {
    const saved = await getAppSetting('unit_system');
    next = saved === 'imperial' || saved === 'metric' ? saved : domyslnyUkladJednostek(regionUrzadzenia());
  } catch {
    // Odczyt ustawienia nieudany: zostaje bieżący układ jednostek
    return currentUnitSystem;
  }
  if (next !== currentUnitSystem) {
    currentUnitSystem = next;
    unitListeners.forEach((fn) => fn(next));
  }
  return next;
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
    // Wybór działa w tej sesji; nieudany zapis: „Nie zapisano” [M1-audytor-generalny-120]
    void guardSave(() => setAppSetting('unit_system', system))();
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

/** Uncje wagowe w gramie (design-spec §7). */
const OZ_PER_GRAM = 0.03527396195;

/**
 * Masa w uncjach według design-spec §7 (096, D-044): ≥ 16 oz → „1 lb 14.0 oz” (uncje z jednym miejscem),
 * 1–16 oz jedno miejsce po przecinku, < 1 oz dwa miejsca (sól, drożdże); separator według języka.
 */
function formatOunces(grams: number): string {
  const oz1 = roundTo(grams * OZ_PER_GRAM, 1);
  if (oz1 >= 16) {
    const lbs = Math.floor(oz1 / 16);
    return `${lbs} lb ${formatFixed(roundTo(oz1 - lbs * 16, 1), 1)} oz`;
  }
  const oz2 = roundTo(grams * OZ_PER_GRAM, 2);
  return oz2 >= 1 ? `${formatFixed(oz1, 1)} oz` : `${formatFixed(oz2, 2)} oz`;
}

/**
 * Formatuje wagę składnika (gramy lub uncje/funty)
 */
export function formatWeight(grams: number, unitSystem: UnitSystem = currentUnitSystem): string {
  if (unitSystem === 'imperial') return formatOunces(grams);
  return `${formatNumber(Math.round(grams), undefined, { maximumFractionDigits: 0 })} g`;
}

/**
 * Formatuje małą wagę składnika (sól, drożdże, zakwas)
 */
export function formatDoseWeight(grams: number, unitSystem: UnitSystem = currentUnitSystem): string {
  if (unitSystem === 'imperial') return formatOunces(grams);
  return `${formatNumber(grams, undefined, { maximumFractionDigits: 1 })} g`;
}

const LITERA = 'A-Za-zÀ-ɏąćęłńóśźżĄĆĘŁŃÓŚŹŻ';
const LICZBA = '(\\d+(?:[.,]\\d+)?)';
/** Słowa po temperaturze, które czynią z niej różnicę (PL, EN): „10 °C niżej” = 18 °F niżej. */
const ROZNICA_PO = '(\\s+(?:niżej|wyżej|mniej|więcej|cieplej|chłodniej|zimniej|lower|higher|cooler|warmer|colder|less|more)(?![' + LITERA + ']))';
const RE_ROZNICA_PO = new RegExp(`${LICZBA}(\\s*)°C${ROZNICA_PO}`, 'g');
const RE_ROZNICA_PRZED = new RegExp(`((?:^|[^${LITERA}])(?:o|by)\\s+|[+±])${LICZBA}(\\s*)°C`, 'g');
const RE_ZAKRES_C = new RegExp(`(^|[^\\d.,])([−-]?)${LICZBA}(\\s*[–-]\\s*)([−-]?)${LICZBA}(\\s*)°C`, 'g');
const RE_TEMP_C = new RegExp(`(^|[^\\d.,])([−-]?)${LICZBA}(\\s*)°C`, 'g');
const RE_ZAKRES_G = new RegExp(`${LICZBA}(\\s*[–-]\\s*)${LICZBA}\\s*(kg|g)(?![${LITERA}\\d])`, 'g');
const RE_MASA = new RegExp(`${LICZBA}\\s*(kg|g)(?![${LITERA}\\d])`, 'g');

const liczba = (s: string, znak = ''): number => (znak ? -1 : 1) * parseFloat(s.replace(',', '.'));
const fahrenheit = (c: number): string => formatNumber(celsiusToFahrenheit(c));
const gramy = (s: string, jednostka: string): number => liczba(s) * (jednostka === 'kg' ? 1000 : 1);

/** Symbole gramów w pismach przekładu poza łacinką (ru, uk, bg, el, ja, ko, zh) [M1-audytor-generalny-096]. */
const RE_MASA_INNA = new RegExp(`${LICZBA}(\\s*)(кг|г|γρ|グラム|그램|公克|克)(?![\\p{L}\\d])`, 'gu');
// Liczba z °C, która nie jest końcem zakresu ani liczbą ujemną (te przelicza zakres/temperatura)
const RE_ROZNICA_TEMP = new RegExp(`(^|[^\\d.,−–-])${LICZBA}(\\s*)°C`, 'g');

/** Wartości liczb, które tekst źródłowy (PL) nazywa różnicą temperatur („10 °C niżej”, „o 2 °C”). */
function roznice(zrodlo: string): Set<number> {
  const wynik = new Set<number>();
  for (const m of zrodlo.matchAll(RE_ROZNICA_PO)) wynik.add(liczba(m[1]));
  for (const m of zrodlo.matchAll(RE_ROZNICA_PRZED)) wynik.add(liczba(m[2]));
  return wynik;
}

/** Masy w gramach z tekstu źródłowego (PL): tylko te liczby w przekładzie są masą, nie np. rok „2026 г.”. */
function masy(zrodlo: string): Set<number> {
  const wynik = new Set<number>();
  for (const m of zrodlo.matchAll(RE_MASA)) wynik.add(gramy(m[1], m[2]));
  for (const m of zrodlo.matchAll(RE_ZAKRES_G)) {
    wynik.add(gramy(m[1], m[4]));
    wynik.add(gramy(m[3], m[4]));
  }
  return wynik;
}

/**
 * Przelicza w tekście temperatury (°C → °F całkowite, także zakresy i różnice) i masy (g, kg → oz, lb)
 * według wybranego układu; metrycznie tekst bez zmian [M1-audytor-generalny-096]. `zrodlo` (tekst PL klucza t())
 * rozpoznaje różnice temperatur i masy w każdym języku przekładu, bez list słów języka [09-lokalizacja-501].
 */
export function formatTextUnits(text: string, unitSystem: UnitSystem = currentUnitSystem, zrodlo?: string): string {
  if (unitSystem !== 'imperial' || !text) return text;
  const roz = zrodlo ? roznice(zrodlo) : null;
  const mas = zrodlo ? masy(zrodlo) : null;
  const poRoznicach = roz?.size
    ? text.replace(RE_ROZNICA_TEMP, (cale: string, p: string, n: string, ws: string) =>
        roz.has(liczba(n)) ? `${p}${formatNumber(Math.round((liczba(n) * 9) / 5))}${ws}°F` : cale)
    : text;
  const poLacince = poRoznicach
    .replace(RE_ROZNICA_PO, (_, n: string, ws: string, po: string) => `${formatNumber(Math.round((liczba(n) * 9) / 5))}${ws}°F${po}`)
    .replace(RE_ROZNICA_PRZED, (_, przed: string, n: string, ws: string) => `${przed}${formatNumber(Math.round((liczba(n) * 9) / 5))}${ws}°F`)
    .replace(RE_ZAKRES_C, (_, p: string, za: string, a: string, sep: string, zb: string, b: string, ws: string) =>
      `${p}${fahrenheit(liczba(a, za))}${sep}${fahrenheit(liczba(b, zb))}${ws}°F`)
    .replace(RE_TEMP_C, (_, p: string, z: string, n: string, ws: string) => `${p}${fahrenheit(liczba(n, z))}${ws}°F`)
    .replace(RE_ZAKRES_G, (_, a: string, sep: string, b: string, j: string) => `${formatOunces(gramy(a, j))}${sep}${formatOunces(gramy(b, j))}`)
    .replace(RE_MASA, (_, n: string, j: string) => formatOunces(gramy(n, j)));
  if (!mas?.size) return poLacince;
  return poLacince.replace(RE_MASA_INNA, (cale: string, n: string, _ws: string, j: string) => {
    const g = liczba(n) * (j === 'кг' ? 1000 : 1);
    return mas.has(g) ? formatOunces(g) : cale;
  });
}

// Każdy tekst przez t() (ekrany, komunikaty, powiadomienia, eksport tekstowy) w trybie imperialnym ma °F i oz
// (design-spec §7, D-044) [M1-audytor-generalny-096]; tekst źródłowy klucza rozpoznaje różnice i masy (09-lokalizacja-501)
// Serbski w łacince z cyrylicznego słownika sr, gdy urządzenie ma sr-Latn [audyt-niezalezny F-11]
ustawPrzeliczanieTekstu((s, zrodlo) => tekstSerbski(currentUnitSystem === 'imperial' ? formatTextUnits(s, 'imperial', zrodlo) : s));

/** Wartość z pola temperatury w jednostce z ustawienia → °C do zapisu (baza metryczna, D-044). */
export function temperaturaZPola(wartosc: number, unitSystem: UnitSystem = currentUnitSystem): number {
  return unitSystem === 'imperial' ? roundTo(((wartosc - 32) * 5) / 9, 2) : wartosc;
}

/** Krok steppera temperatury: imperialnie o 1 °F, metrycznie o 0,5 °C; wynik w °C (096). */
export function krokTemperatury(celsius: number, kierunek: 1 | -1, unitSystem: UnitSystem = currentUnitSystem): number {
  if (unitSystem !== 'imperial') return celsius + 0.5 * kierunek;
  return temperaturaZPola(celsiusToFahrenheit(celsius) + kierunek, 'imperial');
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


