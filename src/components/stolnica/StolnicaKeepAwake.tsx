// ============================================================================
// Apps4Brew Studio — StolnicaKeepAwake
// Ekran nie gaśnie tylko podczas aktywnego wypieku na widocznej Stolnicy; zakładki zostają zamontowane,
// więc sam useKeepAwake w ekranie trzymał blokadę w całej aplikacji [M1-audytor-generalny-060].
// ============================================================================

import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

export const STOLNICA_KEEP_AWAKE_TAG = 'piekarz-stolnica';

function KeepAwakeOn() {
  useKeepAwake(STOLNICA_KEEP_AWAKE_TAG);
  return null;
}

export function StolnicaKeepAwake({ active }: { active: boolean }) {
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  return active && focused ? <KeepAwakeOn /> : null;
}
