#!/usr/bin/env bash
# dSYM prebudowanych frameworków React Native do archiwum przed eksportem (032, KO-028; D-356; sesja J).
# TF #25 (build 1025): „Upload Symbols Failed. The archive did not include a dSYM for the React.framework /
# ReactNativeDependencies.framework / hermesvm.framework” — te frameworki przychodzą z Maven jako binaria, bez dSYM w archiwum.
# Źródło dSYM (odczyt 2026-11-10): Maven Central, ta sama wersja co frameworki:
#   com/facebook/react/react-native-artifacts/<RN>/react-native-artifacts-<RN>-reactnative-core-dSYM-release.tar.gz  (ios-arm64/React.framework.dSYM)
#   …-reactnative-dependencies-dSYM-release.tar.gz  (ios-arm64/ReactNativeDependencies.framework.dSYM)
#   com/facebook/hermes/hermes-ios/<H>/hermes-ios-<H>-hermes-framework-dSYM-release.tar.gz  (iphoneos/hermesvm.framework.dSYM)
# Adresy jak w node_modules/react-native/scripts/cocoapods/rncore.rb, rndependencies.rb i sdks/hermes-engine/hermes-utils.rb
# (Maven przekierowuje 301 na repo.reactnative.dev — stąd curl -L). Wersja Hermes jak hermes-engine.podspec (V1, chyba że
# RCT_HERMES_V1_ENABLED=0). Kontrole: SHA-256 z pliku .sha256 Maven; UUID dSYM = UUID binarki w archiwum (dwarfdump --uuid).
# Brak frameworka w aplikacji (np. build ze źródeł) → pominięty z informacją; niezgodny UUID albo błąd pobrania → ostrzeżenie
# i pominięcie (wydanie idzie dalej; „Upload Symbols Failed” w logu eksportu łapie zadanie `symbole` w testflight.yml).
# Wynik: `dodane=<0..3>` w GITHUB_OUTPUT (zadanie `symbole` wymaga 3). Bez sekretów. Użycie: bash scripts/ci/dsym-ramy.sh <ścieżka .xcarchive>
set -uo pipefail
ARCHIWUM="${1:-}"
[ -n "$ARCHIWUM" ] || { echo "::warning::dSYM: brak ścieżki archiwum"; exit 0; }
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MAVEN="${ENTERPRISE_REPOSITORY:-https://repo1.maven.org/maven2}"
RN=$(node -p "require('$ROOT/node_modules/react-native/package.json').version")
PROP="$ROOT/node_modules/react-native/sdks/hermes-engine/version.properties"
if [ "${RCT_HERMES_V1_ENABLED:-}" = "0" ]; then KLUCZ=HERMES_VERSION_NAME; else KLUCZ=HERMES_V1_VERSION_NAME; fi
HERMES=$(sed -n "s/^$KLUCZ=//p" "$PROP" | tr -d '\r')
[ -n "$RN" ] && [ -n "$HERMES" ] || { echo "::warning::dSYM: nie ustalono wersji (RN '$RN', Hermes '$HERMES')"; exit 0; }
APP=$(ls -d "$ARCHIWUM"/Products/Applications/*.app 2>/dev/null | head -n 1)
[ -n "$APP" ] || { echo "::warning::dSYM: brak .app w archiwum"; exit 0; }
mkdir -p "$ARCHIWUM/dSYMs"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
DODANE=0
# Budżet czasu na całe pobieranie (recenzja J2, P1; repo zabrania continue-on-error, 07-jakosc-011): każdy curl dostaje
# tylko resztę budżetu, po jego wyczerpaniu kolejne frameworki są pomijane z ostrzeżeniem. Krok ma timeout-minutes 12 jako bezpiecznik.
BUDZET_S=${DSYM_BUDZET_S:-480}
reszta() { echo $(( BUDZET_S - SECONDS )); }

# $1 = nazwa frameworka, $2 = ścieżka w Maven, $3 = katalog dSYM w tarballu
dodaj() {
  local nazwa="$1" sciezka="$2" wtar="$3" bin plik oczek jest u_bin u_dsym
  bin="$APP/Frameworks/$nazwa.framework/$nazwa"
  if [ ! -f "$bin" ]; then echo "dSYM $nazwa: frameworka nie ma w aplikacji — pominięty"; return 0; fi
  plik="$TMP/$nazwa.tar.gz"
  if [ "$(reszta)" -lt 30 ]; then echo "::warning::dSYM $nazwa: budżet czasu pobierania wyczerpany — pominięty"; return 0; fi
  if ! curl -fsSL --retry 2 --retry-all-errors --retry-delay 10 --retry-max-time "$(reszta)" --connect-timeout 30 --max-time "$(reszta)" -o "$plik" "$MAVEN/$sciezka"; then
    echo "::warning::dSYM $nazwa: pobranie nieudane ($sciezka)"; return 0
  fi
  oczek=$(curl -fsSL --retry 3 --retry-all-errors --retry-delay 15 --connect-timeout 30 --max-time 30 "$MAVEN/$sciezka.sha256" | tr -d ' \r\n' | cut -c1-64)
  jest=$(shasum -a 256 "$plik" | cut -d ' ' -f 1)
  if [ -z "$oczek" ] || [ "$oczek" != "$jest" ]; then echo "::warning::dSYM $nazwa: SHA-256 niezgodne z Maven"; return 0; fi
  mkdir -p "$TMP/$nazwa" && tar -xzf "$plik" -C "$TMP/$nazwa" "./$wtar" || { echo "::warning::dSYM $nazwa: brak $wtar w tarballu"; return 0; }
  u_bin=$(dwarfdump --uuid "$bin" | awk '$3 == "(arm64)" {print $2; exit}')
  u_dsym=$(dwarfdump --uuid "$TMP/$nazwa/$wtar" | awk '$3 == "(arm64)" {print $2; exit}')
  if [ -z "$u_bin" ] || [ "$u_bin" != "$u_dsym" ]; then
    echo "::warning::dSYM $nazwa: UUID niezgodny (aplikacja $u_bin, dSYM $u_dsym) — pominięty"; return 0
  fi
  rm -rf "$ARCHIWUM/dSYMs/$nazwa.framework.dSYM"
  cp -R "$TMP/$nazwa/$wtar" "$ARCHIWUM/dSYMs/"
  echo "dSYM $nazwa: dodany (UUID $u_bin)"; DODANE=$((DODANE + 1))
}

dodaj React "com/facebook/react/react-native-artifacts/$RN/react-native-artifacts-$RN-reactnative-core-dSYM-release.tar.gz" ios-arm64/React.framework.dSYM
dodaj ReactNativeDependencies "com/facebook/react/react-native-artifacts/$RN/react-native-artifacts-$RN-reactnative-dependencies-dSYM-release.tar.gz" ios-arm64/ReactNativeDependencies.framework.dSYM
dodaj hermesvm "com/facebook/hermes/hermes-ios/$HERMES/hermes-ios-$HERMES-hermes-framework-dSYM-release.tar.gz" iphoneos/hermesvm.framework.dSYM
M="dSYM prebudowanych frameworków (RN $RN, Hermes $HERMES): dodane $DODANE z 3"
[ -z "${GITHUB_OUTPUT:-}" ] || echo "dodane=$DODANE" >> "$GITHUB_OUTPUT"
echo "$M"; [ -z "${GITHUB_STEP_SUMMARY:-}" ] || echo "$M" >> "$GITHUB_STEP_SUMMARY"
exit 0
