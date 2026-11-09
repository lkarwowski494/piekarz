06-tresci fix M2 p3 (2026-11-09), gałąź naprawy/M2-koordynator-napraw-2026-11-09-p3, wypchnięta (9a692b21..09d8227a). Rola 06: treść, rejestr, wektor, decyzje. Kod (`src/`, `app/`) bez zmian.

ETAP 0: Linux, Node v22.23.4, git; push działa; sieć: ciafoodies.com, kingarthurbaking.com, tsapps.nist.gov 200, usgs.gov 403. Bez Xcode, bez subagentów.

Commity:
- cac65b73 → M2-012 (D-309): `docs/tresci/pl|en/plan-brioszki.md`, PIE-BRI-002 (nowe), PIE-BRI-900 zawężone do czasów, wektor `docs/tresci/wektory/plan-brioszki-2026-11-09.json`.
- 09d8227a → M2-013 (D-310): DDT-WOD-001 (nowe), znacznik zdania too_hot_danger w `docs/tresci/pl|en/teksty-glownego-przeplywu.md`, DDT-WOD-900 uwagi.
- Przed każdym commitem `npm run verify` po `git add`: kod 0, 625 zestawów, 6476 testów (`dowody/verify-012.txt`, `dowody/verify-013.txt`). Kontrola treści po: 0 błędów, 2 uwagi sprzed zmian (`dowody/kontrole-p3-po.txt`).

Czerwień przed:
- M2-012: `dowody/M2-012-czerwien.txt` — plan każdej receptury bierze `DEFAULT_STAGE_TEMPLATES` i podmienia tylko pieczenie (`src/core/reverse-scheduler.ts:230`).
- M2-013: `dowody/M2-013-czerwien.txt`, `dowody/M2-013-rachunek.txt` — stara rada podnosi wynik z 52 do 57 °C. Rada bez twierdzenia (`[T:-]`). Stary klucz został w słownikach.

Źródła przeczytane 2026-11-09 (`dowody/M2-zrodla-2026-11-09.txt`, grep -F = 1 przy każdym cytacie):
- CIA „Brioche”, ciafoodies.com/brioche, sha256 63c931215de8: „For the loaf pan, hand roll the dough out to the length of your pan. Grease the pan lightly with butter and place the dough in the pan. Cover with plastic wrap and let proof in a warm place for 20 minutes.” Do tego cytaty o wyrabianiu i o nocy w lodówce (PIE-BRI-002).
- King Arthur „Dough Temperatures”, sha256 30bb09273afd: „we subtract from it the sum of the known temperatures, and the result will be the required water temperature” (DDT-WOD-001).
- NIST pub_id=926353: „∆fusH(0 °C) = 333.4 J/g” (RD-18, lód). USGS: HTTP 403, Do sprawdzenia; zostaje odczyt S-41 z 2026-10-19.

Przekazanie do roli 08:
- M2-012, kroki planu brioszki w tej kolejności (kategoria, czas w logice, tekst z `plan-brioszki.md`):
  - starter_feed: szablon, 360.
  - brioche_mix: mix, 20. Tekst „Wyrabianie ciasta z masłem”: „Połącz mąkę, wodę, sól i zakwas i wyrabiaj. Masło dodawaj stopniowo, porcjami. Gdy całe masło połączy się z ciastem, wyrabiaj dalej, aż ciasto zacznie odchodzić od ścianek misy.” Po nim 2 zdania BEZ-SUR z kroku mix.
  - brioche_cold: bulk_ferment, 840 (480–1440). Tekst „Ciasto na noc w lodówce”: „Przełóż ciasto na blachę wyłożoną papierem do pieczenia posmarowanym masłem. Szczelnie przykryj je folią i wstaw na noc do lodówki.” Bez Q10; coldRetardHours i podpowiedź kolizji ze snem działają na ten krok.
  - brioche_shape: final_shape, 15. Tekst „Formowanie w keksówce”: „Rozwałkuj ciasto dłońmi na długość keksówki. Keksówkę lekko posmaruj masłem i włóż do niej ciasto.”
  - brioche_proof: final_proof, 20. Tekst „Rośnięcie w keksówce”: „Przykryj keksówkę folią i odstaw ciasto do wyrośnięcia w ciepłe miejsce.”
  - preheat_oven 45, bake_forma 28 (D-304, bez zmian); cool: szablon, 120.
  - Bez kroków autolyse, bulk_ferment, pre_shape, bench_rest, final_shape, final_proof. Wpis EN: `en/plan-brioszki.md`.
  - Jedno źródło kroków dla planu i prowadzenia (jak rye-stages). „Po co ten krok” tylko dla kroków, które plan ma.
- M2-013: kod ma już poprawny tekst (p2): PL „Ogrzej mąkę albo zakwas do temperatury pokojowej albo ustaw niższą temperaturę ciasta.”, EN „Bring the flour or the starter to room temperature, or set a lower dough temperature.” Do zrobienia: usunąć martwy klucz ze starą radą z `src/lib/i18n-en/czesc-4.ts:68` i 33 słowników. Klucz jest martwy, bo komunikat jest liczony na bieżąco (`app/(tabs)/receptury/receptura.tsx`, linia 357).

Przekazanie do roli 07:
- Test planu brioszki na wektorze.
- Test, że ogrzanie mąki obniża wynik `calculateDDTWaterTemp`, a komunikat too_hot_danger nie zawiera „Schłodź”.

Do akceptacji roli 04 i przekładu (M2): 11 zdań i nazw `plan-brioszki.md`. Opcja D-310 dla za zimnej wody: PL „Zastąp część wody lodem albo schłodź mąkę lub zakwas.”, EN „Replace part of the water with ice, or chill the flour or the starter.” — tylko po akceptacji.

[DO USTALENIA]:
- PIE-BRI-900, czasy brioszki na Lievito Madre: rośnięcie przed lodówką, czas w lodówce, rośnięcie w keksówce i znak gotowości, wyrabianie ręczne, nagrzewanie. Przepisu brioszki na zakwasie ze szczebla 1–4 nie znaleziono; blogi (szczebel 5) podają ok. 1,5–5 h.
- DDT-WOD-900: progi 45 i 4 °C bez zmian.

Nowe znaleziska:
- P2: `receptura.tsx` (linia 357) przekazuje komunikat tylko dla too_hot_danger, więc rada lodu nie pokazuje się w tym miejscu (do sprawdzenia przez 08).
- Rezerwa 20 min rośnięcia w keksówce jest krótka dla zakwasu (jakość, nie bezpieczeństwo). Tekst kroku każe czekać do wyrośnięcia.

Decyzje właściciela: brak wymaganych. D-309 i D-310 do weta; alternatywa weta przy D-309: brioszka bez planu do czasu źródła (jak orkisz). Numery D-309 i D-310 nadałem sam; koordynator sprawdza, czy nie kolidują z innymi rolami p3. Nieodbyte: przegląd ścieżki wrażliwej (nie dotyczy, bez kodu). Status „zweryfikowane” nadaje dopiero reaudyt.

Kontrola dowodów i sekretów (sprawdz-raport.mjs): OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone (kod 0).
