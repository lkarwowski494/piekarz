# Karta ustawień App Store: French (Canada) (`fr-CA`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/fr-CA.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **French (Canada)**, kod ASC `fr-CA`; język aplikacji `fr` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → French (Canada) (jeśli go nie ma: „Not Localized” → French (Canada) → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 1 — CAN (Canada)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 23 / 30 znaków · App Information

```text
Mitron : Pain au levain
```

### Podtytuł (Subtitle) · 25 / 30 znaków · App Information

```text
Calcul, plan et minuterie
```

### Słowa kluczowe (Keywords) · 97 / 100 bajtów (96 znaków) · wersja 1.0

```text
boulangerie,hydratation,farine,seigle,pizza,fermentation,recette,cocotte,pourcentage,maison,pâte
```

### Tekst promocyjny (Promotional Text) · 168 / 170 znaków · wersja 1.0

```text
Choisissez l'heure où le pain doit être prêt : Mitron calcule les quantités, planifie à rebours et signale la fin de chaque étape. Sans compte, sans internet, sans pub.
```

### Opis (Description) · 3731 / 4000 znaków · wersja 1.0

```text
Mitron vous guide dans la fournée de pain au levain, de la recette à la miche : il calcule les quantités, établit le planning et surveille le temps quand le téléphone est en veille. Il fonctionne sans compte et sans internet, sans publicité et sans pistage. Vos recettes, vos levains et votre journal restent uniquement sur votre téléphone.

RECETTES ET QUANTITÉS
Choisissez l'une des 15 recettes de base (au levain, au seigle, à la levure, pizza et sucrées) ou votre propre recette. Réglez le nombre de miches ou la masse de farine, et Mitron indique les grammes de farine, d'eau, de levain, de sel et de levure. Le pourcentage boulanger tient compte de la farine et de l'eau du levain et du levain tout point. Mitron indique aussi la température de l'eau pour atteindre la température de pâte désirée.

UN PLANNING À PARTIR DE L'HEURE « PRÊT »
Choisissez quand le pain doit être prêt, et Mitron calcule à rebours l'heure de début de chaque étape. La durée de fermentation dépend de la température de votre cuisine. Quand une étape qui demande vos mains tombe la nuit (par défaut entre 23:00 et 07:00), Mitron propose un temps plus long au réfrigérateur. S'il n'y a pas assez de temps, il indique l'heure la plus tôt possible.

GUIDAGE ÉTAPE PAR ÉTAPE
Mitron affiche l'étape en cours : que faire, combien de temps cela dure et ce qui vient ensuite. Si vous autorisez les notifications, il vous prévient de la fin d'une étape même lorsque le téléphone est verrouillé. Pendant une étape qui demande vos mains, l'écran de guidage reste allumé. Les étapes avec un récipient chaud ou de la pâte crue comportent un avertissement. Le pain de seigle (plus de la moitié de la farine est de la farine de seigle) a ses propres étapes, sans rabats. Vous pouvez annuler une étape validée par erreur, et l'application revient à l'étape en cours quand vous la rouvrez.

LEVAINS
Gérez plusieurs levains. Mitron indique les quantités pour le rafraîchi selon un rapport 1:1:1, 1:2:2, 1:3:3 ou 1:5:5. Quand le levain a doublé de volume, Mitron le marque comme prêt pour la pâte. Après 12 heures à température ambiante sans rafraîchi, une notification vous le rappelle. Vous pouvez créer un nouveau levain jour après jour. Mitron applique le principe de précaution : en cas de pellicule, de décoloration ou d'odeur de pourri, il conseille de jeter le levain.

DOCTEUR PAIN
Mie serrée et croûte pâle ? Cochez les symptômes, et le Docteur Pain identifie l'un des 9 défauts, explique la cause et indique quoi changer la prochaine fois. Quatre protocoles de sauvetage vous aident quand la pâte a un problème pendant la fermentation. Le Docteur Levain vous aide quand quelque chose vous inquiète dans votre levain.

JOURNAL
Notez chaque miche : étoiles, mie, croûte et profil gustatif. Le Journal affiche des statistiques, et « Cuire à nouveau » ouvre la même recette.

VOS DONNÉES
Mitron conserve sur votre téléphone les 10 dernières sauvegardes automatiques. Vous pouvez exporter toutes vos données dans un fichier et les importer depuis un fichier, et exporter l'historique de vos fournées au format CSV. Unités : grammes et °C ou onces et °F.

BON À SAVOIR
Mitron fonctionne sur iPhone et ne synchronise pas les données entre appareils ; vous les transférez avec un fichier de sauvegarde. Sans autorisation des notifications, Mitron n'affiche la fin d'une étape que sur l'écran ouvert.

ACCÈS ET ACHAT
Basic est gratuit pour toujours, sans période d'essai. Pro ajoute la planification, l'entretien du levain naturel, davantage de levains et de recettes. Pro est un abonnement mensuel ou annuel, ou un achat unique à vie sur l'App Store.
Conditions d’utilisation (EULA) : https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Langues : 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk fr-CA … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.3/01-plan.png` | Du pain prêt à l'heure voulue | Un planning à rebours, sans étape en pleine nuit |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.3/02-receptura.png` | Les grammes de chaque ingrédient | Farine et eau du levain comptées dans le pourcentage boulanger |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.3/03-prowadzenie-ciemny.png` | Une étape à la fois | Que faire, combien de temps et une alerte en fin d'étape |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.3/04-doktor.png` | Améliorez votre prochaine miche | Symptômes, cause et un seul changement pour la prochaine fournée |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.3/05-zakwasy.png` | Un levain toujours prêt à temps | Quantités pour le rafraîchi et rappel après 12 heures |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.3/06-dziennik.png` | Chaque fournée enregistrée | Notez la miche et « Cuire à nouveau » en un seul geste |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fr-CA/iphone-6.3/07-offline.png` | Sans compte ni internet | Sans pub ni pistage ; vos données restent uniquement sur votre téléphone |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |
|---|---|---|
| CAN (Canada) | 0,99 / 9,99 / 19,99 CAD | D-038, docs/wydanie/ceny.json |

Pozostałe storefronty tej karty (0): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).
