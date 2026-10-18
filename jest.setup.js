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

