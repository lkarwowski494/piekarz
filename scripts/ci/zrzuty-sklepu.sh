#!/usr/bin/env bash
# Zrzuty sklepu z symulatora iOS (zrzuty-sklepu.yml; KO-025, 2026-11-10; wzór: oczko scripts/ci/zrzuty-sklepu.sh @ 87ade5a).
# Dla każdej lokalizacji: język i region symulatora (defaults + restart, jak e2e-ios.yml), pasek stanu 9:41, tryb jasny,
# 00-przygotuj.yaml (dane FIKCYJNE: zakwas i jeden zakończony wypiek), potem sceny 01…07 — każda to osobny scenariusz Maestro
# (restart na tych samych danych + nawigacja), po nim `xcrun simctl io screenshot` (natywne piksele, bez ramki Maestro).
# Scena 03 w trybie ciemnym (jak obecna ramka) i przedostatnia, bo zostawia trwający wypiek; 07 po niej, jasna (D-383). Nieudana scena: jedno ponowienie;
# po drugiej porażce wpis w `nieudane-<część>.txt`, reszta idzie dalej, kod wyjścia 1.
# Zgoda na powiadomienia raz na zadanie w en-US (00-zgoda.yaml), potem lokalizacje bez ponownej instalacji aplikacji.
# Ekranu zakupu tu nie ma (D-365): bez StoreKit symulator nie dawał cen (`bez-oferty/`, D-353); zrzut zakupu robi E2E z atrapą
# ofert (.maestro/e2e-zakup, e2e-ios.yml; docs/wydanie/zrzut-zakupu.md).
# W logu tylko kody lokalizacji, nazwy plików i liczby (repo publiczne). Bez sekretów.
# Użycie: bash scripts/ci/zrzuty-sklepu.sh <UDID> <katalog klasy, np. iphone-6.9> <wyjście> <dzienniki> <app Pro> "<kod:AppleLanguages:AppleLocale> …"
# Zmienne: CZESC (nazwa części do nazw plików dziennika), ZRZUTY_SCENY (podzbiór SCENY z planu, KO-047, D-380; puste = wszystkie),
# ZRZUTY_PAUZA (sekundy po scenie przed zrzutem, domyślnie 3; test: 0).
# Zegar maszyny (KO-049, D-385): symulator bierze czas z maszyny, a pasek pokazuje 9:41 — skrypt ustawia zegar runnera
# (sudo bez hasła): dokarmienie 03:35 (00-przygotuj), podwojenie i wypiek 09:35 (00-przygotuj-podwojenie), każda scena 09:41.
# Dni zawsze przyszłe (lokalizacja n = dziś + n dni), więc skoki idą do przodu; NTP wyłączone na czas przebiegu, na końcu
# włączone i zegar zsynchronizowany (trap EXIT). Bez sudo: ostrzeżenie i zegar maszyny jak dotąd.
set -uo pipefail
UDID="$1"; KLASA="$2"; OUT="$3"; LOGI="$4"; APP_PRO="$5"; JEZYKI="$6"
CZESC="${CZESC:-$KLASA}"
FLOWS="$(cd "$(dirname "$0")/../.." && pwd)/.maestro/zrzuty-sklepu"
BUNDLE_ID="com.apps4brew.baker"
# Kolejność: 03 zostawia trwający wypiek, więc idzie po scenach, które go nie chcą; 07 po 03 pokazuje „Dziś” z tym wypiekiem
# zamiast pustego stanu (KO-051, D-383). Pozostałe nie zmieniają danych.
SCENY="02-receptura 01-plan 05-zakwasy 06-dziennik 04-doktor 03-prowadzenie-ciemny 07-offline"
# --- wybór scen (KO-047, D-380): plan podaje sceny w kolejności SCENY; tu tylko obrona przed nazwą spoza listy
if [ -n "${ZRZUTY_SCENY:-}" ]; then
  for s in $ZRZUTY_SCENY; do
    case " $SCENY " in *" $s "*) ;; *) echo "::error::ZRZUTY_SCENY: nieznana scena $s"; exit 2 ;; esac
  done
  SCENY="$ZRZUTY_SCENY"
