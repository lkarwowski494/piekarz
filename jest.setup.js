// jest.setup.js — Global mocks for native Expo modules in Jest

const mockFiles = new Map();

const mockFileSystem = {
  documentDirectory: 'file:///mock/documents/',
  cacheDirectory: 'file:///mock/cache/',
  writeAsStringAsync: jest.fn(async (uri, content) => {
    mockFiles.set(uri, content);
  }),
  readAsStringAsync: jest.fn(async (uri) => {
    if (mockFiles.has(uri)) {
      return mockFiles.get(uri);
    }
    return '';
  }),
  getInfoAsync: jest.fn(async (uri) => {
    const exists = mockFiles.has(uri) || Array.from(mockFiles.keys()).some((k) => k.startsWith(uri));
    return { exists, isDirectory: uri.endsWith('/') };
  }),
  readDirectoryAsync: jest.fn(async (dirUri) => {
    const dir = dirUri.endsWith('/') ? dirUri : dirUri + '/';
    const filenames = new Set();
    for (const key of mockFiles.keys()) {
      if (key.startsWith(dir)) {
        const rest = key.slice(dir.length);
        const name = rest.split('/')[0];
        if (name) filenames.add(name);
      }
    }
    return Array.from(filenames);
  }),
  deleteAsync: jest.fn(async (uri) => {
    mockFiles.delete(uri);
    for (const key of Array.from(mockFiles.keys())) {
      if (key.startsWith(uri)) {
        mockFiles.delete(key);
      }
    }
  }),
  copyAsync: jest.fn(async ({ from, to }) => {
    if (mockFiles.has(from)) {
      mockFiles.set(to, mockFiles.get(from));
    }
  }),
  makeDirectoryAsync: jest.fn(async () => {}),
  __mockFiles: mockFiles,
};

// expo-notifications: lista oczekujących i sterowana zgoda (ADR-006) [M1-audytor-generalny-006]
const mockNotif = {
  pending: new Map(),
  iosStatus: 0, // 0 NOT_DETERMINED, 1 DENIED, 2 AUTHORIZED
  grantOnRequest: true,
};
jest.mock('expo-notifications', () => ({
  IosAuthorizationStatus: { NOT_DETERMINED: 0, DENIED: 1, AUTHORIZED: 2, PROVISIONAL: 3, EPHEMERAL: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  getPermissionsAsync: jest.fn(async () => ({
    granted: mockNotif.iosStatus >= 2,
    canAskAgain: mockNotif.iosStatus === 0,
    status: mockNotif.iosStatus >= 2 ? 'granted' : mockNotif.iosStatus === 0 ? 'undetermined' : 'denied',
    ios: { status: mockNotif.iosStatus },
  })),
  requestPermissionsAsync: jest.fn(async () => {
    if (mockNotif.iosStatus === 0) mockNotif.iosStatus = mockNotif.grantOnRequest ? 2 : 1;
    return { granted: mockNotif.iosStatus >= 2, ios: { status: mockNotif.iosStatus } };
  }),
  getAllScheduledNotificationsAsync: jest.fn(async () => Array.from(mockNotif.pending.values())),
  scheduleNotificationAsync: jest.fn(async (req) => {
    const id = req.identifier || `n${mockNotif.pending.size}`;
    mockNotif.pending.set(id, { identifier: id, content: req.content, trigger: req.trigger });
    return id;
  }),
  cancelScheduledNotificationAsync: jest.fn(async (id) => {
    mockNotif.pending.delete(id);
  }),
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  __mock: mockNotif,
}));

jest.mock('expo-file-system', () => mockFileSystem);
jest.mock('expo-file-system/legacy', () => mockFileSystem);

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
  getStringAsync: jest.fn().mockResolvedValue(''),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
  })),
  useAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
  })),
}));

jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CameraView: (props) => React.createElement(View, { ...props, testID: props.testID || 'camera-view' }),
    useCameraPermissions: () => [
      { granted: true, canAskAgain: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ],
  };
});

jest.mock('expo-print', () => ({
  printAsync: jest.fn().mockResolvedValue(undefined),
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file:///mock/print.pdf' }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: (cb) => {
    const React = require('react');
    React.useEffect(cb, []);
  },
  Link: (props) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, props, props.children);
  },
}));

jest.mock('expo-crypto', () => {
  const crypto = require('crypto');
  return {
    CryptoDigestAlgorithm: {
      SHA256: 'SHA-256',
      SHA512: 'SHA-512',
    },
    CryptoEncoding: {
      HEX: 'HEX',
      BASE64: 'BASE64',
    },
    digestStringAsync: jest.fn(async (algo, data) => {
      return crypto.createHash('sha256').update(data).digest('hex');
    }),
    getRandomBytes: jest.fn((n) => new Uint8Array(crypto.randomBytes(n))),
    getRandomBytesAsync: jest.fn(async (n) => new Uint8Array(crypto.randomBytes(n))),
  };
});

