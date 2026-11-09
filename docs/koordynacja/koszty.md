# Koszty sesji — Piekarz

| Sesja | Rola | Szacunek USD | Rzeczywisty USD | Kontekst max % | Zlecone → start → 1. commit → CI zielone → przyjęte (UTC) | Oczekiwanie: min i przyczyna | Uwagi |
|---|---|---|---|---|---|---|---|
| `session_01T66VBy48fpemgf7wQvUkU4` | M2 p1–p3 cz. 1 | [DO USTALENIA] | 225,98 | 25 | 09.11 04:06 → … → przekazanie 19:27 | — | zarchiwizowana 19:49 |
| `session_01T66VBx5s4zkdFqT2gZ5CDQ` | M2 p3 cz. 2 (A) | — | 12,64 (21:36, w toku) | 23,5 | 19:27 → 19:38 → ~20:10 → E2E #100 21:32 → — | E2E iOS 78 min (20:14–21:32) | aktywna |
| `session_01T66VBwuR25xmeQCZYdPG2r` | koordynator M3 | — | 55,97 (21:36) | 15,5 | od 08.11 16:02 | — | migracja M9 |
| `session_01T66VBywjUPA4m3hXCFNdYr` | M1 | — | [DO USTALENIA] (raport M1: licznik ok. 173 USD) | — | — | — | zarchiwizowana |

Mnożnik szacunku: [DO USTALENIA] (brak szacunków USD w dawnych plikach; na start 2).
| B (reaudyt M1 p1) | M1 reaudit | 60 (pułap) | 62,81 | 26,5 | 21:48 → 21:49 → — → — → 22:30 | ~10 min: dostęp do prompts (zgoda właściciela w czacie B) | wariant B 2,33 mln tok. subagentów (+6% nad planem); pułap przekroczony o 4,7%, poniżej STOP |
| A (M2 p3 cz. 2 + p4 cz. 1) | M2 fix | — | 23,88 | 31,4 | 19:27 → … → p3 E2E 21:32 → przyjęte 21:49; p4 22:30 → 087 bb162ddf → 088/089 d04c94ca 22:55 | ~10 min: dokończenie subagenta roli 06 przy przekazaniu | archiwizacja odrzucona (klasyfikator; sesja utworzona przez poprzednika) |
