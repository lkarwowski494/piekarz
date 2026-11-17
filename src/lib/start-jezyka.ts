// ============================================================================
// Piekarz — język na starcie z limitem czasu (KO-071, AB-06/AB-07, D-424)
// Drzewo ekranów czeka na język (D-423, `start-jezyk-ladowanie`), więc odczyt zapisu języka nie może wisieć ani rzucać:
// po błędzie albo po limicie czasu start idzie dalej z językiem systemu (`ustawJezykSystemu`). Spóźniony wynik odczytu
// ustawia zapisany język później; krój i teksty przeliczają ekrany subskrybujące język (D-424).
// ============================================================================

/** Najdłuższe oczekiwanie na odczyt języka z zapisu (jeden odczyt `app_settings`, busy_timeout 5000 ms); wybór konserwatywny, D-424. */
export const JEZYK_START_LIMIT_MS = 3000;

/** `init` (odczyt języka) z limitem czasu; przy błędzie albo po limicie wywołuje `zapasowy` (język systemu). Nie rzuca. */
export async function jezykNaStart(init: () => Promise<void>, zapasowy: () => void, limitMs: number = JEZYK_START_LIMIT_MS): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limit = new Promise<'limit'>((resolve) => {
    timer = setTimeout(() => resolve('limit'), limitMs);
  });
  try {
    // Promise.race obsługuje też późne odrzucenie `init`, więc nie ma nieobsłużonego odrzucenia
    const wynik = await Promise.race([init().then(() => 'ok' as const), limit]);
    if (wynik === 'limit') zapasowy();
  } catch {
    zapasowy();
  } finally {
    clearTimeout(timer);
  }
}
