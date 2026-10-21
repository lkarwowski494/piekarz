// ============================================================================
// Piekarz — serbski w łacince (iOS „Srpski (latinica)”, tag sr-Latn) ze słownika sr pisanego cyrylicą
// [audyt-niezalezny F-11]. Serbski ma dwa równoprawne alfabety z odpowiedniością liter 1:1 (dwuznaki lj, nj, dž
// dla љ, њ, џ), więc łacinka nie wymaga osobnego przekładu. Wpięcie: przeliczanie gotowego tekstu t()
// (unit-converter rejestruje je w i18n), bez zmiany wyboru języka w src/lib/i18n.ts (tag sr-Latn → język sr).
// ============================================================================

import { getLocales } from 'expo-localization';
import { lang } from './i18n';

const MAPA: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž', з: 'z', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj',
  м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'ć', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'č',
  џ: 'dž', ш: 'š',
};

/** Tekst serbski cyrylicą → łacinka (wielka litera dwuznaku: „Lj”, „Nj”, „Dž”); inne znaki bez zmian. */
export function cyrylicaNaLacinke(tekst: string): string {
  let wynik = '';
  for (const z of tekst) {
    const male = z.toLowerCase();
    const l = MAPA[male];
    if (l === undefined) {
      wynik += z;
      continue;
    }
    wynik += z === male ? l : l.charAt(0).toUpperCase() + l.slice(1);
  }
  return wynik;
}

/** Czy tag systemu to serbski w łacince (sr-Latn, sr-Latn-RS, sr_Latn_ME). */
export function czySerbskaLacinka(tag: string): boolean {
  const czesci = tag.split(/[-_]/);
  return (czesci[0] ?? '').toLowerCase() === 'sr' && czesci.slice(1).some((x) => x.toLowerCase() === 'latn');
}

let lacinkaUrzadzenia: boolean | null = null;

/** Pierwszy serbski tag z listy języków urządzenia jest w łacince (odczyt raz na uruchomienie). */
function urzadzenieWLacince(): boolean {
  if (lacinkaUrzadzenia === null) {
    try {
      const sr = getLocales().find((l) => (l.languageTag ?? '').toLowerCase().split(/[-_]/)[0] === 'sr');
      lacinkaUrzadzenia = sr ? czySerbskaLacinka(sr.languageTag) : false;
    } catch {
      lacinkaUrzadzenia = false;
    }
  }
  return lacinkaUrzadzenia;
}

/** Tylko testy: ponowny odczyt języków urządzenia. */
export function _resetLacinkiForTests(): void {
  lacinkaUrzadzenia = null;
}

/**
 * Tekst z t() po polsku przetłumaczony na sr: w łacince, gdy urządzenie ma serbski w łacince; inny język bez zmian.
 * Wpięte w przeliczanie tekstu t() (unit-converter, ustawPrzeliczanieTekstu).
 */
export function tekstSerbski(tekst: string): string {
  return lang() === 'sr' && urzadzenieWLacince() ? cyrylicaNaLacinke(tekst) : tekst;
}
