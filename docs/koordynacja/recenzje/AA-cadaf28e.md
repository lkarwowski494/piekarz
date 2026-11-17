# AA: recenzja niezależna zrzuty #13 (98efd38b..cadaf28e), 2026-11-17

Zakres: D-418 (podpis EN 02), D-419 (krój tytułów ru/uk), D-420 (kafel nl), D-421 (numer dnia CJK). Tylko odczyt;
testy w osobnym klonie /home/user/rec (npm ci --ignore-scripts). 4 nowe/zmienione zestawy: 84/84 zielone na cadaf28e;
po cofnięciu samych poprawek (src + metadane) 7 czerwonych (D-419 ×2, D-421 ×3 [zh-Hant/ja/ko], D-418, D-420 nl) — każdy
test byłby czerwony bez swojej poprawki. Limit 20 480 B: zmienione pliki ≤ 19 036 B (nl/czesc-8.ts). Brak @ts-ignore/skip.

## P1
- **D-421 nie działa na urządzeniu (Hermes iOS).** src/lib/format.ts:117 bierze część `type === 'day'` z `formatToParts`.
  Hermes na Apple (lib/Platform/Intl/PlatformIntlApple.mm, gałąź static_h = Hermes V1 z RN 0.86, `DateTimeFormatApple::formatToParts`)
  NIE ma danych ICU o częściach: tnie gotowy napis na ciągi `NSCharacterSet.alphanumericCharacterSet` i typ nadaje według
  litery wzorca. „日” i „일” to litery (Lo), więc „15日” = jedna część `{type:'day', value:'15日'}` → funkcja zwraca „15日”
  (ko: „15일”). Test src/lib/__tests__/pasek-numer-dnia-d421.test.ts:17-26 przechodzi tylko na ICU Node (Jest), nie na
  silniku aplikacji — dowód „czerwony→zielony” nie dotyczy zachowania na iPhonie. Poprawka: liczba bez Intl-części, np.
  `new Intl.NumberFormat(locale, { useGrouping: false }).format(d.getDate())` (cyfry lokalne zachowane) albo wyciągnięcie
  `\p{Nd}+` z napisu; test z atrapą `formatToParts` zwracającą jedną część „15日” (zachowanie Hermes).

## P2
- **D-419 naprawia 2 z ~70 getterów tego samego typu.** Ten sam leniwy `get fontFamily()` w `StyleSheet.create` (ta sama
  ścieżka: ekran zamontowany przed `initLanguage()` albo zmiana języka w Ustawieniach przy zamontowanych zakładkach) zostaje m.in.:
  src/components/start/PlanyWypiekow.tsx:92 i src/components/start/WypiekiNaSpirali.tsx:148 (ekran „Dziś”, ten sam co zrzut),
  src/components/start/UprzedzenieKoncaPro.tsx:102, app/doktor.tsx:213, src/components/harmonogram/TargetReadyCard.tsx:201,
  src/components/harmonogram/TimelineStagesList.tsx:200, src/components/zakwas/StarterPeakActivityCard.tsx:247,
  src/components/NotificationsOffBanner.tsx:56, src/components/stolnica/stolnica-screen.styles.ts:61,68,
  src/components/receptury/style-maszyny.ts:25, src/ui/naglowek.ts:24 (headerTitleStyle). Dotyczy też vi/ja/ko/zh-Hant
  (Sofia bez glifów, krój mieszany) po przejściu z pl. Zalecenie: jedno rozwiązanie systemowe (np. `key={lang}` na
  korzeniu nawigacji/ekranie po `initLanguage`, albo render po `initLanguage` w StorageGate) zamiast łatania per komponent,
  plus reguła statyczna zakazująca nowych getterów bez `krojTytulowStyl()`; tests/duzy-tekst-kroj.test.ts dziś wymusza
  właśnie getter, czyli wzorzec z błędem.
- **D-419 test bada implementację, nie natywny diff.** src/ui/__tests__/kroj-tytulow-zmiana-jezyka-d419.test.tsx:41
  sprawdza, że stary `style` spłaszczony po zmianie języka ma dalej Sofię — to pośrednik hipotezy o diffie
  (ReactNativeAttributePayload), nie potwierdzenie na urządzeniu. Rozumowanie jest poprawne (indeks z nowym obiektem
  daje `fontFamily: null` w payloadzie, więc reset do systemowego), ale brak dowodu zrzutem ru/uk po poprawce.

## P3
- D-420: src/lib/__tests__/kafle-start-dlugie-slowa-d420.test.ts:11 — próg 15 liter zmierzony dla 6,3″; przy 320 pt
  i AX5 „surdeigsstarter” (no) itp. nadal mogą się łamać (autor przyznaje). nl: kafel mówi „zuurdesem”, a 128 innych
  tekstów nl „zuurdesemstarter” — semantycznie OK („zuurdesem opzetten” idiomatyczne), drobna niespójność terminu.
- D-418: „Exact Amounts for Every Ingredient” poprawne dla en-US (uncje) i neutralne dla en-GB/AU/CA; test
  tests/ramki-sklepu-podpisy.test.ts:84 sprawdza tylko en-US/regex `grams?` — wystarczy. Zrzuty EN trzeba wygenerować ponownie
  (sam podpis w JSON nie zmienia PNG w audit/).
- src/ui/kroj-tytulow.ts:34 tworzy nowy obiekt przy każdym renderze — koszt pomijalny, ale wymusza diff stylu co render.

## Czytelność ja/ko (D-421)
Sama liczba w kolumnie dnia to norma kalendarzy CJK (iOS Kalendarz); kontekst miesiąca jest: tytuł okresu
`tytulWidoku` (src/lib/kalendarz-widok.ts:91-103, „11月15日～21日”), podtytuł z datą w PasDzis (src/components/start/PasDzis.tsx:50),
skrót dnia nad liczbą i pełna data w etykiecie VoiceOver (PasekTygodnia.tsx:68). AX5 idzie listą wierszy (bez kolumn) — bez zmian.
44 pt: `dzien` minHeight = theme.cele.pozostale bez zmian. Brak regresji w innych językach (pl/en/hu/vi = to samo co wcześniej).

## Werdykt
**Przyjąć z uwagami — warunkowo:** D-418 i D-420 przyjąć. D-421 nie przyjmować jako naprawionego, dopóki P1 nie jest
poprawione (na urządzeniu zostaje „15日”). D-419 przyjąć jako częściową naprawę z zadaniem P2 na pozostałe gettery.
