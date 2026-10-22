# Karta ustawień App Store: Spanish (Spain) (`es-ES`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/es-ES.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Spanish (Spain)**, kod ASC `es-ES`; język aplikacji `es` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Spanish (Spain) (jeśli go nie ma: „Not Localized” → Spanish (Spain) → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 1 — ESP (Spain)
- Język dodatkowy: 0 — —
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

### Tekst promocyjny (Promotional Text) · 161 / 170 znaków · wersja 1.0

```text
Elige a qué hora quieres el pan listo: Panadero calcula cantidades, planifica hacia atrás y te avisa al acabar cada paso. Sin cuenta, sin internet, sin anuncios.
```

### Opis (Description) · 3645 / 4000 znaków · wersja 1.0

```text
Panadero te guía en el horneado de pan de masa madre, desde la receta hasta la hogaza: calcula las cantidades, organiza el plan y vigila los tiempos aunque el teléfono esté en reposo. Funciona sin cuenta y sin internet, sin anuncios y sin rastreo. Tus recetas, masas madre y diario se quedan solo en tu teléfono.

RECETAS Y CANTIDADES
Elige una de las 15 recetas base (de masa madre, de centeno, con levadura, pizza y dulces) o una propia. Indica el número de hogazas o el peso de la harina, y Panadero te da los gramos de harina, agua, masa madre, sal y levadura. El porcentaje del panadero tiene en cuenta la harina y el agua de la masa madre y del levain. Panadero también te indica la temperatura del agua para obtener la temperatura de la masa que quieres.

UN PLAN DESDE LA HORA «LISTO»
Elige cuándo quieres el pan listo y Panadero calcula hacia atrás la hora de inicio de cada paso. El tiempo de fermentación depende de la temperatura de tu cocina. Cuando un paso que requiere tus manos cae de noche (por defecto, entre las 23:00 y las 07:00), Panadero te propone más tiempo en la nevera. Si no hay tiempo suficiente, te indica la hora más temprana posible.

GUÍA PASO A PASO
Panadero muestra el paso actual: qué hacer, cuánto dura y qué viene después. Si permites las notificaciones, te avisa del final de cada paso incluso con el teléfono bloqueado. En los pasos que requieren tus manos, la pantalla de guía no se apaga. Los pasos con un recipiente caliente o con masa cruda llevan una advertencia. El pan de centeno (más de la mitad de la harina es harina de centeno) tiene sus propios pasos, sin pliegues. Puedes deshacer un paso confirmado por error y, al volver a abrir la app, vuelves al paso actual.

MASAS MADRE
Gestiona varias masas madre. Panadero te da las cantidades de refresco en proporción 1:1:1, 1:2:2, 1:3:3 o 1:5:5. Cuando la masa madre duplica su volumen, Panadero la marca como lista para la masa. Tras 12 horas en la encimera sin refresco, te la recuerda con una notificación. Puedes crear una masa madre nueva día a día. Panadero aplica el principio de precaución: si hay película, cambio de color u olor a podrido, te aconseja tirar la masa madre.

DOCTOR DEL PAN
¿Miga compacta y corteza pálida? Marca los síntomas y el Doctor del Pan señala uno de 9 defectos, explica la causa y te dice qué cambiar la próxima vez. Cuatro protocolos de rescate te ayudan cuando la masa tiene problemas durante la fermentación. El Doctor de la masa madre te ayuda cuando algo de tu masa madre te preocupa.

DIARIO
Valora cada hogaza: estrellas, miga, corteza y perfil de sabor. El Diario muestra estadísticas y «Hornear de nuevo» abre la misma receta.

TUS DATOS
Panadero guarda en el teléfono las 10 últimas copias de seguridad automáticas. Puedes exportar todos los datos a un archivo e importarlos desde un archivo, y exportar el historial de horneados en CSV. Unidades: gramos y °C u onzas y °F.

CONVIENE SABER
Panadero funciona en iPhone y no sincroniza los datos entre dispositivos; los datos se trasladan con el archivo de copia. Sin permiso para las notificaciones, Panadero solo muestra el final de un paso con la pantalla abierta.

ACCESO Y COMPRA
El acceso completo se obtiene con una suscripción mensual o anual, o con una compra única de por vida en el App Store. La suscripción puede empezar con un periodo de prueba gratuito (oferta introductoria del App Store para quienes cumplan los requisitos). Sin compra, puedes consultar el historial de horneados, importar un archivo y exportar y eliminar tus datos.
Condiciones de uso (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk es-ES … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.3/01-plan.png` | Pan listo a la hora que tú elijas | Plan hacia atrás sin pasos en plena noche |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.3/02-receptura.png` | Gramos de cada ingrediente al momento | Harina y agua de la masa madre incluidas en el porcentaje del panadero |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.3/03-prowadzenie-ciemny.png` | Un paso cada vez | Qué hacer, cuánto dura y aviso al terminar cada paso |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.3/04-doktor.png` | Qué mejorar en tu próxima hogaza | Síntomas, causa y un solo cambio para el próximo horneado |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.3/05-zakwasy.png` | Masa madre siempre lista a tiempo | Cantidades de refresco y recordatorio a las 12 horas |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.3/06-dziennik.png` | Cada horneado, registrado | Valora la hogaza y «Hornear de nuevo» con un toque |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/es-ES/iphone-6.3/07-offline.png` | Sin cuenta y sin internet | Sin anuncios ni rastreo; tus datos, solo en tu teléfono |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |
|---|---|---|
| ESP (Spain) | 0,99 / 7,99 / 17,99 EUR | D-038, docs/wydanie/ceny.json |

Pozostałe storefronty tej karty (0): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).
