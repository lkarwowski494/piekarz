// ============================================================================
// Piekarz — leniwe ładowanie skanera QR (F-08 PÓŹNIEJ, D-043) [M1-audytor-generalny-049]
// Build 1.0 nie linkuje expo-camera (package.json expo.autolinking.*.exclude), więc moduł aparatu
// ładujemy tylko przy otwarciu skanera; brak modułu natywnego daje null, nie awarię startu.
// ============================================================================

import type { QrScannerModal as QrScannerModalType } from '../components/QrScannerModal';

export function ladujSkanerQr(): typeof QrScannerModalType | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- celowy leniwy require: build 1.0 nie linkuje expo-camera
    const mod: { QrScannerModal?: typeof QrScannerModalType } = require('../components/QrScannerModal');
    return typeof mod.QrScannerModal === 'function' ? mod.QrScannerModal : null;
  } catch {
    return null;
  }
}
