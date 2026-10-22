// ============================================================================
// Piekarz — Stolnica: prowadzenie wybranego trwającego wypieku [M3 D3a]. Wypiek z trasy (`wypiek` = id, np. z
// powiadomienia kroku albo z „Wróć do: …”), inaczej nowy wypiek z planu, inaczej jedyny trwający; przy kilku bez id
// wybór na „Dziś” (P2-6). Przy dwóch trwających przełącznik nad prowadzeniem (BR-KAL-016 „Który krok czyj”);
// prowadzenie: ProwadzenieWypieku. Zapis odrzucony przez bazę (inny stan niż na ekranie) — odczyt od nowa [D3a-fix].
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getActiveBake, setActiveBake } from '../src/data/sqlite-store';
import { idSesji, sesjeDoPokazania, type SesjaDoPokazania } from '../src/data/bake-session-store';
import { loadActiveBakeSessionsZWersja } from '../src/data/bake-sessions-store';
import { ProwadzenieWypieku } from '../src/components/stolnica/ProwadzenieWypieku';
import { PrzelacznikWypiekow } from '../src/components/stolnica/PrzelacznikWypiekow';
import type { OdrzuconyZapis } from '../src/hooks/useBakeSession';

/**
 * Wypiek do pokazania: z trasy, gdy trwa; bez niego nowy wypiek z planu (jeszcze bez zapisu) albo jedyny trwający;
 * przy kilku trwających bez id null — wybór na „Dziś”, żeby powiadomienie bez id nie otworzyło cudzego wypieku (P2-6).
 */
function wybierzWypiek(lista: readonly SesjaDoPokazania[], zTrasy: string | undefined): string | null {
  const ids = lista.map((w) => idSesji(w.sesja));
  if (zTrasy !== undefined && ids.includes(zTrasy)) return zTrasy;
  const nowy = lista.find((w) => w.nowy);
  if (nowy) return idSesji(nowy.sesja);
  return ids.length === 1 ? ids[0] : null;
}

async function wczytaj(): Promise<SesjaDoPokazania[]> {
  // Nieudany odczyt zapisu to brak sesji, nie zgadnięty krok (bake-session-store parsuje z unknown)
  return sesjeDoPokazania(getActiveBake(), await loadActiveBakeSessionsZWersja().catch(() => []));
}

export default function StolnicaScreen() {
  const router = useRouter();
  const { wypiek } = useLocalSearchParams<{ wypiek?: string }>();
  const [lista, setLista] = useState<SesjaDoPokazania[] | null>(null);
  const [wybrany, setWybrany] = useState<string | null>(null);
  // Licznik odczytów: po odrzuconym zapisie prowadzenie montuje się od nowa ze stanem z bazy
  const [odczyt, setOdczyt] = useState(0);
  // Bieżący krok każdego wypieku dla przełącznika (prowadzony wypiek zgłasza zmianę kroku)
  const [kroki, setKroki] = useState<Record<string, string>>({});

  /** Lista od nowa i wybór: preferowany, gdy dalej trwa (P2-4: wypiek, który już nie trwa, nie zostawia pustego ekranu). */
  const odswiez = useCallback(async (preferowany: string | undefined) => {
    const l = await wczytaj();
    setLista(l);
    setWybrany(wybierzWypiek(l, preferowany));
    setOdczyt((n) => n + 1);
  }, []);

  useEffect(() => {
    void odswiez(typeof wypiek === 'string' ? wypiek : undefined);
  }, [wypiek, odswiez]);

  // Bez trwającego wypieku (koniec, przerwanie, powiadomienie po wypieku) albo przy kilku bez wyboru Stolnica
  // przekierowuje na Dziś: tam są wszystkie trwające (decyzja właściciela 2a) [M1-audytor-generalny-117]
  const pusta = lista !== null && wybrany === null;
  useEffect(() => {
    if (pusta) router.replace('/');
  }, [pusta, router]);

  const onKoniec = useCallback(() => {
    setWybrany(null);
  }, []);

  const biezacy = lista?.find((w) => idSesji(w.sesja) === wybrany);
  // Ile razy z rzędu zapis tego wypieku został odrzucony: po drugim razie powrót na „Dziś” zamiast pętli odczytów
  const odrzucenia = useRef<{ id: string; ile: number } | null>(null);
  const onOdrzucony = useCallback(
    (powod: OdrzuconyZapis) => {
      if (wybrany === null) return;
      // Nowy wypiek z planu, którego nie da się utworzyć (limit albo wiersz już jest): pamięć go nie trzyma (P2-1, P2-2)
      if ((powod === 'limit' || powod === 'istnieje') && getActiveBake()?.id === wybrany) setActiveBake(null);
      const ile = odrzucenia.current?.id === wybrany ? odrzucenia.current.ile + 1 : 1;
      odrzucenia.current = { id: wybrany, ile };
      if (powod === 'limit' || ile > 1) setWybrany(null);
      else void odswiez(wybrany);
    },
    [wybrany, odswiez]
  );
  if (!lista || !biezacy || wybrany === null) return null;

  const naglowek =
    lista.length > 1 ? (
      <PrzelacznikWypiekow
        wypieki={lista.map(({ sesja }) => {
          const id = idSesji(sesja);
          return { id, nazwa: sesja.recipeName, krok: kroki[id] ?? sesja.steps[sesja.stepIdx]?.name ?? '' };
        })}
        wybrany={wybrany}
        onWybierz={(id) => {
          // Przełączenie: odczyt z zapisu, żeby drugi wypiek wrócił na swoim kroku i zegarze
          if (id !== wybrany) void odswiez(id);
        }}
      />
    ) : undefined;

  return (
    <ProwadzenieWypieku
      key={`${wybrany}:${odczyt}`}
      start={biezacy.sesja}
      wersja={biezacy.wersja}
      naglowek={naglowek}
      onKoniec={onKoniec}
      onOdrzucony={onOdrzucony}
      onKrok={(krok) => setKroki((k) => (k[wybrany] === krok ? k : { ...k, [wybrany]: krok }))}
    />
  );
}
