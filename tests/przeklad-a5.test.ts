/**
 * Przebieg przekładu a5 (M1, 2026-10-23: batche a5, a5b, a5c przez Message Batches, walidacja 0 braków / 0 błędów),
 * wpięty na redesign/piekarz-2026-10-22 przez M3 (scripts/wepnij-przeklad.mjs): każdy z 164 kluczy ma w każdym
 * z 33 języków własny, niepusty wpis w słowniku (część kluczy, np. „Pro”, „+{n}”, ma poprawnie ten sam tekst co EN,
 * więc test nie porównuje z EN; treść przekładu sprawdziła walidacja przebiegu). Regresja: klucz zniknie ze słownika.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { EN } from '../src/lib/i18n.en';
import { getAllSupportedLocaleCodes } from '../src/lib/i18n-locales';

const root = path.join(__dirname, '..');

/** Słownik języka z plików src/lib/i18n-slowniki/<kod>/czesc-N.ts (literały 'klucz': 'wartość', jak w teście 093). */
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

// M3 T2 (D-123, 2026-10-23): 24 klucze a5 z nazwą źródła w tekście zmieniły brzmienie; stare klucze usunięte ze słowników,
// nowe czekają na przebieg a5d (docs/lokalizacja/czeka-na-przeklad.json, wyjątek „T2 / a5d” w teście 093), więc nie ma ich na tej liście.
const KLUCZE_A5 = [
  'Trwa już inny wypiek',
  'W tym dniu zmienia się czas, a wybranej godziny nie ma. Chleb będzie gotowy o {godzina}.',
  'Wypiek: {wypiek}.',
  'Dziś ustalony dzień karmienia zakwasu „{name}”.',
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
  'Prowadź oba',
  'Wróć do: {nazwa}',
  'Prowadzisz już 2 wypieki',
  '{wypiek}, krok: {krok}',
  'Receptura bazowa zmieniła się od tamtego wypieku: ma teraz więcej drożdży.',
  'Ten wypiek jest już zakończony albo przerwany.',
  'Przerośnięte ciasto',
  'Jeśli ratujesz ciasto, wyjmij je z koszyka albo naczynia.',
  'Odgazuj je, mocno dociskając, tak jak przy formowaniu.',
  'Uformuj je ponownie i odstaw do garowania.',
  'Zbyt luźne ciasto',
  'Ciasto jest lepkie i luźne i nie trzyma kształtu.',
  'Jeśli soli brakuje, otwórz protokół „Zapomniana sól”.',
  'Zapomniana sól',
  'Ciasto jest już wymieszane, a odważona sól została na blacie.',
  'Wymieszaj sól z kilkoma łyżeczkami wody.',
  'Rozpłaszcz ciasto, rozsmaruj na nim tę mieszankę, zwiń je, znów rozpłaszcz, obróć o 90° i zwiń ponownie.',
  'Wyrabiaj, aż ciasto znów będzie w miarę gładkie.',
  'Drożdże suche',
  'Drożdże do odważenia',
  'świeże|drożdże',
  'suche|drożdże',
  'Procent drożdży w recepturze to drożdże świeże. Drożdży suchych (instant albo aktywnych) odważysz 0,4 tej masy.',
  'Pizza w stylu neapolitańskim',
  'Ciasto na pizzę w stylu neapolitańskim o chrupiącym brzegu i delikatnym wnętrzu.',
  'Francuska bagietka na zaczynie poolish dojrzewającym około 14 godzin. Chrupiąca, cienka skórka i lekki, napowietrzony miękisz.',
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
  '{wypiek}: {krok}, trwa',
  '{wypiek}, krok: {krok}, do {godzina}',
  'karmienie zakwasu {zakwas}, jeśli zakwas nie podwoił objętości',
  'Jeśli zakwas „{name}” nie podwoił objętości, dokarm go ponownie.',
  'Zaplanuj',
  'Masz już 5 planów',
  'Zacznij albo usuń jeden z nich, żeby dodać kolejny.',
  'Pokaż plany',
  'Kroki nachodzą na siebie',
  'Zaplanuj mimo to',
  '{krok} o {godzina}: w tym czasie {wypiek}: {krokInny}',
  'Usuń plan',
  'Usunięto plan wypieku',
  'Tego planu już nie ma.',
  'Zobacz plan',
  'Zaplanowane wypieki',
  'Zaplanuj wypiek na ten dzień',
  'Piekarnik zajęty: {r1} i {r2} pieką się w tym samym czasie',
  'Piekarnik zajęty o {h}',
  '{dzien}: piekarnik zajęty o {h}',
  '{r1} piecze się od {od} do {do}. Przesuń start: {r2} o {m} min, pieczenie od {pieczenie}, gotowe o {gotowe}.',
  'Przesuń start: {r} o {m} min',
  'Zapisz bez zmiany',
  'Tydzień',
  'Miesiąc',
  'Poprzedni tydzień',
  'Następny tydzień',
  'Odznacz objawy',
  'Ostatni wypiek: {data}',
  'Nie sprawdzę piekarnika',
  'Ten plan nie ma kroku nagrzewania, więc nie wiem, od kiedy zajmie piekarnik. Porównaj godziny pieczenia obu wypieków.',
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
  'Dodaj do kalendarza',
  'Plan trafi do kalendarza telefonu jako plik z wydarzeniem. Piekarz nie dostaje dostępu do Twojego kalendarza.',
  'Wydarzenie w kalendarzu telefonu się nie zmieniło. Godziny zmienisz tam sam albo dodasz plan jeszcze raz.',
  'Nie dodano do kalendarza',
  'Ten telefon nie pozwala wysłać pliku do kalendarza. Plan zostaje w Piekarzu, możesz go skopiować jako tekst.',
  'Ten plan nie ma godzin, które da się zapisać w kalendarzu. Ułóż plan jeszcze raz.',
  'Nie udało się przygotować pliku z planem. Plan zostaje w Piekarzu. Spróbuj ponownie.',
  'Piekarz Pro kończy się {data}',
  'Subskrypcja się nie odnowi. Potem przypomnienia o dokarmianiu wyłączą się, a Twoje receptury, zakwasy i dziennik zostaną.',
  'Przypomnienia o dokarmianiu wyłączyły się. Twoje receptury, zakwasy i dziennik zostają.',
  'Zamknij informację o Piekarz Pro',
  'Załóż zakwas od nowa',
  'Założyć zakwas od nowa?',
  'Wpisy tego zakwasu zostaną usunięte, a zakładanie zacznie się od dnia 1 z dokarmieniem teraz.',
  'Zapisano zmiany w recepturze „{name}”.',
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
  '{wypiek}: {krok}. Otwórz prowadzenie wypieku',
  'Otwórz',
  '{co} z {h}: otwórz',
];

describe('przekład a5: 164 kluczy w 33 językach', () => {
  it('każdy klucz a5 ma tekst EN', () => {
    expect(KLUCZE_A5.filter((k) => typeof EN[k] !== 'string')).toEqual([]);
  });
  it.each(getAllSupportedLocaleCodes().filter((k) => k !== 'pl' && k !== 'en'))('%s: każdy klucz a5 ma własny tekst', (kod) => {
    const s = slownik(kod);
    expect(KLUCZE_A5.filter((k) => !s.get(k))).toEqual([]);
  });
});
