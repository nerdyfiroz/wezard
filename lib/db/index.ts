import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import crypto from "crypto";

const connectionString = process.env.DATABASE_URL;
export const isDbConfigured = Boolean(connectionString && connectionString.startsWith("postgres"));

const sql_client = isDbConfigured ? neon(connectionString!) : null;
export const db = sql_client ? drizzle(sql_client, { schema }) : null;

import { asc, eq, sql } from "drizzle-orm";

// ─── Auto-migration flag ─────────────────────────────────────────────────────
let migrationRan = false;

async function ensureMigrated() {
  if (migrationRan || !db) return;
  try {
    // 1. Add proof columns safely
    try {
      await db.execute(sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS proof_label VARCHAR(255)`);
    } catch (e) {
      console.error("proof_label column migration notice:", e);
    }
    try {
      await db.execute(sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS proof_required BOOLEAN NOT NULL DEFAULT false`);
    } catch (e) {
      console.error("proof_required column migration notice:", e);
    }

    // 2. Backfill proof labels for existing default tasks if they were null
    try {
      await db.execute(sql`
        UPDATE tasks 
        SET proof_label = 'Submit your X / Twitter handle or profile link' 
        WHERE id = '7d9e4a1b-3c2f-4e8a-9b1d-5f6e7a8b9c0d' AND (proof_label IS NULL OR proof_label = '');
      `);
      await db.execute(sql`
        UPDATE tasks 
        SET proof_label = 'Paste your reply or comment tweet link', proof_required = true
        WHERE id = 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d' AND (proof_label IS NULL OR proof_label = '');
      `);
    } catch (e) {
      console.error("Backfill migration notice:", e);
    }

    migrationRan = true;
  } catch (err) {
    console.error("Auto-migration notice:", err);
  }
}

// ─── Default seed tasks (used only once if DB table is empty) ───────────────
export const DEFAULT_TASKS: schema.Task[] = [
  {
    id: "7d9e4a1b-3c2f-4e8a-9b1d-5f6e7a8b9c0d",
    title: "Follow @We_Zards and @SickickZards",
    description: "Follow the official project (@We_Zards) and artist (@SickickZards) accounts on X / Twitter.",
    type: "x_follow",
    url: "https://x.com/We_Zards",
    required: true,
    verificationType: "url",
    active: true,
    sortOrder: 1,
    proofLabel: "Submit your X / Twitter handle or profile link",
    proofRequired: true,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
  {
    id: "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d",
    title: "Like, Repost & Comment on WeZards Tweet",
    description: "Engage with the official WeZards announcement post on X / Twitter.",
    type: "x_repost",
    url: "https://x.com/We_Zards",
    required: true,
    verificationType: "url",
    active: true,
    sortOrder: 2,
    proofLabel: "Paste your reply or comment tweet link",
    proofRequired: true,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
  {
    id: "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    title: "Submit EVM Wallet Address",
    description: "Submit your Ethereum / EVM compatible wallet address (0x...) to secure your whitelist spot.",
    type: "submit_wallet",
    url: "",
    required: true,
    verificationType: "manual",
    active: true,
    sortOrder: 3,
    proofLabel: "Enter your EVM Wallet Address (0x...)",
    proofRequired: true,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
];

// ─── getUnifiedTasks ─────────────────────────────────────────────────────────
// Primary source of truth: Neon DB. Falls back to DEFAULT_TASKS only in local
// dev when DATABASE_URL is not configured.
export async function getUnifiedTasks(): Promise<schema.Task[]> {
  if (isDbConfigured && db) {
    await ensureMigrated();
    try {
      let dbTasks = await db.select().from(schema.tasks).orderBy(asc(schema.tasks.sortOrder));

      // Auto-seed on first boot if table is empty
      if (dbTasks.length === 0) {
        try {
          await db.insert(schema.tasks).values(
            DEFAULT_TASKS.map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              type: t.type,
              url: t.url ?? "",
              required: t.required,
              verificationType: t.verificationType,
              active: t.active,
              sortOrder: t.sortOrder,
              proofLabel: t.proofLabel ?? null,
              proofRequired: t.proofRequired ?? false,
            }))
          );
          dbTasks = await db.select().from(schema.tasks).orderBy(asc(schema.tasks.sortOrder));
        } catch (seedErr) {
          console.error("DB auto-seed tasks error:", seedErr);
        }
      }

      return dbTasks;
    } catch (dbErr) {
      console.error("DB fetch tasks error:", dbErr);
      // If DB is unreachable, throw so the caller can handle it
      throw dbErr;
    }
  }

  // Local dev fallback (no DATABASE_URL set)
  return [...DEFAULT_TASKS];
}

