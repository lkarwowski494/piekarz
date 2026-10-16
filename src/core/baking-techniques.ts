// ============================================================================
// Piekarz (Crust) — Artisan Baking Techniques Library (Z-091…098 / BIB)
// 12 technique cards with physical principles, step-by-step cues, and pitfalls.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

export type TechniqueCategory =
  | 'dough_prep'
  | 'bulk_fermentation'
  | 'shaping'
  | 'proofing'
  | 'baking_cooling';

export interface TechniqueCard {
  id: string;
  code: string; // e.g. BIB-01
  category: TechniqueCategory;
  titlePl: string;
  titleEn: string;
  icon: string;
  physicalPrinciplePl: string;
  physicalPrincipleEn: string;
  executionStepsPl: string[];
  executionStepsEn: string[];
  commonMistakesPl: string[];
  commonMistakesEn: string[];
  proTipsPl: string;
  proTipsEn: string;
}

export const BAKING_TECHNIQUES: TechniqueCard[] = [
  {
    id: 'bib_01_autolyse',
    code: 'BIB-01',
    category: 'dough_prep',
    titlePl: 'Autoliza i Fermentoliza',
    titleEn: 'Autolyse & Fermentolyse',
    icon: '🥣',
    physicalPrinciplePl: 'Spontaniczne rozwinięcie łańcuchów glutenu bez wysiłku mechanicznego; proteazy rozluźniają wiązania, a cząsteczki skrobi w pełni absorbują wodę.',
    physicalPrincipleEn: 'Spontaneous gluten formation without physical kneading; proteases relax bonds while starch granules fully hydrate.',
    executionStepsPl: [
      'Zmieszaj całą mąkę z receptury z 90–95% przewidzianej wody, aż nie będzie suchych grudek.',
      'NIE dodawaj soli na tym etapie — sól działa higroskopijnie, wyciąga wodę i hamuje działanie enzymów.',
      'Odstaw miskę pod przykryciem na 30–90 minut w temperaturze 22–26°C.',
      'Dla mąk pełnoziarnistych (graham, razowa) wydłuż autolizę do 60–90 minut.',
      'Fermentoliza: polega na dodaniu zakwasu od razu do mąki i wody (z pominięciem soli), skracając późniejszy czas mieszania.',
    ],
    executionStepsEn: [
      'Mix all formula flour with 90–95% recipe water until no dry pockets remain.',
      'Do NOT add salt now — salt is hygroscopic, tightens gluten and inhibits enzymatic hydration.',
      'Cover and rest for 30–90 minutes at 22–26°C ambient temperature.',
      'For whole grain flours (graham, whole wheat), extend autolyse to 60–90 minutes.',
      'Fermentolyse: includes active starter together with flour and water (leaving only salt for later).',
    ],
    commonMistakesPl: [
      'Dodanie soli na początku autolizy (drastycznie wydłuża czas hydratacji białek).',
      'Zbyt długa autoliza (>2h w cieple), która prowadzi do nadmiernego rozpadu siatki glutenowej przez proteazy.',
    ],
    commonMistakesEn: [
      'Adding salt at the beginning (delays protein hydration and enzyme activity).',
      'Extending autolyse beyond 2h in warm room, causing excessive enzymatic gluten breakdown.',
    ],
    proTipsPl: 'Po prawidłowej autolizie ciasto z szorstkiej grudkowatej masy staje się gładkie i rozciągliwe jeszcze przed właściwym wyrabianiem!',
    proTipsEn: 'Proper autolyse transforms rough shaggy dough into a smooth, extensible mass before any kneading begins!',
  },
  {
    id: 'bib_02_stretch_and_fold',
    code: 'BIB-02',
    category: 'bulk_fermentation',
    titlePl: 'Składanie rozciągane (Stretch & Fold)',
    titleEn: 'Stretch & Fold Technique',
    icon: '🖐️',
    physicalPrinciplePl: 'Równoległe ukierunkowanie nici glutenowych oraz równomierne rozprowadzenie temperatury i drożdży w objętości ciasta.',
    physicalPrincipleEn: 'Aligns gluten strands along tension lines and equalizes internal temperature and yeast distribution.',
    executionStepsPl: [
      'Zwilż dłonie wodą (nie podsypuj mąką — dodatkowa mąka obniżyłaby faktyczną hydratację ciasta).',
      'Chwyć ciasto od spodu po stronie północnej (góra miski) i unieś delikatnie w górę, rozciągając je bez rwania.',
      'Załóż wyciągnięty płat przez wierzch na przeciwną stronę ciasta.',
      'Obróć misę o 90° i powtórz czynność ze strony wschodniej, południowej i zachodniej (łącznie 4 naciągnięcia).',
      'Odstaw ciasto pod przykryciem na 30–45 minut do kolejnego cyklu.',
    ],
    executionStepsEn: [
      'Wet hands with water (never flour — adding raw flour skews true dough hydration).',
      'Slip hands under north side of dough, lift upwards stretching gently without tearing.',
      'Fold extended flap over the top toward the opposite side.',
      'Rotate bowl 90 degrees and repeat on east, south, and west quadrants (4 folds total).',
      'Cover and rest for 30–45 minutes before the next interval.',
    ],
    commonMistakesPl: [
      'Szarpnięcie i rozerwanie siatki glutenowej zamiast płynnego rozciągania.',
      'Używanie mąki na dłoniach, która tworzy wewnątrz ciasta niepożądane suche smugi.',
    ],
    commonMistakesEn: [
      'Aggressive yanking that tears gluten strands instead of smooth elongation.',
      'Flouring hands which incorporates unhydrated dry flour streaks into crumb.',
    ],
    proTipsPl: 'Dla ciast o średniej hydratacji (65–72%) wystarczą 3–4 serie składań w pierwszych 2 godzinach fermentacji burzliwej.',
    proTipsEn: 'For moderate hydration (65–72%), 3–4 fold cycles during the first 2 hours are sufficient.',
  },
  {
    id: 'bib_03_coil_fold',
    code: 'BIB-03',
    category: 'bulk_fermentation',
    titlePl: 'Składanie zwojowe (Coil Fold)',
    titleEn: 'Coil Fold Technique',
    icon: '🌀',
    physicalPrinciplePl: 'Wzmacnianie delikatnej struktury w luźnych ciastach wysokiej hydratacji (>75%) z wykorzystaniem grawitacji, bez miażdżenia pęcherzyków gazu.',
    physicalPrincipleEn: 'Strengthens wet dough (>75% hydration) using gravity while protecting delicate fermentation gas bubbles.',
    executionStepsPl: [
      'Umieść ciasto w prostokątnym, płaskim pojemniku (np. szklanym naczyniu żaroodpornym).',
      'Zwilż obie dłonie wodą i wsuń palce pod środek ciasta z obu stron.',
      'Unieś ciasto pionowo w górę — oba końce swobodnie opadną i podwiną się pod spód ciasta.',
      'Opuść ciasto delikatnie na dno naczynia.',
      'Obróć pojemnik o 90° i powtórz uniesienie w osi poprzecznej.',
    ],
    executionStepsEn: [
      'Keep dough in a flat rectangular dish (e.g. glass pyrex container).',
      'Moisten fingers with water and slide hands under the dough center from both sides.',
      'Lift vertically — let both loose ends fold under by natural gravity.',
      'Gently lower the coiled dough back onto the container base.',
      'Rotate dish 90 degrees and repeat in the transverse direction.',
    ],
    commonMistakesPl: [
      'Zbyt gwałtowne pociągnięcie, które wyciska nagromadzony dwutlenek węgla.',
      'Wykonywanie składania w wąskiej, głębokiej misce (wymaga płaskiego pojemnika).',
    ],
    commonMistakesEn: [
      'Rushing the lift and expelling trapped carbon dioxide.',
      'Attempting coil folds in a deep narrow bowl instead of a wide flat pan.',
    ],
    proTipsPl: 'Z każdym kolejnym coil foldem poczujesz, jak ciasto staje się coraz bardziej zwarte, poduszkowe i samoistnie trzyma kształt.',
    proTipsEn: 'With each coil fold you will feel the dough become pillow-like, holding height independently.',
  },
  {
    id: 'bib_04_slap_and_fold',
    code: 'BIB-04',
    category: 'dough_prep',
    titlePl: 'Wyrabianie francuskie (Slap & Fold / Bertinet)',
    titleEn: 'French Kneading (Slap & Fold)',
    icon: '⚡',
    physicalPrinciplePl: 'Szybkie wprowadzenie powietrza i energii kinetycznej do bardzo kleistego ciasta na samym początku mieszania.',
    physicalPrincipleEn: 'Rapidly aerates and introduces mechanical energy into high-hydration sticky dough at the mixing onset.',
    executionStepsPl: [
      'Wyłóż lepkie ciasto na czysty, nienatłuszczony i nieoprószony blat.',
      'Wsuń palce obu dłoni pod boki ciasta, kciukami obejmując wierzch.',
      'Unieś ciasto, energicznie uderz dolną częścią o blat (slap), rozciągnij w przód i zawiń przez wierzch na siebie (fold).',
      'Obróć o 90°, ponownie podchwyć i powtarzaj płynny rytm przez 3–5 minut.',
      'W trakcie wyrabiania ciasto magicznie przestanie kleić się do rąk i blatu, zamieniając się w lśniącą kulę.',
    ],
    executionStepsEn: [
      'Transfer sticky dough onto an ungreased, unfloured kitchen worktop.',
      'Slide fingers under dough flanks with thumbs resting on top.',
      'Lift, slap the hanging base onto the worktop, stretch forward and fold over itself.',
      'Rotate 90 degrees and repeat in a continuous fluid rhythm for 3–5 minutes.',
      'The dough will magically release from counter and hands, turning into a glossy ball.',
    ],
    commonMistakesPl: [
      'Podsypywanie blatu mąką podczas wyrabiania (blokuje przywieranie ciasta potrzebne do rozciągania).',
      'Zbyt wolne, niepewne ruchy powodujące przyklejanie się ciasta do dłoni.',
    ],
    commonMistakesEn: [
      'Dusting worktop with flour (prevents the friction adhesion necessary to stretch).',
      'Hesitant, slow movements causing dough to stick to warm hands.',
    ],
    proTipsPl: 'Kluczem jest pewność i prędkość — gluten buduje się dzięki energii kinetycznej uderzenia o blat.',
    proTipsEn: 'Speed and confidence are key — kinetic impact drives rapid gluten network entanglement.',
  },
  {
    id: 'bib_05_lamination',
    code: 'BIB-05',
    category: 'bulk_fermentation',
    titlePl: 'Laminacja ciasta i dodatki',
    titleEn: 'Dough Lamination & Inclusions',
    icon: '✨',
    physicalPrinciplePl: 'Ekstremalne rozciągnięcie siatki glutenowej w przezroczystą błonę w celu równomiernego ułożenia nasion, ziół lub sera.',
    physicalPrincipleEn: 'Stretching the gluten matrix into a thin translucent sheet to evenly disperse seeds, herbs, or cheese inclusions.',
    executionStepsPl: [
      'Zwilż blat kuchenny mgiełką wody (woda zapobiega przywieraniu ciasta lepiej niż mąka).',
      'Wyłóż ciasto po 2. lub 3. składaniu na blat.',
      'Delikatnie chwytaj krawędzie ciasta od spodu i rozciągaj je we wszystkie strony, tworząc prostokąt o grubości 2–3 mm.',
      'Rozsyp równomiernie ulubione dodatki (prażony słonecznik, rozmaryn, ser cheddar, suszone pomidory).',
      'Złóż ciasto w 1/3 jak list biznesowy od lewej i prawej strony, posyp kolejną warstwę dodatków i zroluj od góry do dołu.',
      'Przełóż z powrotem do pojemnika na dokończenie fermentacji burzliwej.',
    ],
    executionStepsEn: [
      'Mist kitchen worktop lightly with water (water prevents stickiness better than flour).',
      'Transfer dough after 2nd or 3rd fold onto moistened surface.',
      'Gently slide hands under edges and pull outward into a 2–3 mm thin rectangular sheet.',
      'Scatter inclusions evenly across the entire surface (toasted seeds, cheese, rosemary).',
      'Fold in thirds like a letter, dust more inclusions, and roll tightly from top to bottom.',
      'Return to proofing tub to conclude bulk fermentation.',
    ],
    commonMistakesPl: [
      'Dodawanie mokrych dodatków (np. oliwek) bez uprzedniego odsączenia (rozbija strukturę ciasta).',
      'Zbyt wczesna laminacja, zanim gluten osiągnie odpowiednią elastyczność.',
    ],
    commonMistakesEn: [
      'Adding wet inclusions (e.g. un-drained olives) that dilute and tear local gluten.',
      'Laminating too early before gluten has developed sufficient tensile elasticity.',
    ],
    proTipsPl: 'Laminacja pozwala na wprowadzenie nawet do 25% wagi dodatków bez niszczenia napowietrzenia miękiszu.',
    proTipsEn: 'Lamination allows introducing up to 25% inclusion weight without compromising crumb open-ness.',
  },
  {
    id: 'bib_06_preshaping',
    code: 'BIB-06',
    category: 'shaping',
    titlePl: 'Formowanie wstępne (Pre-shape) i Bench Rest',
    titleEn: 'Pre-shaping & Bench Rest',
    icon: '⏳',
    physicalPrinciplePl: 'Uporządkowanie struktury ciasta w symetryczną kulę i krótki relaks glutenu przed ostatecznym naciągiem.',
    physicalPrincipleEn: 'Aligns dough mass into a symmetric sphere and allows gluten relaxation before final tensioning.',
    executionStepsPl: [
      'Wysyp ciasto na lekko oprószony blat za pomocą zaokrąglonej skrobki.',
      'Za pomocą skrobki i oprószonej dłoni podciągaj ciasto ku sobie, formując gładką kulę.',
      'Pozostaw ciasto na blacie na 15–25 minut (Bench Rest) bez przykrycia (przy dużej wilgotności) lub pod ściereczką.',
      'W tym czasie na powierzchni ciasta powstanie cieniutka skórka ułatwiająca ostateczne formowanie.',
    ],
    executionStepsEn: [
      'Tip dough onto lightly floured worktop using a flexible curved bowl scraper.',
      'Use bench knife and cupped hand to drag dough toward yourself, forming a smooth ball.',
      'Rest on worktop for 15–25 minutes (bench rest) covered with a linen cloth.',
      'During this rest, the surface forms a micro-skin that stabilizes final shaping tension.',
    ],
    commonMistakesPl: [
      'Pominięcie bench restu — gluten jest zbyt napięty i rwie się przy ostatecznym formowaniu.',
      'Zbyt mocne naciągnięcie na etapie wstępnym.',
    ],
    commonMistakesEn: [
      'Skipping bench rest — gluten remains tense and snaps when final shaping is attempted.',
      'Over-tensioning during pre-shape.',
    ],
    proTipsPl: 'Jeśli po 20 minutach ciasto rozlało się jak kałuża, jego gluten jest słaby — formuj ciaśniej. Jeśli stoi w pionie, jest gotowe do formowania batarda.',
    proTipsEn: 'If dough flattens into a puddle after 20 min, gluten is weak — shape tighter. If it holds dome shape, it is ready for batard.',
  },
  {
    id: 'bib_07_batard_shaping',
    code: 'BIB-07',
    category: 'shaping',
    titlePl: 'Formowanie bochenka podłużnego (Batard)',
    titleEn: 'Batard Shaping (Oval Loaf)',
    icon: '🥖',
    physicalPrinciplePl: 'Wytworzenie silnego napięcia powierzchniowego (Surface Tension) zapobiegającego rozlewaniu się bochenka na boki w piecu.',
    physicalPrincipleEn: 'Builds longitudinal skin surface tension, preventing lateral spreading and driving explosive upward oven spring.',
    executionStepsPl: [
      'Oprósz wierzch ciasta mąką, odwróć skrobką na drugą stronę (strona gładka dotyka blatu).',
      'Rozklep delikatnie dłońmi na kształt prostokąta/trapezu.',
      'Złóż dolną 1/3 do góry, a boki zawiń do środka jak kopertę.',
      'Chwyć górną krawędź kciukami i zroluj ciasno w dół ku sobie, dociskając kciukami szew.',
      'Za pomocą krawędzi dłoni przeciągaj batard po blacie, wzmacniając naciąg wzdłużny.',
      'Przełóż szwem do góry do podłużnego koszyka (bannetona) oprószonego mąką ryżową.',
    ],
    executionStepsEn: [
      'Lightly dust dough top, flip over with bench knife so smooth side contacts counter.',
      'Gently pat into a soft rectangle/trapezoid.',
      'Fold bottom third up, and fold left and right flanks inward like an envelope.',
      'Grab top edge with thumbs and roll down tightly toward yourself, tucking and sealing the seam.',
      'Cup hands around the loaf and drag gently across the worktop to seal the bottom seam.',
      'Transfer seam-side up into an oblong banneton dusted with rice flour.',
    ],
    commonMistakesPl: [
      'Zbyt luźne zwinięcie bochenka (chleb rozleje się na boki po wyjęciu z koszyka).',
      'Za dużo mąki na blacie (ciasto ślizga się i nie da się wytworzyć oporu i naciągu).',
    ],
    commonMistakesEn: [
      'Loose rolling (causes loaf to pancake laterally when un-molded from basket).',
      'Excessive bench flour (causes dough to slip without building friction grip).',
    ],
    proTipsPl: 'Dociąganie kciukami przy każdym obrocie tworzy wewnętrzny spiralny szkielet trzymający chleb w pionie.',
    proTipsEn: 'Tucking with thumbs on each downward roll creates an internal spiral spine that props the loaf upright.',
  },
  {
    id: 'bib_08_boule_shaping',
    code: 'BIB-08',
    category: 'shaping',
    titlePl: 'Formowanie bochenka okrągłego (Boule)',
    titleEn: 'Boule Shaping (Round Loaf)',
    icon: '🌕',
    physicalPrinciplePl: 'Równomierne centryczne naprężenie sfery ciasta do wypieku w garnku żeliwnym lub koszyku okrągłym.',
    physicalPrincipleEn: 'Builds radial centric tension across the spherical dough envelope for round Dutch ovens.',
    executionStepsPl: [
      'Rozłóż kęs ciasta gładką stroną do dołu na lekko oprószonym blacie.',
      'Zbierz krawędzie z 8 stron do środka jak sakiewkę i sklej palcami w centralnym punkcie.',
      'Odwróć bochenek gładką stroną do góry (szew dotyka blatu).',
      'Ułóż dłonie wokół ciasta w kształt litery V i obracając kulę, przyciągaj ją ku sobie po blacie.',
      'Opór blatu naciąga zewnętrzną membranę w idealnie gładką, napiętą kopułę.',
      'Przełóż szwem do góry do okrągłego koszyka rozrostowego.',
    ],
    executionStepsEn: [
      'Lay dough smooth-side down on lightly dusted counter.',
      'Gather edges from 8 perimeter points into the center like a pouch, pinching firmly.',
      'Flip ball over so the smooth skin faces up and seam touches the bench.',
      'Cup hands around the back in an inverted V-shape and rotate-drag the ball toward yourself.',
      'Friction against the worktop stretches the outer mantle into a taut hemisphere.',
      'Invert seam-up into a round banneton.',
    ],
    commonMistakesPl: [
      'Rwanie skórki przez zbyt agresywne obracanie na suchym blacie.',
      'Nieszczelne sklejenie szwu, przez co chleb pęka od spodu w piecu.',
    ],
    commonMistakesEn: [
      'Ripping the mantle by over-dragging against a dry surface.',
      'Incompletely sealed bottom seam, causing blowout through the base.',
    ],
    proTipsPl: 'Prawidłowo uformowana kula po dotknięciu lekko drży jak napompowana piłka.',
    proTipsEn: 'A properly shaped boule vibrates with elastic resonance when tapped gently.',
  },
  {
    id: 'bib_09_banneton_prep',
    code: 'BIB-09',
    category: 'proofing',
    titlePl: 'Przygotowanie koszyka rozrostowego (Banneton)',
    titleEn: 'Banneton Preparation & Care',
    icon: '🧺',
    physicalPrinciplePl: 'Odprowadzenie wilgoci z powierzchni ciasta i zapobieganie przywieraniu do formy z rattanu lub pulpy drzewnej.',
    physicalPrincipleEn: 'Wicks moisture from dough skin during retard, creating a dry micro-crust that ensures clean un-molding.',
    executionStepsPl: [
      'Do oprószania koszyka używaj WYŁĄCZNIE mąki bezglutenowej: mąki ryżowej lub skrobi ziemniaczanej (50/50 z mąką pszenną).',
      'Brak glutenu w mące ryżowej sprawia, że w kontakcie z wilgocią ciasta nie tworzy kleju!',
      'Rozprowadź mąkę dłonią dokładnie w rowkach wikliny koszyka.',
      'Po wypieku wysusz koszyk w stygnącym piekarniku (max 50°C) i wyczyść suchą szczoteczką z twardym włosiem.',
      'NIGDY nie myj koszyka rattanowego wodą z płynem do naczyń — sprzyja to rozwojowi pleśni.',
    ],
    executionStepsEn: [
      'Dust banneton EXCLUSIVELY with non-gluten flour: white rice flour or potato starch (or a 50/50 blend).',
      'Rice flour has zero gluten, meaning it never forms paste when contacting moist dough!',
      'Rub flour thoroughly into all rattan coil crevices.',
      'Post-bake, dry banneton in the warm residual oven (under 50°C) and brush out dry with a stiff bristle brush.',
      'NEVER wash a cane banneton with soap and water — moisture induces mold.',
    ],
    commonMistakesPl: [
      'Użycie zwykłej mąki pszennej do oprószenia koszyka (ciasto przywiera i rwie się przy wyjmowaniu!).',
      'Zamykanie wilgotnego koszyka w szczelnej szafce.',
    ],
    commonMistakesEn: [
      'Using standard wheat flour in banneton (dough welds to the cane and tears upon release!).',
      'Storing damp bannetons in enclosed cupboards.',
    ],
    proTipsPl: 'Połączenie mąki ryżowej i zimnego ciasta z lodówki gwarantuje, że bochenek sam wyskoczy na papier do pieczenia w ułamku sekundy.',
    proTipsEn: 'Rice flour combined with chilled dough ensures effortless, zero-stick release in a split second.',
  },
  {
    id: 'bib_10_scoring_ear',
    code: 'BIB-10',
    category: 'baking_cooling',
    titlePl: 'Nacinanie żyletką pod „ucho” (Scoring for Ear)',
    titleEn: 'Scoring Angle for Ear Creation',
    icon: '🔪',
    physicalPrinciplePl: 'Asymetryczne nacięcie pod ostrym kątem 30° tworzy płat skórki, który pod wpływem ciśnienia pary unosi się i tworzy chrupiące ucho.',
    physicalPrincipleEn: 'An acute 30-degree cut creates an asymmetrical dough flap that peels upward as steam expands, forging a jagged ear.',
    executionStepsPl: [
      'Użyj świeżej, ostrej żyletki zamocowanej na zakrzywionej rękojeści (kulawce / lame).',
      'Nacinaj ciasto natychmiast po wyjęciu z lodówki — schłodzone ciasto jest sztywne i nie ciągnie się za ostrzem.',
      'Trzymaj żyletkę pod kątem ostrym ok. 30° względem powierzchni chleba (nie pionowo pod kątem 90°!).',
      'Wykonaj jedno pewne, płynne cięcie wzdłuż osi bochenka na głębokość 8–10 mm, lekko przesunięte od środka ku krawędzi.',
      'Nie poprawiaj cięcia ani nie piłuj ostrzem — jedno pociągnięcie daje najczystsze otwarcie.',
    ],
    executionStepsEn: [
      'Use a fresh surgical razor blade mounted on a curved lame handle.',
      'Score immediately after removing dough from 4°C fridge — firm skin cuts cleanly without dragging.',
      'Hold blade at an acute ~30° angle relative to the loaf surface (never perpendicular 90°!).',
      'Cut in one decisive, swift stroke along the longitudinal axis, 8–10 mm deep, slightly off-center.',
      'Do not saw back and forth — a single confident stroke delivers the cleanest opening.',
    ],
    commonMistakesPl: [
      'Nacinanie pod kątem prostym 90° (daje symetryczne pęknięcie, ale zero uniesionego ucha).',
      'Tępe ostrze lub zbyt wolny ruch szarpiący ciasto.',
    ],
    commonMistakesEn: [
      'Scoring at 90 degrees (results in a round crater with no raised ear).',
      'Using a dull blade or hesitating, which drags dough.',
    ],
    proTipsPl: 'Krzywa żyletka automatycznie podcina ciasto pod spód, tworząc idealny daszek pod spektakularne ucho rzemieślnicze.',
    proTipsEn: 'A curved lame naturally slips underneath, creating the ideal undercut flap for a dramatic artisan ear.',
  },
  {
    id: 'bib_11_dutch_oven',
    code: 'BIB-11',
    category: 'baking_cooling',
    titlePl: 'Wypiek w garnku żeliwnym (Dutch Oven)',
    titleEn: 'Dutch Oven Two-Phase Baking',
    icon: '🥘',
    physicalPrinciplePl: 'Zamknięta przestrzeń naczynia zatrzymuje parę parującą z samego ciasta (100% wilgotności), opóźniając twardnienie skórki i umożliwiając maksymalny Oven Spring.',
    physicalPrincipleEn: 'Traps self-generated dough steam at 100% relative humidity, delaying crust starch setting for maximum oven spring expansion.',
    executionStepsPl: [
      'Rozgrzewaj garnek żeliwny z pokrywką w piekarniku w temperaturze 240–250°C przez 45–60 minut.',
      'Ostrożnie wyjmij gorący garnek (zawsze w rękawicach żaroodpornych!) i zdejmij pokrywkę.',
      'Przełóż nacięte ciasto na papierze do pieczenia na dno garnka.',
      'FAZA 1 (PAROWA): Zamknij szczelnie pokrywkę i piecz 20 minut w 230–240°C. Para sprawia, że bochenek gwałtownie rośnie, a cięcie otwiera się w ucho.',
      'FAZA 2 (RUMIENIENIE): Zdejmij pokrywkę, zmniejsz temperaturę do 200–210°C i dopiekaj 20–25 minut do uzyskania głębokiego koloru mahoniowego.',
    ],
    executionStepsEn: [
      'Preheat cast-iron Dutch oven with lid inside oven at 240–250°C for 45–60 minutes.',
      'Carefully retrieve the scorching pot (always wearing heat-resistant gloves!) and take off lid.',
      'Lower the scored dough on parchment paper directly into the pot base.',
      'PHASE 1 (STEAM): Seal lid tight and bake 20 minutes at 230–240°C. Trapped steam drives explosive spring and gelatinizes outer crust.',
      'PHASE 2 (BROWNING): Remove lid, lower heat to 200–210°C, and bake 20–25 minutes until deep mahogany caramelization forms.',
    ],
    commonMistakesPl: [
      'Włożenie ciasta do niedostatecznie nagrzanego garnka (dolna skórka będzie blada i gruba).',
      'Pieczenie bez pokrywki od początku (skórka twardnieje przedwcześnie, blokując rozrost bochenka).',
    ],
    commonMistakesEn: [
      'Loading dough into an underheated pot (produces a pale, rubbery bottom).',
      'Baking uncovered from start (crust sets prematurely, trapping interior gas).',
    ],
    proTipsPl: 'Wrzuć 2 kostki lodu pod papier do pieczenia tuż przed nałożeniem pokrywki, by uzyskać dodatkowy zastrzyk pary i lśniącą skórkę w drobne bąbelki.',
    proTipsEn: 'Toss 2 ice cubes under the parchment just before lidding for an extra steam blast that produces micro-blisters.',
  },
  {
    id: 'bib_12_cooling_wire_rack',
    code: 'BIB-12',
    category: 'baking_cooling',
    titlePl: 'Studzenie na kratce i zakaz wczesnego krojenia',
    titleEn: 'Wire Rack Cooling & Slicing Discipline',
    icon: '❄️',
    physicalPrinciplePl: 'Wypiek kończy się dopiero po ostygnięciu bochenka; woda odparowuje przez pory, a skrobia przechodzi proces retrogradacji, stabilizując miękisz.',
    physicalPrincipleEn: 'Baking concludes only when cooled; steam diffuses through pores while starch undergoes retrogradation to set crumb architecture.',
    executionStepsPl: [
      'Po wyjęciu z pieca natychmiast przełóż chleb z garnka na uniesioną metalową kratkę.',
      'Zapewnij swobodny przepływ powietrza od spodu bochenka (chleb pozostawiony na blacie lub desce zaparzy się i namoknie od spodu!).',
      'Posłuchaj chleba: w pierwszych minutach usłyszysz charakterystyczne „śpiewanie” (trzaskanie pękającej cieniutkiej skórki).',
      'Dla chlebów pszennych: odczekaj MINIMUM 2 godziny przed pierwszym krojeniem.',
      'Dla chlebów żytnich (100% żyto): odczekaj MINIMUM 12–24 godziny! Gorące żyto po ukrojeniu ma postać lepkiej mazi.',
    ],
    executionStepsEn: [
      'Immediately transfer hot loaf onto an elevated wire rack post-bake.',
      'Ensure free airflow beneath the loaf (leaving bread on solid board causes trapped steam to turn base soggy).',
      'Listen closely: within the first 10 minutes you will hear the bread "sing" as the micro-crust crackles.',
      'For wheat sourdough: wait at LEAST 2 hours before the first cut.',
      'For 100% rye loaves: wait at LEAST 12–24 hours! Warm rye sliced prematurely resembles raw paste.',
    ],
    commonMistakesPl: [
      'Krojenie gorącego chleba prosto z pieca — nóż miażdży niestabilną siatkę skrobi, tworząc trwały zakalec na ostrzu.',
      'Zawijanie ciepłego chleba w folię lub ściereczkę.',
    ],
    commonMistakesEn: [
      'Slicing steaming hot bread — the knife crushes un-set starch gels, causing instant gumminess.',
      'Wrapping warm loaves in plastic or damp cloths.',
    ],
    proTipsPl: 'Cierpliwość to ostatni składnik dobrego chleba: miękisz tnie się czysto bez brudzenia noża tylko wtedy, gdy temperatura spadnie do pokojowej.',
    proTipsEn: 'Patience is the final ingredient: crumb slices cleanly without gumming the knife only once fully at ambient temperature.',
  },
];

/**
 * Returns all baking techniques.
 */
export function getBakingTechniques(): TechniqueCard[] {
  return BAKING_TECHNIQUES;
}

/**
 * Filter techniques by category.
 */
export function filterTechniques(
  category: TechniqueCategory | 'all'
): TechniqueCard[] {
  if (category === 'all') return BAKING_TECHNIQUES;
  return BAKING_TECHNIQUES.filter((t) => t.category === category);
}

/**
 * Search techniques by query string.
 */
export function searchTechniques(query: string): TechniqueCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return BAKING_TECHNIQUES;

  return BAKING_TECHNIQUES.filter((t) => {
    return (
      t.titlePl.toLowerCase().includes(q) ||
      t.titleEn.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.physicalPrinciplePl.toLowerCase().includes(q) ||
      t.physicalPrincipleEn.toLowerCase().includes(q)
    );
  });
}
