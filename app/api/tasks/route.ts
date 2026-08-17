import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured, memoryStore, DEFAULT_TASKS } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    if (isDbConfigured && db) {
      try {
        let activeTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.active, true))
          .orderBy(asc(tasks.sortOrder));

        if (activeTasks.length > 0) {
          return NextResponse.json({ tasks: activeTasks });
        }
      } catch (dbErr) {
        console.error("DB public tasks GET failed, fallback to memory store:", dbErr);
      }
    }

    const activeTasks = memoryStore.getTasks().filter((t) => t.active);
    return NextResponse.json({ tasks: activeTasks });
  } catch (error) {
    console.error("Error fetching public tasks:", error);
    return NextResponse.json({ tasks: DEFAULT_TASKS });
  }
}
