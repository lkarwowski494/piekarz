// ============================================================================
// Piekarz (Crust) — UI Theme Tokens
// Apps4Craft Studio: Dark Basalt Ceramic (#121214) with Warm Crust Gold (#D49B42)
// Official integration with @apps4craft/ui
// ============================================================================

import { getCraftTheme, sharedCraftTokens } from '@apps4craft/ui';

export const craftTheme = getCraftTheme('piekarz');

export const theme = {
  colors: {
    // Ceramic Basalt surfaces
    background: sharedCraftTokens.colors.bgBasalt,          // #121214
    backgroundSecondary: sharedCraftTokens.colors.bgCard, // #1C1C1F
    surface: sharedCraftTokens.colors.bgCard,             // #1C1C1F
    surfaceCard: sharedCraftTokens.colors.bgCardSecondary, // #242428
    card: sharedCraftTokens.colors.bgCardSecondary,        // #242428

    // Borders & dividers
    border: sharedCraftTokens.colors.border,              // #2E2E34
    borderLight: sharedCraftTokens.colors.borderLight,    // #3E3E46
    borderActive: craftTheme.accent,                     // #D49B42

    // Swiss typography (High readability in flour-dusted kitchen)
    textPrimary: sharedCraftTokens.colors.textPrimary,   // #F4EFEA
    textSecondary: sharedCraftTokens.colors.textSecondary, // #A09C96
    textMuted: sharedCraftTokens.colors.textMuted,       // #686561

    // Metallic Crust Gold accents (Piekarz)
    accent: craftTheme.accent,                          // #D49B42
    accentDark: '#B45309',
    accentLight: craftTheme.accentLight,                // #EDE4D0
    accentMuted: craftTheme.accentMuted,                // rgba(212, 155, 66, 0.15)
    crustGold: craftTheme.accent,                       // #D49B42
    secondaryAccent: craftTheme.secondaryAccent,        // #8C6239

    // Status & biological alerts
    statusSuccess: sharedCraftTokens.colors.statusSuccess,
    statusWarning: craftTheme.accent,
    statusDanger: sharedCraftTokens.colors.danger,

    activeStageBadge: craftTheme.accent,
    passiveStageBadge: sharedCraftTokens.colors.borderLight,
  },
  typography: {
    fontFamilyHeading: 'System',
    fontFamilyBody: 'System',
  },
  spacing: sharedCraftTokens.spacing,
  radius: {
    sm: sharedCraftTokens.borderRadius.sm,
    md: sharedCraftTokens.borderRadius.md,
    lg: 16,
    full: 9999,
  },
};
