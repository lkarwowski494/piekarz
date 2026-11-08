/**
 * Słownik EN, część 28 (M3 p9b: wersje drożdżowe D-154/D-155). Treść wersji: docs/tresci/en/wersje-drozdzowe.md
 * i drozdze-plan-przelicznik.md (rola 06); teksty interfejsu do akceptacji roli 04. Pozostałe 33 języki: rola 09.
 */
export const EN_28: Record<string, string> = {
  'Plan dla tej receptury na drożdżach czeka na czasy etapów. Ilości i wskazówki są wyżej.':
    'The plan for the yeast version of this recipe is waiting for stage times. Amounts and tips are above.',
  // Przełącznik wersji na recepturze (SegmentWersji)
  'Wersja receptury': 'Recipe version',
  'na zakwasie|wersja receptury': 'sourdough',
  'na drożdżach|wersja receptury': 'with yeast',
  // Kroki planu wersji drożdżowej (src/core/yeast-stages.ts; DRO-MOD-016, docs/tresci/en/drozdze-plan-przelicznik.md)
  'Mieszanie i wyrabianie': 'Mixing and kneading',
  'Pierwsze rośnięcie': 'First rise',
  'Odgazowanie': 'Degassing',
  'Kształtowanie': 'Shaping',
  'Drugie rośnięcie': 'Second rise',
  'Czasy są wskazówką, bo tempo rośnięcia zależy od składników, siły ciasta, temperatury i wilgotności.':
    'Times are a guide, because the rise depends on the ingredients, dough strength, temperature and humidity.',
  'Ciasto jest gotowe, gdy wgłębienie po naciśnięciu palcem zostaje. Przed pieczeniem uformowane ciasto nie powinno więcej niż podwoić objętości.':
    'The dough is ready when a finger dent stays. Before baking, the shaped dough should not more than double in size.',
  // spelt_ancient_seeded (docs/tresci/en/wersje-drozdzowe.md)
  'Na drożdżach: 3% drożdży względem mąki (badanie nie podaje ich rodzaju, Piekarz liczy je jako świeże), a od zarobienia ciasta do wstawienia chleba do pieca mijają około 3 godziny w temperaturze pokojowej. Z nocą w lodówce: 1% drożdży, ciasto stoi 18 godzin w lodówce w 4 °C, a potem jeszcze 3 godziny w temperaturze pokojowej. Ilość drożdży i czasy pochodzą z badania chleba z pełnoziarnistej mąki orkiszowej. Czasy są wskazówką: gotowość ciasta ocenia się wyglądem i testem palca.':
    'With yeast: 3% yeast by flour weight (the study does not name the type; the app counts it as fresh), and about 3 hours at room temperature from mixing the dough to putting the bread in the oven. With a night in the fridge: 1% yeast, the dough rests 18 hours in the fridge at 4 °C, then another 3 hours at room temperature. The yeast amount and times come from a study of bread made with wholegrain spelt flour. Times are a guide: judge readiness by the look of the dough and the finger test.',
  // graham_bread_honey (docs/tresci/en/wersje-drozdzowe.md)
  'Na drożdżach: 2% drożdży świeżych względem mąki. W badaniu chleba z mąki pszennej razowej ciasto fermentowało 15 minut, po podziale jeszcze 15 minut, a w formie rosło 70 minut w komorze o temperaturze 32 °C. W chłodniejszym pomieszczeniu ciasto rośnie dłużej, więc gotowość ocenia się wyglądem i testem palca, nie czasem.':
    'With yeast: 2% fresh yeast by flour weight. In a study of wholemeal wheat bread, the dough fermented 15 minutes, another 15 minutes after dividing, and rose 70 minutes in the tin in a cabinet at 32 °C. In a cooler room the dough rises longer, so judge readiness by its look and the finger test, not the clock.',
  // rye_100_pan (docs/tresci/en/wersje-drozdzowe.md)
  'Na drożdżach, bez zakwasu: 3% drożdży (badanie nie podaje ich rodzaju, Piekarz liczy je jako świeże), 76% wody i 1,2% soli względem mąki. W badaniu ciasto odpoczywało 60 minut w 28 °C, a bochenki rosły w formie 60 minut w 37 °C w komorze garowniczej. Chleb pieczono 10 minut w 240 °C i 35 minut w 220 °C. W dniu wypieku chleby z pełnoziarnistej mąki żytniej były zbyt lepkie do oceny, dlatego badano je następnego dnia.':
    'With yeast, without sourdough: 3% yeast (the study does not name the type; the app counts it as fresh), 76% water and 1.2% salt by flour weight. In the study the dough rested 60 minutes at 28 °C, and the loaves rose in the tin 60 minutes at 37 °C in a proofing cabinet. The bread was baked 10 minutes at 240 °C and 35 minutes at 220 °C. On baking day the wholegrain rye breads were too sticky to assess, so they were tested the next day.',
  // tartine_high_hydration_80 (docs/tresci/en/wersje-drozdzowe.md)
  'Na drożdżach, według jednego przepisu na chleb bez wyrabiania o podobnej ilości wody: 1 łyżeczka drożdży instant, czyli według przelicznika Piekarza około 1,7% drożdży świeżych względem mąki. Ciasto stoi w temperaturze pokojowej przez noc, co najmniej 8 godzin, a uformowany bochenek rośnie potem około 90 minut.':
    'With yeast, following one recipe for a no-knead bread with a similar amount of water: 1 teaspoon of instant yeast, which by the app\'s conversion is about 1.7% fresh yeast by flour weight. The dough rests at room temperature overnight, at least 8 hours, and the shaped loaf then rises about 90 minutes.',
};
