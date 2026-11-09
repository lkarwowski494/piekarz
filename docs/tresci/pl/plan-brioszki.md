# Plan i prowadzenie brioszki w keksówce: kroki ze źródła receptury (M2-012, PIE-BRI-900) — PL
<!-- Rola 06, fix M2 p3, 2026-11-09 (D-308 pkt 2). Receptura lievito_madre_panettone_brioche (src/recipes/presets-pizza-slodkie.ts, recommendedVessel bread_pan). Nagłówek = id kroku planu brioszki, kategoria (StageCategory) i pole. Kolejność i czynności według The Culinary Institute of America, „Brioche” (PIE-BRI-002, odczyt 2026-11-09); zamiast szablonu bochenka w koszyku (DEFAULT_STAGE_TEMPLATES: autoliza, składania, formowanie wstępne, odpoczynek, koszyk, garowanie w lodówce w koszyku), którego brioszka w keksówce nie ma. Kroki w kolejności: starter_feed (szablon bez zmian), brioche_mix, brioche_cold, brioche_shape, brioche_proof, preheat_oven i bake (pieczenie-receptur.md, brioszka w keksówce, D-304), cool (szablon bez zmian). Czasy kroków tylko w logice (wektor docs/tresci/wektory/plan-brioszki-2026-11-09.json), tekst nie podaje liczb: czasy rośnięcia źródła dotyczą ciasta na drożdżach instant, a czasy dla Lievito Madre są [DO USTALENIA] (PIE-BRI-900). Krok brioche_mix kończą te same dwa zdania bezpieczeństwa co krok mix szablonu (BEZ-SUR-001, BEZ-SUR-002, dosłownie z wypiek-bezpieczenstwo.md; bez powtórzenia tutaj, żeby nie zmieniać skrótu przejrzanej wersji zdań). [T:-] przy instrukcji bez faktu dziedzinowego = sposób wykonania receptury Piekarza (jak w teksty-glownego-przeplywu.md). Kod bierze tekst dosłownie (bez znacznika); wpina rola 08. -->

## plan brioszki, krok brioche_mix, kategoria mix (namePl)
Wyrabianie ciasta z masłem [T:-]

## plan brioszki, krok brioche_mix (instructionsPl; po tych zdaniach dwa zdania BEZ-SUR-001, BEZ-SUR-002 jak w kroku mix)
Połącz mąkę, wodę, sól i zakwas i wyrabiaj. [T:-]
Masło dodawaj stopniowo, porcjami. [T:PIE-BRI-002]
Gdy całe masło połączy się z ciastem, wyrabiaj dalej, aż ciasto zacznie odchodzić od ścianek misy. [T:PIE-BRI-002]

## plan brioszki, krok brioche_cold, kategoria bulk_ferment (namePl)
Ciasto na noc w lodówce [T:-]

## plan brioszki, krok brioche_cold (instructionsPl)
Przełóż ciasto na blachę wyłożoną papierem do pieczenia posmarowanym masłem. [T:PIE-BRI-002]
Szczelnie przykryj je folią i wstaw na noc do lodówki. [T:PIE-BRI-002]

## plan brioszki, krok brioche_shape, kategoria final_shape (namePl)
Formowanie w keksówce [T:-]

## plan brioszki, krok brioche_shape (instructionsPl)
Rozwałkuj ciasto dłońmi na długość keksówki. [T:PIE-BRI-002]
Keksówkę lekko posmaruj masłem i włóż do niej ciasto. [T:PIE-BRI-002]

## plan brioszki, krok brioche_proof, kategoria final_proof (namePl)
Rośnięcie w keksówce [T:-]

## plan brioszki, krok brioche_proof (instructionsPl)
Przykryj keksówkę folią i odstaw ciasto do wyrośnięcia w ciepłe miejsce. [T:PIE-BRI-002]
