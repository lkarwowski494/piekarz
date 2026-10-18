// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Amber Night Mode (OLED Pure Black & Zero Blue Light)
// 0% Blue Light (<600nm) for early morning bake sessions (4:00 AM)
// ============================================================================

export const amberTheme = {
  id: 'amber',
  name: 'Amber OLED Night Mode',
  colors: {
    // Pure OLED absolute black
    background: '#000000',
    backgroundSecondary: '#0A0600',
    surface: '#0D0800',
    surfaceCard: '#1A1000',
    card: '#1A1000',

    // Amber borders
    border: '#332000',
    borderLight: '#4D3000',
    borderActive: '#FFA000',

    // Pure monochromatic amber typography (zero blue light)
    textPrimary: '#FFB000',
    textSecondary: '#CC8400',
    textMuted: '#805300',

    // Amber radiant accents
    accent: '#FF9500',
    accentDark: '#B36800',
    accentLight: '#FFE0A3',
    accentMuted: 'rgba(255, 149, 0, 0.15)',
    crustGold: '#FFB000',
    secondaryAccent: '#805300',

    // Amber-adapted status badges
    statusSuccess: '#FFB000',
    statusWarning: '#FFA000',
    statusDanger: '#FF4400',

    activeStageBadge: '#FF9500',
    passiveStageBadge: '#4D3000',
  },
  typography: {
    fontFamilyHeading: 'System',
    fontFamilyBody: 'System',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 9999,
  },
};
