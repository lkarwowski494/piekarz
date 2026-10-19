/**
 * Awaria przy starcie nie zamyka drogi do danych: ErrorBoundary z eksportem i tryb awaryjny po dwóch
 * nieudanych startach z rzędu [M1-audytor-generalny-018; 12-niezawodnosc-004].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const textOf = (n: unknown): string => {
  if (typeof n === 'string') return n;
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  return '';
};

describe('Startup rescue (018)', () => {
  beforeEach(() => {
    mockFiles.clear();
    jest.clearAllMocks();
  });

  it('two failed starts in a row open rescue mode on the third; a start that reaches the milestone resets the count', async () => {
    const guard = require('../lib/startup-guard');
    expect((await guard.beginStartup()).rescue).toBe(false); // 1. start — padł przed kamieniem milowym
    expect((await guard.beginStartup()).rescue).toBe(false); // 2. start — padł
    expect((await guard.beginStartup()).rescue).toBe(true); // 3. start: dwa nieudane z rzędu
    await guard.markStartupSucceeded();
    expect((await guard.beginStartup()).rescue).toBe(false);
    expect(guard.STARTUP_FAILURES_FOR_RESCUE).toBe(2);
  });

  it('a render error in the app shows the rescue screen with data export instead of a crash loop', async () => {
    const { ErrorBoundary } = require('../../app/_layout');
    expect(typeof ErrorBoundary).toBe('function');
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<ErrorBoundary error={new Error('render crash')} retry={jest.fn(async () => {})} />);
    });
    const text = textOf(tree!.toJSON());
    expect(text).toContain('Piekarz nie uruchomił się poprawnie');
    expect(text).toContain('Twoje dane są zapisane w telefonie. Zanim spróbujesz ponownie, możesz wyeksportować ich kopię.');
    expect(text).toContain('Eksportuj kopię danych');
    expect(require('../lib/startup-guard').STARTUP_MILESTONE_MS).toBe(5000);
    await act(async () => {
      await tree!.root.findByProps({ testID: 'rescue-export' }).props.onPress();
    });
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      expect.stringMatching(/piekarz-backup-.*\.json$/),
      expect.objectContaining({ mimeType: 'application/json' })
    );
    act(() => tree!.unmount());
  });

  it('the rescue screen retry calls the router retry', async () => {
    const { ErrorBoundary } = require('../../app/_layout');
    const retry = jest.fn(async () => {});
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<ErrorBoundary error={new Error('x')} retry={retry} />);
    });
    await act(async () => {
      await tree!.root.findByProps({ testID: 'rescue-retry' }).props.onPress();
    });
    expect(retry).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
  });
});
