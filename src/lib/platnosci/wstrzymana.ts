// ============================================================================
// Piekarz — akcja wstrzymana przez ekran Pro (04-studio-projektowe-018, decyzja M1 wg rekomendacji) [M3 W-fix2].
// Stuknięcie funkcji Pro bez Pro zapamiętuje akcję; po zakupie (dostęp z fałszu na prawdę) wykonuje się ona raz, a
// zamknięcie ekranu Pro bez zakupu ją porzuca. Jedna akcja na proces, jak jeden ekran zakupu (ekran.ts).
// ============================================================================

let akcja: (() => void | Promise<void>) | null = null;

/** Funkcja Pro bez Pro: akcja do wykonania po zakupie (nowsza zastępuje starszą). */
export function wstrzymajAkcje(fn: () => void | Promise<void>): void {
  akcja = fn;
}

/** Ekran Pro zamknięty bez zakupu. */
export function porzucAkcje(): void {
  akcja = null;
}

/** Zakup nadał dostęp: wstrzymana akcja raz. */
export function wznowAkcje(): void {
  const fn = akcja;
  akcja = null;
  if (fn) void fn();
}
