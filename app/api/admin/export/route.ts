import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { getMongoDb, isMongoConfigured } from "@/lib/db/mongodb";
import { db, isPgConfigured } from "@/lib/db";
import { whitelistEntries } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status") || "all";

    const headerRow = "wallet_address,twitter_username,reply_comment_link,email,status,created_at\n";

    // 1. MongoDB Streaming Export
    if (isMongoConfigured) {
      const mongo = await getMongoDb();
      if (mongo) {
        const filter: any = {};
        if (status && status !== "all") {
          filter.status = status;
        }
        if (search) {
          const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          filter.$or = [
            { walletAddress: { $regex: safeSearch, $options: "i" } },
            { twitterUsername: { $regex: safeSearch, $options: "i" } },
            { replyCommentLink: { $regex: safeSearch, $options: "i" } },
            { email: { $regex: safeSearch, $options: "i" } },
          ];
        }

        const cursor = mongo.collection("whitelist_entries").find(filter, {
          projection: {
            walletAddress: 1,
            twitterUsername: 1,
            replyCommentLink: 1,
            email: 1,
            status: 1,
            createdAt: 1,
            _id: 0,
          },
          sort: { createdAt: -1 },
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              controller.enqueue(encoder.encode(headerRow));
              for await (const doc of cursor) {
                const row = `"${doc.walletAddress || ""}","${doc.twitterUsername || ""}","${(doc.replyCommentLink || "").replace(/"/g, '""')}","${doc.email || ""}","${doc.status || "pending"}","${new Date(doc.createdAt || Date.now()).toISOString()}"\n`;
                controller.enqueue(encoder.encode(row));
              }
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
        });

        return new Response(stream, {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename=wezards-whitelist-${Date.now()}.csv`,
          },
        });
      }
    }

    // 2. PostgreSQL fallback
    if (isPgConfigured && db) {
      const all = await db.select().from(whitelistEntries);
      const rows = all.map((e: any) => [
        `"${e.walletAddress || ""}"`,
        `"${e.twitterUsername || ""}"`,
        `"${(e.replyCommentLink || "").replace(/"/g, '""')}"`,
        `"${e.email || ""}"`,
        `"${e.status || "pending"}"`,
        `"${new Date(e.createdAt || Date.now()).toISOString()}"`,
      ]);
      const csvContent = [headerRow.trim(), ...rows.map((row: any) => row.join(","))].join("\n");
      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=wezards-whitelist-${Date.now()}.csv`,
        },
      });
    }

    return new Response(headerRow, {
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

