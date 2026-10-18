// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Siri Shortcuts & Voice Deep Linking (App Intents Support)
// Hands-free voice automation for flour-dusted hands
// ============================================================================

export interface SiriShortcutDescriptor {
  id: string;
  titlePl: string;
  phrasePl: string;
  titleEn: string;
  phraseEn: string;
  urlScheme: string;
}

export const SIRI_SHORTCUTS: readonly SiriShortcutDescriptor[] = [
  {
    id: 'siri_lid_off',
    titlePl: 'Ile czasu do zdjęcia pokrywki?',
    phrasePl: 'Zdejmij pokrywkę',
    titleEn: 'Dutch Oven Lid Off',
    phraseEn: 'Remove Dutch oven lid',
    urlScheme: 'piekarz://stolnica/lid-off',
  },
  {
    id: 'siri_record_fold',
    titlePl: 'Zarejestruj złożenie ciasta',
    phrasePl: 'Złóż ciasto',
    titleEn: 'Record Dough Fold',
    phraseEn: 'Fold the dough',
    urlScheme: 'piekarz://stolnica/fold',
  },
  {
    id: 'siri_next_stage',
    titlePl: 'Przejdź do kolejnego etapu wypieku',
    phrasePl: 'Kolejny etap',
    titleEn: 'Next Baking Stage',
    phraseEn: 'Next bake stage',
    urlScheme: 'piekarz://stolnica/next',
  },
  {
    id: 'siri_emergency_doctor',
    titlePl: 'Ratuj ciasto w Doktorze Chleba',
    phrasePl: 'Ratuj ciasto',
    titleEn: 'Emergency Bread Recovery',
    phraseEn: 'Save my bread',
    urlScheme: 'piekarz://doktor/emergency',
  },
  {
    id: 'siri_calculate_ddt',
    titlePl: 'Oblicz temperaturę wody DDT',
    phrasePl: 'Temperatura wody',
    titleEn: 'Calculate DDT Water Temp',
    phraseEn: 'Calculate water temperature',
    urlScheme: 'piekarz://kalkulator/ddt',
  },
] as const;

export interface SiriCommand {
  target: 'stolnica' | 'doktor' | 'kalkulator';
  action: 'lid-off' | 'fold' | 'next' | 'emergency' | 'ddt';
}

/**
 * Parses incoming deep links from Siri Shortcuts.
 */
export function parseSiriDeepLink(url: string): SiriCommand | null {
  if (!url || !url.startsWith('piekarz://')) return null;

  const stripped = url.replace('piekarz://', '');
  const [target, action] = stripped.split('/');

  if (target === 'stolnica' && (action === 'lid-off' || action === 'fold' || action === 'next')) {
    return { target: 'stolnica', action };
  }
  if (target === 'doktor' && action === 'emergency') {
    return { target: 'doktor', action: 'emergency' };
  }
  if (target === 'kalkulator' && action === 'ddt') {
    return { target: 'kalkulator', action: 'ddt' };
  }

  return null;
}
