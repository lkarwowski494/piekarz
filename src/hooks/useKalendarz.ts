// ============================================================================
// Piekarz — dane kalendarza na „Dziś” (BR-KAL-001…007; D-105, D-106) [M3 D4b]
// Odczyt przy wejściu na zakładkę i po decyzji „Zrobione”/„Pomiń”; zegar co minutę, więc po północy wyróżniony jest
// nowy dzień najpóźniej po minucie (BR-KAL-001 „Północ”, RD-29-W2). Liczy zdarzenia tygodnia i 7 dni naprzód (arkusz
// najbliższych z „+N”). Niczego nie zapisuje (BR-KAL-007).
// ============================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { addCalendarDays, startOfLocalDay } from '../core/dzien-lokalny';
import { NAJBLIZSZE_DNI } from '../core/kalendarz-config';
import { czyKalendarzPusty, liniaNastepne, znacznikiDni, type LiniaNastepne, type ZnacznikDnia } from '../core/kalendarz-nastepne';
import { zdarzeniaKalendarza, type DaneKalendarza, type ZdarzenieKalendarza } from '../core/kalendarz-zdarzenia';
import { wczytajDaneKalendarza } from '../lib/kalendarz-dane';
import { dniPaska, type DzienPaska } from '../lib/kalendarz-pasek';
import { systemFirstWeekday } from '../lib/format';

const MINUTA_MS = 60_000;

export interface StanKalendarza {
  gotowe: boolean;
  now: number;
  dane: DaneKalendarza | null;
  dni: DzienPaska[];
  zdarzenia: ZdarzenieKalendarza[];
  linia: LiniaNastepne;
  znaczniki: Record<string, ZnacznikDnia>;
  /** Brak wypieków, planów, zakwasów i wpisów (BR-KAL-005): pasek z adnotacją, bez „Następne”. */
  pusty: boolean;
  /** Id trwających i zaplanowanych wypieków w kolejności (drugi trwający = trójkąt na pasku). */
  wypieki: string[];
  odswiez: () => void;
}

const PUSTA_LINIA: LiniaNastepne = { zalegle: [], przyszle: [], wiecej: 0, wszystkiePrzyszle: [] };

/** `zmiana` (np. dostęp z App Store) wymusza ponowny odczyt — terminy karmienia zależą od dostępu (BR-KAL-006). */
export function useKalendarz(zmiana: unknown): StanKalendarza {
  const [dane, ustawDane] = useState<DaneKalendarza | null>(null);
  const [now, ustawNow] = useState(() => Date.now());
  const [odczyt, ustawOdczyt] = useState(0);
  const odswiez = useCallback(() => ustawOdczyt((n) => n + 1), []);

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

  const dni = useMemo(() => dniPaska(now, systemFirstWeekday()), [now]);
  return useMemo(() => {
    const klucze = dni.map((d) => d.klucz);
    if (!dane) return { gotowe: false, now, dane, dni, zdarzenia: [], linia: PUSTA_LINIA, znaczniki: znacznikiDni([], klucze), pusty: true, wypieki: [], odswiez };
    const odMs = dni[0]?.ms ?? startOfLocalDay(now);
    const doMs = Math.max(addCalendarDays(odMs, 7), addCalendarDays(startOfLocalDay(now), NAJBLIZSZE_DNI + 1));
    const zdarzenia = zdarzeniaKalendarza(dane, now, { odMs, doMs });
    return {
      gotowe: true,
      now,
      dane,
      dni,
      zdarzenia,
      linia: liniaNastepne(zdarzenia, now),
      znaczniki: znacznikiDni(zdarzenia, klucze),
      pusty: czyKalendarzPusty(dane),
      wypieki: [...dane.wypieki.map((w) => w.id), ...dane.zaplanowane.map((p) => p.id)],
      odswiez,
    };
  }, [dane, now, dni, odswiez]);
}
