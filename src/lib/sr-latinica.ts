// ============================================================================
// Piekarz — serbski w łacince (iOS „Srpski (latinica)”, tag sr-Latn) ze słownika sr pisanego cyrylicą
// [audyt-niezalezny F-11]. Serbski ma dwa równoprawne alfabety z odpowiedniością liter 1:1 (dwuznaki lj, nj, dž
// dla љ, њ, џ), więc łacinka nie wymaga osobnego przekładu. Wpięcie: wybór języka w src/lib/i18n.ts
// (tag sr-Latn → słownik sr i przejście tekstu t() przez cyrylicaNaLacinke).
// ============================================================================

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
