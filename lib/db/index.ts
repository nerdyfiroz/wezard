import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const connectionString = process.env.DATABASE_URL;
export const isDbConfigured = Boolean(connectionString && connectionString.startsWith("postgres"));

const sql = isDbConfigured ? neon(connectionString!) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

// Clean Merged Default Tasks for WeZards
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
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
];

// Persistent File Paths for Serverless Lambdas (/tmp)
const TMP_TASKS_FILE = path.join(process.env.TMPDIR || "/tmp", "wezard_tasks_v3.json");
const TMP_ENTRIES_FILE = path.join(process.env.TMPDIR || "/tmp", "wezard_entries_v3.json");

declare global {
  var __WEZARD_TASKS_STORE__: schema.Task[] | undefined;
  var __WEZARD_ENTRIES_STORE__: schema.WhitelistEntry[] | undefined;
}

import { asc, eq } from "drizzle-orm";

function loadPersistedTasks(): schema.Task[] {
  if (globalThis.__WEZARD_TASKS_STORE__ !== undefined) {
    return globalThis.__WEZARD_TASKS_STORE__;
  }
  try {
    if (fs.existsSync(TMP_TASKS_FILE)) {
      const content = fs.readFileSync(TMP_TASKS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        globalThis.__WEZARD_TASKS_STORE__ = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading /tmp tasks file:", err);
  }
  globalThis.__WEZARD_TASKS_STORE__ = [...DEFAULT_TASKS];
  return globalThis.__WEZARD_TASKS_STORE__;
}

function savePersistedTasks(tasksList: schema.Task[]) {
  globalThis.__WEZARD_TASKS_STORE__ = tasksList;
  try {
    fs.writeFileSync(TMP_TASKS_FILE, JSON.stringify(tasksList), "utf-8");
  } catch (err) {
    console.error("Error saving to /tmp tasks file:", err);
  }
}

function loadPersistedEntries(): schema.WhitelistEntry[] {
  if (globalThis.__WEZARD_ENTRIES_STORE__) {
    return globalThis.__WEZARD_ENTRIES_STORE__;
  }
  try {
    if (fs.existsSync(TMP_ENTRIES_FILE)) {
      const content = fs.readFileSync(TMP_ENTRIES_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        // Parse ISO dates back to Date objects
        const formatted = parsed.map((e: any) => ({
          ...e,
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
        }));
        globalThis.__WEZARD_ENTRIES_STORE__ = formatted;
        return formatted;
      }
    }
  } catch (err) {
    console.error("Error reading /tmp entries file:", err);
  }
  globalThis.__WEZARD_ENTRIES_STORE__ = [];
  return globalThis.__WEZARD_ENTRIES_STORE__;
}

function savePersistedEntries(entriesList: schema.WhitelistEntry[]) {
  globalThis.__WEZARD_ENTRIES_STORE__ = entriesList;
  try {
    fs.writeFileSync(TMP_ENTRIES_FILE, JSON.stringify(entriesList), "utf-8");
  } catch (err) {
    console.error("Error saving to /tmp entries file:", err);
  }
}

export async function getUnifiedTasks(): Promise<schema.Task[]> {
  if (isDbConfigured && db) {
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
              url: t.url || "",
              required: t.required,
              verificationType: t.verificationType,
              active: t.active,
              sortOrder: t.sortOrder,
            }))
          );
          dbTasks = await db.select().from(schema.tasks).orderBy(asc(schema.tasks.sortOrder));
        } catch (seedErr) {
          console.error("DB auto-seed tasks error:", seedErr);
        }
      }
      if (dbTasks.length > 0) {
        savePersistedTasks(dbTasks);
        return dbTasks;
      }
    } catch (dbErr) {
      console.error("DB fetch tasks error:", dbErr);
    }
  }
  return memoryStore.getTasks();
}

export async function addUnifiedTask(taskData: {
  title: string;
  description: string;
  type: schema.Task["type"];
  url?: string;
  required: boolean;
  verificationType: schema.Task["verificationType"];
  active: boolean;
  sortOrder: number;
}) {
  const newTaskInMemory = memoryStore.addTask({
    title: taskData.title,
    description: taskData.description,
    type: taskData.type,
    url: taskData.url || "",
    required: taskData.required,
    verificationType: taskData.verificationType,
    active: taskData.active,
    sortOrder: taskData.sortOrder,
  });

  if (isDbConfigured && db) {
    try {
      await db.insert(schema.tasks).values({
        id: newTaskInMemory.id,
        title: taskData.title,
        description: taskData.description,
        type: taskData.type,
        url: taskData.url || "",
        required: taskData.required,
        verificationType: taskData.verificationType,
        active: taskData.active,
        sortOrder: taskData.sortOrder,
      });
    } catch (dbErr) {
      console.error("DB insert task error:", dbErr);
    }
  }

  const allTasks = await getUnifiedTasks();
  return { newTask: newTaskInMemory, tasks: allTasks };
}

