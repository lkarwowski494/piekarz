// ============================================================================
// Piekarz — udostępnianie receptury bez adresów w obcych domenach
// M1-audytor-generalny-028 (01-odkrywanie-016, DEC-05 a): dane receptury nie
// trafiają do linku w domenie, której studio nie kontroluje (piekarz.app).
// ============================================================================

import React from 'react';
import { Share } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Clipboard from 'expo-clipboard';
import { ShareRecipeQrModal } from '../components/ShareRecipeQrModal';
import { MASTER_RECIPES } from '../recipes/presets';
import * as sharing from '../lib/recipe-sharing';

const WEB_ADDRESS = /https?:\/\//i;

describe('udostępnianie receptury bez obcej domeny (M1-audytor-generalny-028)', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
      tree?.unmount();
    });
    tree = null;
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('moduł udostępniania nie zna adresu WWW i zawsze koduje link piekarz://', () => {
    expect(Object.values(sharing).some((v) => typeof v === 'string' && WEB_ADDRESS.test(v))).toBe(false);
    for (const recipe of MASTER_RECIPES.slice(0, 4)) {
      const url = sharing.encodeRecipeToShareUrl(recipe);
      expect(url.startsWith(`${sharing.RECIPE_SHARE_PROTOCOL}?v=1&d=`)).toBe(true);
    }
  });

  it('żadna akcja okna udostępniania nie wysyła adresu WWW', async () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    await act(async () => {
      tree = renderer.create(
        <ShareRecipeQrModal visible onClose={jest.fn()} recipe={MASTER_RECIPES[0]} />
      );
    });
    const root = tree!.root;

    expect(root.findAll((n) => n.props.testID === 'copy-web-link-btn')).toHaveLength(0);

    const actions = root.findAll(
      (n) => typeof n.props.testID === 'string' && /-btn$/.test(n.props.testID) && typeof n.props.onPress === 'function'
    );
    for (const btn of actions) {
      if (btn.props.testID === 'close-share-qr-btn') continue;
      await act(async () => {
        await btn.props.onPress();
      });
    }

    expect(shareSpy).toHaveBeenCalled();
    const sent = [
      ...shareSpy.mock.calls.map((c) => JSON.stringify(c[0])),
      ...(Clipboard.setStringAsync as jest.Mock).mock.calls.map((c) => String(c[0])),
    ];
    expect(sent.length).toBeGreaterThan(0);
    for (const payload of sent) {
      expect(payload).not.toMatch(WEB_ADDRESS);
    }
    expect(sent.some((p) => p.includes('piekarz://recipe?v=1&d='))).toBe(true);
  });
});
