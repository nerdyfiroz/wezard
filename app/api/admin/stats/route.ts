import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { db, isDbConfigured, getUnifiedTasks, getEntries } from "@/lib/db";
import { getMongoDb, isMongoConfigured } from "@/lib/db/mongodb";
import { whitelistEntries, tasks, taskCompletions } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let allEntries: any[] = [];
    let allTasks: any[] = [];
    let allCompletions: any[] = [];

    // 1. MongoDB
    if (isMongoConfigured) {
      const mongo = await getMongoDb();
      if (mongo) {
        [allEntries, allTasks, allCompletions] = await Promise.all([
          mongo.collection("whitelist_entries").find({}).toArray(),
          getUnifiedTasks(),
          mongo.collection("task_completions").find({}).toArray(),
        ]);
      }
    } else if (db) {
      // 2. PostgreSQL
      [allEntries, allTasks, allCompletions] = await Promise.all([
        db.select().from(whitelistEntries),
        db.select().from(tasks).orderBy(asc(tasks.sortOrder)),
        db.select().from(taskCompletions),
      ]);
    } else {
      allTasks = await getUnifiedTasks();
    }

    const totalApplications = allEntries.length;
    const approvedCount = allEntries.filter((e) => e.status === "approved").length;
    const pendingCount = allEntries.filter((e) => e.status === "pending").length;
    const rejectedCount = allEntries.filter((e) => e.status === "rejected").length;
    const uniqueWallets = new Set(
      allEntries.map((e) => (e.walletAddress ? e.walletAddress.toLowerCase() : ""))
    ).size;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysApplications = allEntries.filter(
      (e) => new Date(e.createdAt || 0).getTime() >= startOfToday.getTime()
    ).length;

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
