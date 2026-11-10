#!/usr/bin/env bash
# Zrzuty sklepu z symulatora iOS (zrzuty-sklepu.yml; KO-025, 2026-11-10; wzór: oczko scripts/ci/zrzuty-sklepu.sh @ 87ade5a).
# Dla każdej lokalizacji: język i region symulatora (defaults + restart, jak e2e-ios.yml), pasek stanu 9:41, tryb jasny,
# 00-przygotuj.yaml (dane FIKCYJNE: zakwas i jeden zakończony wypiek), potem sceny 01…07 — każda to osobny scenariusz Maestro
# (restart na tych samych danych + nawigacja), po nim `xcrun simctl io screenshot` (natywne piksele, bez ramki Maestro).
# Scena 03 w trybie ciemnym (jak obecna ramka) i ostatnia, bo zostawia trwający wypiek. Nieudana scena: jedno ponowienie;
# po drugiej porażce wpis w `nieudane-<część>.txt`, reszta idzie dalej, kod wyjścia 1.
# Zgoda na powiadomienia raz na zadanie w en-US (00-zgoda.yaml), potem lokalizacje bez ponownej instalacji aplikacji.
# Ekran zakupu (opcjonalnie, `ZAKUP=<kod lokalizacji>`, po wszystkich lokalizacjach): aplikacja Basic (bez EXPO_PUBLIC_E2E), scena zakup.yaml, potem
# zakup-oferta.yaml — z ofertą sklepu plik idzie do `review/zakup.png`, bez oferty do `bez-oferty/review/zakup.png` (ostrzeżenie).
# W logu tylko kody lokalizacji, nazwy plików i liczby (repo publiczne). Bez sekretów.
# Użycie: bash scripts/ci/zrzuty-sklepu.sh <UDID> <katalog klasy, np. iphone-6.9> <wyjście> <dzienniki> <app Pro> <app Basic|-> "<kod:AppleLanguages:AppleLocale> …"
# Zmienne: ZAKUP (kod lokalizacji ekranu zakupu albo puste), CZESC (nazwa części do nazw plików dziennika).
set -uo pipefail
UDID="$1"; KLASA="$2"; OUT="$3"; LOGI="$4"; APP_PRO="$5"; APP_BASIC="$6"; JEZYKI="$7"
ZAKUP="${ZAKUP:-}"; CZESC="${CZESC:-$KLASA}"
FLOWS="$(cd "$(dirname "$0")/../.." && pwd)/.maestro/zrzuty-sklepu"
BUNDLE_ID="com.apps4brew.baker"
# Kolejność: 03 ostatnia (zostawia trwający wypiek); pozostałe nie zmieniają danych.
SCENY="07-offline 02-receptura 01-plan 05-zakwasy 06-dziennik 04-doktor 03-prowadzenie-ciemny"
mkdir -p "$OUT" "$LOGI"
NIEUDANE="$LOGI/nieudane-$CZESC.txt"; : > "$NIEUDANE"

maestro_run() {   # $1 = kod lokalizacji, $2 = scenariusz (bez .yaml), $3 = próba
  local log="$LOGI/$CZESC-$1-$2-$3"; mkdir -p "$log"
  maestro --device "$UDID" test "$FLOWS/$2.yaml" --test-output-dir "$log" > "$log/maestro.log" 2>&1
}
pomiar() { sips -g pixelWidth -g pixelHeight "$1" | awk '/pixelWidth/ {w=$2} /pixelHeight/ {h=$2} END {print w "x" h}'; }
pasek() {
  xcrun simctl status_bar "$UDID" override --time "9:41" --dataNetwork wifi --wifiMode active --wifiBars 3 \
    --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100 >/dev/null 2>&1 \
    || echo "::warning::Nie udało się ustawić paska stanu (zrzuty będą miały godzinę maszyny)"
}
jezyk() {   # $1 = AppleLanguages, $2 = AppleLocale; restart symulatora jak e2e-ios.yml (aplikacja bierze język systemu)
  xcrun simctl spawn "$UDID" defaults write -g AppleLanguages -array "$1"
  xcrun simctl spawn "$UDID" defaults write -g AppleLocale -string "$2"
  xcrun simctl shutdown "$UDID" >/dev/null 2>&1 || true
  xcrun simctl boot "$UDID"
  xcrun simctl bootstatus "$UDID" -b >/dev/null
  pasek
  xcrun simctl ui "$UDID" appearance light >/dev/null 2>&1 || true
}
instaluj() {   # $1 = katalog .app; czysta instalacja
  xcrun simctl uninstall "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
  xcrun simctl install "$UDID" "$1"
}
zrzut() {   # $1 = plik docelowy
  mkdir -p "$(dirname "$1")"
  xcrun simctl io "$UDID" screenshot --type=png "$1" >/dev/null 2>&1 && [ -s "$1" ]
}
scena() {   # $1 = kod lokalizacji, $2 = scena, $3 = plik docelowy; dwie próby
  local proba
  for proba in 1 2; do
    if maestro_run "$1" "$2" "$proba"; then
      sleep 3   # animacje przejścia kończą się po asercji; bez tego zrzut łapie stan pośredni
      if zrzut "$3"; then echo "zrzut $1 $KLASA $2: $(pomiar "$3"), $(wc -c < "$3" | tr -d ' ') B"; return 0; fi
      echo "::warning::$1 $2: simctl screenshot nie zapisał pliku (próba $proba)"
    else
      echo "::warning::$1 $2: scenariusz nieudany (próba $proba)"; tail -12 "$LOGI/$CZESC-$1-$2-$proba/maestro.log" | sed 's/^/    /'
    fi
  done
  echo "$1 $2" >> "$NIEUDANE"; return 1
}

