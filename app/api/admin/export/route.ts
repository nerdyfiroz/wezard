import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { getEntries } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await getEntries();

    const headers = ["wallet_address", "twitter_username", "reply_comment_link", "email", "status", "created_at"];
    const rows = entries.map((e: any) => [
      `"${e.walletAddress || ""}"`,
      `"${e.twitterUsername || ""}"`,
      `"${(e.replyCommentLink || "").replace(/"/g, '""')}"`,
      `"${e.email || ""}"`,
      `"${e.status || "pending"}"`,
      `"${new Date(e.createdAt || Date.now()).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row: any) => row.join(","))].join("\n");

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
