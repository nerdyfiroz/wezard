import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { db, isDbConfigured, memoryStore } from "@/lib/db";
import { whitelistEntries, tasks, taskCompletions } from "@/lib/db/schema";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const memoryEntries = memoryStore.getEntries();
    let dbEntries: any[] = [];
    let dbTasks: any[] = [];
    let dbCompletions: any[] = [];

    if (isDbConfigured && db) {
      try {
        dbEntries = await db.select().from(whitelistEntries);
        dbTasks = await db.select().from(tasks);
        dbCompletions = await db.select().from(taskCompletions);
      } catch (dbErr) {
        console.error("DB get stats notice:", dbErr);
      }
    }

    const combinedMap = new Map<string, any>();
    for (const e of memoryEntries) {
      combinedMap.set(e.walletAddress.toLowerCase(), e);
    }
    for (const e of dbEntries) {
      combinedMap.set(e.walletAddress.toLowerCase(), e);
    }

    const allEntries = Array.from(combinedMap.values());

    const totalApplications = allEntries.length;
    const approvedCount = allEntries.filter((e) => e.status === "approved").length;
    const pendingCount = allEntries.filter((e) => e.status === "pending").length;
    const rejectedCount = allEntries.filter((e) => e.status === "rejected").length;

    const uniqueWallets = new Set(allEntries.map((e) => e.walletAddress.toLowerCase())).size;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysApplications = allEntries.filter(
      (e) => new Date(e.createdAt).getTime() >= startOfToday.getTime()
    ).length;

    const allTasks = dbTasks.length > 0 ? dbTasks : memoryStore.getTasks();
    const allCompletions = dbCompletions.length > 0 ? dbCompletions : memoryStore.taskCompletions;

    const taskStatsMap: Record<string, { title: string; count: number }> = {};
    for (const t of allTasks) {
      taskStatsMap[t.id] = { title: t.title, count: 0 };
    }

    for (const c of allCompletions) {
      if (taskStatsMap[c.taskId]) {
        taskStatsMap[c.taskId].count += 1;
      }
    }

    const taskBreakdown = Object.entries(taskStatsMap).map(([id, val]) => ({
      taskId: id,
      title: val.title,
      completions: val.count,
    }));

    return NextResponse.json({
      totalApplications,
      verified: approvedCount,
      pending: pendingCount,
      rejected: rejectedCount,
      uniqueWallets,
      todaysApplications,
      taskBreakdown,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
