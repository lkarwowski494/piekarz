// Atrapa expo-iap tylko do zrzutów Expo web (scratchpad, nie repo): StoreKit nie istnieje w przeglądarce.
const noop = async () => [];
module.exports = new Proxy({ __esModule: true }, { get: (t, k) => (k in t ? t[k] : k === 'default' ? module.exports : noop) });
