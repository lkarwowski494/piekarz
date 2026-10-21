# Karta ustawień App Store: Spanish (Mexico) (`es-MX`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/es-MX.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Spanish (Mexico)**, kod ASC `es-MX`; język aplikacji `es-419` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Spanish (Mexico) (jeśli go nie ma: „Not Localized” → Spanish (Mexico) → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 16 — ARG (Argentina), BOL (Bolivia), CHL (Chile), COL (Colombia), CRI (Costa Rica), DOM (Dominican Republic), ECU (Ecuador), SLV (El Salvador), GTM (Guatemala), HND (Honduras), MEX (Mexico), NIC (Nicaragua), PAN (Panama), PRY (Paraguay), PER (Peru), VEN (Venezuela)
- Język dodatkowy: 3 — BLZ (Belize), USA (United States), URY (Uruguay)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 27 / 30 znaków · App Information

```text
Panadero: Pan de masa madre
```

### Podtytuł (Subtitle) · 30 / 30 znaków · App Information

```text
Calculadora y plan de horneado
```

### Słowa kluczowe (Keywords) · 95 / 100 bajtów (93 znaków) · wersja 1.0

```text
hidratación,fermentación,levadura,pizza,centeno,recetas,harina,temporizador,porcentaje,casero
```

### Tekst promocyjny (Promotional Text) · 166 / 170 znaków · wersja 1.0

```text
Fija la hora en que quieres el pan listo: Panadero calcula cantidades, planifica hacia atrás y te avisa al terminar cada paso. Sin cuenta, sin internet, sin anuncios.
```

### Opis (Description) · 3543 / 4000 znaków · wersja 1.0

```text
Panadero te guía en el horneado de pan de masa madre, de la fórmula a la hogaza: calcula las cantidades, arma el plan y lleva el tiempo aunque el teléfono esté en reposo. Funciona sin cuenta y sin internet, sin anuncios y sin rastreo. Tus fórmulas, masas madre y bitácora se quedan solo en tu teléfono.

FÓRMULAS Y CANTIDADES
Elige una de las 15 fórmulas base (de masa madre, de centeno, con levadura, pizza y dulces) o una propia. Indica el número de hogazas o el peso de la harina, y Panadero te da los gramos de harina, agua, masa madre, sal y levadura. El porcentaje del panadero incluye la harina y el agua de la masa madre y del fermento. Panadero también te indica la temperatura del agua para lograr la temperatura de la masa que buscas.

UN PLAN DESDE LA HORA “LISTO”
Elige cuándo debe estar listo el pan y Panadero calcula hacia atrás la hora de inicio de cada paso. El tiempo de fermentación depende de la temperatura de tu cocina. Si un paso que requiere tus manos cae de noche (por defecto entre las 23:00 y las 07:00), Panadero te propone más tiempo en el refrigerador. Si no alcanza el tiempo, te indica la hora más temprana posible.

GUÍA PASO A PASO
Panadero muestra el paso actual: qué hacer, cuánto dura y qué viene después. Si permites las notificaciones, te avisa del final de un paso incluso con el teléfono bloqueado. En un paso que requiere tus manos, la pantalla de la guía no se apaga. Los pasos con un recipiente caliente o masa cruda llevan una advertencia. El pan de centeno (más de la mitad de la harina es harina de centeno) tiene sus propios pasos, sin pliegues. Puedes deshacer un paso confirmado por error y, al volver a abrir la app, regresas al paso actual.

MASAS MADRE
Lleva varias masas madre. Panadero te da las cantidades para alimentarlas en proporción 1:1:1, 1:2:2, 1:3:3 o 1:5:5. Cuando la masa madre duplica su volumen, Panadero la marca como lista para la masa. Tras 12 horas fuera del refrigerador sin alimentar, te la recuerda con una notificación. Puedes crear una masa madre nueva día a día. Panadero aplica el principio de precaución: si hay película, cambio de color u olor a podrido, te aconseja desechar la masa madre.

DOCTOR DEL PAN
¿Miga compacta y corteza pálida? Marca los síntomas y el Doctor del Pan identifica uno de 9 defectos, explica la causa y te dice qué cambiar la próxima vez. El Doctor de la masa madre te ayuda cuando algo de tu masa madre te preocupa.

BITÁCORA
Califica cada hogaza: estrellas, miga, corteza y perfil de sabor. La Bitácora muestra estadísticas y “Hornear de nuevo” abre la misma fórmula.

TUS DATOS
Panadero guarda en el teléfono las 10 copias de seguridad automáticas más recientes. Puedes exportar todos tus datos a un archivo e importarlos desde un archivo, y exportar tu historial de horneados como CSV. Unidades: gramos y °C u onzas y °F.

CONVIENE SABER
Panadero funciona en iPhone y no sincroniza datos entre dispositivos; los datos se transfieren con el archivo de copia. Sin permiso para notificaciones, Panadero muestra el final de un paso solo con la pantalla abierta.

ACCESO Y COMPRA
El acceso completo se obtiene con una suscripción mensual o anual, o con una compra única de por vida en el App Store. La suscripción puede empezar con un periodo de prueba gratuito (oferta introductoria del App Store para usuarios elegibles). Sin compra, puedes consultar tu historial de horneados, importar un archivo, y exportar y eliminar tus datos.
Términos de uso (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk es-MX … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.3/01-plan.png` | Pan listo a la hora que quieras | Plan hacia atrás sin pasos en plena noche |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.3/02-receptura.png` | Gramos de cada ingrediente al instante | Harina y agua de la masa madre incluidas en el porcentaje del panadero |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.3/03-prowadzenie-ciemny.png` | Un paso a la vez | Qué hacer, cuánto dura y aviso al terminar cada paso |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.3/04-doktor.png` | Qué mejorar en tu próxima hogaza | Síntomas, causa y un cambio para tu próximo horneado |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.3/05-zakwasy.png` | Masa madre siempre lista a tiempo | Cantidades de alimentación y recordatorio tras 12 horas |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.3/06-dziennik.png` | Cada horneado registrado | Califica la hogaza y “Hornear de nuevo” con un toque |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-MX/iphone-6.3/07-offline.png` | Sin cuenta y sin internet | Sin anuncios ni rastreo; tus datos solo en tu teléfono |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |
|---|---|---|
| MEX (Mexico) | 19 / 149 / 299 MXN | D-038, docs/wydanie/ceny.json |
| USA (United States), bazowy | 0,99 / 6,99 / 14,99 USD | D-038, docs/wydanie/ceny.json |

Pozostałe storefronty tej karty (17): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).
