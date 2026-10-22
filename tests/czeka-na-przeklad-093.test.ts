/**
 * Klucze 1.0, które po wpięciu 093 czekały na mały przebieg przekładu M1 (docs/lokalizacja/czeka-na-przeklad.json:
 * 6 szablonów Doktora Chleba, 6 czasów dojrzewania zaczynu). Po wpięciu przebiegu „doktor” lista jest pusta,
 * a w każdym z 33 języków przekładu klucz ma własny tekst, nie angielski [M1-audytor-generalny-093; 09-lokalizacja-093-03].
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { EN } from '../src/lib/i18n.en';
import { getAllSupportedLocaleCodes } from '../src/lib/i18n-locales';

const root = path.join(__dirname, '..');
const KLUCZE = [
  'Jaskinie (Niedofermentowany)',
  'Płaski dysk (Przerośnięty)',
  'Gumowaty (Gorący nóż)',
  'Pęknięty bok',
  'Zbyt kwaśny (Octowy)',
  'Płaski smak (Jałowy)',
  '12–16h w 18–20°C (lub 4h w 24°C)',
  '16–24h w 16–18°C (lub 24–48h w lodówce)',
  '12–24h w chłodzie (4–8°C)',
  '4–8h w 24–26°C do szczytu objętości',
  'Do ostygnięcia do temp. pokojowej',
  'Min. 4h lub przez noc w lodówce',
];

// Zmiana 216 (M2 p20, tor P): 5 kluczy wyboru rodzaju drożdży czeka na wspólny przebieg przekładu M1; po przebiegu
// usuń wpisy i tę stałą [M1-audytor-generalny-216].
const CZEKAJA_216 = [
  'Drożdże suche',
  'Drożdże do odważenia',
  'świeże|drożdże',
  'suche|drożdże',
  'Procent drożdży w recepturze to drożdże świeże. Drożdży suchych (instant albo aktywnych) odważysz 0,4 tej masy.',
];

/** Słownik języka z wygenerowanych plików (src/lib/i18n-slowniki/<kod>/czesc-N.ts): literały 'klucz': 'wartość'. */
function slownik(kod: string): Map<string, string> {
  const dir = path.join(root, 'src/lib/i18n-slowniki', kod);
  const m = new Map<string, string>();
  for (const f of fs.readdirSync(dir).filter((x) => /^czesc-\d+\.ts$/.test(x))) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const [, k, v] of src.matchAll(/^\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"):\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"),?$/gm)) {
      m.set(JSON.parse(k.startsWith("'") ? `"${k.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"')}"` : k),
        JSON.parse(v.startsWith("'") ? `"${v.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"')}"` : v));
    }
  }
  return m;
}

