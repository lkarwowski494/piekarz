# Karta ustawień App Store: Greek (`el`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/el.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Greek**, kod ASC `el`; język aplikacji `el` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Greek (jeśli go nie ma: „Not Localized” → Greek → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).
- **Weryfikacja natywna:** nazwę i podtytuł przed wysyłką sprawdza osoba mówiąca tym językiem (D-053; docs/wydanie/widocznosc.md §6 p. 5).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 2 — CYP (Cyprus), GRC (Greece)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 25 / 30 znaków · App Information

```text
Αρτοποιός: Ψωμί & Προζύμι
```

### Podtytuł (Subtitle) · 27 / 30 znaków · App Information

```text
Υπολογισμός ζύμης και πλάνο
```

### Słowa kluczowe (Keywords) · 87 / 100 bajtów (46 znaków) · wersja 1.0

```text
υδάτωση,συνταγές,σίκαλη,λεβέν,πίτσα,χρονόμετρο
```

### Tekst promocyjny (Promotional Text) · 168 / 170 znaków · wersja 1.0

```text
Ορίστε πότε θέλετε έτοιμο το ψωμί: ο Αρτοποιός υπολογίζει ποσότητες, σχεδιάζει αντίστροφα και ειδοποιεί στο τέλος κάθε βήματος. Χωρίς λογαριασμό, internet, διαφημίσεις.
```

### Opis (Description) · 3770 / 4000 znaków · wersja 1.0

```text
Ο Αρτοποιός σας καθοδηγεί στο ψήσιμο ψωμιού με προζύμι, από τη συνταγή μέχρι το καρβέλι: υπολογίζει ποσότητες, φτιάχνει πρόγραμμα και μετρά τον χρόνο όσο το τηλέφωνο κοιμάται. Λειτουργεί χωρίς λογαριασμό και χωρίς internet, χωρίς διαφημίσεις και χωρίς παρακολούθηση. Οι συνταγές, τα προζύμια και το ημερολόγιό σας μένουν μόνο στο τηλέφωνό σας.

ΣΥΝΤΑΓΕΣ ΚΑΙ ΠΟΣΟΤΗΤΕΣ
Επιλέξτε μία από 15 βασικές συνταγές (με προζύμι, σίκαλης, με μαγιά, πίτσα και γλυκά) ή τη δική σας. Ορίστε τον αριθμό των καρβελιών ή το βάρος του αλευριού και ο Αρτοποιός δίνει τα γραμμάρια αλευριού, νερού, προζυμιού, αλατιού και μαγιάς. Το αρτοποιητικό ποσοστό λαμβάνει υπόψη το αλεύρι και το νερό του προζυμιού και της μαγιάς προζυμιού. Ο Αρτοποιός δίνει επίσης τη θερμοκρασία του νερού για τη θερμοκρασία ζύμης που θέλετε να πετύχετε.

ΠΡΟΓΡΑΜΜΑ ΑΠΟ ΤΗΝ ΩΡΑ «ΕΤΟΙΜΟ»
Επιλέξτε πότε θα είναι έτοιμο το ψωμί και ο Αρτοποιός υπολογίζει αντίστροφα την ώρα έναρξης κάθε βήματος. Ο χρόνος ζύμωσης εξαρτάται από τη θερμοκρασία στην κουζίνα. Όταν ένα βήμα που απαιτεί τα χέρια σας πέφτει μέσα στη νύχτα (από προεπιλογή μεταξύ 23:00 και 07:00), ο Αρτοποιός προτείνει μεγαλύτερο χρόνο στο ψυγείο. Όταν ο χρόνος δεν φτάνει, δίνει τη νωρίτερη δυνατή ώρα.

ΚΑΘΟΔΗΓΗΣΗ ΒΗΜΑ ΠΡΟΣ ΒΗΜΑ
Ο Αρτοποιός δείχνει το τρέχον βήμα: τι να κάνετε, πόσο διαρκεί και τι ακολουθεί. Αν επιτρέψετε τις ειδοποιήσεις, σας ενημερώνει για το τέλος του βήματος ακόμη και με κλειδωμένο τηλέφωνο. Σε ένα βήμα που απαιτεί τα χέρια σας, η οθόνη καθοδήγησης δεν σβήνει. Τα βήματα με καυτό σκεύος ή ωμή ζύμη έχουν προειδοποίηση. Το ψωμί σίκαλης (πάνω από το μισό αλεύρι είναι αλεύρι σίκαλης) έχει δικά του βήματα χωρίς διπλώματα. Ένα βήμα που επιβεβαιώσατε κατά λάθος μπορείτε να το αναιρέσετε και, όταν ανοίξετε ξανά την εφαρμογή, επιστρέφει στο τρέχον βήμα.

ΠΡΟΖΥΜΙΑ
Διατηρήστε πολλά προζύμια. Ο Αρτοποιός δίνει τις ποσότητες για τάισμα σε αναλογία 1:1:1, 1:2:2, 1:3:3 ή 1:5:5. Όταν το προζύμι διπλασιάσει τον όγκο του, ο Αρτοποιός το σημειώνει ως έτοιμο για τη ζύμη. Μετά από 12 ώρες στον πάγκο χωρίς τάισμα, σας το υπενθυμίζει με ειδοποίηση. Νέο προζύμι μπορείτε να φτιάξετε μέρα με τη μέρα. Ο Αρτοποιός εφαρμόζει την αρχή της προφύλαξης: σε περίπτωση επίστρωσης, αλλοίωσης χρώματος ή σάπιας μυρωδιάς συνιστά να πετάξετε το προζύμι.

ΓΙΑΤΡΟΣ ΨΩΜΙΟΥ
Η ψίχα είναι σφιχτή και η κόρα χλωμή; Σημειώστε τα συμπτώματα και ο Γιατρός Ψωμιού εντοπίζει ένα από 9 ελαττώματα, εξηγεί την αιτία και λέει τι να αλλάξετε την επόμενη φορά. Τέσσερα πρωτόκολλα διάσωσης βοηθούν όταν η ζύμη έχει πρόβλημα κατά τη ζύμωση. Ο Γιατρός Προζυμιού βοηθά όταν κάτι στο προζύμι σάς ανησυχεί.

ΗΜΕΡΟΛΟΓΙΟ
Βαθμολογήστε κάθε καρβέλι: αστέρια, ψίχα, κόρα και γευστικό προφίλ. Το Ημερολόγιο δείχνει στατιστικά και το «Ψήστε ξανά» ανοίγει την ίδια συνταγή.

ΤΑ ΔΕΔΟΜΕΝΑ ΣΑΣ
Ο Αρτοποιός κρατά στο τηλέφωνο τα 10 τελευταία αυτόματα αντίγραφα ασφαλείας. Μπορείτε να εξαγάγετε όλα τα δεδομένα σε αρχείο και να τα εισαγάγετε από αρχείο, καθώς και να εξαγάγετε το ιστορικό ψησίματος σε CSV. Μονάδες: γραμμάρια και °C ή ουγγιές και °F.

ΚΑΛΟ ΝΑ ΞΕΡΕΤΕ
Ο Αρτοποιός λειτουργεί σε iPhone και δεν συγχρονίζει δεδομένα μεταξύ συσκευών· τα δεδομένα τα μεταφέρετε με αρχείο αντιγράφου ασφαλείας. Χωρίς άδεια για ειδοποιήσεις, ο Αρτοποιός δείχνει το τέλος ενός βήματος μόνο όταν η οθόνη είναι ανοιχτή.

ΠΡΟΣΒΑΣΗ ΚΑΙ ΑΓΟΡΑ
Πλήρη πρόσβαση δίνει η μηνιαία ή ετήσια συνδρομή ή η εφάπαξ αγορά εφ' όρου ζωής στο App Store. Η συνδρομή μπορεί να ξεκινά με δωρεάν δοκιμαστική περίοδο (εισαγωγική προσφορά του App Store για όσους πληρούν τις προϋποθέσεις). Χωρίς αγορά μπορείτε να περιηγηθείτε στο ιστορικό ψησίματος, να εισαγάγετε αρχείο, καθώς και να εξαγάγετε και να διαγράψετε τα δεδομένα σας.
Όροι χρήσης (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Γλώσσες: 35.
```

