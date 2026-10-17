import {
  saveCorruptState,
  checkCorruptState,
  dismissCorruptState,
  AUTO_DIR,
} from '../backup';
import * as FileSystem from 'expo-file-system/legacy';

describe('Corrupted State Recovery Protocol (BR-TEST-023)', () => {
  const mockDir = 'file:///mock/documents/';

  beforeEach(async () => {
    (FileSystem as any).documentDirectory = mockDir;
  });

  it('saves corrupt payload with recovery envelope and detects it', async () => {
    const rawPayload = '{"corrupted": true, "bakes": [1, 2, 3]}';
    const filePath = await saveCorruptState(rawPayload, 'Test SQLite corruption');

    expect(filePath).toContain('state_corrupt_');

    const corruptInfo = await checkCorruptState();
    expect(corruptInfo).not.toBeNull();
    expect(corruptInfo?.corruptFile).toContain('state_corrupt_');
    expect(corruptInfo?.rawSnippet).toContain('{"corrupted": true');

    if (corruptInfo) {
      await dismissCorruptState(corruptInfo.corruptFile);
      const afterDismiss = await checkCorruptState();
      expect(afterDismiss).toBeNull();
    }
  });
});
