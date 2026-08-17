import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { db, isDbConfigured, memoryStore } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isDbConfigured && db) {
      const allSettings = await db.select().from(settings);
      const settingsMap: Record<string, any> = {
        captchaEnabled: false,
        emailRequired: false,
        applicationEnabled: true,
        maintenanceMode: false,
        duplicateWalletPolicy: "strict",
      };
      for (const row of allSettings) {
        settingsMap[row.key] = row.value;
      }
      return NextResponse.json({ settings: settingsMap });
    } else {
      return NextResponse.json({ settings: memoryStore.settings });
    }
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
    } else {
      memoryStore.settings = {
        ...memoryStore.settings,
        ...body,
      };
      return NextResponse.json({ success: true, settings: memoryStore.settings });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
