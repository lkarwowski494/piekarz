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
| E (005 cz. 1) | 04 fix | — | 11,88 | 33,2 | 06:21 → 06:22 → bfa029f2 ~06:30 → — (verify czerwone: fr) → odebrane 06:58 (69af687c) | ~5 min: odpowiedzi koordynatora (KO-017 ×2), ~3 min: decyzja właściciela KO-018 | dwie nieudane próby układu przy 320 pt; następczyni E2 |
| D (N10 + tests-tz) | 07 fix | — | 6,79 | 26,2 | 05:38 → 05:38 → 23f0196f ~05:50 → tests-tz #191 06:31 (E2E #104 w toku) → przyjęte 06:35 | ~3 min: BRAK PROMPTS (WG-03) | zadania 1–5; zarchiwizowana 07:00 |
| B2 (reaudyt M1 p2) | M1 reaudit | — | 36,32 | 28,3 | 05:37 → 05:42 → G1 ~05:52 → — → STOP 2 06:14; KO-019 c7a5450d 07:00 | ~5 min: prompts (WG-03); model zmieniony przez właściciela 06:0x | subagenci 1,27 mln tok.; zarchiwizowana 07:02 |
| E2 (005 cz. 2 + kandydat) | 04 fix | — | 8,29 | 25,3 | 06:57 → 06:58 → 8cea3dd0 ~07:05 → E2E #105 zielone 09:37 → przyjęte 09:45 | ~50 min: restart workera koordynatora (07:24→08:16) przy pytaniu KO-020; E2E 67 min | zarchiwizowana 11:10 |
| R | 04→08 fix | — | 12,62 | 36,3 | 20:13 → 20:14 → 20:2x → E2E #116 zielone 22:05 → przyjęte 22:23 | E2E #115 startup_failure ~11 min (infra) | P1+P2 jedna sesja |
| S | 04→08→09 fix | — | 8,65 | 28,4 | 21:17 → 21:18 → 21:2x → E2E #117 zielone 22:46 → przyjęte 22:50 | — | ~1,5 h agenta wg S, faktycznie 22 min |
| T | 07→08 fix | — | 4,81 | 24,6 | 07:15 → 07:16 → 07:2x → zrzuty #6 zielone 08:15 → przyjęte 08:24 | — | diagnoza 6 min |
| U (D-392 nagłówek karty, D-393 kadr 05) | 04→08 fix | [brak szacunku] | 10,65 | 31,8 | 09:54 → 09:54 → ~10:10 → E2E 12:00 → 12:31 | pytanie do właściciela ~5 min; kolejka macOS 14 min; E2E 88 min | KO-055, KO-056 |
| V (diagnoza zrzutów #8, D-394) | 07→08 fix | — | 11,46 | 39,1 | 12.11 17:16 → 17:16 → bd507cbc ~17:32 → E2E #122 zielone 18:51 → przyjęte 18:58 | kolejka macOS (E2E); próbka #9 czerwona (hr) 21:20 | ponad 30% (39%) — wyjątek: koordynator 8/8 nie mógł tworzyć następcy; zarchiwizowana 13.11 07:2x na polecenie właściciela |
