import { OutboxService } from '../outbox-service';
import { SQLitePendingOpsQueue } from '../repositories/sqlite-repositories';

describe('OutboxService (ADR-003 Offline Resiliency)', () => {
  let queue: SQLitePendingOpsQueue;
  let service: OutboxService;

  beforeEach(async () => {
    queue = new SQLitePendingOpsQueue();
    // purge any existing
    const pending = await queue.getPending();
    for (const op of pending) {
      await queue.updateStatus(op.id, 'SYNCED');
    }
    await queue.purgeSynced();
    service = new OutboxService(queue);
  });

  it('records fold, feeding, inventory and bake log updates to outbox queue', async () => {
    const op1 = await service.recordDoubleTapFold('bake_1', 2);
    expect(op1.opType).toBe('DOUBLE_TAP_FOLD');
    expect(op1.status).toBe('PENDING');

    const op2 = await service.recordFeeding('starter_1', 123456789);
    expect(op2.opType).toBe('FEEDING_LOGGED');

    const op3 = await service.recordInventoryDeduction('Mąka pszenna chlebowa t750', 500);
    expect(op3.opType).toBe('INVENTORY_DEDUCTED');

    const pending = await service.getPendingOperations();
    expect(pending.length).toBe(3);
  });

  it('flushes pending operations using handlers and purges synced records', async () => {
    const foldsLogged: number[] = [];
    const feedingsLogged: string[] = [];

    await service.recordDoubleTapFold('bake_1', 1);
    await service.recordFeeding('starter_xyz', 99999);

    const result = await service.flushPendingOps({
      onDoubleTapFold: async (payload) => {
        foldsLogged.push(payload.foldIndex);
      },
      onFeedingLogged: async (payload) => {
        feedingsLogged.push(payload.starterId);
      },
    });

    expect(result.processed).toBe(2);
    expect(result.failed).toBe(0);
    expect(foldsLogged).toEqual([1]);
    expect(feedingsLogged).toEqual(['starter_xyz']);

    const remaining = await service.getPendingOperations();
    expect(remaining.length).toBe(0);
  });
});
