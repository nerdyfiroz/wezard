import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { db, isDbConfigured } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const DEFAULT_SETTINGS = {
  captchaEnabled: false,
  emailRequired: false,
  applicationEnabled: true,
  maintenanceMode: false,
  duplicateWalletPolicy: "strict",
};

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isDbConfigured && db) {
      const allSettings = await db.select().from(settings);
      const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };
      for (const row of allSettings) {
        settingsMap[row.key] = row.value;
      }
      return NextResponse.json({ settings: settingsMap });
    }
    // Local dev fallback
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (isDbConfigured && db) {
      for (const [key, value] of Object.entries(body)) {
        await db
          .insert(settings)
          .values({ key, value: value as any, updatedAt: new Date() })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value: value as any, updatedAt: new Date() },
          });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
