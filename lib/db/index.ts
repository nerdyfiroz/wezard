import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import crypto from "crypto";
import { getMongoDb, isMongoConfigured } from "./mongodb";

// ─── PostgreSQL (Neon) setup ─────────────────────────────────────────────────
const rawPostgresString = (
  (process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.startsWith("postgres://") ||
    process.env.DATABASE_URL.startsWith("postgresql://"))
    ? process.env.DATABASE_URL
    : "") ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  ""
)
  .trim()
  .replace(/^["']|["']$/g, "");

export const isPgConfigured = Boolean(
  rawPostgresString &&
    (rawPostgresString.startsWith("postgres://") ||
      rawPostgresString.startsWith("postgresql://"))
);

export const isDbConfigured = isMongoConfigured || isPgConfigured;

const sql_client = isPgConfigured ? neon(rawPostgresString) : null;
export const db = sql_client ? drizzle(sql_client, { schema }) : null;

import { asc, eq, sql } from "drizzle-orm";

// ─── Default seed tasks ───────────────────────────────────────────────────────
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
    proofLabel: "Submit your X Handle",
    proofRequired: true,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
  {
    id: "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d",
    title: "Like & Retweet on WeZards Tweet",
    description: "Like & repost the official WeZards announcement post on X / Twitter.",
    type: "x_repost",
    url: "https://x.com/We_Zards",
    required: true,
    verificationType: "url",
    active: true,
    sortOrder: 2,
    proofLabel: "Submit your Retweet link",
    proofRequired: true,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
  {
    id: "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    title: "Comment on WeZards Tweet",
    description: "Must do a comment on the pinned post & submit your reply link.",
    type: "x_repost",
    url: "https://x.com/We_Zards",
    required: true,
    verificationType: "url",
    active: true,
    sortOrder: 3,
    proofLabel: "Submit your Comment link",
    proofRequired: true,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
];

// ─── Auto-migration flag (Postgres) ──────────────────────────────────────────
let migrationRan = false;

async function ensureMigrated() {
  if (migrationRan || !db) return;
  try {
    try {
      await db.execute(sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS proof_label VARCHAR(255)`);
    } catch (e) {}
    try {
      await db.execute(sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS proof_required BOOLEAN NOT NULL DEFAULT false`);
    } catch (e) {}
    migrationRan = true;
  } catch (err) {}
}

// ─── MongoDB Auto-Seed ───────────────────────────────────────────────────────
let mongoSeeded = false;
async function ensureMongoSeeded() {
  if (mongoSeeded) return;
  const mongo = await getMongoDb();
  if (!mongo) return;
  try {
    const tasksCol = mongo.collection("tasks");
    const count = await tasksCol.countDocuments();
    if (count === 0) {
      await tasksCol.insertMany(
        DEFAULT_TASKS.map((t) => ({ ...t, _id: t.id }))
      );
    }
    mongoSeeded = true;
  } catch (e) {
    console.error("MongoDB seed notice:", e);
  }
}

// ─── getUnifiedTasks ─────────────────────────────────────────────────────────
export async function getUnifiedTasks(): Promise<schema.Task[]> {
  // 1. Check MongoDB
  if (isMongoConfigured) {
    await ensureMongoSeeded();
    const mongo = await getMongoDb();
    if (mongo) {
      const dbTasks = await mongo
        .collection("tasks")
        .find({})
        .sort({ sortOrder: 1 })
        .toArray();
      if (dbTasks.length > 0) {
        return dbTasks.map((t: any) => ({
          id: t.id || t._id,
          title: t.title,
          description: t.description,
          type: t.type,
          url: t.url ?? "",
          required: Boolean(t.required),
          verificationType: t.verificationType || "url",
          active: t.active !== false,
          sortOrder: Number(t.sortOrder) || 1,
          proofLabel: t.proofLabel ?? null,
          proofRequired: Boolean(t.proofRequired),
          createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
          updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
        }));
      }
    }
  }

  // 2. Check PostgreSQL
  if (isPgConfigured && db) {
    await ensureMigrated();
    try {
      let dbTasks = await db.select().from(schema.tasks).orderBy(asc(schema.tasks.sortOrder));
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
        } catch (seedErr) {}
      }
      return dbTasks;
    } catch (dbErr) {}
  }

  // 3. Fallback
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

  // 1. MongoDB
  if (isMongoConfigured) {
    const mongo = await getMongoDb();
    if (mongo) {
      const taskDoc = {
        _id: newId,
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
      await mongo.collection("tasks").insertOne(taskDoc);
      const allTasks = await getUnifiedTasks();
      return { newTask: taskDoc, tasks: allTasks };
    }
  }

  // 2. PostgreSQL
  if (isPgConfigured && db) {
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

  // 3. Fallback
  const fallbackTask: schema.Task = {
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
  return { newTask: fallbackTask, tasks: [fallbackTask] };
}

// ─── updateUnifiedTask ───────────────────────────────────────────────────────
export async function updateUnifiedTask(id: string, updates: Partial<schema.Task>) {
  // 1. MongoDB
  if (isMongoConfigured) {
    const mongo = await getMongoDb();
    if (mongo) {
      const tasksCol = mongo.collection("tasks");
      const res = await tasksCol.findOneAndUpdate(
        { $or: [{ id }, { _id: id } as any] },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: "after" }
      );
      if (!res) {
        const defaultMatch = DEFAULT_TASKS.find((t) => t.id === id);
        if (defaultMatch) {
          await tasksCol.insertOne({
            _id: id,
            ...defaultMatch,
            ...updates,
            updatedAt: new Date(),
          });
        }
      }
      const allTasks = await getUnifiedTasks();
      return { task: updates, tasks: allTasks };
    }
  }

  // 2. PostgreSQL
  if (isPgConfigured && db) {
    await ensureMigrated();
    let [updatedTask] = await db
      .update(schema.tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.tasks.id, id))
      .returning();

    if (!updatedTask) {
      const defaultMatch = DEFAULT_TASKS.find((t) => t.id === id);
      if (defaultMatch) {
        const [inserted] = await db
          .insert(schema.tasks)
          .values({
            id: defaultMatch.id,
            title: defaultMatch.title,
            description: defaultMatch.description,
            type: defaultMatch.type,
            url: defaultMatch.url ?? "",
            required: defaultMatch.required,
            verificationType: defaultMatch.verificationType,
            active: defaultMatch.active,
            sortOrder: defaultMatch.sortOrder,
            proofLabel: defaultMatch.proofLabel ?? null,
            proofRequired: defaultMatch.proofRequired ?? false,
            ...updates,
            updatedAt: new Date(),
          })
          .returning();
        updatedTask = inserted;
      }
    }

    const allTasks = await getUnifiedTasks();
    return { task: updatedTask, tasks: allTasks };
  }

  throw new Error("Database not connected. Please ensure MONGODB_URI or DATABASE_URL is set in environment variables.");
}

// ─── deleteUnifiedTask ───────────────────────────────────────────────────────
export async function deleteUnifiedTask(id: string) {
  if (isMongoConfigured) {
    const mongo = await getMongoDb();
    if (mongo) {
      await mongo.collection("tasks").deleteOne({ $or: [{ id }, { _id: id } as any] });
      const allTasks = await getUnifiedTasks();
      return { tasks: allTasks };
    }
  }

  if (isPgConfigured && db) {
    await ensureMigrated();
    await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
    const allTasks = await getUnifiedTasks();
    return { tasks: allTasks };
  }

  return { tasks: DEFAULT_TASKS };
}

// ─── Whitelist Entry helpers (MongoDB + PostgreSQL) ──────────────────────────
export async function findEntryByWallet(wallet: string) {
  const norm = wallet.toLowerCase();
  if (isMongoConfigured) {
    const mongo = await getMongoDb();
    if (mongo) {
      return await mongo.collection("whitelist_entries").findOne({ walletAddress: norm });
    }
  }
  if (isPgConfigured && db) {
    const results = await db
      .select()
      .from(schema.whitelistEntries)
      .where(eq(schema.whitelistEntries.walletAddress, norm));
    return results[0] ?? null;
  }
  return null;
}

export async function findEntryByTwitter(handle: string) {
  const clean = handle.replace("@", "").toLowerCase();
  if (isMongoConfigured) {
    const mongo = await getMongoDb();
    if (mongo) {
      return await mongo.collection("whitelist_entries").findOne({
        twitterUsername: { $regex: new RegExp(`^@?${clean}$`, "i") },
      });
    }
  }
  if (isPgConfigured && db) {
    const results = await db
      .select()
      .from(schema.whitelistEntries)
      .where(eq(schema.whitelistEntries.twitterUsername, `@${clean}`));
    return results[0] ?? null;
  }
  return null;
}

export async function getEntries() {
  if (isMongoConfigured) {
    const mongo = await getMongoDb();
    if (mongo) {
      return await mongo
        .collection("whitelist_entries")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
    }
  }
  if (isPgConfigured && db) {
    return await db
      .select()
      .from(schema.whitelistEntries)
      .orderBy(schema.whitelistEntries.createdAt);
  }
  return [];
}

export async function updateEntryStatus(id: string, status: "pending" | "approved" | "rejected") {
  if (isMongoConfigured) {
    const mongo = await getMongoDb();
    if (mongo) {
      return await mongo
        .collection("whitelist_entries")
        .findOneAndUpdate(
          { $or: [{ id }, { _id: id } as any] },
          { $set: { status, updatedAt: new Date() } },
          { returnDocument: "after" }
        );
    }
  }
  if (isPgConfigured && db) {
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
  if (isMongoConfigured) {
    const mongo = await getMongoDb();
    if (mongo) {
      await mongo.collection("whitelist_entries").deleteOne({ $or: [{ id }, { _id: id } as any] });
      return true;
    }
  }
  if (isPgConfigured && db) {
    await db.delete(schema.whitelistEntries).where(eq(schema.whitelistEntries.id, id));
    return true;
  }
  return false;
}

// ─── Platform Settings ───────────────────────────────────────────────────────
export async function getPlatformSettings() {
  const DEFAULT_SETTINGS = {
    captchaEnabled: false,
    emailRequired: false,
    applicationEnabled: true,
    maintenanceMode: false,
    duplicateWalletPolicy: "strict",
  };

  if (isMongoConfigured) {
    const mongo = await getMongoDb();
    if (mongo) {
      try {
        const rows = await mongo.collection("settings").find({}).toArray();
        const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };
        for (const row of rows) {
          settingsMap[row.key || row._id] = row.value;
        }
        return settingsMap;
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
  }

  if (isPgConfigured && db) {
    try {
      const allSettings = await db.select().from(schema.settings);
      const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };
      for (const row of allSettings) {
        settingsMap[row.key] = row.value;
      }
      return settingsMap;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  return DEFAULT_SETTINGS;
}

export async function updatePlatformSettings(newSettings: Record<string, any>) {
  if (isMongoConfigured) {
    const mongo = await getMongoDb();
    if (mongo) {
      const col = mongo.collection("settings");
      for (const [key, value] of Object.entries(newSettings)) {
        await col.updateOne(
          { key },
          { $set: { key, value, updatedAt: new Date() } },
          { upsert: true }
        );
      }
      return true;
    }
  }

  if (isPgConfigured && db) {
    for (const [key, value] of Object.entries(newSettings)) {
      await db
        .insert(schema.settings)
        .values({ key, value: value as any, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: schema.settings.key,
          set: { value: value as any, updatedAt: new Date() },
        });
    }
    return true;
  }

  return true;
}
