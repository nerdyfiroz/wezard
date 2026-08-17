import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { getEntries } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status") || "all";

    let entries = await getEntries();

    if (status !== "all") {
      entries = entries.filter((e: any) => e.status === status);
    }

    if (search) {
      entries = entries.filter(
        (e: any) =>
          (e.walletAddress && e.walletAddress.toLowerCase().includes(search)) ||
          (e.twitterUsername && e.twitterUsername.toLowerCase().includes(search)) ||
          (e.replyCommentLink && e.replyCommentLink.toLowerCase().includes(search)) ||
          (e.email && e.email.toLowerCase().includes(search)) ||
          (e.ipAddress && e.ipAddress.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ applications: entries });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
