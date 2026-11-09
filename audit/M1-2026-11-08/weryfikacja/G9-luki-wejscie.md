# Wejście weryfikacji G9-luki (M1 2026-11-08, commit 2ef8870a)
Hipotezy z linii bazowej, których nie potwierdził ani nie obalił żaden raport. Dla każdej ustal: potwierdzone (to jest brak/defekt) / obalone (kod lub test to zapewnia) / niepewne (wymaga telefonu), z dowodem.

### H1 · Powiadomienia nie podążają za zmianą planu w trakcie wypieku
Obietnica: „pilnuje czasu, gdy telefon śpi”; sklep: „tells you when a step ends even when your phone is locked”, „You can undo a step confirmed by mistake”. Sprawdź: przy cofnięciu kroku, przestawieniu planu, pominięciu/wydłużeniu kroku, zakończeniu i anulowaniu wypieku oraz przy dwóch wypiekach naraz — czy zaplanowane powiadomienia są anulowane i planowane od nowa zgodnie z nowym stanem; czy po ponownym uruchomieniu aplikacji następuje uzgodnienie. Zacznij od `src/lib/notifications.ts`, wywołań z prowadzenia i warstwy sesji.

### H2 · Wielodniowe plany i kilka wypieków przekraczają systemowy limit oczekujących powiadomień
iOS przechowuje ograniczoną liczbę zaplanowanych powiadomień lokalnych (dokumentacja Apple: 64 najbliższe) [potwierdź źródłem]. Policz najgorszy przypadek z kodu: zaplanowane wypieki na przyszłe dni + dwa trwające + przypomnienia zakwasów. Czy kod ogranicza/priorytetyzuje?

### H3 · Brak zgody na powiadomienia jest cichy
Sklep: „Without permission for notifications, Baker shows the end of a step only on the open screen.” Sprawdź, czy przy odmowie (lub cofnięciu zgody w Ustawieniach) użytkownik widzi to na ekranie prowadzenia/planu, a nie tylko raz przy pytaniu.

### H4 · Doktor chleba nie przenosi zmiany na następny wypiek
Cel: „pomaga poprawiać następny wypiek”; sklep: „says what to change next time”, „Bake Again opens the same recipe”. Sprawdź, czy zalecana zmiana z Doktora jest gdziekolwiek pokazana przy następnym wypieku tej receptury (Piecz ponownie, karta receptury), czy tylko jako tekst w chwili diagnozy.
