#!/usr/bin/env bash
# Uruchamia polecenie Maestro i ponawia je najwyżej raz, wyłącznie gdy padł start sterownika XCUITest
# („iOS driver not ready in time”), zanim wykonał się jakikolwiek przepływ (brak linii [Passed]/[Failed]/[Skipped]).
# Każda inna porażka, także porażka przepływu, kończy krok z kodem Maestro, bez ponowienia.
# Nazwany wyjątek od zakazu ponowień w bramce: awaria maszyny przed pierwszym scenariuszem, jedno powtórzenie
# (M2-p4-N10, KO-011, D-330; diagnoza iOS E2E #103, run 42725323063). Limit startu sterownika jest tylko w env
# workflow e2e-ios.yml; ten skrypt go nie zmienia.
# Użycie: bash scripts/ci/ponow-start-sterownika.sh maestro --device "$UDID" test .maestro/e2e ...
# Wyjście każdej próby zostaje w $E2E_LOG_DIR (domyślnie zrzuty-e2e, katalog artefaktu maestro-e2e).
set -u

KOMUNIKAT_STEROWNIKA='iOS driver not ready in time'
WYNIK_PRZEPLYWU='\[(Passed|Failed|Skipped)\]'
LOGI="${E2E_LOG_DIR:-zrzuty-e2e}"
mkdir -p "$LOGI"

# proba <nr> <polecenie...>: uruchamia polecenie, wyjście na ekran i do pliku; zwraca kod polecenia (nie tee).
proba() {
  local nr="$1"
  shift
  LOG="$LOGI/maestro-proba-$nr.log"
  "$@" 2>&1 | tee "$LOG"
  return "${PIPESTATUS[0]}"
}

proba 1 "$@"
kod=$?
if [ "$kod" -eq 0 ]; then
  exit 0
fi

if grep -qF "$KOMUNIKAT_STEROWNIKA" "$LOG" && ! grep -qE "$WYNIK_PRZEPLYWU" "$LOG"; then
  echo "::warning::Start sterownika Maestro przekroczył limit przed pierwszym przepływem; jedno ponowienie (M2-p4-N10, D-330)."
  proba 2 "$@"
  kod=$?
fi
exit "$kod"
