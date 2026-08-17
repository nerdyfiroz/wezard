import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured, memoryStore, DEFAULT_TASKS } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    let dbActiveTasks: any[] = [];

    if (isDbConfigured && db) {
      try {
        dbActiveTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.active, true))
          .orderBy(asc(tasks.sortOrder));

        // Auto-seed default tasks if DB tasks table is empty
        if (dbActiveTasks.length === 0) {
          try {
            await db.insert(tasks).values(
              DEFAULT_TASKS.map((t) => ({
                id: t.id,
                title: t.title,
                description: t.description,
                type: t.type,
                url: t.url || "",
                required: t.required,
                active: t.active,
                sortOrder: t.sortOrder,
              }))
            );
            dbActiveTasks = await db
              .select()
              .from(tasks)
              .where(eq(tasks.active, true))
              .orderBy(asc(tasks.sortOrder));
          } catch (seedErr) {
            console.error("DB auto-seed tasks error:", seedErr);
          }
        }
      } catch (dbErr) {
        console.error("DB public tasks GET failed, fallback to memory store:", dbErr);
      }
    }

    const memoryActiveTasks = memoryStore.getTasks().filter((t) => t.active);
    const finalTasks = dbActiveTasks.length > 0 ? dbActiveTasks : memoryActiveTasks;

    return NextResponse.json({ tasks: finalTasks });
  } catch (error) {
    console.error("Error fetching public tasks:", error);
    return NextResponse.json({ tasks: DEFAULT_TASKS });
  }
}
