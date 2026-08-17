import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL;
export const isDbConfigured = Boolean(connectionString && connectionString.startsWith("postgres"));

const sql = isDbConfigured ? neon(connectionString!) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

// Clean Merged Default Tasks for WeZards
export const DEFAULT_TASKS: schema.Task[] = [
  {
    id: "task-1-x-follow-combined",
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
    id: "task-2-x-repost",
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

// Persistent File Path for Serverless Lambdas (/tmp)
const TMP_TASKS_FILE = path.join(process.env.TMPDIR || "/tmp", "wezard_tasks_v2.json");

declare global {
  var __WEZARD_TASKS_STORE__: schema.Task[] | undefined;
}

function loadPersistedTasks(): schema.Task[] {
  // 1. Try globalThis in-memory store
  if (globalThis.__WEZARD_TASKS_STORE__ && globalThis.__WEZARD_TASKS_STORE__.length > 0) {
    return globalThis.__WEZARD_TASKS_STORE__;
  }

  // 2. Try reading from /tmp file store
  try {
    if (fs.existsSync(TMP_TASKS_FILE)) {
      const content = fs.readFileSync(TMP_TASKS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__WEZARD_TASKS_STORE__ = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading /tmp tasks file:", err);
  }

  // 3. Fallback to DEFAULT_TASKS
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

class MemoryStore {
  tasks: schema.Task[] = [...DEFAULT_TASKS];
  settings: Record<string, any> = {
    captchaEnabled: true,
    emailRequired: false,
    applicationEnabled: true,
    maintenanceMode: false,
    duplicateWalletPolicy: "strict",
  };
  whitelistEntries: schema.WhitelistEntry[] = [
    {
      id: "e-1",
      walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F".toLowerCase(),
      twitterUsername: "@merlin_wiz",
      replyCommentLink: "https://x.com/We_Zards/status/123456789",
      email: "",
      status: "approved",
      createdAt: new Date("2026-08-10"),
      updatedAt: new Date("2026-08-10"),
    },
  ];
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
      id: `task-${Date.now()}`,
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

  getEntries() {
    return this.whitelistEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  findEntryByWallet(wallet: string) {
    return this.whitelistEntries.find((e) => e.walletAddress.toLowerCase() === wallet.toLowerCase());
  }

  findEntryByTwitter(handle: string) {
    const clean = handle.replace("@", "").toLowerCase();
    return this.whitelistEntries.find((e) => e.twitterUsername.replace("@", "").toLowerCase() === clean);
  }

  addEntry(data: {
    walletAddress: string;
    twitterUsername: string;
    replyCommentLink: string;
    email?: string;
    completedTaskIds: string[];
  }) {
    const id = `w-${Date.now()}`;
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
    this.whitelistEntries.push(newEntry);

    for (const taskId of data.completedTaskIds) {
      this.taskCompletions.push({
        id: `tc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
    const entry = this.whitelistEntries.find((e) => e.id === id);
    if (entry) {
      entry.status = status;
      entry.updatedAt = new Date();
    }
    return entry;
  }

  deleteEntry(id: string) {
    const index = this.whitelistEntries.findIndex((e) => e.id === id);
    if (index !== -1) {
      this.whitelistEntries.splice(index, 1);
      this.taskCompletions = this.taskCompletions.filter((tc) => tc.whitelistEntryId !== id);
      return true;
    }
    return false;
  }
}

export const memoryStore = new MemoryStore();
