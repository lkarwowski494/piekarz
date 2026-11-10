const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');
const domyslny = config.resolver.resolveRequest;
config.resolver.resolveRequest = (ctx, name, platform) => {
  if (name === 'expo-iap') return { type: 'sourceFile', filePath: path.join(__dirname, 'zrzut-stub/expo-iap.js') };
  return (domyslny ?? ctx.resolveRequest)(ctx, name, platform);
};
const przed = config.serializer.getModulesRunBeforeMainModule;
config.serializer.getModulesRunBeforeMainModule = (e) => [...(przed ? przed(e) : []), path.join(__dirname, 'zrzut-stub/polyfill.js')];
module.exports = config;
