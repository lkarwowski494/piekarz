// Tokeny Piekarza (kierunek A „Koszyk spiralny”, D-049, D-050) — kopia docs/design/tokeny.ts.
// Źródło: docs/design/tokeny.json (rola 04). Nie edytuj ręcznie: zmiana tylko w tokeny.json,
// potem `node docs/design/narzedzia/tokeny.mjs` i ponowna kopia; zgodność pilnuje src/ui/__tests__/tokeny-zgodnosc.test.ts.

export type WariantMotywu = 'jasny' | 'ciemny' | 'jasnyKontrast' | 'ciemnyKontrast';

export const kolory = {
  "jasny": {
    "tlo": "#F5F5F2",
    "tloGrupa": "#ECECE7",
    "powierzchnia": "#FFFFFF",
    "tusz": "#1C1D1B",
    "tusz2": "#4B4D48",
    "tusz3": "#62645E",
    "linia": "#D6D6CF",
    "obwodka": "#7E8079",
    "akcent": "#1E4954",
    "naAkcencie": "#FFFFFF",
    "akcentTekst": "#1E4954",
    "ratan": "#9C6B2F",
    "ratanSzary": "#8A8273",
    "nocDane": "#1E4954",
    "ostrzTlo": "#F7D117",
    "ostrzTusz": "#1C1D1B",
    "blad": "#B3261E",
    "zablokowane": "#62645E",
    "pas": "#1E4954",
    "naPasie": "#FFFFFF",
    "naPasie2": "#C8D8DC",
    "ratanNaPasie": "#D9AE72"
  },
  "ciemny": {
    "tlo": "#141A1C",
    "tloGrupa": "#0E1315",
    "powierzchnia": "#1F2729",
    "tusz": "#F1F1EC",
    "tusz2": "#B9BDB8",
    "tusz3": "#9AA09A",
    "linia": "#354044",
    "obwodka": "#6E7A7D",
    "akcent": "#8FB9C4",
    "naAkcencie": "#0F1517",
    "akcentTekst": "#8FB9C4",
    "ratan": "#D3A464",
    "ratanSzary": "#7D7466",
    "nocDane": "#8FB9C4",
    "ostrzTlo": "#F7D117",
    "ostrzTusz": "#1C1D1B",
    "blad": "#FF8A80",
    "zablokowane": "#9AA09A",
    "pas": "#1D3B43",
    "naPasie": "#F1F1EC",
    "naPasie2": "#BFD0D4",
    "ratanNaPasie": "#D3A464"
  },
  "jasnyKontrast": {
    "tlo": "#FFFFFF",
    "tloGrupa": "#F0F0EC",
    "powierzchnia": "#FFFFFF",
    "tusz": "#000000",
    "tusz2": "#2E302C",
    "tusz3": "#3E403B",
    "linia": "#8A8B84",
    "obwodka": "#3E403B",
    "akcent": "#12323A",
    "naAkcencie": "#FFFFFF",
    "akcentTekst": "#12323A",
    "ratan": "#6E4A1F",
    "ratanSzary": "#7C7568",
    "nocDane": "#12323A",
    "ostrzTlo": "#F7D117",
    "ostrzTusz": "#000000",
    "blad": "#8C1D18",
    "zablokowane": "#3E403B",
    "pas": "#12323A",
    "naPasie": "#FFFFFF",
    "naPasie2": "#E2ECEE",
    "ratanNaPasie": "#E8C38E"
  },
  "ciemnyKontrast": {
    "tlo": "#000000",
    "tloGrupa": "#000000",
    "powierzchnia": "#161C1E",
    "tusz": "#FFFFFF",
    "tusz2": "#DADDD8",
    "tusz3": "#C4C8C2",
    "linia": "#7C878A",
    "obwodka": "#B4BEC0",
    "akcent": "#B5D6DE",
    "naAkcencie": "#000000",
    "akcentTekst": "#B5D6DE",
    "ratan": "#E8C38E",
    "ratanSzary": "#837C6D",
    "nocDane": "#B5D6DE",
    "ostrzTlo": "#F7D117",
    "ostrzTusz": "#000000",
    "blad": "#FFB4AB",
    "zablokowane": "#C4C8C2",
    "pas": "#0F2A31",
    "naPasie": "#FFFFFF",
    "naPasie2": "#E2ECEE",
    "ratanNaPasie": "#E8C38E"
  }
} as const;

