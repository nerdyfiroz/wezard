import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { db, isDbConfigured, memoryStore } from "@/lib/db";
import { whitelistEntries } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let entries: Array<{
      walletAddress: string;
      twitterUsername: string;
      replyCommentLink: string;
      email: string | null;
      status: string;
      createdAt: Date;
    }> = [];

    if (isDbConfigured && db) {
      entries = await db.select().from(whitelistEntries).orderBy(desc(whitelistEntries.createdAt));
    } else {
      entries = memoryStore.getEntries();
    }

    const headers = ["wallet_address", "twitter_username", "reply_comment_link", "email", "status", "created_at"];
    const rows = entries.map((e) => [
      `"${e.walletAddress}"`,
      `"${e.twitterUsername}"`,
      `"${(e.replyCommentLink || "").replace(/"/g, '""')}"`,
      `"${e.email || ""}"`,
      `"${e.status}"`,
      `"${new Date(e.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=wezards-whitelist-${Date.now()}.csv`,
      },
    });
  } catch (error) {
    console.error("CSV Export error:", error);
    return NextResponse.json({ error: "Failed to generate CSV export" }, { status: 500 });
  }
}
