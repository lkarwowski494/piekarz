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
    ],
  },
];

/** Wszystkie klucze słownika ekranu: wstęp, tematy, nazwy i opisy (do testu „nazwy źródeł tylko tutaj”). */
export function kluczeZrodelWiedzy(): string[] {
  return [ZRODLA_WIEDZY_WSTEP, ...ZRODLA_WIEDZY.flatMap((g) => [g.temat, ...g.zrodla.flatMap((z) => [z.nazwa, z.opis])])];
}