describe('093: 12 kluczy po małym przebiegu przekładu', () => {
  // Zmiana a1b (M3 p1b): 4 klucze pytania przy starcie drugiego wypieku czekają na przebieg przekładu a5; zmiana
  // testu tylko o ten wyjątek (inny klucz na liście nadal czerwony). Po przebiegu a5 usuń wpisy i tę stałą.
  const CZEKAJA_A1B = [
    'Trwa już inny wypiek',
    // M3 D3a: pytanie przy starcie przy trwających (D-104), przełącznik wypieków, zmiana receptury bazowej (5 kluczy);
    // 4 klucze a1b z przerwaniem usunięte razem z pytaniem
    'Prowadź oba',
    'Wróć do: {nazwa}',
    'Prowadzisz już 2 wypieki',
    '{wypiek}, krok: {krok}',
    'Receptura bazowa zmieniła się od tamtego wypieku: ma teraz więcej drożdży.',
    'Ten wypiek jest już zakończony albo przerwany.', // M3 D3a-fix (P1-1)
    'W tym dniu zmienia się czas, a wybranej godziny nie ma. Chleb będzie gotowy o {godzina}.',
    // M3 D2: powiadomienia wielu wypieków i stałego dnia karmienia (2 klucze)
    'Wypiek: {wypiek}.',
    'Dziś ustalony dzień karmienia zakwasu „{name}”.',
    // M3 D4a: kalendarz 1.0 — linia „Następne”, zaległe, typy zdarzeń (15 kluczy)
    'Następne: {lista}',
    'Zaległe: {co} ({h})',
    '{kiedy} {h} {co}',
    '{co}, opcjonalne',
    '+{n}',
    'Pokaż jeszcze {n} w arkuszu dnia',
    '{co} z {h}: zrobione',
    'Pomiń {co} z {h}',
    'Pomiń',
    '{wypiek}: gotowe',
    'karmienie zakwasu {zakwas}',
    'Dokarmiony {zakwas}',
    'Zakładanie zakwasu: dzień {n}, do zrobienia',
    'Zakładanie zakwasu: dzień {n} zapisany',
    '{wypiek}: ocena {ocena} z 5',
    // M3 D4b: ekrany „Dziś” 3+1 i kalendarza 1.0 (pas, pasek tygodnia, arkusz dnia, spirala z torami, Stolnica)
    '{data}, dziś',
    'Nic w planach',
    '{h} {co}',
    'i jeszcze {n}, szczegóły w arkuszu dnia',
    'Ten tydzień',
    'Pokaż cały tydzień',
    'Nic nie mamy w planach',
    'Kalendarz jest pusty. Zapełni się, gdy założysz zakwas albo zaplanujesz wypiek.',
    'Tu pojawi się plan wypieku i tydzień z karmieniami, gdy coś zaczniesz.',
    'Tego dnia nic nie zaplanowano.',
    'Najbliższe dni',
    'Zapisano dokarmienie zakwasu {zakwas}.',
    '{wypiek}: {krok}',
    'Tor {n}, {receptura}: {krok}, {czas}',
    'Tor {n}, {receptura}: {krok}',
    '{wypiek}: {krok}. Otwórz prowadzenie wypieku', // decyzja M1 2026-10-23 (zgoda trwała), wariant (a)
    '{wypiek}: {krok}, trwa',
    '{wypiek}, krok: {krok}, do {godzina}',
    // KONIEC D4b
    // M3 D5: plany na przyszłe dni (BR-KAL-009, BR-KAL-015, RD-33, D-108)
    'karmienie zakwasu {zakwas}, jeśli zakwas nie podwoił objętości',
    'Jeśli zakwas „{name}” nie podwoił objętości, dokarm go ponownie.',
    'Zaplanuj',
    'Masz już 5 planów',
    'Zacznij albo usuń jeden z nich, żeby dodać kolejny.',
    'Pokaż plany',
    'Kroki nachodzą na siebie',
    'Zaplanuj mimo to',
    '{krok} o {godzina}: w tym czasie {wypiek}: {krokInny}',
    'Usunięto plan wypieku',
    'Usuń plan',
    'Tego planu już nie ma.',
    'Zobacz plan',
    'Zaplanowane wypieki',
    'Zaplanuj wypiek na ten dzień',
    // KONIEC D5
    // M3 D6: piekarnik zajęty (BR-KAL-016, RD-34)
    'Piekarnik zajęty: {r1} i {r2} pieką się w tym samym czasie',
    'Piekarnik zajęty o {h}',
    '{dzien}: piekarnik zajęty o {h}',
    '{r1} piecze się od {od} do {do}. Przesuń start: {r2} o {m} min, pieczenie od {pieczenie}, gotowe o {gotowe}.',
    'Przesuń start: {r} o {m} min',
    'Zapisz bez zmiany',
    'Nie sprawdzę piekarnika',
    'Ten plan nie ma kroku nagrzewania, więc nie wiem, od kiedy zajmie piekarnik. Porównaj godziny pieczenia obu wypieków.',
    // KONIEC D6
    // M3 D7: tydzień, miesiąc, stały dzień karmienia, rytm (BR-KAL-008, -010, -013, -014; D-114)
    'Tydzień',
    'Miesiąc',
    'Poprzedni tydzień',
    'Następny tydzień',
    'Poprzedni miesiąc',
    'Następny miesiąc',
    'Stały dzień karmienia',
    'Karmienie co 7 dni: {dzien}, {h}.',
    'Bez stałego dnia: następne karmienie 7 dni po ostatnim.',
    'Bez stałego dnia',
    'Stały dzień karmienia ustawisz, gdy zakwas będzie gotowy. Zakwas trafia do lodówki dopiero po 7–10 dniach od założenia.',
    'Po dokarmieniu zakwas może wrócić do lodówki po 1–2 h w temperaturze pokojowej.',
    'Stały dzień karmienia to {staly}, a zakwas dokarmiono w dniu: {dzien}.',
    'Zostaw: {dzien}',
    'Licz od: {dzien}',
    'Propozycja z Dziennika: {dzien}, jak ostatnie wypieki. Możesz wybrać inny dzień.',
    // KONIEC D7
    // M3 D8: plan w kalendarzu telefonu jako plik .ics (BR-KAL-011)
    'Dodaj do kalendarza',
    'Plan trafi do kalendarza telefonu jako plik z wydarzeniem. Piekarz nie dostaje dostępu do Twojego kalendarza.',
    'Wydarzenie w kalendarzu telefonu się nie zmieniło. Godziny zmienisz tam sam albo dodasz plan jeszcze raz.',
    'Nie dodano do kalendarza',
    'Ten telefon nie pozwala wysłać pliku do kalendarza. Plan zostaje w Piekarzu, możesz go skopiować jako tekst.',
    'Ten plan nie ma godzin, które da się zapisać w kalendarzu. Ułóż plan jeszcze raz.',
    'Nie udało się przygotować pliku z planem. Plan zostaje w Piekarzu. Spróbuj ponownie.',
    // KONIEC D8
    // M3 P-a: uprzedzenie o końcu Piekarz Pro i komunikat po wygaśnięciu (D-113, D-116), na przebieg a5 jak D5–D8
    'Piekarz Pro kończy się {data}',
    'Subskrypcja się nie odnowi. Potem przypomnienia o dokarmianiu wyłączą się, a Twoje receptury, zakwasy i dziennik zostaną.',
    'Przypomnienia o dokarmianiu wyłączyły się. Twoje receptury, zakwasy i dziennik zostają.',
    'Zamknij informację o Piekarz Pro',
    // KONIEC P-a
    // M3 P-a-fix: zakładanie od nowa przy jednym zakwasie (P0-1), zapis zmian własnej receptury (P1-1)
    'Załóż zakwas od nowa',
    'Założyć zakwas od nowa?',
    'Wpisy tego zakwasu zostaną usunięte, a zakładanie zacznie się od dnia 1 z dokarmieniem teraz.',
    'Zapisano zmiany w recepturze „{name}”.',
    // KONIEC P-a-fix
    // M3 P-b: ekran Pro, oznaczenie „Pro”, gratulacje po pierwszym zakwasie, Ustawienia (D-117), na przebieg a5 jak P-a
    'Pro',
    '{funkcja}, Pro',
    'Plan wstecz od godziny „gotowe”',
    'Gotowość zakwasu do ciasta',
    'Proporcje dokarmiania',
    'Porównanie i statystyki',
    'Basic zostaje bezpłatny na zawsze. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i receptur.',
    'Co daje Pro',
    'Planowanie: plan wstecz od godziny „gotowe” z ochroną snu i czasem fermentacji z temperatury, wypieki na kolejne dni, dwa wypieki naraz, widok miesiąca i plan w kalendarzu telefonu.',
    'Zakwas: przypomnienia o dokarmianiu, proporcje dokarmiania, gotowość zakwasu do ciasta, stały dzień karmienia w lodówce i kolejne zakwasy.',
    'Liczenie: zaczyn poolish, biga, stare ciasto albo levain w recepturze.',
    'Receptury i Dziennik: więcej własnych receptur, porównanie i statystyki wypieków.',
    'Jedna opłata, bez odnawiania.',
    'Piekarz Pro jest aktywny.',
    'Gratulacje, Twój pierwszy zakwas jest gotowy. Pamiętaj, aby o niego dbać zgodnie z zasadami.',
    'Przypomnienia o dokarmianiu są w Piekarz Pro.',
    'Zrealizuj kod',
    'Nie udało się otworzyć realizacji kodu. Realizacja kodu wymaga połączenia z App Store: sprawdź internet i spróbuj ponownie.',
    'Przypomnienia o dokarmianiu gotowego zakwasu są w Piekarz Pro. W czasie zakładania zakwasu przychodzą bez Pro.',
    // KONIEC P-b
    // M3 PRZ (przegląd roli 04): przemianowanie przycisku objawów na karcie bezpieczeństwa (PRZ-39)
    'Odznacz objawy',
    // KONIEC PRZ
    // M3 D10: pas nocy na każdej zakładce, zdanie na pasie Dziennika (opcja A), na przebieg a5 jak PRZ
    'Ostatni wypiek: {data}',
    // KONIEC D10
    // M3 W-fix2 (decyzje M1 wg rekomendacji z weryfikacji W): nowe klucze na przebieg a5c
    'Otwórz',
    '{co} z {h}: otwórz',
    // KONIEC W-fix2
  ];
  // F-71 (rola 06, 2026-10-22): teksty protokołów ratunkowych ze źródłami czekają na wspólny batch przekładu toru T;
  // wyjątek tylko dla wpisów z tym znacznikiem w „powod”, które są kluczami słownika EN części F-71. Po batchu usuń.
  // Tak samo presety drożdżowe 217 (docs/tresci/pl/presety-drozdze.md) [M1-audytor-generalny-217].
  const ZNACZNIKI_TORU_T = ['[rola 06 F-71, docs/tresci/pl/doktor-ratunek.md]', '[rola 06 217, docs/tresci/pl/presety-drozdze.md]'];
  it('lista czekających jest pusta (poza kluczami a1b i D-13 do przebiegu a5 i kluczami F-71 do batcha toru T)', () => {
    const j = JSON.parse(fs.readFileSync(path.join(root, 'docs/lokalizacja/czeka-na-przeklad.json'), 'utf8'));
    const f71 = (x: { klucz: string; powod: string }) => ZNACZNIKI_TORU_T.some((z) => x.powod.includes(z)) && typeof EN[x.klucz] === 'string';
    expect((j.klucze as { klucz: string; powod: string }[]).filter((x) => !f71(x)).map((x) => x.klucz).filter((k) => !CZEKAJA_A1B.includes(k) && !CZEKAJA_216.includes(k))).toEqual([]);
  });

  it.each(getAllSupportedLocaleCodes().filter((k) => k !== 'pl' && k !== 'en'))('%s: każdy z 12 kluczy ma własny tekst', (kod) => {
    const s = slownik(kod);
    const brak = KLUCZE.filter((k) => !s.get(k) || s.get(k) === EN[k]);
    expect(brak).toEqual([]);
  });
});