# --- zgoda na powiadomienia raz na zadanie, w en-US (okno systemu rozpoznawane tekstem „Allow”; recenzja J, P0) ---
# Potem lokalizacje bez ponownej instalacji: decyzja systemu zostaje przy zmianie języka [DO USTALENIA: i przy clearState].
jezyk en-US en_US
instaluj "$APP_PRO"
if ! maestro_run en-US 00-zgoda 1; then
  echo "::warning::00-zgoda nieudane — okno zgody może zasłonić sceny w językach innych niż pl i en"
  tail -15 "$LOGI/$CZESC-en-US-00-zgoda-1/maestro.log" | sed 's/^/    /'
fi

for wpis in $JEZYKI; do
  IFS=: read -r KOD LANG_SYM LOCALE_SYM <<< "$wpis"
  [ -n "$KOD" ] && [ -n "$LANG_SYM" ] && [ -n "$LOCALE_SYM" ] || { echo "::error::zły wpis lokalizacji: $wpis"; exit 2; }
  echo "::group::$KOD ($LANG_SYM, $LOCALE_SYM) $KLASA"
  jezyk "$LANG_SYM" "$LOCALE_SYM"
  if ! maestro_run "$KOD" 00-przygotuj 1; then
    echo "::warning::$KOD 00-przygotuj: próba 1 nieudana — ponawiam (scenariusz zaczyna od clearState)"
    tail -15 "$LOGI/$CZESC-$KOD-00-przygotuj-1/maestro.log" | sed 's/^/    /'
    if ! maestro_run "$KOD" 00-przygotuj 2; then
      echo "::error::$KOD 00-przygotuj nieudane dwukrotnie — brak danych do zrzutów tej lokalizacji"
      echo "$KOD 00-przygotuj" >> "$NIEUDANE"; echo "::endgroup::"; continue
    fi
  fi
  for s in $SCENY; do
    [ "$s" = 03-prowadzenie-ciemny ] && xcrun simctl ui "$UDID" appearance dark >/dev/null 2>&1
    scena "$KOD" "$s" "$OUT/$KOD/$KLASA/$s.png"
  done
  xcrun simctl ui "$UDID" appearance light >/dev/null 2>&1 || true
  echo "::endgroup::"
done

# --- ekran zakupu po wszystkich lokalizacjach (aplikacja Basic zastępuje Pro) ---
if [ -n "$ZAKUP" ]; then
  wpis=$(printf '%s\n' $JEZYKI | grep "^$ZAKUP:" | head -1)
  if [ -z "$wpis" ]; then echo "::error::ekran zakupu: lokalizacji $ZAKUP nie ma w tej części"; echo "$ZAKUP zakup" >> "$NIEUDANE"
  else
    IFS=: read -r KOD LANG_SYM LOCALE_SYM <<< "$wpis"
    echo "::group::zakup $KOD"
    jezyk "$LANG_SYM" "$LOCALE_SYM"
    if [ "$APP_BASIC" = "-" ] || [ ! -d "$APP_BASIC" ]; then
      echo "::error::ekran zakupu: brak aplikacji Basic"; echo "$KOD zakup" >> "$NIEUDANE"
    else
      instaluj "$APP_BASIC"
      TMP_ZAKUP="$OUT/.zakup-$KOD.png"
      if scena "$KOD" zakup "$TMP_ZAKUP"; then
        if maestro_run "$KOD" zakup-oferta 1; then
          mkdir -p "$OUT/review"; mv "$TMP_ZAKUP" "$OUT/review/zakup.png"; echo "zakup: oferta sklepu widoczna → review/zakup.png"
        else
          mkdir -p "$OUT/bez-oferty/review"; mv "$TMP_ZAKUP" "$OUT/bez-oferty/review/zakup.png"
          echo "::warning::zakup: sklep nie zwrócił oferty na symulatorze (brak cen) — plik w bez-oferty/review/zakup.png, NIE do App Review"
        fi
      fi
    fi
    echo "::endgroup::"
  fi
fi

xcrun simctl status_bar "$UDID" clear >/dev/null 2>&1 || true
echo "Zrzuty ($CZESC): $(find "$OUT" -name '*.png' | wc -l | tr -d ' ') plików; nieudane: $(wc -l < "$NIEUDANE" | tr -d ' ')"
if [ -s "$NIEUDANE" ]; then
  M="Nieudane dwukrotnie ($CZESC): $(tr '\n' ';' < "$NIEUDANE")"; echo "::error::$M"
  [ -z "${GITHUB_STEP_SUMMARY:-}" ] || echo "$M" >> "$GITHUB_STEP_SUMMARY"
  exit 1
fi
