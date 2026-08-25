import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { db, getUnifiedTasks } from "@/lib/db";
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
    const allTasks = await getUnifiedTasks();

    // 1. MongoDB (Optimized Aggregations)
    if (isMongoConfigured) {
      const mongo = await getMongoDb();
      if (mongo) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const [statusCounts, todayCount, distinctWallets, completionCounts] = await Promise.all([
          mongo
            .collection("whitelist_entries")
            .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
            .toArray()
            .catch(() => []),
          mongo
            .collection("whitelist_entries")
            .countDocuments({ createdAt: { $gte: startOfToday } })
            .catch(() => 0),
          mongo
            .collection("whitelist_entries")
            .distinct("walletAddress")
            .then((w: any[]) => w.length)
            .catch(() => 0),
          mongo
            .collection("task_completions")
            .aggregate([{ $group: { _id: "$taskId", count: { $sum: 1 } } }])
            .toArray()
            .catch(() => []),
        ]);

        let totalApplications = 0;
        let approvedCount = 0;
        let pendingCount = 0;
        let rejectedCount = 0;

        for (const s of statusCounts) {
          totalApplications += s.count;
          if (s._id === "approved") approvedCount = s.count;
          else if (s._id === "rejected") rejectedCount = s.count;
          else pendingCount += s.count;
        }

        const taskStatsMap: Record<string, { title: string; count: number }> = {};
        for (const t of allTasks) {
          taskStatsMap[t.id] = { title: t.title, count: 0 };
        }
        for (const c of completionCounts) {
          if (taskStatsMap[c._id]) {
            taskStatsMap[c._id].count = c.count;
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
          uniqueWallets: distinctWallets || totalApplications,
          todaysApplications: todayCount,
          taskBreakdown,
        });
      }
    }

    // 2. PostgreSQL
    if (db) {
      const [allEntries, pgCompletions] = await Promise.all([
        db.select().from(whitelistEntries),
        db.select().from(taskCompletions),
      ]);

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
      for (const c of pgCompletions) {
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
    }

    return NextResponse.json({
      totalApplications: 0,
      verified: 0,
      pending: 0,
      rejected: 0,
      uniqueWallets: 0,
      todaysApplications: 0,
      taskBreakdown: [],
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

