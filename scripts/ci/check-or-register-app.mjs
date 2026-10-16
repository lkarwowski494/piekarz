import crypto from 'node:crypto';

const keyId = process.env.ASC_KEY_ID;
const issuerId = process.env.ASC_ISSUER_ID;
const keyP8 = process.env.ASC_KEY_P8;
const targetBundleId = process.env.BUNDLE_ID || 'com.apps4brew.baker';

if (!keyId || !issuerId || !keyP8) {
  console.error('Brak wymaganych zmiennych środowiskowych ASC_KEY_ID, ASC_ISSUER_ID lub ASC_KEY_P8');
  process.exit(1);
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function generateJWT() {
  const header = {
    alg: 'ES256',
    kid: keyId,
    typ: 'JWT',
  };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 20 * 60,
    aud: 'appstoreconnect-v1',
  };
  const tokenData = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signer = crypto.createSign('SHA256');
  signer.update(tokenData);
  signer.end();
  const signature = signer.sign({ key: keyP8, dsaEncoding: 'ieee-p1363' }, 'base64url');
  return `${tokenData}.${signature}`;
}

async function apiRequest(path, method = 'GET', body = null) {
  const token = generateJWT();
  const res = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('--- Weryfikacja konta App Store Connect ---');
  
  // 1. Sprawdź zarejestrowane aplikacje
  const appsRes = await apiRequest('/v1/apps');
  let matchedApp = null;
  if (!appsRes.ok) {
    console.error('Błąd pobierania listy aplikacji:', appsRes.status, JSON.stringify(appsRes.data));
  } else {
    const apps = appsRes.data.data || [];
    console.log(`Znaleziono ${apps.length} aplikacji w App Store Connect:`);
    for (const app of apps) {
      console.log(` - [${app.id}] "${app.attributes?.name}" (bundleId: ${app.attributes?.bundleId}, sku: ${app.attributes?.sku})`);
      if (app.attributes?.bundleId === targetBundleId) {
        matchedApp = app;
      }
    }
  }

  // 2. Sprawdź Bundle IDs
  const bundleRes = await apiRequest(`/v1/bundleIds?filter[identifier]=${encodeURIComponent(targetBundleId)}`);
  let bundleIdResource = bundleRes.data?.data?.[0];

  if (!bundleIdResource) {
    console.log(`Bundle ID ${targetBundleId} nie istnieje jeszcze. Rejestracja w Apple Developer Portal...`);
    const createRes = await apiRequest('/v1/bundleIds', 'POST', {
      data: {
        type: 'bundleIds',
        attributes: {
          name: 'Piekarz',
          identifier: targetBundleId,
          platform: 'IOS',
        },
      },
    });

    if (createRes.ok) {
      console.log(`Pomyślnie zarejestrowano Bundle ID ${targetBundleId} (ID: ${createRes.data?.data?.id})!`);
      bundleIdResource = createRes.data?.data;
    } else {
      console.log(`Rejestracja Bundle ID zwróciła status ${createRes.status}:`, JSON.stringify(createRes.data));
    }
  } else {
    console.log(`Bundle ID ${targetBundleId} jest już zarejestrowany (ID: ${bundleIdResource.id}).`);
  }

  if (!matchedApp) {
    console.log('================================================================');
    console.log(`UWAGA: Aplikacja dla Bundle ID '${targetBundleId}' nie została jeszcze utworzona w App Store Connect!`);
    console.log('Apple wymaga jednorazowego kliknięcia "+ Nowa aplikacja" na https://appstoreconnect.apple.com/apps');
    console.log('  1. Wejdź na: https://appstoreconnect.apple.com/apps');
    console.log('  2. Kliknij "+" -> "Nowa aplikacja"');
    console.log('  3. Wybierz platformę: iOS');
    console.log('  4. Nazwa: Piekarz (lub Piekarz - Asystent Piekarza)');
    console.log('  5. Język podstawowy: polski');
    console.log(`  6. Identyfikator pakietu (Bundle ID): ${targetBundleId}`);
    console.log('  7. SKU: PIEKARZ-001');
    console.log('================================================================');
  } else {
    console.log(`Aplikacja ${targetBundleId} jest poprawnie powiązana z rekordem App Store Connect (ID: ${matchedApp.id})!`);
  }
}

run().catch((err) => {
  console.error('Nieoczekiwany błąd weryfikacji App Store Connect:', err);
});
