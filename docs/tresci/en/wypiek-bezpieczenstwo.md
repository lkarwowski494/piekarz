# Bake mode: safety warnings in steps (RD-22, RD-23) — EN
<!-- M1-audytor-generalny-086. EN values for the PL keys (src/lib/i18n-en/), same headings as the PL file. Role 08 implements the text verbatim (without the [T:...] marker). Critical content: awaiting human review. Back-translation EN→PL is in the role 06 report (wynik.md, partia 4). -->

## lid removal step: baking-phases.ts lid_off (new warning field) and the steam-gate-alert banner in DutchOvenController.tsx (RD-23-W1)
Wear dry oven mitts and lift the lid away from you, because hot steam escapes from under it. [T:BEZ-OPA-001,BEZ-OPA-002,BEZ-OPA-003]

## dough mixing step: reverse-scheduler.ts mix and rye-stages.ts rye_mix (added to the instructions, RD-22-W1)
Do not taste raw dough or flour. [T:BEZ-SUR-001]
After handling dough, wash your hands with soap under running water. [T:BEZ-SUR-002]
