import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
export const isDbConfigured = Boolean(connectionString && connectionString.startsWith("postgres"));

const sql = isDbConfigured ? neon(connectionString!) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

// Initial Default Tasks for WeZards
export const DEFAULT_TASKS: schema.Task[] = [
  {
    id: "task-1-x-follow-project",
    title: "Follow @We_Zards on X",
    description: "Follow the official WeZards project account on X / Twitter to stay updated.",
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
    id: "task-2-x-follow-artist",
    title: "Follow @SickickZards (Artist) on X",
    description: "Follow the official artist account of WeZards on X / Twitter.",
    type: "x_follow",
    url: "https://x.com/SickickZards",
    required: true,
    verificationType: "url",
    active: true,
    sortOrder: 2,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
  {
    id: "task-3-x-repost",
    title: "Like, Repost & Comment on WeZards Tweet",
    description: "Engage with the official WeZards announcement post on X / Twitter.",
    type: "x_repost",
    url: "https://x.com/We_Zards",
    required: true,
    verificationType: "url",
    active: true,
    sortOrder: 3,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
  {
    id: "task-4-submit-wallet",
    title: "Submit EVM Wallet & Proof",
    description: "Enter your primary EVM address, X username, and reply/comment link below.",
    type: "submit_wallet",
    url: "",
    required: true,
    verificationType: "manual",
    active: true,
    sortOrder: 4,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
];

class MemoryStore {
  tasks: schema.Task[] = [...DEFAULT_TASKS];
  whitelistEntries: schema.WhitelistEntry[] = [
    {
      id: "e-1",
      walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F".toLowerCase(),
      twitterUsername: "@merlin_wiz",
      replyCommentLink: "https://x.com/We_Zards/status/123456789",
      email: "merlin@wezards.io",
      status: "approved",
      createdAt: new Date("2026-08-10"),
      updatedAt: new Date("2026-08-10"),
    },
    {
      id: "e-2",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678".toLowerCase(),
      twitterUsername: "@gandalf_grey",
      replyCommentLink: "https://x.com/SickickZards/status/987654321",
      email: "gandalf@valinor.org",
      status: "pending",
      createdAt: new Date("2026-08-15"),
      updatedAt: new Date("2026-08-15"),
    },
  ];
  taskCompletions: schema.TaskCompletion[] = [
    {
      id: "tc-1",
      whitelistEntryId: "e-1",
      taskId: "task-1-x-follow-project",
      proofUrl: "",
      status: "completed",
      verifiedAt: new Date("2026-08-10"),
      createdAt: new Date("2026-08-10"),
    },
  ];
  settings: Record<string, any> = {
    captchaEnabled: true,
    emailRequired: false,
    applicationEnabled: true,
    maintenanceMode: false,
    duplicateWalletPolicy: "strict",
  };

  getTasks() {
    return this.tasks.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getTask(id: string) {
    return this.tasks.find((t) => t.id === id);
  }

  addTask(task: Omit<schema.Task, "id" | "createdAt" | "updatedAt">) {
    const newTask: schema.Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<schema.Task>) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.tasks[index];
  }

  deleteTask(id: string) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
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
