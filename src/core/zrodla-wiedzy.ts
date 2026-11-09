// ============================================================================
// Piekarz — ekran „Źródła wiedzy” w Ustawieniach (D-123, M3 T2): jedyne miejsce w aplikacji z nazwami źródeł.
// Porady w aplikacji mówią naturalnym językiem, bez przypisów do źródeł; podstawą liczb pozostaje rejestr twierdzeń
// (docs/tresci/rejestr.json) i BRD. Treść: rola 06 (audit/M3-2026-10-22, zrodla-ekran.json, 2026-10-23): tylko źródła
// z potwierdzonymi twierdzeniami użytymi w docs/tresci/pl. Wstęp, tematy, nazwy i opisy to klucze słownika (PL = klucz,
// EN: src/lib/i18n-en/czesc-25.ts); adres to zwykły tekst bez odnośnika (offline, bez sieci).
// ============================================================================

export interface ZrodloWiedzy {
  /** Klucz słownika: nazwa źródła (instytucja, autorzy, tytuł). */
  readonly nazwa: string;
  /** Klucz słownika: czego dotyczy w aplikacji. */
  readonly opis: string;
  /** Adres jako zwykły tekst, bez odnośnika. */
  readonly adres: string;
}

export interface GrupaZrodel {
  /** Klucz słownika: temat grupy (nagłówek). */
  readonly temat: string;
  readonly zrodla: readonly ZrodloWiedzy[];
}

export const ZRODLA_WIEDZY_WSTEP =
  'Nasze porady opierają się na sprawdzonych poradnikach piekarskich, zaleceniach bezpieczeństwa żywności i badaniach naukowych. Tu znajdziesz, z czego korzystamy.';

