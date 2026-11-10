// Tylko zrzuty web: react-native-web nie ma isBoldTextEnabled / isDarkerSystemColorsEnabled (iOS).
const { AccessibilityInfo } = require('react-native');
for (const k of ['isBoldTextEnabled', 'isDarkerSystemColorsEnabled', 'isReduceMotionEnabled', 'isScreenReaderEnabled']) {
  if (typeof AccessibilityInfo[k] !== 'function') AccessibilityInfo[k] = () => Promise.resolve(false);
}
// Krój tytułów: na iOS wbudowany przez expo-font (app.json); w przeglądarce @font-face z tego samego pliku.
if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = "@font-face{font-family:'Sofia Sans Semi Condensed';src:url('/fonts/SofiaSansSemiCondensed-wght.ttf') format('truetype');font-weight:100 900;}";
  document.head.appendChild(s);
}
