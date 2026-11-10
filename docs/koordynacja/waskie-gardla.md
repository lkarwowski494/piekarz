# Wąskie gardła (WG) — Piekarz

| WG | Objaw | Pomiar | Przyczyna | Działanie | Ryzyko | Stan |
|---|---|---|---|---|---|---|
| WG-01 | Commit stanu koordynatora na gałęzi integracji psuje scalenie FF partii M2 | 1× (09.11 19:28, `9007adeb` → p3 nie-FF) | stan M3 w `docs/wznowienie-M3.md` na `redesign` | stan przeniesiony na gałąź `koordynacja` (M9 zasada 6) | bez zmian kontroli | zamknięte 2026-11-09 |
| WG-02 | Pierwsze przekazanie M2 kosztuje dużo kontekstu następczyni | start A: 16,7% po 20 min (167k) | wczytanie zasad, punktów wznowienia i promptu roli | obserwować przy następnym przekazaniu; drugi raz → skrócić punkt wznowienia | bez zmian kontroli | otwarte, 1× |
| WG-03 | Sesja podrzędna nie dostaje biblioteki `prompts` (`add_repo` odrzucany przez klasyfikator trybu auto) | 4 razy: B 09.11 (~10 min, zgoda właściciela w czacie B), koordynator 10.11 00:16, B2 i D 10.11 05:38 (~15 min i ok. 20 tys. tokenów koordynatora na wysłanie promptu) | biblioteka prywatna, sesja startuje z jednym repo; rola M9 każe wklejać prompt w pierwszą wiadomość — nie zrobiono tego przy starcie (oszczędność tokenów) | od teraz: prompt roli w pierwszej wiadomości albo wskazanie złożonego promptu już obecnego w K; propozycja lekcji dla biblioteki w linii 14:00 (create_session z drugim repo tylko do odczytu albo reguła uprawnień dla add_repo prompts) | bez zmian kontroli | otwarte, 2026-11-10 |