export const ZRODLA_WIEDZY: readonly GrupaZrodel[] = [
  {
    temat: 'Zakwas',
    zrodla: [
      {
        nazwa: 'CSU Extension (Colorado State University), „Sourdough Starter Best Practices”',
        opis: 'Jak bezpiecznie prowadzić zakwas: temperatura, wilgotność, płyn na wierzchu i kiedy zakwas wyrzucić.',
        adres: 'extension.colostate.edu',
      },
      {
        nazwa: 'SDSU Extension (South Dakota State University), „Sourdough Starters”',
        opis: 'Zakładanie zakwasu od zera, temperatura i codzienna opieka.',
        adres: 'extension.sdstate.edu',
      },
      {
        nazwa: 'Calvert M.D. i in., „A review of sourdough starters”, PeerJ 2021',
        opis: 'Kiedy zakwas jest dojrzały, jak dokarmianie i temperatura zmieniają jego kwasowość i smak.',
        adres: 'doi.org/10.7717/peerj.11389',
      },
      {
        nazwa: 'Landis E.A. i in., „The diversity and function of sourdough starter microbiomes”, eLife 2021',
        opis: 'Jak bardzo różne zakwasy różnią się tempem, w jakim podnoszą ciasto.',
        adres: 'doi.org/10.7554/eLife.61644',
      },
      {
        nazwa: 'CORDIS (Komisja Europejska), wyniki projektu AGRF0032',
        opis: 'Dlaczego gęstszy zakwas daje więcej kwasu octowego.',
        adres: 'cordis.europa.eu',
      },
    ],
  },
  {
    temat: 'Temperatura i czas',
    zrodla: [
      {
        nazwa: 'Gänzle M.G., Ehmann M., Hammes W.P., Applied and Environmental Microbiology 1998',
        opis: 'Z tego badania pochodzi nasza prosta zasada, o ile dłużej trwa fermentacja, gdy jest chłodniej (przy 20–26 °C).',
        adres: 'doi.org/10.1128/aem.64.7.2616-2623.1998',
      },
    ],
  },
  {
    temat: 'Mąka i normy',
    zrodla: [
      {
        nazwa: 'Polska Norma PN-A-74022:2003 „Mąka pszenna” (Polski Komitet Normalizacyjny)',
        opis: 'Określa typy mąki pszennej (np. 450, 650, 750) według zawartości popiołu.',
        adres: 'sklep.pkn.pl',
      },
      {
        nazwa: 'Polska Norma PN-A-74032:2002 „Mąka żytnia” (Polski Komitet Normalizacyjny)',
        opis: 'Określa typy mąki żytniej według zawartości popiołu.',
        adres: 'sklep.pkn.pl',
      },
      {
        nazwa: 'Achremowicz B., Berski W., Gambuś H., Żywność. Nauka. Technologia. Jakość 2010',
        opis: 'Białko w polskich mąkach pszennych i to, które z nich są nisko-, a które wysokowyciągowe.',
        adres: 'wydawnictwo.pttz.org',
      },
      {
        nazwa: 'Sujka K., Koczoń P., Journal of Analytical Methods in Chemistry 2017',
        opis: 'Białko w mąkach z polskich młynów: pszennych, żytnich i orkiszowych.',
        adres: 'pmc.ncbi.nlm.nih.gov/articles/PMC5294222',
      },
      {
        nazwa: 'Szwedziak K. i in., „Analiza jakości wybranych typów mąki pszennej”, Postępy Techniki Przetwórstwa Spożywczego 2018',
        opis: 'Białko i popiół w mąkach pszennych różnych typów.',
        adres: 'bibliotekanauki.pl',
      },
      {
        nazwa: 'Szafrańska A., Acta Agrophysica 2018',
        opis: 'Jakie typy mąk są w polskich sklepach i które z nich (np. 850) młyny robią po swojemu, poza normą.',
        adres: 'doi.org/10.31545/aagr0008',
      },
      {
        nazwa: 'Instytut Biotechnologii Przemysłu Rolno-Spożywczego, S. Stępniewska (streszczenie rozprawy)',
        opis: 'Mąka żytnia z polskich młynów przemysłowych.',
        adres: 'ibprs.pl',
      },
      {
        nazwa: 'Stolarska A. i in., Folia Pomeranae Universitatis Technologiae Stetinensis',
        opis: 'Potoczne nazwy mąk pszennych: tortowa, wrocławska, luksusowa, bułkowa i chlebowa.',
        adres: 'zut.edu.pl',
      },
    ],
  },
  {
    temat: 'Chleb żytni',
    zrodla: [
      {
        nazwa: 'Stępniewska S. i in., „Procedures for Breadmaking Quality Assessment of Rye Wholemeal Flour”, Foods 2019',
        opis: 'Kolejne etapy wypieku chleba z razowej mąki żytniej.',
        adres: 'doi.org/10.3390/foods8080331',
      },
      {
        nazwa: 'Oest M. i in., „Rye Bread Defects”, Foods 2020',
        opis: 'Czym jest chleb żytni i skąd biorą się jego typowe wady.',
        adres: 'doi.org/10.3390/foods9121900',
      },
      {
        nazwa: 'Leitsätze für Brot und Kleingebäck (niemieckie wytyczne dla pieczywa, 1993)',
        opis: 'Ile żyta musi mieć chleb, żeby nazywać się żytnim albo żytnio-pszennym.',
        adres: 'umwelt-online.de',
      },
    ],
  },
  {
    temat: 'Bezpieczeństwo w kuchni',
    zrodla: [
      {
        nazwa: 'USDA FSIS (amerykańska służba bezpieczeństwa żywności), „Molds on Food”',
        opis: 'Jak wygląda pleśń (bywa też biała) i dlaczego spleśniałego jedzenia się nie wącha.',
        adres: 'fsis.usda.gov',
      },
      {
        nazwa: 'FDA (amerykańska agencja żywności i leków), „Handling Flour Safely”',
        opis: 'Dlaczego nie je się surowej mąki ani surowego ciasta i jak myć ręce oraz blaty po pracy z mąką.',
        adres: 'fda.gov',
      },
      {
        nazwa: 'Rhode Island Burn Center (Brown University Health), „Avoiding Scalds”',
        opis: 'Rękawice i łapki do gorących pokryw i naczyń.',
        adres: 'brownhealth.org',
      },
      {
        nazwa: 'UofL Health Burn Center, „Tips to help avoid scald injuries”',
        opis: 'Pokrywę unosi się od siebie, żeby para nie poparzyła.',
        adres: 'uoflhealth.org',
      },
      {
        nazwa: 'Oklahoma State University, „Designing safer oven mitts”',
        opis: 'Dlaczego mokra rękawica kuchenna parzy.',
        adres: 'news.okstate.edu',
      },
      {
        nazwa: "Shriners Children's, „Scald Prevention in the Kitchen”",
        opis: 'Strefa bez dzieci wokół kuchenki i piekarnika.',
        adres: 'shrinerschildrens.org',
      },
      {
        nazwa: 'CPSC (amerykańska Komisja Bezpieczeństwa Produktów Konsumenckich), „Avoiding Tap Water Scalds”',
        opis: 'Jak szybko gorąca woda parzy skórę: przy zaparzaniu mąki i parzeniu obwarzanków.',
        adres: 'cpsc.gov',
      },
    ],
  },
  {
    temat: 'Technika i wypiek',
    zrodla: [
      {
        nazwa: 'King Arthur Baking',
        opis: 'Większość porad o zakwasie, wyrabianiu, formowaniu, nacinaniu, pieczeniu w garnku, studzeniu i ratowaniu ciasta.',
        adres: 'kingarthurbaking.com',
      },
      {
        nazwa: 'Modernist Cuisine (autorzy „Modernist Bread”), „How to Rescue Overproofed Dough”',
        opis: 'Jak rozpoznać przerośnięte ciasto i kiedy da się je uratować.',
        adres: 'modernistcuisine.com',
      },
      {
        nazwa: 'Bread Bakers Guild of America, „Formula Layout Standards” (Bread Lines 2009)',
        opis: 'Czym są poolish, biga i stare ciasto oraz jak długo dojrzewają.',
        adres: 'bbga.org',
      },
      {
        nazwa: 'Red Star Yeast (producent drożdży), „Baking with Yeast: Step-by-Step Guide”',
        opis: 'Kolejne kroki wypieku na drożdżach i dlaczego czasy rośnięcia z przepisu są tylko wskazówką.',
        adres: 'redstaryeast.com',
      },
      {
        // D-306 (DRO-INS-030, -011, -012): przelicznik drożdży świeże → suche w arkuszu „Składniki”
        // (docs/tresci/pl/drozdze-przelicznik.md) [M1-audytor-generalny-040]
        nazwa: 'Dr. Oetker Polska (producent drożdży), „Drożdże suszone instant 7 g”',
        opis: 'Ile drożdży suszonych zastępuje drożdże świeże.',
        adres: 'oetker.pl',
      },
      {
        nazwa: 'Lesaffre Polska (producent drożdży), „Drożdże SAF INSTANT czerwone/złote”',
        opis: 'Ile drożdży suszonych zastępuje drożdże świeże.',
        adres: 'lesaffre.pl',
      },
      {
        nazwa: "Fleischmann's Yeast (producent drożdży), najczęstsze pytania",
        opis: 'Ile drożdży suchych zastępuje drożdże świeże i które drożdże suche najpierw rozpuścić w wodzie.',
        adres: 'fleischmannsyeast.com',
      },
      {
        nazwa: 'University of Kentucky Cooperative Extension, „The Art of Baking Bread” (2010)',
        opis: 'Test palca: kiedy ciasto drożdżowe jest gotowe i o ile może urosnąć przed pieczeniem.',
        adres: 'fcs.mgcafe.uky.edu',
      },
    ],
  },
  {
    // D-247 (06z): źródła receptur katalogu p8 (docs/tresci/pl/katalog-m3.md) i przeliczania miar na gramy;
    // D-255 (06d): badania wersji drożdżowych 3 receptur (docs/tresci/pl/wersje-drozdzowe.md)
    temat: 'Receptury',
    zrodla: [
      {
        nazwa: 'Dziennik Urzędowy Unii Europejskiej: specyfikacje „Salinātā rudzu rupjmaize”, „Karjalanpiirakka”, „Obwarzanek krakowski” i „Kołocz śląski”',
        opis: 'Skład i sposób wypieku chleba żytniego z parzoną mąką, otwartych pierożków żytnich, obwarzanka parzonego i kołacza z serem i kruszonką.',
        adres: 'publications.europa.eu',
      },
      {
        nazwa: 'Komisja Europejska, rejestr eAmbrosia: specyfikacja „Pane di Altamura”',
        opis: 'Skład i sposób wypieku chleba z semoliny durum na zakwasie.',
        adres: 'ec.europa.eu',
      },
      {
        nazwa: 'Brytyjski rejestr chronionych nazw żywności (Defra): angielskie tłumaczenia wniosków „Obwarzanek krakowski” i „Kołocz śląski”',
        opis: 'Temperatura i czas pieczenia obwarzanka i kołacza oraz wyrastanie zaczynu do kołacza.',
        adres: 'assets.publishing.service.gov.uk',
      },
      {
        // D-304 (PIE-BRI-001): pieczenie brioszki w keksówce (docs/tresci/pl/pieczenie-receptur.md) [M1-audytor-generalny-009]
        nazwa: 'The Culinary Institute of America, przepis „Brioche”',
        opis: 'Temperatura i czas pieczenia brioszki w keksówce.',
        adres: 'ciafoodies.com',
      },
      {
        nazwa: 'Illinois 4-H (University of Illinois Extension), „Cooking 301 State Fair Recipes”',
        opis: 'Przepisy na chleby foremkowe, bułki mleczne, słodkie bułeczki i wieniec cynamonowy.',
        adres: '4h.extension.illinois.edu',
      },
      {
        nazwa: 'Marttaliitto (fińska organizacja doradztwa domowego), przepis „Karjalanpiirakat”',
        opis: 'Ilość soli w otwartych pierożkach żytnich.',
        adres: 'martat.fi',
      },
      {
        nazwa: 'USDA FoodData Central (amerykańska baza danych o składzie żywności), SR Legacy',
        opis: 'Ile waży szklanka albo łyżeczka mąki, cukru, soli i innych składników, gdy przepis podaje miary zamiast gramów.',
        adres: 'fdc.nal.usda.gov',
      },
      {
        nazwa: 'NIST (amerykański Narodowy Instytut Standaryzacji i Technologii), Handbook 44 (2025)',
        opis: 'Ile mililitrów ma amerykańska szklanka miarowa.',
        adres: 'doi.org/10.6028/NIST.HB.44-2025',
      },
      {
        nazwa: 'Longin C.F.H. i in., International Journal of Molecular Sciences 2023',
        opis: 'Ilość drożdży i czas od zarobienia ciasta do pieca w wersji drożdżowej chleba orkiszowego.',
        adres: 'doi.org/10.3390/ijms24032770',
      },
      {
        nazwa: 'Verdonck C. i in., Current Research in Food Science 2025',
        opis: 'Ilość drożdży i czasy rośnięcia w wersji drożdżowej chleba z mąki pszennej razowej.',
        adres: 'doi.org/10.1016/j.crfs.2025.101208',
      },
      {
        nazwa: 'Koistinen V.M. i in., Scientific Reports 2018',
        opis: 'Ilość drożdży, wody i soli oraz czasy rośnięcia i pieczenia w wersji drożdżowej chleba żytniego.',
        adres: 'doi.org/10.1038/s41598-018-24149-w',
      },
    ],
  },
  {
    // D-265 (06m): instrukcje producentów maszyn do chleba, źródła trybu maszyny (docs/tresci/pl/maszyna.md)
    temat: 'Maszyna do chleba',
    zrodla: [
      {
        nazwa: 'Tefal, instrukcja obsługi i instrukcja bezpieczeństwa maszyny do chleba Pain Plaisir (PF220838)',
        opis: 'Największa ilość mąki, ciasta i drożdży, kolejność wkładania, opóźniony start i bezpieczne wyjmowanie formy.',
        adres: 'dam.groupeseb.com',
      },
      {
        nazwa: 'Zojirushi, instrukcja obsługi maszyny do chleba BB-PDC20 (Home Bakery Virtuoso Plus)',
        opis: 'Kolejność wkładania, opóźniony start, gorące części po pieczeniu i program na zakwasie, który używa też drożdży.',
        adres: 'cdn.shopify.com',
      },
      {
        nazwa: 'Panasonic, instrukcja obsługi i przepisy do maszyny do chleba SD-YR2550',
        opis: 'Wielkość bochenka, kolejność wkładania i dozownik drożdży, opóźniony start i bezpieczne wyjmowanie formy.',
        adres: 'bilder.quelle.de',
      },
      {
        nazwa: 'Cuisinart, instrukcja obsługi maszyny do chleba CBK-110',
        opis: 'Programy maszyny, z których bierze się podpowiedź programu, opóźniony start z mlekiem w proszku i gorące mieszadło.',
        adres: 'images.homedepot-static.com',
      },
      {
        nazwa: 'Kenwood, instrukcja obsługi maszyny do chleba BM200',
        opis: 'Kolejność wkładania, opóźniony start i wyjmowanie gorącej formy.',
        adres: 'dls.delonghigroup.com',
      },
    ],
  },
];

/** Wszystkie klucze słownika ekranu: wstęp, tematy, nazwy i opisy (do testu „nazwy źródeł tylko tutaj”). */
export function kluczeZrodelWiedzy(): string[] {
  return [ZRODLA_WIEDZY_WSTEP, ...ZRODLA_WIEDZY.flatMap((g) => [g.temat, ...g.zrodla.flatMap((z) => [z.nazwa, z.opis])])];
}
