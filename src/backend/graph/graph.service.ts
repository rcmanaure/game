import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource, LessThan, Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
// harness/* is ESM-only (langgraph has no CJS build) while this backend
// compiles to CommonJS — a CJS module can't `require()` an ESM one, so
// these two boundary points load it via dynamic `import()` instead of a
// static import. Type-only imports stay static; they're erased at compile.
import type { HarnessGraphState } from '../../harness/graph';

type HarnessGraphModule = typeof import('../../harness/graph');
type HarnessArtModule = typeof import('../../harness/art');
import { TurnEntity } from '../entities/turn.entity';
import { NpcEntity } from '../entities/npc.entity';
import { ChronicleEntity } from '../entities/chronicle.entity';
import { TurnReservationService } from './turn-reservation.service';

@Injectable()
export class GraphService implements OnModuleInit {
  private turnRepo: Repository<TurnEntity>;
  private npcRepo: Repository<NpcEntity>;
  private chronicleRepo: Repository<ChronicleEntity>;
  private harnessGraphModule?: Promise<HarnessGraphModule>;
  private harnessArtModule?: Promise<HarnessArtModule>;

  constructor(
    private dataSource: DataSource,
    private reservationService: TurnReservationService,
  ) {
    this.turnRepo = dataSource.getRepository(TurnEntity);
    this.npcRepo = dataSource.getRepository(NpcEntity);
    this.chronicleRepo = dataSource.getRepository(ChronicleEntity);
  }

  private loadHarnessGraph(): Promise<HarnessGraphModule> {
    if (!this.harnessGraphModule) {
      this.harnessGraphModule = import('../../harness/graph');
    }
    return this.harnessGraphModule;
  }

  private loadHarnessArt(): Promise<HarnessArtModule> {
    if (!this.harnessArtModule) {
      this.harnessArtModule = import('../../harness/art');
    }
    return this.harnessArtModule;
  }

  // Startup sweep: flip stale 'reserved' rows to 'failed' so they're retryable
  // Eng review 2026-08-06: crash mid-turn leaves status='reserved' forever
  // without this. Timeout threshold: 60s (if turn takes >60s to complete, it's
  // likely crashed and the client should retry anyway).
  async onModuleInit() {
    // Must run before the first invoke: PostgresSaver creates no tables on
    // construction, so without this every turn throws on a missing
    // "checkpoints" relation.
    const { ensureCheckpointer } = await this.loadHarnessGraph();
    await ensureCheckpointer();

    const STALE_THRESHOLD_MS = 60 * 1000;
    const staleBefore = new Date(Date.now() - STALE_THRESHOLD_MS);

    await this.turnRepo.update(
      { status: 'reserved', createdAt: LessThan(staleBefore) },
      { status: 'failed' },
    );
  }

