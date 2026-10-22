// ============================================================================
// Piekarz — Stolnica: prowadzenie wybranego trwającego wypieku [M3 D3a]. Wypiek z trasy (`wypiek` = id, np. z
// powiadomienia kroku albo z „Wróć do: …”), inaczej wypiek przekazany z planu, inaczej najstarszy trwający. Przy dwóch
// trwających przełącznik nad prowadzeniem (BR-KAL-016 „Który krok czyj”); prowadzenie: ProwadzenieWypieku.
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getActiveBake } from '../src/data/sqlite-store';
import { idSesji, sesjeDoPokazania, type SesjaDoPokazania } from '../src/data/bake-session-store';
import { loadActiveBakeSessions } from '../src/data/bake-sessions-store';
import { ProwadzenieWypieku } from '../src/components/stolnica/ProwadzenieWypieku';
import { PrzelacznikWypiekow } from '../src/components/stolnica/PrzelacznikWypiekow';

/** Wypiek do pokazania: z trasy, gdy trwa; potem przekazany z planu; potem najstarszy. */
function wybierzWypiek(lista: readonly SesjaDoPokazania[], zTrasy: string | undefined, wPamieci: string | undefined): string | null {
  const ids = lista.map((w) => idSesji(w.sesja));
  if (zTrasy !== undefined && ids.includes(zTrasy)) return zTrasy;
  if (wPamieci !== undefined && ids.includes(wPamieci)) return wPamieci;
  return ids[0] ?? null;
}

export default function StolnicaScreen() {
  const router = useRouter();
  const { wypiek } = useLocalSearchParams<{ wypiek?: string }>();
  const [lista, setLista] = useState<SesjaDoPokazania[] | null>(null);
  const [wybrany, setWybrany] = useState<string | null>(null);
  // Bieżący krok każdego wypieku dla przełącznika (prowadzony wypiek zgłasza zmianę kroku)
  const [kroki, setKroki] = useState<Record<string, string>>({});

  useEffect(() => {
    let zywy = true;
    void (async () => {
      // Nieudany odczyt zapisu to brak sesji, nie zgadnięty krok (bake-session-store parsuje z unknown)
      const zapis = await loadActiveBakeSessions().catch(() => []);
      if (!zywy) return;
      const l = sesjeDoPokazania(getActiveBake(), zapis);
      setLista(l);
      setWybrany(wybierzWypiek(l, typeof wypiek === 'string' ? wypiek : undefined, getActiveBake()?.id));
    })();
    return () => {
      zywy = false;
    };
  }, [wypiek]);

  // Bez trwającego wypieku (koniec, przerwanie, powiadomienie po wypieku) Stolnica przekierowuje na Dziś:
  // wypiek zaczyna się z receptury, historia jest w Dzienniku (decyzja właściciela 2a) [M1-audytor-generalny-117]
  const pusta = lista !== null && wybrany === null;
  useEffect(() => {
    if (pusta) router.replace('/');
  }, [pusta, router]);

  const onKoniec = useCallback(() => {
    setWybrany(null);
  }, []);

  const biezacy = lista?.find((w) => idSesji(w.sesja) === wybrany);
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
          if (id === wybrany) return;
          // Przełączenie: odczyt z zapisu, żeby drugi wypiek wrócił na swoim kroku i zegarze
          void loadActiveBakeSessions()
            .catch(() => [])
            .then((zapis) => {
              setLista(sesjeDoPokazania(getActiveBake(), zapis));
              setWybrany(id);
            });
        }}
      />
    ) : undefined;

  return (
    <ProwadzenieWypieku
      key={wybrany}
      start={biezacy.sesja}
      nowy={biezacy.nowy}
      naglowek={naglowek}
      onKoniec={onKoniec}
      onKrok={(krok) => setKroki((k) => (k[wybrany] === krok ? k : { ...k, [wybrany]: krok }))}
    />
  );
}
