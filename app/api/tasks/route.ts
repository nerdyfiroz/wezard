import { NextResponse } from "next/server";
import { db, isDbConfigured, memoryStore, DEFAULT_TASKS } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    if (isDbConfigured && db) {
      let activeTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.active, true))
        .orderBy(asc(tasks.sortOrder));

      // Auto-seed default tasks if DB tasks table is empty
      if (activeTasks.length === 0) {
        try {
          await db.insert(tasks).values(
            DEFAULT_TASKS.map((t) => ({
              title: t.title,
              description: t.description,
              type: t.type,
              url: t.url,
              required: t.required,
              active: t.active,
              sortOrder: t.sortOrder,
            }))
          );
          activeTasks = await db
            .select()
            .from(tasks)
            .where(eq(tasks.active, true))
            .orderBy(asc(tasks.sortOrder));
        } catch (seedErr) {
          console.error("Auto-seed error:", seedErr);
        }
      }

      return NextResponse.json({ tasks: activeTasks });
    } else {
      if (!memoryStore.tasks || memoryStore.tasks.length === 0) {
        memoryStore.tasks = [...DEFAULT_TASKS];
      }
      const activeTasks = memoryStore.getTasks().filter((t) => t.active);
      return NextResponse.json({ tasks: activeTasks });
    }
  } catch (error) {
    console.error("Error fetching public tasks:", error);
    return NextResponse.json({ tasks: DEFAULT_TASKS });
  }
}
