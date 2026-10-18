// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Outbox Service (ADR-003, Offline Durability & Zero Data Loss Axiom 11)
// Manages asynchronous event queuing and flushing for bread baking operations
// ============================================================================

import { PendingOp, StoredBakeLog } from '../core/domain/types';
import { IPendingOpsQueue } from '../core/domain/interfaces';
import { SQLitePendingOpsQueue } from './repositories/sqlite-repositories';

export interface OutboxHandlers {
  onDoubleTapFold?: (payload: { bakeId: string; foldIndex: number }) => Promise<void>;
  onFeedingLogged?: (payload: { starterId: string; timestamp: number }) => Promise<void>;
  onInventoryDeducted?: (payload: { flourName: string; grams: number }) => Promise<void>;
  onBakeLogUpdate?: (payload: StoredBakeLog) => Promise<void>;
}

export class OutboxService {
  private queue: IPendingOpsQueue;

  constructor(queue: IPendingOpsQueue = new SQLitePendingOpsQueue()) {
    this.queue = queue;
  }

  async recordDoubleTapFold(bakeId: string, foldIndex: number): Promise<PendingOp> {
    return this.queue.enqueue('DOUBLE_TAP_FOLD', { bakeId, foldIndex });
  }

  async recordFeeding(starterId: string, timestamp: number): Promise<PendingOp> {
    return this.queue.enqueue('FEEDING_LOGGED', { starterId, timestamp });
  }

  async recordInventoryDeduction(flourName: string, grams: number): Promise<PendingOp> {
    return this.queue.enqueue('INVENTORY_DEDUCTED', { flourName, grams });
  }

  async recordBakeLogUpdate(log: StoredBakeLog): Promise<PendingOp> {
    return this.queue.enqueue('BAKE_LOG_UPDATE', log as unknown as Record<string, unknown>);
  }

  async getPendingOperations(): Promise<PendingOp[]> {
    return this.queue.getPending();
  }

  async flushPendingOps(
    handlers: OutboxHandlers = {}
  ): Promise<{ processed: number; failed: number }> {
    const pending = await this.queue.getPending();
    let processed = 0;
    let failed = 0;

    for (const op of pending) {
      await this.queue.updateStatus(op.id, 'PROCESSING');
      try {
        const payload = JSON.parse(op.payload);
        switch (op.opType) {
          case 'DOUBLE_TAP_FOLD':
            if (handlers.onDoubleTapFold) {
              await handlers.onDoubleTapFold(payload);
            }
            break;
          case 'FEEDING_LOGGED':
            if (handlers.onFeedingLogged) {
              await handlers.onFeedingLogged(payload);
            }
            break;
          case 'INVENTORY_DEDUCTED':
            if (handlers.onInventoryDeducted) {
              await handlers.onInventoryDeducted(payload);
            }
            break;
          case 'BAKE_LOG_UPDATE':
            if (handlers.onBakeLogUpdate) {
              await handlers.onBakeLogUpdate(payload);
            }
            break;
        }
        await this.queue.updateStatus(op.id, 'SYNCED');
        processed++;
      } catch (err) {
        await this.queue.updateStatus(op.id, 'FAILED');
        failed++;
      }
    }

    if (processed > 0) {
      await this.queue.purgeSynced();
    }

    return { processed, failed };
  }
}
