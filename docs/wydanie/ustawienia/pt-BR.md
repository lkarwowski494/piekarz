# Karta ustawień App Store: Portuguese (Brazil) (`pt-BR`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/pt-BR.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Portuguese (Brazil)**, kod ASC `pt-BR`; język aplikacji `pt-BR` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Portuguese (Brazil) (jeśli go nie ma: „Not Localized” → Portuguese (Brazil) → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 1 — BRA (Brazil)
- Język dodatkowy: 1 — USA (United States)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 28 / 30 znaków · App Information

```text
Padeiro: Fermentação Natural
```

### Podtytuł (Subtitle) · 30 / 30 znaków · App Information

```text
Calculadora e plano de fornada
```

### Słowa kluczowe (Keywords) · 96 / 100 bajtów (94 znaków) · wersja 1.0

```text
hidratação,levain,receitas,caseiro,artesanal,pizza,centeio,farinha,fermento,massa,temporizador
```

### Tekst promocyjny (Promotional Text) · 169 / 170 znaków · wersja 1.0

```text
Defina a hora em que o pão deve ficar pronto: o Padeiro calcula as quantidades, monta o plano reverso e avisa o fim de cada etapa. Sem conta, sem internet, sem anúncios.
```

### Opis (Description) · 3518 / 4000 znaków · wersja 1.0

```text
O Padeiro guia você na fornada de pão de fermentação natural, da receita ao pão pronto: calcula as quantidades, monta o plano e controla o tempo mesmo com o celular em repouso. Funciona sem conta e sem internet, sem anúncios e sem rastreamento. Suas receitas, seus fermentos naturais e seu diário ficam só no seu celular.

RECEITAS E QUANTIDADES
Escolha uma das 15 receitas base (de fermentação natural, de centeio, com fermento biológico, pizza e doces) ou uma receita própria. Defina o número de pães ou o peso da farinha, e o Padeiro informa os gramas de farinha, água, fermento natural, sal e fermento biológico. A porcentagem do padeiro considera a farinha e a água do fermento natural e do levain. O Padeiro também informa a temperatura da água para chegar à temperatura da massa que você quer.

PLANO A PARTIR DO HORÁRIO “PRONTO”
Escolha quando o pão deve ficar pronto, e o Padeiro calcula de trás para frente o horário de início de cada etapa. O tempo de fermentação depende da temperatura da cozinha. Quando uma etapa que exige suas mãos cai à noite (por padrão, entre 23:00 e 07:00), o Padeiro sugere um tempo maior na geladeira. Quando o tempo é curto demais, ele informa o horário mais cedo possível.

ORIENTAÇÃO PASSO A PASSO
O Padeiro mostra a etapa atual: o que fazer, quanto tempo leva e o que vem depois. Se você permitir notificações, ele avisa o fim da etapa mesmo com o celular bloqueado. Durante uma etapa que exige suas mãos, a tela de orientação não se apaga. Etapas com recipiente quente ou massa crua têm um aviso. O pão de centeio (mais da metade da farinha é farinha de centeio) tem etapas próprias, sem dobras. Você pode desfazer uma etapa confirmada por engano e, ao reabrir o app, ele volta para a etapa atual.

FERMENTOS NATURAIS
Mantenha vários fermentos naturais. O Padeiro informa as quantidades para alimentação na proporção 1:1:1, 1:2:2, 1:3:3 ou 1:5:5. Quando o fermento natural dobrar de volume, o Padeiro o marca como pronto para a massa. Após 12 horas na bancada sem alimentação, ele lembra você com uma notificação. Você pode iniciar um novo fermento natural dia a dia. O Padeiro segue o princípio da precaução: em caso de película, alteração de cor ou cheiro de podre, recomenda jogar o fermento natural fora.

DOUTOR DO PÃO
Miolo compacto e casca pálida? Marque os sintomas, e o Doutor do Pão aponta um de 9 defeitos, explica a causa e diz o que mudar na próxima vez. Quatro protocolos de resgate ajudam quando a massa tem problemas durante a fermentação. O Doutor do Fermento ajuda quando algo no fermento natural preocupa você.

DIÁRIO
Avalie cada pão: estrelas, miolo, casca e perfil de sabor. O Diário mostra estatísticas, e “Assar novamente” abre a mesma receita.

SEUS DADOS
O Padeiro guarda no celular os 10 últimos backups automáticos. Você pode exportar todos os dados para um arquivo e importá-los de um arquivo, e exportar o histórico de fornadas em CSV. Unidades: gramas e °C ou onças e °F.

BOM SABER
O Padeiro funciona no iPhone e não sincroniza dados entre dispositivos; você transfere os dados com o arquivo de backup. Sem permissão para notificações, o Padeiro mostra o fim da etapa só com a tela aberta.

ACESSO E COMPRA
O Basic é gratuito para sempre, sem período de teste. O Pro adiciona planejamento, cuidados com o fermento natural, mais fermentos naturais e receitas. O Pro é uma assinatura mensal ou anual ou uma compra vitalícia única na App Store.
Termos de Uso (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk pt-BR … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.3/01-plan.png` | Pão pronto na sua hora | Plano reverso sem etapas no meio da noite |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.3/02-receptura.png` | Gramas de cada ingrediente na hora | Farinha e água do fermento natural incluídas na porcentagem do padeiro |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.3/03-prowadzenie-ciemny.png` | Uma etapa por vez | O que fazer, quanto tempo leva e aviso no fim da etapa |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.3/04-doktor.png` | O que melhorar no próximo pão | Sintomas, causa e uma mudança para a próxima fornada |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.3/05-zakwasy.png` | Fermento natural pronto a tempo | Quantidades de alimentação e lembrete após 12 horas |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.3/06-dziennik.png` | Cada fornada registrada | Avaliação do pão e “Assar novamente” com um toque |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/pt-BR/iphone-6.3/07-offline.png` | Sem conta e sem internet | Sem anúncios nem rastreamento; dados só no seu celular |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |
|---|---|---|
| USA (United States), bazowy | 0,99 / 6,99 / 14,99 USD | D-038, docs/wydanie/ceny.json |

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).
