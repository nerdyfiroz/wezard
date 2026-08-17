import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { db, isDbConfigured, memoryStore } from "@/lib/db";
import { whitelistEntries } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status") || "all";

    const memoryEntries = memoryStore.getEntries();
    let dbEntries: any[] = [];

    if (isDbConfigured && db) {
      try {
        dbEntries = await db.select().from(whitelistEntries).orderBy(desc(whitelistEntries.createdAt));
      } catch (dbErr) {
        console.error("DB get applications failed, fallback to memory store:", dbErr);
      }
    }

    // Merge DB entries and Memory entries without duplicates by walletAddress
    const combinedMap = new Map<string, any>();
    
    // Add memory entries first
    for (const entry of memoryEntries) {
      combinedMap.set(entry.walletAddress.toLowerCase(), entry);
    }

    // Overlay DB entries
    for (const entry of dbEntries) {
      combinedMap.set(entry.walletAddress.toLowerCase(), entry);
    }

    let entries = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (status !== "all") {
      entries = entries.filter((e) => e.status === status);
    }

    if (search) {
      entries = entries.filter(
        (e) =>
          e.walletAddress.toLowerCase().includes(search) ||
          e.twitterUsername.toLowerCase().includes(search) ||
          (e.replyCommentLink && e.replyCommentLink.toLowerCase().includes(search)) ||
          (e.email && e.email.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ applications: entries });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