### Co nowego (What’s New in This Version)

nie dotyczy wersji 1.0: Apple — „This property isn’t available for the first version of the app”. Od 1.0.1 tekst z listy zmian według `docs/wydanie/sklep.md` §5.

### Privacy Policy URL · App Information

```text
https://apps4brew.com/piekarz/privacy.html
```

### Support URL · wersja 1.0

```text
https://apps4brew.com/piekarz/support.html
```

## Kategoria (raz dla całej aplikacji, nie na lokalizację)

Primary Category: **Food & Drink**; Secondary Category: **Productivity** (D-055; docs/15-app-store.md §3).

## Zrzuty ekranu (7 na klasę, kolejność D-055)

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk el … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.3/01-plan.png` | Ψωμί έτοιμο την ώρα που θέλετε | Αντίστροφο πρόγραμμα χωρίς βήματα μέσα στη νύχτα |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.3/02-receptura.png` | Τα γραμμάρια κάθε υλικού αμέσως | Αλεύρι και νερό του προζυμιού μετρούν στο αρτοποιητικό ποσοστό |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.3/03-prowadzenie-ciemny.png` | Ένα βήμα τη φορά | Τι να κάνετε, πόσο διαρκεί και ειδοποίηση στο τέλος του βήματος |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.3/04-doktor.png` | Τι να βελτιώσετε στο επόμενο καρβέλι | Συμπτώματα, αιτία και μία αλλαγή για το επόμενο ψήσιμο |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.3/05-zakwasy.png` | Προζύμι πάντα έτοιμο στην ώρα του | Ποσότητες για τάισμα και υπενθύμιση μετά από 12 ώρες |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.3/06-dziennik.png` | Κάθε ψήσιμο καταγεγραμμένο | Βαθμολογία καρβελιού και «Ψήστε ξανά» με ένα άγγιγμα |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/el/iphone-6.3/07-offline.png` | Χωρίς λογαριασμό, χωρίς internet | Χωρίς διαφημίσεις και παρακολούθηση· δεδομένα μόνο στο τηλέφωνό σας |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (2): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).
