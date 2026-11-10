# Recipe baking: temperature, time and vessel from the source (DEC-03 a, D-303) — EN
<!-- Role 06, fix M2 p2, 2026-11-09. Same headers and claims as docs/tresci/pl/pieczenie-receptur.md. Numbers for code and tests: docs/tresci/wektory/pieczenie-receptur-2026-11-09.json. -->

## pizza_napoletana_48h (bakeTempSteamC, bakeTempBrowningC, bakeTimeSteamMinutes, bakeTimeBrowningMinutes, recommendedVessel)
The pizza bakes at 260 °C for about 6 minutes on the steel. [T:PIE-PIZ-001]

## pizza_napoletana_48h.notesPl (added sentence)
Heat the steel at 260 °C for at least 30 minutes, and after 6 minutes of baking turn on the top broiler for 2–3 minutes; without a broiler, bake a few minutes longer. [T:PIE-PIZ-001]

## pot recipes: country_loaf_72, tartine_high_hydration_80, san_francisco_sourdough, pain_de_campagne, spelt_ancient_seeded, graham_bread_honey (bakeTempSteamC, bakeTempBrowningC, bakeTimeSteamMinutes, bakeTimeBrowningMinutes, recommendedVessel)
The loaf bakes in the pot at 232 °C: 20 minutes with the lid on, then 20–25 minutes with the lid off. [T:PIE-GAR-001]

## plan, step preheat_oven, pot recipes (namePl)
Heating the oven and the pot [T:-]

## plan, step preheat_oven, pot recipes (instructionsPl)
Put the pot in the oven and heat it for 45 minutes at 260 °C. [T:PIE-GAR-001]

## plan, step bake, pot recipes (instructionsPl; 20–25 = the recipe's bakeTimeBrowningMinutes)
Turn the loaf out onto baking paper and score it, holding the blade at about 30° to the surface of the dough. [T:PIE-GAR-001,DIA-NAC-001]
Using the paper, move the loaf into the pot, put the lid on and lower the temperature to 232 °C right away. [T:PIE-GAR-001]
Bake for 20 minutes with the lid on, then 20–25 minutes with the lid off, until the crust is deep golden brown. [T:PIE-GAR-001]

## phase lid_on (descriptionPl; numbers = the recipe's bakeTimeSteamMinutes and bakeTempSteamC)
Lid on: 20 minutes at 232 °C. [T:PIE-GAR-001]

## phase lid_on (tipPl)
Steam in the pot keeps the crust soft for longer, so the loaf can keep rising. [T:KRO-POC-013]

## phase lid_off (descriptionPl; numbers = the recipe's bakeTimeBrowningMinutes and bakeTempBrowningC)
Lid off: 20–25 minutes at 232 °C, until the crust is deep golden brown. [T:PIE-GAR-001]

## phase lid_off (tipPl)
The bread bakes without the lid until it is fully browned. [T:KRO-POC-014]

## phase lid_off (alertHeadlinePl) and the lid message on the Bench (DutchOvenController)
Take the lid off the pot and keep baking at the same temperature. [T:PIE-GAR-001]

## lievito_madre_panettone_brioche (bakeTempSteamC, bakeTempBrowningC, bakeTimeSteamMinutes, bakeTimeBrowningMinutes, recommendedVessel)
The brioche bakes in a loaf pan at 177 °C for 28–30 minutes, without steam. [T:PIE-BRI-001]

## plan, step preheat_oven, brioche in a loaf pan (namePl)
Heating the oven [T:-]

## plan, step preheat_oven, brioche in a loaf pan (instructionsPl)
Heat the oven to 204 °C, and before the loaf pan goes in, lower the temperature to 177 °C. [T:PIE-BRI-001]

## plan, step bake, brioche in a loaf pan (instructionsPl)
Brush the brioche with beaten egg and bake for 20 minutes, then turn the pan around and bake for another 8–10 minutes, until the brioche is golden brown. [T:PIE-BRI-001]
Take the brioche out of the pan onto a rack right away. [T:PIE-BRI-001]

<!-- durum_semolina_sourdough: data unchanged (250 °C, 0 + 60 min, steel; KAT-ALT-005); the baking sentence is already in notesPl (katalog-m3.md). -->

## plan, steps preheat_oven and bake, durum semolina bread on the steel (instructionsPl)
Heat the oven with the steel to 250 °C. [T:KAT-ALT-005]
Bake at 250 °C. [T:KAT-ALT-005]

<!-- M1-audytor-generalny-088 (06-tresci-601, option a): loaf pan and steel outside the D-304 vector: step without numbers, pointing to “About This Recipe”. -->

## plan, step preheat_oven, loaf pan and steel outside the D-304 vector (instructionsPl)
Heat the oven to the baking temperature given in “About This Recipe”. [T:-]

## plan, step bake, loaf pan and steel outside the D-304 vector (instructionsPl)
Bake at the temperature and for the time given in “About This Recipe”. [T:-]
