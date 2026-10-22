// Motyw Piekarza: cztery warianty kolorów z tokeny.ts (jasny, ciemny i oba ze „Zwiększ kontrast”), wybierane przez iOS (D-045).
// Style ekranów tworzone raz przy imporcie dostają kolory DynamicColorIOS — iOS sam podmienia wariant po zmianie
// wyglądu albo „Zwiększ kontrast”. Poza iOS (podgląd web, testy z platformą inną niż ios) kolor wariantu jasnego.
// Wartości hex potrzebne w obliczeniach daje useMotyw(). [M1-audytor-generalny-050; mapa-rol.md §1, §3]
import { useEffect, useState } from 'react';
import { AccessibilityInfo, DynamicColorIOS, Platform, useColorScheme, type ColorValue } from 'react-native';
import { kolory, type WariantMotywu } from './tokeny';

export type KluczKoloru = keyof typeof kolory.jasny;
export type PaletaHex = { readonly [K in KluczKoloru]: string };
export type KoloryMotywu = { readonly [K in KluczKoloru]: ColorValue };

/** Wariant z ustawień systemu: wygląd (light/dark/brak) i „Zwiększ kontrast”. Brak wyglądu → jasny. */
export function wybierzWariant(schemat: string | null | undefined, zwiekszonyKontrast: boolean): WariantMotywu {
  if (schemat === 'dark') return zwiekszonyKontrast ? 'ciemnyKontrast' : 'ciemny';
  return zwiekszonyKontrast ? 'jasnyKontrast' : 'jasny';
}

/** Kolor tokenu dla stylów statycznych: na iOS DynamicColorIOS ze wszystkimi 4 wariantami, gdzie indziej hex jasnego. */
export function kolorDynamiczny(klucz: KluczKoloru, platforma: string = Platform.OS): ColorValue {
  if (platforma !== 'ios') return kolory.jasny[klucz];
  return DynamicColorIOS({
    light: kolory.jasny[klucz],
    dark: kolory.ciemny[klucz],
    highContrastLight: kolory.jasnyKontrast[klucz],
    highContrastDark: kolory.ciemnyKontrast[klucz],
  });
}

function zbudujKolory(): KoloryMotywu {
  const k = (klucz: KluczKoloru) => kolorDynamiczny(klucz);
  return {
    tlo: k('tlo'),
    tloGrupa: k('tloGrupa'),
    powierzchnia: k('powierzchnia'),
    tusz: k('tusz'),
    tusz2: k('tusz2'),
    tusz3: k('tusz3'),
    linia: k('linia'),
    obwodka: k('obwodka'),
    akcent: k('akcent'),
    naAkcencie: k('naAkcencie'),
    akcentTekst: k('akcentTekst'),
    ratan: k('ratan'),
    ratanSzary: k('ratanSzary'),
    nocDane: k('nocDane'),
    ostrzTlo: k('ostrzTlo'),
    ostrzTusz: k('ostrzTusz'),
    blad: k('blad'),
    zablokowane: k('zablokowane'),
    // Pas „Dziś” w kolorze nocy (D-105) [M3 D4b]
    pas: k('pas'),
    naPasie: k('naPasie'),
    naPasie2: k('naPasie2'),
    ratanNaPasie: k('ratanNaPasie'),
  };
}

/** Kolory motywu do StyleSheet.create (klucze = nazwy tokenów). */
export const koloryMotywu: KoloryMotywu = zbudujKolory();

/**
 * Bieżący wariant i jego paleta hex (SVG z obliczeniami, wartości potrzebne w kodzie). Na iOS śledzi wygląd
 * (useColorScheme) i „Zwiększ kontrast” (AccessibilityInfo, zdarzenie darkerSystemColorsChanged). Poza iOS
 * zawsze wariant jasny, tak jak kolory statyczne z kolorDynamiczny().
 */
export function useMotyw(): { wariant: WariantMotywu; kolory: PaletaHex } {
  const schemat = useColorScheme();
  const [kontrast, ustawKontrast] = useState(false);
  const ios = Platform.OS === 'ios';
  useEffect(() => {
    if (!ios) return undefined;
    let aktywny = true;
    AccessibilityInfo.isDarkerSystemColorsEnabled()
      .then((wlaczone) => {
        // stan początkowy to false: aktualizacja tylko przy włączonym kontraście (bez zbędnego renderu)
        if (aktywny && wlaczone) ustawKontrast(true);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('darkerSystemColorsChanged', (wlaczone: boolean) => {
      ustawKontrast(wlaczone);
    });
    return () => {
      aktywny = false;
      sub.remove();
    };
  }, [ios]);
  const wariant = ios ? wybierzWariant(schemat, kontrast) : 'jasny';
  return { wariant, kolory: kolory[wariant] };
}
