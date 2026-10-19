#!/usr/bin/env node
/**
 * Apps4Brew Studio — Native iOS Verification (BR-REL-009..013 & Rozdział 12.4 BRD)
 * Runs cross-platform (Windows, Linux, macOS) verifying all 20 iOS native invariants.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
// --app <ścieżka>: inny plik konfiguracji (test bramki na przykładzie) [M1-audytor-generalny-077]
const appArg = process.argv.indexOf('--app');
const appJsonPath = appArg >= 0 && process.argv[appArg + 1] ? process.argv[appArg + 1] : join(root, 'app.json');
const appJsonRaw = JSON.parse(readFileSync(appJsonPath, 'utf8'));
const appJson = appJsonRaw.expo;
const errors = [];

const check = (cond, msg) => {
  if (!cond) errors.push(msg);
};

console.log('[verify-native] Sprawdzanie 20 niezmienników natywnego projektu iOS...');

// 1. Nazwa i wersja aplikacji
const ver = appJson.version;
check(/^\d+\.\d+(\.\d+)?$/.test(ver), `Wersja '${ver}' w app.json musi mieć format X.Y lub X.Y.Z`);

// 2. Identyfikator pakietu (Bundle Identifier)
const bundleId = appJson.ios?.bundleIdentifier;
check(!!bundleId && /^[a-zA-Z0-9_.-]+$/.test(bundleId), `Nieprawidłowy bundleIdentifier w app.json: ${bundleId}`);

// 2b. Minimalny iOS z decyzji BRD 00b o minimalnym iOS (docs/brd/00b_Decyzje.md: iOS 18) i jedno
// źródło numeru buildu: liczy go workflow testflight.yml, więc app.json nie ma buildNumber [M1-audytor-generalny-077]
const IOS_DEPLOYMENT_TARGET = '18.0';
check(
  appJson.ios?.deploymentTarget === IOS_DEPLOYMENT_TARGET,
  `app.json ios.deploymentTarget musi wynosić '${IOS_DEPLOYMENT_TARGET}' (decyzja BRD 00b o minimalnym iOS), obecnie: ${appJson.ios?.deploymentTarget}`
);
check(
  appJson.ios?.buildNumber === undefined,
  'app.json nie może mieć ios.buildNumber: numer buildu ustawia wyłącznie workflow testflight.yml'
);

// 3. ITSAppUsesNonExemptEncryption = false
const infoPlist = appJson.ios?.infoPlist || {};
check(
  infoPlist.ITSAppUsesNonExemptEncryption === false,
  'app.json (ios.infoPlist) musi mieć ITSAppUsesNonExemptEncryption = false'
);
check(
  appJson.ios?.supportsTablet === false,
  'app.json (ios.supportsTablet) musi wynosić false dla jednoręcznej aplikacji iPhone (BR-REL-009)'
);
check(
  !infoPlist.UIBackgroundModes || !infoPlist.UIBackgroundModes.includes('audio'),
  'app.json nie może zawierać UIBackgroundModes: ["audio"] (Apple Guideline 2.5.4)'
);

// 4. Zakaz niechcianych uprawnień śledzących i zbędnych
const forbiddenPermissions = [
  'NSMicrophoneUsageDescription',
  'NSLocationWhenInUseUsageDescription',
  'NSLocationAlwaysUsageDescription',
  'NSContactsUsageDescription',
  'NSBluetoothAlwaysUsageDescription',
  'NSUserTrackingUsageDescription',
  'NSAppleMusicUsageDescription',
];
for (const perm of forbiddenPermissions) {
  check(!infoPlist[perm], `app.json zawiera niedozwolone uprawnienie: ${perm}`);
}

// 4b. Powiadomienia lokalne (ADR-006) [M1-audytor-generalny-006]: wtyczka, Time Sensitive, bez trybu tła push
const plugins = appJson.plugins || [];
check(
  plugins.some((p) => p === 'expo-notifications' || (Array.isArray(p) && p[0] === 'expo-notifications')),
  'app.json musi zawierać wtyczkę expo-notifications (ADR-006)'
);
check(
  appJson.ios?.entitlements?.['com.apple.developer.usernotifications.time-sensitive'] === true,
  'app.json musi mieć ios.entitlements com.apple.developer.usernotifications.time-sensitive = true (ADR-006)'
);
check(
  !(Array.isArray(infoPlist.UIBackgroundModes) && infoPlist.UIBackgroundModes.includes('remote-notification')),
  'app.json nie może zawierać UIBackgroundModes: ["remote-notification"] (powiadomienia tylko lokalne, ADR-006)'
);

// 5. Ciemny ekran powitalny (Splash Screen)
const splashBg = appJson.splash?.backgroundColor;
check(
  splashBg && (splashBg.toLowerCase() === '#121214' || splashBg.toLowerCase() === '#121212' || splashBg.startsWith('#1')),
  `Splash screen musi posiadać ciemne tło (obecnie: ${splashBg})`
);

// 6. Plik ikony aplikacji (1024x1024 RGB bez kanału alfa, colorType === 2)
const iconPath = join(root, appJson.icon || 'assets/icon.png');
check(existsSync(iconPath), `Brak pliku ikony aplikacji: ${iconPath}`);
if (existsSync(iconPath)) {
  const buf = readFileSync(iconPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const colorType = buf[25];
  check(w === 1024 && h === 1024, `Ikona ${iconPath} ma wymiary ${w}x${h} (wymagane 1024x1024)`);
  check(
    colorType === 2,
    `Ikona ${iconPath} ma typ koloru PNG=${colorType} (wymagane 2 = RGB bez kanału przezroczystości alfa!)`
  );
}

// 7. Privacy Manifests (Required Reason APIs)
const privManifest = appJson.ios?.privacyManifests;
check(!!privManifest, 'app.json musi zawierać blok ios.privacyManifests');
if (privManifest) {
  check(privManifest.NSPrivacyTracking === false, 'privacyManifests.NSPrivacyTracking musi wynosić false');
  check(
    Array.isArray(privManifest.NSPrivacyTrackingDomains) && privManifest.NSPrivacyTrackingDomains.length === 0,
    'privacyManifests.NSPrivacyTrackingDomains musi być pustą tablicą'
  );
  check(
    Array.isArray(privManifest.NSPrivacyCollectedDataTypes) && privManifest.NSPrivacyCollectedDataTypes.length === 0,
    'privacyManifests.NSPrivacyCollectedDataTypes musi być pustą tablicą (100% offline-first, brak zbierania danych)'
  );

  const apiTypes = privManifest.NSPrivacyAccessedAPITypes || [];
  const declaredCategories = apiTypes.map((t) => t.NSPrivacyAccessedAPIType);

  for (const cat of [
    'NSPrivacyAccessedAPICategoryUserDefaults',
    'NSPrivacyAccessedAPICategoryFileTimestamp',
    'NSPrivacyAccessedAPICategorySystemBootTime',
    'NSPrivacyAccessedAPICategoryDiskSpace',
  ]) {
    check(
      declaredCategories.includes(cat),
      `ios.privacyManifests musi deklarować kategorię Required Reason API: ${cat}`
    );
  }
}

// 8. Weryfikacja wygenerowanego ios/ jeśli istnieje
const iosDir = join(root, 'ios');
if (existsSync(iosDir)) {
  const iosScheme = appJson.name.replace(/[^a-zA-Z0-9]/g, '');
  const pbxPath = join(iosDir, `${iosScheme}.xcodeproj`, 'project.pbxproj');
  const plistPath = join(iosDir, iosScheme, 'Info.plist');
  const privPath = join(iosDir, iosScheme, 'PrivacyInfo.xcprivacy');

  if (existsSync(pbxPath)) {
    const pbx = readFileSync(pbxPath, 'utf8');
    const matchesVersion =
      pbx.includes(`MARKETING_VERSION = ${ver};`) ||
      pbx.includes(`MARKETING_VERSION = "${ver}";`) ||
      (ver === '1.0.0' && (pbx.includes('MARKETING_VERSION = 1.0;') || pbx.includes('MARKETING_VERSION = "1.0";')));
    check(matchesVersion, `MARKETING_VERSION w project.pbxproj nie zgadza się z ${ver}`);
    const targets = [...pbx.matchAll(/IPHONEOS_DEPLOYMENT_TARGET = "?([\d.]+)"?;/g)].map((m) => m[1]);
    // Prebuild ustawia wartość w konfiguracjach głównego celu aplikacji (nadpisują poziom projektu)
    check(
      targets.includes(IOS_DEPLOYMENT_TARGET),
      `IPHONEOS_DEPLOYMENT_TARGET ${IOS_DEPLOYMENT_TARGET} nie trafił do project.pbxproj (obecnie: ${[...new Set(targets)].join(', ') || 'brak'})`
    );
    const podProps = join(iosDir, 'Podfile.properties.json');
    if (existsSync(podProps)) {
      const props = JSON.parse(readFileSync(podProps, 'utf8'));
      check(
        props['ios.deploymentTarget'] === IOS_DEPLOYMENT_TARGET,
        `ios/Podfile.properties.json ios.deploymentTarget musi wynosić ${IOS_DEPLOYMENT_TARGET} (obecnie: ${props['ios.deploymentTarget']})`
      );
    }
  }
  if (existsSync(plistPath)) {
    const plist = readFileSync(plistPath, 'utf8');
    check(
      /<key>ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/.test(plist),
      'Info.plist musi mieć ITSAppUsesNonExemptEncryption = false'
    );
  }
  if (existsSync(privPath)) {
    const priv = readFileSync(privPath, 'utf8');
    check(/<key>NSPrivacyTracking<\/key>\s*<false\/>/.test(priv), 'PrivacyInfo.xcprivacy tracking = false');
  }
}

if (errors.length > 0) {
  console.error('\n[verify-native] BŁĘDY WERYFIKACJI NATYWNEJ iOS:');
  for (const e of errors) console.error(`  ❌ ${e}`);
  process.exit(1);
}

console.log('[verify-native] ✅ Wszystkie 20 niezmienników natywnego projektu iOS spełnione!');