export const typografia = {
  "_zrodlo": "HIG Typography, iOS Dynamic Type, Large (Default) i AX5 (odczyt 2026-10-20, developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json); punkty iOS",
  "krojTytulow": "Sofia Sans Semi Condensed",
  "krojTresci": "system (SF Pro)",
  "style": {
    "tytulDuzy": {
      "styl": "Large Title",
      "pt": 34,
      "ax5": 60,
      "krój": "tytuły",
      "waga": 700
    },
    "tytulKroku": {
      "styl": "Title 1",
      "pt": 28,
      "ax5": 58,
      "krój": "tytuły",
      "waga": 700
    },
    "czas": {
      "styl": "własny, skala jak Large Title",
      "pt": 56,
      "ax5": 99,
      "krój": "tytuły",
      "waga": 700,
      "uwaga": "cyfry tabelaryczne; zawija się, nigdy nie ucina"
    },
    "tytul2": {
      "styl": "Title 2",
      "pt": 22,
      "ax5": 56,
      "krój": "tytuły",
      "waga": 700
    },
    "naglowek": {
      "styl": "Headline",
      "pt": 17,
      "ax5": 53,
      "krój": "treść",
      "waga": 600
    },
    "tresc": {
      "styl": "Body",
      "pt": 17,
      "ax5": 53,
      "krój": "treść",
      "waga": 400
    },
    "objasnienie": {
      "styl": "Subhead",
      "pt": 15,
      "ax5": 49,
      "krój": "treść",
      "waga": 400
    },
    "przypis": {
      "styl": "Footnote",
      "pt": 13,
      "ax5": 44,
      "krój": "treść",
      "waga": 400
    },
    "podpis": {
      "styl": "Caption 1",
      "pt": 12,
      "ax5": 43,
      "krój": "treść",
      "waga": 400
    }
  },
  "duzyTekst": "od AX1: element firmowy nad tekstem (stos pionowy), przyciski pod sobą, etykiety obok spirali przenoszą się pod nią; żaden tekst nie ma limitu linii"
} as const;

export const odstepy = {"xs":4,"s":8,"m":12,"l":16,"xl":20,"xxl":24,"xxxl":32} as const;

export const promienie = {"_zasada":"hierarchia: im większy i ważniejszy obiekt, tym większy promień; listy grupowane systemowe","pas":26,"przyciskGlowny":18,"chip":22,"przycisk":14,"grupa":12,"ostrzezenie":12,"znacznik":6,"pole":10} as const;

export const cele = {"glownyPrzeplyw":48,"pozostale":44,"przyciskKciuka":64,"_zrodlo":"DEC-15 a, NFR-INT-001"} as const;

export const ruch = {
  "zwoj": {
    "ms": 300,
    "krzywa": "easeOut",
    "kiedy": "po „Zrobione”: zwój bieżący staje się gruby, znacznik przesuwa się"
  },
  "krotki": {
    "ms": 200,
    "krzywa": "easeOut",
    "kiedy": "pojawienie się paska „Cofnij”, zmiana stanu przycisku"
  },
  "ograniczRuch": "bez przejść: zmiana natychmiastowa; tylko przenikanie 150 ms tam, gdzie zmiana bez przejścia byłaby myląca"
} as const;

export const haptyka = {
  "zrobione": "impact medium",
  "cofnij": "impact light",
  "ostrzezenieWKroku": "notification warning",
  "blad": "notification error",
  "zakupUdany": "notification success",
  "wyborWLiscie": "selection",
  "_zasada": "dźwięk tylko razem z haptyką; haptyka może być sama; oba wyłączalne w ustawieniach aplikacji i systemu"
} as const;
