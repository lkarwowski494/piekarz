const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: [
    '**/src/core/__tests__/**/*.test.ts',
  ],
};
