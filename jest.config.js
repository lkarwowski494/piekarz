module.exports = {
  preset: 'jest-expo',
  testTimeout: 20000,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@apps4craft|@formatjs/.*)',
  ],
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['./jest.app-after-env.js'],
  // Testy tylko z src/ i tests/: bez drzew sesji w .claude/worktrees (M1-audytor-generalny-166).
  // Glob bez <rootDir>: na Windows ścieżka z „\.claude” psuła wzorzec i pomijała tests/.
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/tests/**/*.test.[jt]s?(x)',
  ],
};
