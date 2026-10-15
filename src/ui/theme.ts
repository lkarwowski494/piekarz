// ============================================================================
// Piekarz (Crust) — UI Theme Tokens (WYG-002 & DEC-39)
// Warm linen, toasted crust amber, dark roasted espresso typography.
// Apps4Brew Studio.
// ============================================================================

export const theme = {
  colors: {
    background: '#FBF9F5',       // Jasny len / mąka
    backgroundSecondary: '#F3ECE2', // Ciepły pergamin
    surface: '#FFFFFF',          // Biały blat
    surfaceCard: '#F7F2EB',      // Karta receptury
    border: '#E6DCcf',           // Delikatny zarys formy
    borderActive: '#D97724',     // Złocista skórka

    textPrimary: '#2C1810',      // Ciemna przypieczona skórka / espresso
    textSecondary: '#6B584C',    // Otręby / ciepły brąz
    textMuted: '#9C8878',        // Pył mączny

    accent: '#D97724',           // Złoty bochenek (Amber Crust)
    accentDark: '#B45309',       // Głęboki mahoń
    accentLight: '#FEF3C7',      // Młody kwas

    statusSuccess: '#15803D',    // Prawidłowa fermentacja
    statusWarning: '#B45309',    // Uwaga termiczna
    statusDanger: '#B91C1C',     // Alarm pleśni / wysoka temperatura

    activeStageBadge: '#D97724',
    passiveStageBadge: '#78716C',
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
    md: 12,
    lg: 16,
    full: 9999,
  },
};