export async function updateUnifiedTask(id: string, updates: Partial<schema.Task>) {
  const updatedInMemory = memoryStore.updateTask(id, updates);

  if (isDbConfigured && db) {
    try {
      await db
        .update(schema.tasks)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.tasks.id, id));
    } catch (dbErr) {
      console.error("DB update task error:", dbErr);
    }
  }

  const allTasks = await getUnifiedTasks();
  return { task: updatedInMemory || updates, tasks: allTasks };
}

export async function deleteUnifiedTask(id: string) {
  memoryStore.deleteTask(id);

  if (isDbConfigured && db) {
    try {
      await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
    } catch (dbErr) {
      console.error("DB delete task error:", dbErr);
    }
  }

  const allTasks = await getUnifiedTasks();
  return { tasks: allTasks };
}

class MemoryStore {
  tasks: schema.Task[] = [...DEFAULT_TASKS];
  settings: Record<string, any> = {
    captchaEnabled: true,
    emailRequired: false,
    applicationEnabled: true,
    maintenanceMode: false,
    duplicateWalletPolicy: "strict",
  };
  taskCompletions: schema.TaskCompletion[] = [];

  getTasks(): schema.Task[] {
    const list = loadPersistedTasks();
    this.tasks = list;
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getTask(id: string) {
    const list = loadPersistedTasks();
    return list.find((t) => t.id === id);
  }

  addTask(task: Omit<schema.Task, "id" | "createdAt" | "updatedAt">) {
    const list = loadPersistedTasks();
    const newTask: schema.Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    list.push(newTask);
    savePersistedTasks(list);
    this.tasks = list;
    return newTask;
  }

  updateTask(id: string, updates: Partial<schema.Task>) {
    const list = loadPersistedTasks();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date(),
    };
    savePersistedTasks(list);
    this.tasks = list;
    return list[index];
  }

  deleteTask(id: string) {
    const list = loadPersistedTasks();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    savePersistedTasks(list);
    this.tasks = list;
    return true;
  }

  getEntries(): schema.WhitelistEntry[] {
    const list = loadPersistedEntries();
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findEntryByWallet(wallet: string) {
    const list = loadPersistedEntries();
    return list.find((e) => e.walletAddress.toLowerCase() === wallet.toLowerCase());
  }

  findEntryByTwitter(handle: string) {
    const list = loadPersistedEntries();
    const clean = handle.replace("@", "").toLowerCase();
    return list.find((e) => e.twitterUsername.replace("@", "").toLowerCase() === clean);
  }

  addEntry(data: {
    walletAddress: string;
    twitterUsername: string;
    replyCommentLink: string;
    email?: string;
    completedTaskIds: string[];
  }) {
    const list = loadPersistedEntries();
    const id = crypto.randomUUID();
    const newEntry: schema.WhitelistEntry = {
      id,
      walletAddress: data.walletAddress.toLowerCase(),
      twitterUsername: data.twitterUsername,
      replyCommentLink: data.replyCommentLink,
      email: data.email || "",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    list.push(newEntry);
    savePersistedEntries(list);

    for (const taskId of data.completedTaskIds) {
      this.taskCompletions.push({
        id: crypto.randomUUID(),
        whitelistEntryId: id,
        taskId,
        proofUrl: "",
        status: "completed",
        verifiedAt: new Date(),
        createdAt: new Date(),
      });
    }

    return newEntry;
  }

  updateEntryStatus(id: string, status: "pending" | "approved" | "rejected") {
    const list = loadPersistedEntries();
    const entry = list.find((e) => e.id === id);
    if (entry) {
      entry.status = status;
      entry.updatedAt = new Date();
      savePersistedEntries(list);
    }
    return entry;
  }

  deleteEntry(id: string) {
    const list = loadPersistedEntries();
    const index = list.findIndex((e) => e.id === id);
    if (index !== -1) {
      list.splice(index, 1);
      savePersistedEntries(list);
      this.taskCompletions = this.taskCompletions.filter((tc) => tc.whitelistEntryId !== id);
      return true;
    }
    return false;
  }
}

export const memoryStore = new MemoryStore();
