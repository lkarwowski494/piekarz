# Karta ustawień App Store: Portuguese (Portugal) (`pt-PT`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/pt-PT.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Portuguese (Portugal)**, kod ASC `pt-PT`; język aplikacji `pt` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Portuguese (Portugal) (jeśli go nie ma: „Not Localized” → Portuguese (Portugal) → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 1 — PRT (Portugal)
- Język dodatkowy: 0 — —
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 24 / 30 znaków · App Information

```text
Padeiro: Pão e massa-mãe
```

### Podtytuł (Subtitle) · 30 / 30 znaków · App Information

```text
Calculadora e plano de fornada
```

### Słowa kluczowe (Keywords) · 91 / 100 bajtów (87 znaków) · wersja 1.0

```text
hidratação,fermentação,levain,receitas,caseiro,artesanal,pizza,centeio,farinha,fermento
```

### Tekst promocyjny (Promotional Text) · 162 / 170 znaków · wersja 1.0

```text
Defina a hora a que quer o pão pronto: o Padeiro calcula as quantidades, cria o plano inverso e avisa no fim de cada passo. Sem conta, sem internet, sem anúncios.
```

### Opis (Description) · 3431 / 4000 znaków · wersja 1.0

```text
O Padeiro acompanha-o na fornada de pão de fermento natural, da receita ao pão: calcula as quantidades, organiza o plano e controla o tempo enquanto o telemóvel está em repouso. Funciona sem conta e sem internet, sem anúncios e sem rastreio. As suas receitas, fermentos naturais e diário ficam apenas no seu telemóvel.

RECEITAS E QUANTIDADES
Escolha uma das 15 receitas base (de fermento natural, de centeio, de levedura, pizza e doces) ou uma receita própria. Defina o número de pães ou o peso da farinha, e o Padeiro indica os gramas de farinha, água, fermento natural, sal e levedura. A percentagem de padeiro tem em conta a farinha e a água do fermento natural e do isco. O Padeiro indica também a temperatura da água para obter a temperatura da massa que pretende.

PLANO A PARTIR DA HORA «PRONTO»
Escolha quando o pão deve estar pronto, e o Padeiro calcula para trás a hora de início de cada passo. O tempo de fermentação depende da temperatura da cozinha. Quando um passo que exige as suas mãos calha de noite (por predefinição, entre as 23:00 e as 06:30), o Padeiro propõe um tempo mais longo no frigorífico. Quando o tempo não chega, indica a hora mais cedo possível.

ORIENTAÇÃO PASSO A PASSO
O Padeiro mostra o passo atual: o que fazer, quanto tempo demora e o que vem a seguir. Se permitir as notificações, avisa do fim do passo mesmo com o telemóvel bloqueado. O ecrã de orientação não se apaga durante a fornada. Os passos com recipiente quente ou massa crua têm um aviso. O pão de centeio (mais de metade da farinha é farinha de centeio) tem passos próprios, sem dobras. Pode anular um passo confirmado por engano e, ao reabrir a app, esta regressa ao passo atual.

FERMENTOS NATURAIS
Mantenha vários fermentos naturais. O Padeiro indica as quantidades para a alimentação na proporção 1:1:1, 1:2:2, 1:3:3 ou 1:5:5. Quando o fermento natural duplicar de volume, o Padeiro marca-o como pronto para a massa. Após 12 horas na bancada sem alimentação, o Padeiro envia uma notificação de lembrete. Pode criar um novo fermento natural dia após dia. O Padeiro segue o princípio da precaução: perante película, descoloração ou cheiro a podre, aconselha deitar fora o fermento natural.

DOUTOR PÃO
Miolo compacto e côdea pálida? Assinale os sintomas e o Doutor Pão indica um de 9 defeitos, explica a causa e diz o que alterar da próxima vez. O Doutor Fermento ajuda quando algo no seu fermento natural o preocupa.

DIÁRIO
Avalie cada pão: estrelas, miolo, côdea e perfil de sabor. O Diário mostra estatísticas, e «Cozer novamente» abre a mesma receita.

OS SEUS DADOS
O Padeiro guarda no telemóvel as 10 cópias de segurança automáticas mais recentes. Pode exportar todos os dados para um ficheiro e importá-los de um ficheiro, e exportar o histórico de fornadas em CSV. Unidades: gramas e °C ou onças e °F.

BOM SABER
O Padeiro funciona no iPhone e não sincroniza dados entre dispositivos; os dados são transferidos com o ficheiro de cópia de segurança. Sem autorização para notificações, o Padeiro mostra o fim do passo apenas com o ecrã aberto.

ACESSO E COMPRA
O acesso completo é obtido com uma subscrição mensal ou anual, ou com uma compra vitalícia única na App Store. A subscrição pode começar com um período experimental gratuito (oferta introdutória da App Store para utilizadores elegíveis). Sem compra, pode consultar o histórico de fornadas, importar um ficheiro e exportar e eliminar os seus dados.

Idiomas: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk pt-PT … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.3/01-plan.png` | Pão pronto à hora que quiser | Plano inverso sem passos a meio da noite |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.3/02-receptura.png` | Gramas de cada ingrediente na hora | Farinha e água do fermento natural incluídas na percentagem de padeiro |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.3/03-prowadzenie-ciemny.png` | Um passo de cada vez | O que fazer, quanto demora e notificação no fim do passo |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.3/04-doktor.png` | O que melhorar no próximo pão | Sintomas, causa e uma alteração para a próxima fornada |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.3/05-zakwasy.png` | Fermento natural sempre pronto a tempo | Quantidades para alimentar e lembrete após 12 horas |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.3/06-dziennik.png` | Cada fornada registada | Avaliação do pão e «Cozer novamente» com um toque |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-PT/iphone-6.3/07-offline.png` | Sem conta e sem internet | Sem anúncios nem rastreio; dados só no seu telemóvel |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).
