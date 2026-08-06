import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { harnessGraph, type HarnessGraphState } from '../../harness/graph';
import { generateArt } from '../../harness/art';
import { TurnEntity } from '../entities/turn.entity';
import { NpcEntity } from '../entities/npc.entity';
import { TurnReservationService } from './turn-reservation.service';

@Injectable()
export class GraphService implements OnModuleInit {
  private turnRepo: Repository<TurnEntity>;
  private npcRepo: Repository<NpcEntity>;

  constructor(
    private dataSource: DataSource,
    private reservationService: TurnReservationService,
  ) {
    this.turnRepo = dataSource.getRepository(TurnEntity);
    this.npcRepo = dataSource.getRepository(NpcEntity);
  }

  // Startup sweep: flip stale 'reserved' rows to 'failed' so they're retryable
  // Eng review 2026-08-06: crash mid-turn leaves status='reserved' forever
  // without this. Timeout threshold: 60s (if turn takes >60s to complete, it's
  // likely crashed and the client should retry anyway).
  async onModuleInit() {
    const STALE_THRESHOLD_MS = 60 * 1000;
    const staleBefore = new Date(Date.now() - STALE_THRESHOLD_MS);

    await this.dataSource.query(
      `UPDATE turns SET status = 'failed'
       WHERE status = 'reserved' AND created_at < $1`,
      [staleBefore],
    );
  }

  async runTurn(input: {
    turnId: string;
    userId: string;
    chronicleId: string;
    playerAction: string;
    character: any; // CharacterSchema type from harness
    lastReferenceUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    // Fast transaction 1: reserve the turn
    const reserved = await this.reservationService.reserve(
      input.turnId,
      input.userId,
      input.chronicleId,
    );

    if (!reserved) {
      return { success: false, error: 'Turn already processed or in progress' };
    }

    // T14d recall: query NPC by userId on turn 1 only (fail-open if DB fails)
    // Query happens outside graph, result threaded into state for narrate
    let npcContext: Record<string, unknown> | null = null;
    if (true) { // TODO(T14d): replace with actual turnNumber === 1 check
      try {
        const npc = await this.npcRepo.findOne({
          where: { userId: input.userId },
          order: { createdAt: 'DESC' },
        });
        if (npc) {
          npcContext = { id: npc.id, name: npc.name, fact: npc.fact };
        }
      } catch (err) {
        console.error(`[${input.turnId}] recall query failed:`, err);
        // Fail-open: continue without NPC context
      }
    }

    // Graph invocation (NO open DB transaction for slow LLM calls)
    // turn_id doubles as thread_id for PostgresSaver checkpointing
    let graphResult: HarnessGraphState;
    try {
      graphResult = await harnessGraph.invoke(
        {
          playerAction: input.playerAction,
          character: input.character,
          gameEvent: null,
          narration: null,
          artUrl: null,
          artError: null,
          lastReferenceUrl: input.lastReferenceUrl || null,
          turnNumber: 1, // Placeholder: actual turn number will come from chronicle context
        },
        { configurable: { thread_id: input.turnId } },
      );
    } catch (err) {
      // Graph invocation failed — flip turn to 'failed' so client can retry
      await this.dataSource.query(
        `UPDATE turns SET status = 'failed'
         WHERE turn_id = $1 AND user_id = $2`,
        [input.turnId, input.userId],
      );
      return { success: false, error: `Graph error: ${(err as Error).message}` };
    }

    // Fast transaction 2: persist turn result + apply Npc hp
    try {
      await this.dataSource.transaction(async (queryRunner) => {
        // Persist the Turn
        await queryRunner.update(
          TurnEntity,
          { turnId: input.turnId },
          {
            status: 'completed',
            gameEvent: (graphResult.gameEvent as Record<string, unknown>) || null,
            narration: graphResult.narration,
            artUrl: graphResult.artUrl,
            playerAction: input.playerAction,
          },
        );

        // Apply hp mutation to Npc if there's a resolved event with hp delta
        if (graphResult.gameEvent?.statDeltas?.targetHp) {
          // Npc lookup would happen here (T19 recall node supplies it)
          // For now, this is a placeholder for T14d's scope
          // Future: look up the target Npc by event ID/name and apply hp
        }
      });
    } catch (err) {
      // Persist failed — flip to 'failed' so retry picks it up
      await this.dataSource.query(
        `UPDATE turns SET status = 'failed'
         WHERE turn_id = $1 AND user_id = $2`,
        [input.turnId, input.userId],
      );
      return { success: false, error: `Persist error: ${(err as Error).message}` };
    }

    // Fire art generation asynchronously (no await, no blocking)
    // Result will be pushed over WS via a separate callback when complete
    this.generateArtAsync(input.turnId, input.userId, graphResult).catch((err) => {
      console.error(`[${input.turnId}] art generation failed:`, err);
    });

    return { success: true };
  }

  private async generateArtAsync(
    turnId: string,
    userId: string,
    graphResult: HarnessGraphState,
  ): Promise<void> {
    if (!graphResult.gameEvent?.archetype) return;

    const result = await generateArt(graphResult.gameEvent.archetype);
    if ('error' in result) {
      console.error(`[${turnId}] art error:`, result.error);
      return;
    }

    // Update the Turn row with the real art URL
    await this.turnRepo.update(
      { turnId, userId },
      { artUrl: result.url },
    );

    // TODO(T14b): emit WS event to push the real artUrl to the client
    // This will be wired in jwt-ws.gateway.ts handleTurn callback
  }
}
