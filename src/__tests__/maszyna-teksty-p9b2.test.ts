/**
 * p9b-2: teksty trybu maszyny (karty/README.md §6 wiersz D-138, docs/tresci/pl/maszyna.md, nowe etykiety D-262): każdy
 * ma wpis EN (src/lib/i18n-en/czesc-29.ts), a zdania roli 06 i etykiety kart są na ekranie w trybie maszyny.
 * Pozostałe 33 języki: rola 09 (check:i18n czerwony tylko przez te klucze, wyjątek jak D-209) [M3 p9b2].
 */
import { EN_29 } from '../lib/i18n-en/czesc-29';
import { setLang, t } from '../lib/i18n';

const KLUCZE = [
  "Piekarnik",
  "Maszyna do chleba",
  "Pojemność maszyny",
  "Kolejność wkładania",
  "Program i godzina",
  "Program",
  "Gotowe o",
  "Kolejność i ilości według instrukcji maszyny.",
  "Zapisz plan",
  "Największa ilość mąki",
  "Największa masa ciasta",
  "Największa masa drożdży suchych",
  "Czas programu",
  "płyny najpierw",
  "drożdże najpierw",
  "Ilość ograniczyła granica Twojej maszyny; procenty receptury są te same.",
  "Uzupełnij mąki w recepturze, żeby zobaczyć podpowiedź programu.",
  "Wpisz czas programu z instrukcji maszyny.",
  "W tej recepturze: {skladniki}.",
  "Program rusza o {godzina}.",
  "Od teraz do gotowości: {czas}.",
  "Ustaw opóźniony start na {czas}.",
  "Program nie zdąży. Najwcześniej gotowe o {godzina}.",
  "Po programie",
  "ciasto|program maszyny",
  "słodki|program maszyny",
  "pełnoziarnisty|program maszyny",
  "francuski|program maszyny",
  "podstawowy|program maszyny",
  "jajka|składnik",
  "świeże mleko|składnik",
  "ser|składnik",
  "jogurt|składnik",
  "sok|składnik",
  "świeże owoce|składnik",
  "warzywa|składnik",
  "Wpisz z instrukcji swojej maszyny największą ilość mąki, a jeśli instrukcja ją podaje, także największą masę ciasta i drożdży; Piekarz nie przeliczy receptury ponad żadną z tych granic.",
  "Na przykład w Tefal PF220838 nie wolno przekroczyć łącznie 1000 g ciasta, 620 g mąki chlebowej i 10 g suchych drożdży instant.",
  "Kolejność wkładania składników podaje instrukcja Twojej maszyny.",
  "W większości przeczytanych instrukcji najpierw wlewa się płyny, potem wsypuje mąkę i inne suche składniki, a drożdże na wierzch, tak by nie dotykały płynów.",
  "W niektórych maszynach jest odwrotnie: najpierw suche drożdże, na nie mąka i suche składniki, a płyn na końcu.",
  "Opóźniony start jest wyłączony, bo receptura ma jajka, świeże mleko, ser, jogurt, sok, świeże owoce albo warzywa.",
  "Każda z przeczytanych instrukcji maszyn zabrania opóźnionego startu z częścią tych składników, bo łatwo się psują.",
  "Według jednej z instrukcji mleko w proszku zamiast świeżego mleka pozwala użyć opóźnionego startu, więc Piekarz go nie blokuje.",
  "Po pieczeniu formę wyjmuj w rękawicach kuchennych, bo forma, jej uchwyt i wnętrze pokrywy są gorące.",
  "Mieszadło, które zostało w bochenku, może być bardzo gorące: wyjmij je dopiero po ostygnięciu chleba, narzędziem z zestawu albo plastikową łopatką, bez noża i widelca, i dalej uważaj na oparzenie.",
  "Przy otwieraniu pokrywy w trakcie albo pod koniec programu może wydostać się gorąca para.",
  "W czasie pracy nie dotykaj otworu pary i go nie zasłaniaj.",
  "Dzieci poniżej 8 lat trzymaj z dala od maszyny i przewodu, a starsze mogą jej używać tylko pod nadzorem.",
  "Podpowiedź programu to reguła Piekarza, nie zalecenie producenta, więc sprawdź ją w instrukcji swojej maszyny.",
  "Program „ciasto” podpowiadamy dla wypieków kształtowanych i pieczonych w piekarniku, bo w nim maszyna przygotowuje ciasto, ale go nie piecze.",
  "Program „słodki” podpowiadamy dla receptur słodkich, bo według opisu w instrukcji jednej z maszyn jest przeznaczony dla chlebów z dużą ilością cukru, tłuszczu i białka.",
  "Program „pełnoziarnisty” podpowiadamy, gdy mąka pełnoziarnista i żytnia to razem co najmniej 50% mąki, jak w progu z instrukcji jednej z maszyn.",
  "Program „francuski” podpowiadamy dla receptur bez cukru i tłuszczu, jak w opisie z instrukcji jednej z maszyn.",
  "W pozostałych recepturach podpowiadamy program podstawowy, według opisu w instrukcji jednej z maszyn przeznaczony głównie dla jasnej mąki pszennej.",
  "W przeczytanych instrukcjach maszyn programy na zakwasie używają także drożdży piekarskich.",
  "Dlatego w trybie maszyny ta receptura używa wersji na drożdżach.",
  "Według czterech z pięciu przeczytanych instrukcji opóźniony start nie działa albo nie jest zalecany w programie samego ciasta, więc Piekarz go nie proponuje.",
] as const;

describe('Teksty trybu maszyny (F-72)', () => {
  afterEach(() => setLang('pl'));
  it('lista kluczy = słownik EN części 29; t() w EN daje niepusty wpis słownika', () => {
    expect([...KLUCZE].sort()).toEqual(Object.keys(EN_29).sort());
    setLang('en');
    for (const k of KLUCZE) expect({ k, en: t(k) }).toEqual({ k, en: EN_29[k] && EN_29[k].length > 0 ? EN_29[k] : '(brak)' });
  });
  it('PL bez dopisku kontekstu klucza (tekst|kontekst) na ekranie', () => {
    setLang('pl');
    expect(t('ciasto|program maszyny')).toBe('ciasto');
    expect(t('świeże mleko|składnik')).toBe('świeże mleko');
  });
});