  async runTurn(input: {
    turnId: string;
    userId: string;
    chronicleId: string;
    playerAction: string;
    character: any; // CharacterSchema type from harness
    lastReferenceUrl?: string;
  }, onArtReady?: (url: string) => void): Promise<{
    success: boolean;
    error?: string;
    chronicleAlreadyEnded?: boolean; // this chronicle ended before this turn was submitted
    chronicleJustEnded?: boolean; // THIS turn is the one that ended it (still completes normally)
    invariantViolation?: boolean; // rulesValidate rejected the mutation — it never happened
    narrationSource?: 'primary' | 'alt' | 'template' | null; // M4.2: which model (if any) produced the narration
  }> {
    // M2.5 (2026-08-13): a dead character stopped the CLI loop, but the
    // backend never blocked further turns against an ended chronicle — a
    // WS client could fire turns at a dead chronicle forever, each one
    // rejected by the rules validator with a flat "attempt rejected"
    // narration that reads as if the turn just... happened. Server-side
    // check against the DB, never the client-supplied character.status —
    // that's exactly the kind of claimed value Decision #7 says never to
    // trust.
    const chronicle = await this.chronicleRepo.findOne({
      where: { id: input.chronicleId, userId: input.userId },
    });
    if (chronicle?.endedAt) {
      return {
        success: false,
        error: 'This chronicle has ended',
        chronicleAlreadyEnded: true,
      };
    }

    // Fast transaction 1: reserve the turn
    const reserved = await this.reservationService.reserve(
      input.turnId,
      input.userId,
      input.chronicleId,
    );

    if (!reserved) {
      return { success: false, error: 'Turn already processed or in progress' };
    }

    // turnNumber is counted AFTER the reservation commits, so this turn's own
    // row is included. The caller used to count-then-add-one before reserving,
    // which is the check-then-act race reserve() itself was rewritten to avoid:
    // two concurrent turns both read N and both became N+1. Counting after the
    // insert cannot return 1 for a turn that is not actually first, which is
    // the only thing the recall gate below depends on.
    const turnNumber = await this.countTurns(input.chronicleId, input.userId);

    // T14d recall: query NPC by userId & chronicleId on turn 2+ (fail-open if DB fails)
    // Query happens outside graph, result threaded into state for narrate
    let npcContext: { id: string; name: string; fact: string } | null = null;
    if (turnNumber > 1) {
      try {
        const npc = await this.npcRepo.findOne({
          where: { userId: input.userId, chronicleId: input.chronicleId },
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
    const { harnessGraph } = await this.loadHarnessGraph();
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
          turnNumber,
          npcContext,
        },
        { configurable: { thread_id: input.turnId } },
      );
    } catch (err) {
      // Graph invocation failed — flip turn to 'failed' so client can retry
      await this.turnRepo.update(
        { turnId: input.turnId, userId: input.userId },
        { status: 'failed' },
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
            // Cast is on the jsonb column only: TypeORM's QueryDeepPartialEntity
            // recurses into the index signature and cannot prove assignability,
            // so an uncast Record<string, unknown> is a TS2322 here. The runtime
            // value is a plain object, which is what jsonb wants.
            gameEvent: (graphResult.gameEvent ??
              null) as QueryDeepPartialEntity<TurnEntity>['gameEvent'],
            narration: graphResult.narration,
            artUrl: graphResult.artUrl,
            playerAction: input.playerAction,
          },
        );

        // Persist the NPC the resolve model signaled this turn (T19/M2.2,
        // D-3: LLM-signaled trigger, 2026-08-13). Upsert by
        // (userId, chronicleId, name) — a repeat mention refreshes the
        // fact rather than piling up duplicate rows for the same NPC, and
        // keeps recall's "most recent" query meaningful. hp/maxHp default
        // to a placeholder band (same discipline as rules.ts's damage
        // bands) until a real NPC stat system exists.
        //
        // M2.3 (2026-08-13): a resolved targetHp delta applies to whichever
        // NPC is "in play" this turn. Live-verified this can't be gated on
        // npcSignal alone — the model doesn't reliably re-signal on every
        // turn of an ongoing fight (observed live: hit landed on turn 3 of
        // a 4-turn exchange, npcSignal was null that exact turn). Falls
        // back to `npcContext` (this turn's recall query, already run
        // above) — the most recently touched NPC in the chronicle — so a
        // hit still lands even on a turn the model didn't re-name the
        // target. No status/death tracking yet — NpcEntity has no such
        // column; hp only ever clamps at 0.
        const npcSignal = graphResult.gameEvent?.npcSignal;
        const targetHpDelta = graphResult.gameEvent?.statDeltas?.targetHp ?? 0;
        const targetName = npcSignal?.name ?? (targetHpDelta ? npcContext?.name : undefined);

        if (targetName) {
          const existing = await queryRunner.findOne(NpcEntity, {
            where: { userId: input.userId, chronicleId: input.chronicleId, name: targetName },
          });

          if (existing) {
            const resultingHp = Math.max(0, existing.hp + targetHpDelta);
            await queryRunner.update(NpcEntity, { id: existing.id }, {
              fact: npcSignal?.fact ?? existing.fact,
              hp: resultingHp,
            });
          } else if (npcSignal) {
            // Only npcSignal creates a brand-new row — a targetHp delta
            // alone with no signal and no existing NPC has no fact to
            // persist, so there's nothing legal to insert.
            const startingHp = Math.max(0, 10 + targetHpDelta);
            await queryRunner.insert(NpcEntity, {
              userId: input.userId,
              chronicleId: input.chronicleId,
              name: npcSignal.name,
              fact: npcSignal.fact,
              hp: startingHp,
              maxHp: 10,
            });
          }
        }

        // M2.5: this turn's mutation transitioned the character to Final
        // Death (Decision #5's Active -> Torpor -> Dead lifecycle,
        // validator.ts) — close the chronicle in the SAME transaction as
        // the turn that caused it, so a crash between the two can't leave
        // a dead character with a still-open chronicle.
        if (graphResult.character?.status === 'dead') {
          await queryRunner.update(
            ChronicleEntity,
            { id: input.chronicleId },
            { endedAt: new Date() },
          );
        }
      });
    } catch (err) {
      // Persist failed — flip to 'failed' so retry picks it up
      await this.turnRepo.update(
        { turnId: input.turnId, userId: input.userId },
        { status: 'failed' },
      );
      return { success: false, error: `Persist error: ${(err as Error).message}` };
    }

    // M2.6: a rejected mutation never happened in the fiction — there's
    // nothing to illustrate. The turn row is still persisted above (so a
    // retry with the same turnId doesn't reprocess it), but the caller
    // gets success:false, not a completed-turn signal.
    if (graphResult.gameEvent?.rejected) {
      return {
        success: false,
        error: graphResult.gameEvent.summary,
        invariantViolation: true,
      };
    }

    // Fire art generation asynchronously (no await, no blocking)
    // Callback will be invoked when art is ready (passed by caller, e.g. WS gateway)
    this.generateArtAsync(
      input.turnId,
      input.userId,
      graphResult,
      onArtReady,
    ).catch((err) => {
      console.error(`[${input.turnId}] art generation failed:`, err);
    });

    return {
      success: true,
      chronicleJustEnded: graphResult.character?.status === 'dead',
      narrationSource: graphResult.narrationSource,
    };
  }

  // Fails open to 1 rather than throwing: a counting failure must not lose a
  // turn the client already reserved. The cost of failing open is a skipped
  // NPC recall on that one turn.
  private async countTurns(chronicleId: string, userId: string): Promise<number> {
    try {
      return await this.turnRepo.count({ where: { chronicleId, userId } });
    } catch (err) {
      console.error(`[${chronicleId}] turn count failed, assuming turn 1:`, err);
      return 1;
    }
  }

  private async generateArtAsync(
    turnId: string,
    userId: string,
    graphResult: HarnessGraphState,
    onArtReady?: (url: string) => void,
  ): Promise<void> {
    if (!graphResult.gameEvent?.archetype) return;

    const { generateArt } = await this.loadHarnessArt();
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

    // Invoke callback to emit WS event (wired in handleTurn)
    if (onArtReady) {
      onArtReady(result.url);
    }
  }
}
