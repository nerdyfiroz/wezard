import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { db, isDbConfigured, memoryStore } from "@/lib/db";
import { whitelistEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status } = body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    if (isDbConfigured && db) {
      const [updated] = await db
        .update(whitelistEntries)
        .set({ status, updatedAt: new Date() })
        .where(eq(whitelistEntries.id, params.id))
        .returning();

      return NextResponse.json({ application: updated });
    } else {
      const updated = memoryStore.updateEntryStatus(params.id, status);
      if (!updated) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }
      return NextResponse.json({ application: updated });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isDbConfigured && db) {
      await db.delete(whitelistEntries).where(eq(whitelistEntries.id, params.id));
      return NextResponse.json({ success: true });
    } else {
      const deleted = memoryStore.deleteEntry(params.id);
      if (!deleted) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