fi

mkdir -p "$OUT" "$LOGI"
NIEUDANE="$LOGI/nieudane-$CZESC.txt"; : > "$NIEUDANE"

# --- zegar maszyny (KO-049, D-385)
ZEGAR=0; DZIEN=""
dzien_za() { date -v+"$1"d +%Y%m%d 2>/dev/null || date -d "+$1 day" +%Y%m%d; }   # macOS (BSD) albo GNU
zegar() {   # $1 = GGMM w dniu $DZIEN (format BSD date: ccyymmddHHMM)
  [ "$ZEGAR" = 1 ] || return 0
  sudo -n date "$DZIEN$1" >/dev/null 2>&1 || echo "::warning::zegar: nie ustawiono $DZIEN $1 (godziny w scenach z zegara maszyny)"
}
przywroc_zegar() {
  [ "$ZEGAR" = 1 ] || return 0
  sudo -n systemsetup -setusingnetworktime on >/dev/null 2>&1 || true
  sudo -n sntp -sS time.apple.com >/dev/null 2>&1 || echo "::warning::zegar: synchronizacja po przebiegu nieudana"
}
if sudo -n systemsetup -setusingnetworktime off >/dev/null 2>&1; then
  ZEGAR=1; trap przywroc_zegar EXIT
else
  echo "::warning::zegar maszyny bez zmian (brak sudo bez hasła): godziny w scenach nie będą zgodne z paskiem 9:41"
fi

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
      sleep "${ZRZUTY_PAUZA:-3}"   # animacje przejścia kończą się po asercji; bez tego zrzut łapie stan pośredni
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
  NR_JEZYKA=$(( ${NR_JEZYKA:-0} + 1 )); DZIEN="$(dzien_za "$NR_JEZYKA")"
  gotowe=0
  for proba in 1 2; do   # obie części od nowa (00-przygotuj zaczyna od clearState)
    zegar 0335
    if maestro_run "$KOD" 00-przygotuj "$proba"; then
      zegar 0935
      if maestro_run "$KOD" 00-przygotuj-podwojenie "$proba"; then gotowe=1; break; fi
      echo "::warning::$KOD 00-przygotuj-podwojenie: próba $proba nieudana"
      tail -15 "$LOGI/$CZESC-$KOD-00-przygotuj-podwojenie-$proba/maestro.log" | sed 's/^/    /'
    else
      echo "::warning::$KOD 00-przygotuj: próba $proba nieudana"
      tail -15 "$LOGI/$CZESC-$KOD-00-przygotuj-$proba/maestro.log" | sed 's/^/    /'
    fi
  done
  if [ "$gotowe" != 1 ]; then
    echo "::error::$KOD 00-przygotuj nieudane dwukrotnie — brak danych do zrzutów tej lokalizacji"
    echo "$KOD 00-przygotuj" >> "$NIEUDANE"; echo "::endgroup::"; continue
  fi
  for s in $SCENY; do
    zegar 0941
    [ "$s" = 03-prowadzenie-ciemny ] && xcrun simctl ui "$UDID" appearance dark >/dev/null 2>&1
    [ "$s" = 07-offline ] && xcrun simctl ui "$UDID" appearance light >/dev/null 2>&1
    scena "$KOD" "$s" "$OUT/$KOD/$KLASA/$s.png"
  done
  xcrun simctl ui "$UDID" appearance light >/dev/null 2>&1 || true
  echo "::endgroup::"
done

xcrun simctl status_bar "$UDID" clear >/dev/null 2>&1 || true
echo "Zrzuty ($CZESC): $(find "$OUT" -name '*.png' | wc -l | tr -d ' ') plików; nieudane: $(wc -l < "$NIEUDANE" | tr -d ' ')"
if [ -s "$NIEUDANE" ]; then
  M="Nieudane dwukrotnie ($CZESC): $(tr '\n' ';' < "$NIEUDANE")"; echo "::error::$M"
  [ -z "${GITHUB_STEP_SUMMARY:-}" ] || echo "$M" >> "$GITHUB_STEP_SUMMARY"
  exit 1
fi
