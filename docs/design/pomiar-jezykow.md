# Pomiar długości tekstów w 35 językach (D-048)

2026-10-20 · 80 tekstów kluczowych ekranów (start, prowadzenie, oferta, zakwas; klucze `pw.*`, `st.*`, `tab.*`, `nav.*`, `of.*`, `zk.*`) przetłumaczone roboczo przez Message Batches (claude-opus-5-5, wysiłek low), partia `msgbatch_01NUEFbKYiJEGc5qSzt2rwFy`, koszt 1,41 USD. Długość = znaki widocznego tekstu bez znaczników HTML (wartości liczbowe zastąpione stałym „0000”). Przekład roboczy tylko do pomiaru i makiet; przekład aplikacji to zadanie 093.

| Język | Znaki | × PL | Najdłuższe słowo |
|---|---|---|---|
| fr | 3516 | 1,202 | 16 |
| it | 3481 | 1,190 | 17 |
| de | 3453 | 1,181 | 20 |
| el | 3402 | 1,163 | 18 |
| es | 3350 | 1,146 | 16 |
| nl | 3349 | 1,145 | 16 |
| pt | 3340 | 1,142 | 16 |
| ms | 3282 | 1,122 | 16 |
| lt | 3278 | 1,121 | 14 |
| hu | 3237 | 1,107 | 15 |
| id | 3221 | 1,102 | 14 |
| no | 3216 | 1,100 | 20 |
| ro | 3201 | 1,095 | 17 |
| sv | 3181 | 1,088 | 18 |
| uk | 3170 | 1,084 | 16 |
| lv | 3157 | 1,080 | 14 |
| en-US | 3140 | 1,074 | 14 |
| bg | 3136 | 1,073 | 16 |
| fi | 3128 | 1,070 | 21 |
| da | 3110 | 1,064 | 19 |
| tr | 3085 | 1,055 | 16 |
| vi | 3062 | 1,047 | 9 |
| hi | 3019 | 1,032 | 13 |
| sk | 3019 | 1,032 | 14 |
| hr | 3006 | 1,028 | 13 |
| et | 2974 | 1,017 | 19 |
| cs | 2925 | 1,000 | 13 |
| pl | 2924 | 1,000 | 16 |
| th | 2771 | 0,948 | (bez spacji) |
| ar | 2715 | 0,929 | 11 |
| he | 2395 | 0,819 | 10 |
| ko | 1625 | 0,556 | 8 |
| ja | 1504 | 0,514 | (bez spacji) |
| zh-TW | 1161 | 0,397 | (bez spacji) |
| zh | 1096 | 0,375 | (bez spacji) |

Wniosek: zrzuty E3 w języku francuskim (najdłuższy łącznie). Ryzyko łamania słów przy AX5: fiński i niemiecki (najdłuższe słowa) — audyt po wdrożeniu sprawdza prowadzenie przy 320 pt AX5 także w `fi` i `de`. Języki prawostronne (ar, he) wymagają odbicia układu (spec, rozdział 2).
