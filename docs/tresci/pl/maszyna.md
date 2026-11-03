# Tryb maszyny do chleba (D-153, D-156, D-175, D-176, D-179) — PL
<!-- Rola 06, E2, 2026-11-03. Nagłówek = proponowany klucz (rola 08/09). Teksty bezpieczeństwa (krytyczne) czekają na przegląd zdań właściciela: docs/tresci/przeglad/m3-zdania-2026-11-03.md. Reguła podpowiedzi programu: D-179 (reguła Piekarza, nie fakt). Zakwas w maszynie: brak źródła (MAS-ZAK-005), tryb odsyła do wersji drożdżowej (D-156). -->

## machine.capacity
Wpisz z instrukcji swojej maszyny największą ilość mąki, a jeśli instrukcja ją podaje, także największą masę ciasta i drożdży; Piekarz nie przeliczy receptury ponad żadną z tych granic. [T:MAS-062,MAS-002,MAS-032]
Na przykład w Tefal PF220838 nie wolno przekroczyć łącznie 1000 g ciasta, 620 g mąki chlebowej i 10 g suchych drożdży instant. [T:MAS-002]

## machine.order
Kolejność wkładania składników podaje instrukcja Twojej maszyny. [T:MAS-060]
W większości przeczytanych instrukcji najpierw wlewa się płyny, potem wsypuje mąkę i inne suche składniki, a drożdże na wierzch, tak by nie dotykały płynów. [T:MAS-005,MAS-020,MAS-040,MAS-050]
W niektórych maszynach jest odwrotnie: najpierw suche drożdże, na nie mąka i suche składniki, a płyn na końcu. [T:MAS-031]
W maszynie z dozownikiem drożdży, na przykład Panasonic SD-YR2550, suche drożdże wsypuje się do dozownika w programach, które go używają. [T:MAS-030]

## machine.delayBlocked
Opóźniony start jest wyłączony, bo receptura ma jajka, świeże mleko, ser, jogurt, sok, świeże owoce albo warzywa. [T:MAS-072]
Każda z przeczytanych instrukcji maszyn zabrania opóźnionego startu z częścią tych składników, bo łatwo się psują. [T:MAS-072,MAS-009,MAS-023,MAS-035,MAS-044]
Według jednej z instrukcji mleko w proszku zamiast świeżego mleka pozwala użyć opóźnionego startu, więc Piekarz go nie blokuje. [T:MAS-084]

## machine.safety
Po pieczeniu formę wyjmuj w rękawicach kuchennych, bo forma, jej uchwyt i wnętrze pokrywy są gorące. [T:MAS-010,MAS-024,MAS-036,MAS-053]
Mieszadło, które zostało w bochenku, może być bardzo gorące: wyjmij je dopiero po ostygnięciu chleba, narzędziem z zestawu albo plastikową łopatką, bez noża i widelca, i dalej uważaj na oparzenie. [T:MAS-045,MAS-025,MAS-037,MAS-013]
Przy otwieraniu pokrywy w trakcie albo pod koniec programu może wydostać się gorąca para. [T:MAS-011]
W czasie pracy nie dotykaj otworu pary i go nie zasłaniaj. [T:MAS-026,MAS-038]
Dzieci poniżej 8 lat trzymaj z dala od maszyny i przewodu, a starsze mogą jej używać tylko pod nadzorem. [T:MAS-014,MAS-026,MAS-038]

## machine.programHint
Podpowiedź programu to reguła Piekarza, nie zalecenie producenta, więc sprawdź ją w instrukcji swojej maszyny. [T:-]
Program „ciasto” podpowiadamy dla wypieków kształtowanych i pieczonych w piekarniku, bo w nim maszyna przygotowuje ciasto, ale go nie piecze. [T:MAS-006,MAS-046]
Program „słodki” podpowiadamy dla receptur słodkich, bo według opisu w instrukcji jednej z maszyn jest przeznaczony dla chlebów z dużą ilością cukru, tłuszczu i białka. [T:MAS-083]
Program „pełnoziarnisty” podpowiadamy, gdy mąka pełnoziarnista i żytnia to razem co najmniej 50% mąki, jak w progu z instrukcji jednej z maszyn. [T:MAS-042]
Program „francuski” podpowiadamy dla receptur bez cukru i tłuszczu, jak w opisie z instrukcji jednej z maszyn. [T:MAS-082]
W pozostałych recepturach podpowiadamy program podstawowy, według opisu w instrukcji jednej z maszyn przeznaczony głównie dla jasnej mąki pszennej. [T:MAS-081]

## machine.sourdough
W przeczytanych instrukcjach maszyn programy na zakwasie używają także drożdży piekarskich. [T:MAS-ZAK-002,MAS-ZAK-003]
Dlatego w trybie maszyny ta receptura używa wersji na drożdżach. [T:-]
