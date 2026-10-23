# Doktor Chleba: przyczyny i kroki naprawcze (src/doctor/diagnostics.ts) — PL
<!-- M1-audytor-generalny-133 (06-tresci-504). Nagłówek = pole w kodzie; zdanie = osobna linia, pole ze zdaniami w kolejności linii. Rola 08 wdraża tekst dosłownie (bez znacznika [T:...]). Tryb imperialny przelicza °C w tekście (formatTextUnits), dlatego temperatury tylko w °C. Wycofane liczby: DIA-LIC-900. -->
<!-- [DO USTALENIA] DIA-KIE-900, zdania bez liczby i bez twierdzenia (liczba usunięta, kierunek zostaje): UNDER_PROOFED.actionChecklistPl[0] „Wydłuż fermentację burzliwą.”; OVER_PROOFED.actionChecklistPl[0] „Zmniejsz udział zakwasu w recepturze.”; BLAND_FLAVOR.actionChecklistPl[1] „Zwiększ udział zakwasu w recepturze.”, [2] „Dodaj do receptury trochę mąki pełnoziarnistej (żytniej lub pszennej).”; DENSE_CRUMB.biologicalCausePl „Zbyt niska hydratacja ciasta, słaba mąka o niskiej zawartości białka lub niedostatecznie rozwinięty gluten.”, actionChecklistPl[0] „Zwiększ hydratację receptury.”, [1] „Użyj mąki chlebowej o wyższej zawartości białka.”. Zdania Doktora bez liczby i bez zmiany: poza zakresem 133 (znalezisko w wyniku p9a). -->

## diagnostics.GUMMY_CRUMB.biologicalCausePl
Chleb wyjęty z pieca nie jest jeszcze gotowy: gdy stygnie, oddaje wilgoć, a miękisz potrzebuje tego czasu, żeby się ustalić, więc pokrojony za wcześnie może być gumowaty. [T:KRO-POC-015]
Inną przyczyną może być niedopieczenie: większość bochenków jest upieczona, gdy w środku ma ok. 88 °C. [T:DIA-TEM-001]

## diagnostics.GUMMY_CRUMB.actionChecklistPl[0]
Przed krojeniem poczekaj, aż bochenek całkiem ostygnie. [T:KRO-POC-015]
Upieczony chleb żytni na zakwasie najlepiej pokroić dopiero po 24 godzinach odpoczynku. [T:ZYT-STU-001]

## diagnostics.GUMMY_CRUMB.actionChecklistPl[1]
Sprawdź termometrem szpilkowym temperaturę w środku bochenka: większość bochenków jest upieczona przy ok. 88 °C, a chleb żytni powinien mieć w środku 96–99 °C. [T:DIA-TEM-001]

## diagnostics.GUMMY_CRUMB.actionChecklistPl[2]
Jeśli w środku jest chłodniej, piecz dłużej i zmierz ponownie. [T:DIA-TEM-001]

## diagnostics.UNDER_PROOFED.actionChecklistPl[2]
Policz temperaturę wody w recepturze: ciasto pszenne po wymieszaniu powinno mieć ok. 24–25,5 °C. [T:DIA-DDT-001]

## diagnostics.OVER_PROOFED.actionChecklistPl[2]
Obniż temperaturę lodówki: w chłodniejszej lodówce fermentacja idzie wolniej. [T:KRO-POC-010]

## diagnostics.SIDE_BLOWOUT.actionChecklistPl[0]
Piecz w garnku pod pokrywą: para pod pokrywką dłużej trzyma skórkę miękką, więc bochenek może jeszcze rosnąć na początku pieczenia. [T:KRO-POC-013]

## diagnostics.SIDE_BLOWOUT.actionChecklistPl[1]
Prowadź zakrzywione ostrze pod kątem ok. 30° do powierzchni ciasta, na głębokość ok. 6–13 mm: płytsze nacięcie może się zrosnąć w czasie pieczenia. [T:DIA-NAC-001]

## diagnostics.LACK_OF_EAR.biologicalCausePl
Nacięcie prosto, pod kątem 90°, rozchyla się na boki, a ucho powstaje, gdy tniesz pod płaskim kątem bochenek uformowany z dobrym napięciem, z napiętą wierzchnią warstwą. [T:DIA-NAC-002]

## diagnostics.LACK_OF_EAR.actionChecklistPl[0]
Pochyl zakrzywione ostrze pod kątem ok. 30° do powierzchni ciasta: wtedy łatwiej powstaje płat ciasta, który odchyla się w ucho. [T:DIA-NAC-001,DIA-NAC-002]

## diagnostics.LACK_OF_EAR.actionChecklistPl[2]
Nagrzewaj pusty garnek około 30 minut przed włożeniem ciasta, żeby zrobiła się w nim para. [T:KRO-POC-011]

## diagnostics.PALE_CRUST.actionChecklistPl[0]
Po zdjęciu pokrywy piecz dalej, aż chleb porządnie się zrumieni. [T:KRO-POC-014]

## diagnostics.EXCESSIVELY_SOUR.actionChecklistPl[0]
Dokarmiaj zakwas częściej przed wypiekiem. [T:KWA-GLO-001]

## diagnostics.EXCESSIVELY_SOUR.actionChecklistPl[2]
Skróć fermentację burzliwą i pilnuj temperatury ciasta: ciasto pszenne po wymieszaniu powinno mieć ok. 24–25,5 °C. [T:KWA-CZA-001,DIA-DDT-001]

## diagnostics.BLAND_FLAVOR.actionChecklistPl[0]
Garuj ciasto w lodówce: chłód spowalnia fermentację, a wolniejsza fermentacja daje głębszy smak. [T:KRO-POC-010]

## diagnostics.DENSE_CRUMB.actionChecklistPl[2]
Wydłuż autolizę i dodaj dodatkową serię składań coil fold. [T:KRO-POC-003,KRO-POC-006]
