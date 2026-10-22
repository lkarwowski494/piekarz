// ============================================================================
// Piekarz — dane kalendarza na „Dziś” (BR-KAL-001…008, BR-KAL-013; D-105, D-106, D-114) [M3 D4b, D7]
// Odczyt przy wejściu na zakładkę i po decyzji „Zrobione”/„Pomiń”; zegar co minutę, więc po północy wyróżniony jest
// nowy dzień najpóźniej po minucie (BR-KAL-001 „Północ”, RD-29-W2). Widok: tydzień albo miesiąc, przesuwany o dni
// kalendarza (RD-30); zdarzenia z pokazanego okresu i zawsze z dziś + 7 dni (linia „Następne”, arkusz „+N”).
// Niczego nie zapisuje (BR-KAL-007).
// ============================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { czyKalendarzPusty, liniaNastepne, znacznikiDni, type LiniaNastepne, type ZnacznikDnia } from '../core/kalendarz-nastepne';
import { zdarzeniaKalendarza, type DaneKalendarza, type ZdarzenieKalendarza } from '../core/kalendarz-zdarzenia';
import { wczytajDaneKalendarza } from '../lib/kalendarz-dane';
import { dniPaska, type DzienPaska } from '../lib/kalendarz-pasek';
import { czyBiezacy, dniMiesiaca, przesunWidok, tytulWidoku, widokDzis, zakresWidoku, zmienTryb, type DzienMiesiaca, type TrybWidoku, type Widok } from '../lib/kalendarz-widok';
import { systemFirstWeekday } from '../lib/format';

const MINUTA_MS = 60_000;

/** Przejścia widoku: poprzedni/następny okres, powrót do dziś, tryb tydzień/miesiąc (BR-KAL-008, BR-KAL-013). */
export interface NawigacjaWidoku {
  tryb: TrybWidoku;
  tytul: string;
  /** Pokazany okres zawiera dziś: „Dziś” niepotrzebne. */
  biezacy: boolean;
  przesun: (n: -1 | 1) => void;
  dzis: () => void;
  ustawTryb: (t: TrybWidoku) => void;
}

export interface StanKalendarza {
  gotowe: boolean;
  now: number;
  dane: DaneKalendarza | null;
  dni: DzienPaska[];
  /** Tygodnie siatki miesiąca (tryb „miesiąc”), inaczej pusta lista. */
  miesiac: DzienMiesiaca[][];
  zdarzenia: ZdarzenieKalendarza[];
  linia: LiniaNastepne;
  znaczniki: Record<string, ZnacznikDnia>;
  /** Brak wypieków, planów, zakwasów i wpisów (BR-KAL-005): pasek z adnotacją, bez „Następne”. */
  pusty: boolean;
  /** Id trwających i zaplanowanych wypieków w kolejności (drugi trwający = trójkąt na pasku). */
  wypieki: string[];
  widok: NawigacjaWidoku;
  odswiez: () => void;
}

const PUSTA_LINIA: LiniaNastepne = { zalegle: [], przyszle: [], wiecej: 0, wszystkiePrzyszle: [] };

/** `zmiana` (np. dostęp z App Store) wymusza ponowny odczyt — terminy karmienia zależą od dostępu (BR-KAL-006). */
export function useKalendarz(zmiana: unknown): StanKalendarza {
  const [dane, ustawDane] = useState<DaneKalendarza | null>(null);
  const [now, ustawNow] = useState(() => Date.now());
  const [odczyt, ustawOdczyt] = useState(0);
  const odswiez = useCallback(() => ustawOdczyt((n) => n + 1), []);
  const [widok, ustawWidok] = useState<Widok>(() => widokDzis('tydzien', Date.now()));

  // Wejście na zakładkę: licznik wejść (odczyt niżej) i zegar minutowy tylko, gdy ekran jest widoczny
  const [wejscie, ustawWejscie] = useState(0);
  useFocusEffect(
    useCallback(() => {
      ustawWejscie((n) => n + 1);
      const zegar = setInterval(() => ustawNow(Date.now()), MINUTA_MS);
      return () => clearInterval(zegar);
    }, [])
  );

  useEffect(() => {
    if (wejscie === 0) return undefined;
    let zywy = true;
    const teraz = Date.now();
    ustawNow(teraz);
    // Nieudany odczyt to pusty kalendarz w tej chwili, nie zgadnięte dane (następne wejście czyta od nowa)
    void wczytajDaneKalendarza(teraz)
      .catch(() => null)
      .then((d) => {
        if (zywy) ustawDane(d);
      });
    return () => {
      zywy = false;
    };
  }, [wejscie, odczyt, zmiana]);

  const first = systemFirstWeekday();
  const nawigacja = useMemo<NawigacjaWidoku>(
    () => ({
      tryb: widok.tryb,
      tytul: tytulWidoku(widok, first),
      biezacy: czyBiezacy(widok, now, first),
      przesun: (n) => ustawWidok((w) => przesunWidok(w, n)),
      dzis: () => ustawWidok((w) => widokDzis(w.tryb, Date.now())),
      ustawTryb: (t) => ustawWidok((w) => zmienTryb(w, t, Date.now())),
    }),
    [widok, now, first]
  );
  const dni = useMemo(() => dniPaska(now, first, widok.kotwica), [now, first, widok.kotwica]);
  const miesiac = useMemo(() => (widok.tryb === 'miesiac' ? dniMiesiaca(widok.kotwica, first, now) : []), [widok, first, now]);
  return useMemo(() => {
    const klucze = (widok.tryb === 'miesiac' ? miesiac.flat() : dni).map((d) => d.klucz);
    const wspolne = { now, dane, dni, miesiac, widok: nawigacja, odswiez };
    if (!dane) return { ...wspolne, gotowe: false, zdarzenia: [], linia: PUSTA_LINIA, znaczniki: znacznikiDni([], klucze), pusty: true, wypieki: [] };
    const zdarzenia = zdarzeniaKalendarza(dane, now, zakresWidoku(widok, first, now));
    return {
      ...wspolne,
      gotowe: true,
      zdarzenia,
      linia: liniaNastepne(zdarzenia, now),
      znaczniki: znacznikiDni(zdarzenia, klucze),
      pusty: czyKalendarzPusty(dane),
      wypieki: [...dane.wypieki.map((w) => w.id), ...dane.zaplanowane.map((p) => p.id)],
    };
  }, [dane, now, dni, miesiac, widok, first, nawigacja, odswiez]);
}
