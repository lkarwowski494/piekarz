// limit.mjs — propozycja reguły darmowego limitu dni wypieku (model V3 wg wzorca portfela; rola 02, STOP E2c, 2026-10-22).
// Czysta funkcja bez zależności, wzorzec: Oczko docs/monetyzacja/limit.mjs (P-057). Wektory: wektory-limitu.json.
// To propozycja do wyboru właściciela, nie kod aplikacji: rola 08 przepisze ją na TypeScript dopiero po decyzji.
// Dzień wypieku = data lokalna (czas telefonu w chwili startu), w której zaczął się wypiek prowadzony w Stolnicy.
// Strażnik woła startWypieku() przy każdym starcie wypieku (Stolnica, „Piecz ponownie”, start planu z kalendarza) i przy
// każdym wejściu, które zastępuje wypiek; dopisanie wstecz, edycja historii, import, kroki trwającego wypieku, karmienie
// zakwasu i planowanie go nie wołają.
// node limit.mjs wektory-limitu.json → sprawdza wektory; kod wyjścia 0 wszystkie zgodne, 1 niezgodność, 2 złe wywołanie.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIMIT_DNI = 5; // „pieczesz raz w tygodniu? zawsze za darmo”: miesiąc ma najwyżej 5 tych samych dni tygodnia
export const PRZERWA_MS = 60 * 60 * 1000; // start po północy bez przerwy < 60 min od ostatniej czynności przy wypieku: ten sam dzień

const DATA = /^\d{4}-\d{2}-\d{2}$/;

// dni: zapisane dni wypieku [{ data: 'RRRR-MM-DD', pro: boolean }] (pro: czy w chwili startu Pro było aktywne).
// ostatniaCzynnosc: ms ostatniego startu albo ukończonego kroku dowolnego wypieku (null = brak).
// Zwraca: dozwolone, zapis (dzień do dopisania albo null), zostalo (darmowe dni w miesiącu po zdarzeniu).
export function startWypieku({ dni, dzis, teraz, ostatniaCzynnosc, pro, limit = LIMIT_DNI, przerwa = PRZERWA_MS }) {
  if (!Array.isArray(dni) || !DATA.test(dzis) || !Number.isFinite(teraz)) throw new Error('startWypieku: złe dane wejściowe');
  const miesiac = dzis.slice(0, 7);
  // Do limitu liczą się tylko dni bez aktywnego Pro (zasada 5 wzorca).
  const darmowe = (lista) => lista.filter((d) => d.data.startsWith(miesiac) && !d.pro).length;
  const wynik = (dozwolone, zapis) => ({ dozwolone, zapis, zostalo: Math.max(0, limit - darmowe(zapis ? [...dni, zapis] : dni)) });
  // Praca przez północ: drugi wypiek zaczęty < 60 min po ostatniej czynności nie otwiera nowego dnia.
  if (ostatniaCzynnosc !== null && teraz - ostatniaCzynnosc >= 0 && teraz - ostatniaCzynnosc < przerwa) return wynik(true, null);
  // Dzień już policzony: drugi wypiek tego dnia (D-104 „Prowadź oba”), także po przerwaniu pierwszego.
  if (dni.some((d) => d.data === dzis)) return wynik(true, null);
  if (pro) return wynik(true, { data: dzis, pro: true });
  if (darmowe(dni) < limit) return wynik(true, { data: dzis, pro: false });
  return wynik(false, null); // na limicie: ekran Pro przy starcie; reszta aplikacji działa (poza tą funkcją)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [plik] = process.argv.slice(2);
  if (!plik) { console.error('Użycie: node limit.mjs wektory-limitu.json'); process.exit(2); }
  const w = JSON.parse(readFileSync(plik, 'utf8'));
  let zle = 0;
  for (const v of w.startWypieku) {
    const jest = startWypieku({ ...v.wejscie, limit: w.limit, przerwa: w.przerwa_ms });
    const ok = JSON.stringify(jest) === JSON.stringify(v.oczekiwane);
    if (!ok) zle++;
    console.log(`${ok ? 'OK ' : 'ŹLE'} ${v.id} ${v.scenariusz}${ok ? '' : ` → ${JSON.stringify(jest)}`}`);
  }
  console.log(`${w.startWypieku.length - zle} z ${w.startWypieku.length} zgodnych`);
  process.exit(zle ? 1 : 0);
}