// ─── addUnifiedTask ──────────────────────────────────────────────────────────
export async function addUnifiedTask(taskData: {
  title: string;
  description: string;
  type: schema.Task["type"];
  url?: string;
  required: boolean;
  verificationType: schema.Task["verificationType"];
  active: boolean;
  sortOrder: number;
  proofLabel?: string;
  proofRequired?: boolean;
}) {
  const newId = crypto.randomUUID();

  if (isDbConfigured && db) {
    await ensureMigrated();
    const [newTask] = await db
      .insert(schema.tasks)
      .values({
        id: newId,
        title: taskData.title,
        description: taskData.description,
        type: taskData.type,
        url: taskData.url ?? "",
        required: taskData.required,
        verificationType: taskData.verificationType,
        active: taskData.active,
        sortOrder: taskData.sortOrder,
        proofLabel: taskData.proofLabel ?? null,
        proofRequired: taskData.proofRequired ?? false,
      })
      .returning();

    const allTasks = await getUnifiedTasks();
    return { newTask, tasks: allTasks };
  }

  // Local dev fallback
  const newTask: schema.Task = {
    id: newId,
    title: taskData.title,
    description: taskData.description,
    type: taskData.type,
    url: taskData.url ?? "",
    required: taskData.required,
    verificationType: taskData.verificationType,
    active: taskData.active,
    sortOrder: taskData.sortOrder,
    proofLabel: taskData.proofLabel ?? null,
    proofRequired: taskData.proofRequired ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return { newTask, tasks: [newTask] };
}

// ─── updateUnifiedTask ───────────────────────────────────────────────────────
export async function updateUnifiedTask(id: string, updates: Partial<schema.Task>) {
  if (isDbConfigured && db) {
    await ensureMigrated();
    const [updatedTask] = await db
      .update(schema.tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.tasks.id, id))
      .returning();

    const allTasks = await getUnifiedTasks();
    return { task: updatedTask, tasks: allTasks };
  }

  // Local dev fallback — no-op
  return { task: updates, tasks: DEFAULT_TASKS };
}

// ─── deleteUnifiedTask ───────────────────────────────────────────────────────
export async function deleteUnifiedTask(id: string) {
  if (isDbConfigured && db) {
    await ensureMigrated();
    await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
    const allTasks = await getUnifiedTasks();
    return { tasks: allTasks };
  }

  return { tasks: DEFAULT_TASKS };
}

// ─── Whitelist Entry helpers (DB-first, memoryStore removed) ─────────────────
export async function findEntryByWallet(wallet: string) {
  if (isDbConfigured && db) {
    const results = await db
      .select()
      .from(schema.whitelistEntries)
      .where(eq(schema.whitelistEntries.walletAddress, wallet.toLowerCase()));
    return results[0] ?? null;
  }
  return null;
}

export async function findEntryByTwitter(handle: string) {
  const clean = handle.replace("@", "").toLowerCase();
  if (isDbConfigured && db) {
    const results = await db
      .select()
      .from(schema.whitelistEntries)
      .where(eq(schema.whitelistEntries.twitterUsername, `@${clean}`));
    return results[0] ?? null;
  }
  return null;
}

export async function getEntries() {
  if (isDbConfigured && db) {
    return await db
      .select()
      .from(schema.whitelistEntries)
      .orderBy(schema.whitelistEntries.createdAt);
  }
  return [];
}

export async function updateEntryStatus(id: string, status: "pending" | "approved" | "rejected") {
  if (isDbConfigured && db) {
    const [updated] = await db
      .update(schema.whitelistEntries)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.whitelistEntries.id, id))
      .returning();
    return updated ?? null;
  }
  return null;
}

export async function deleteEntry(id: string) {
  if (isDbConfigured && db) {
    await db.delete(schema.whitelistEntries).where(eq(schema.whitelistEntries.id, id));
    return true;
  }
  return false;
}

// ─── Legacy memoryStore shim (keeps whitelist/submit route compiling) ────────
// This is a no-op shim kept for backwards compatibility with existing imports.
// All data operations now go through the functions above.
export const memoryStore = {
  findEntryByWallet: async (wallet: string) => findEntryByWallet(wallet),
  findEntryByTwitter: async (handle: string) => findEntryByTwitter(handle),
  addEntry: async (_: any) => null as any,
  getEntries: async () => getEntries(),
  updateEntryStatus: async (id: string, status: any) => updateEntryStatus(id, status),
  deleteEntry: async (id: string) => deleteEntry(id),
  tasks: DEFAULT_TASKS,
  taskCompletions: [] as schema.TaskCompletion[],
};
