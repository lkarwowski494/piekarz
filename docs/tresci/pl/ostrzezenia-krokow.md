# Prowadzenie wypieku: ostrzeżenia według rodzaju kroku (F-57, BR-ETAP-004, RD-22, RD-23) — PL
<!-- M1-audytor-generalny-103. Treść krytyczna: czeka na przegląd człowieka (docs/tresci/przeglad/ostrzezenia-krokow.md); do tego czasu M2 nie wdraża nowych zdań tego pliku. Rola 08 wdraża tekst dosłownie (bez znacznika [T:...]) jako osobne ostrzeżenie, wyróżnione według systemu roli 04. -->
<!-- Mapa rodzaj kroku → ostrzeżenie (klucze z kodu: StageCategory w src/scheduler/reverse-scheduler.ts, fazy w src/core/baking-phases.ts, id etapów w src/core/rye-stages.ts):
  starter_feed, rye_starter, każde dokarmienie przy zakładaniu zakwasu i przy budzeniu z lodówki → sekcja „zakwas”;
  mix, rye_mix → bez zmian: wypiek-bezpieczenstwo.md, „krok mieszania ciasta” (przejrzane 2026-10-20);
  autolyse, bulk_ferment, pre_shape, final_shape, rye_shape → te same dwa zdania co mix (wypiek-bezpieczenstwo.md, „krok mieszania ciasta”), bez nowego tekstu;
  lid_off → bez zmian: wypiek-bezpieczenstwo.md, „krok zdjęcia pokrywki” (przejrzane 2026-10-20);
  preheat_oven, bake, lid_on, rye_bake → sekcje „gorące naczynie” i „dzieci”;
  cool, rye_cool → sekcja „gorące naczynie” (wyjęcie z pieca; ostrzeżenia o surowym cieście brak, RD-22-W3);
  bench_rest, final_proof, rye_rest, rye_proof → brak ostrzeżenia (krok bez pracy z ciastem i bez gorącego naczynia; ER-06-103-a dla roli 01);
  krok nieznanego rodzaju → sekcja „nieznany rodzaj” (RD-22-W4), a gdy trwa w czasie wypieku, także „gorące naczynie” (RD-23-W4). -->

## zakwas: starter_feed, rye_starter, dokarmianie i zakładanie zakwasu (RD-22-W2)
Nie próbuj surowego zakwasu ani mąki. [T:ZAK-SUR-001,BEZ-SUR-001]
Po pracy z mąką i zakwasem umyj ręce mydłem pod bieżącą wodą. [T:BEZ-SUR-002]

## gorące naczynie: preheat_oven, bake, lid_on, rye_bake, cool, rye_cool (RD-23-W2, RD-23-W4)
Gorący garnek, pokrywkę i formę chwytaj suchymi rękawicami kuchennymi albo łapkami. [T:BEZ-OPA-004,BEZ-OPA-003]

## dzieci: preheat_oven, bake, lid_on, rye_bake (RD-23-W2)
Dzieci trzymaj z dala od kuchenki i miejsca, w którym pracujesz. [T:BEZ-OPA-005]

## nieznany rodzaj: krok bez rodzaju z własnej receptury (RD-22-W4)
Jeśli w tym kroku pracujesz z surową mąką, ciastem albo zakwasem, nie próbuj ich, a potem umyj ręce mydłem pod bieżącą wodą. [T:BEZ-SUR-001,ZAK-SUR-001,BEZ-SUR-002]
