import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { db, isDbConfigured } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// This route applies the schema migration to add proof_label and proof_required columns.
// Call it once after deploying: GET /api/admin/migrate
export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDbConfigured || !db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    // Add proof_label column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS proof_label VARCHAR(255);
    `);

    // Add proof_required column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS proof_required BOOLEAN NOT NULL DEFAULT false;
    `);

    return NextResponse.json({
      success: true,
      message: "Migration applied: proof_label and proof_required columns added to tasks table.",
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", detail: error?.message },
      { status: 500 }
    );
  }
}
