import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Check if Neon DB URL is supplied
const connectionString = process.env.DATABASE_URL;

export const isDbConfigured = Boolean(connectionString && connectionString.startsWith("postgres"));

const sql = isDbConfigured ? neon(connectionString!) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

// Initial Default Tasks for fallback/seeding
export const DEFAULT_TASKS: schema.Task[] = [
  {
    id: "task-1-x-follow",
    title: "Follow @WeZardNFT on X",
    description: "Follow the official WeZard account on X / Twitter to stay updated with arcane announcements.",
    type: "x_follow",
    url: "https://x.com/WeZardNFT",
    points: 25,
    required: true,
    verificationType: "url",
    active: true,
    sortOrder: 1,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
  {
    id: "task-2-x-repost",
    title: "Repost WeZard Initiation Tweet",
    description: "Spread the magic. Repost and like the official WeZard initiation announcement.",
    type: "x_repost",
    url: "https://x.com/WeZardNFT/status/123456789",
    points: 20,
    required: true,
    verificationType: "url",
    active: true,
    sortOrder: 2,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
  {
    id: "task-3-discord-join",
    title: "Enter the WeZard Discord Realm",
    description: "Join the private WeZard Discord server and introduce yourself in the #initiation channel.",
    type: "discord_join",
    url: "https://discord.gg/wezard",
    points: 30,
    required: true,
    verificationType: "url",
    active: true,
    sortOrder: 3,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
  {
    id: "task-4-telegram-join",
    title: "Join Telegram Sanctum",
    description: "Subscribe to the official WeZard broadcast channel on Telegram.",
    type: "telegram_join",
    url: "https://t.me/WeZardSanctum",
    points: 15,
    required: false,
    verificationType: "url",
    active: true,
    sortOrder: 4,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
  {
    id: "task-5-submit-wallet",
    title: "Verify EVM Wallet Address",
    description: "Bind your primary Ethereum/EVM wallet address to your whitelist application.",
    type: "submit_wallet",
    url: "",
    points: 50,
    required: true,
    verificationType: "manual",
    active: true,
    sortOrder: 5,
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-08-01"),
  },
];

// Fallback in-memory store for local testing without DB URL
class MemoryStore {
  tasks: schema.Task[] = [...DEFAULT_TASKS];
  whitelistEntries: schema.WhitelistEntry[] = [
    {
      id: "e-1",
      walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F".toLowerCase(),
      discordUsername: "merlin#1337",
      twitterUsername: "@merlin_wiz",
      email: "merlin@wezard.io",
      referralCode: "ARCANE2026",
      status: "approved",
      createdAt: new Date("2026-08-10"),
      updatedAt: new Date("2026-08-10"),
    },
    {
      id: "e-2",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678".toLowerCase(),
      discordUsername: "gandalf#0001",
      twitterUsername: "@gandalf_grey",
      email: "gandalf@valinor.org",
      referralCode: "",
      status: "pending",
      createdAt: new Date("2026-08-15"),
      updatedAt: new Date("2026-08-15"),
    },
  ];
  taskCompletions: schema.TaskCompletion[] = [
    {
      id: "tc-1",
      whitelistEntryId: "e-1",
      taskId: "task-1-x-follow",
      status: "completed",
      verifiedAt: new Date("2026-08-10"),
      createdAt: new Date("2026-08-10"),
    },
  ];
  settings: Record<string, any> = {
    captchaEnabled: false,
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

  findEntryByDiscord(handle: string) {
    return this.whitelistEntries.find((e) => e.discordUsername.toLowerCase() === handle.toLowerCase());
  }

  addEntry(data: {
    walletAddress: string;
    discordUsername: string;
    twitterUsername: string;
    email?: string;
    referralCode?: string;
    completedTaskIds: string[];
  }) {
    const id = `w-${Date.now()}`;
    const newEntry: schema.WhitelistEntry = {
      id,
      walletAddress: data.walletAddress.toLowerCase(),
      discordUsername: data.discordUsername,
      twitterUsername: data.twitterUsername,
      email: data.email || "",
      referralCode: data.referralCode || "",
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
