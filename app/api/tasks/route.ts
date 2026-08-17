import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured, memoryStore, DEFAULT_TASKS } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
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
      // Check for persistent custom tasks cookie
      const customCookie = req.cookies.get("wezard_custom_tasks")?.value;
      let allTasks = memoryStore.getTasks();

      if (customCookie) {
        try {
          const parsed = JSON.parse(customCookie);
          if (Array.isArray(parsed) && parsed.length > 0) {
            allTasks = parsed;
            memoryStore.tasks = parsed;
          }
        } catch (err) {
          console.error("Error parsing custom tasks cookie:", err);
        }
      }

      const activeTasks = allTasks.filter((t) => t.active);
      return NextResponse.json({ tasks: activeTasks });
    }
  } catch (error) {
    console.error("Error fetching public tasks:", error);
    return NextResponse.json({ tasks: DEFAULT_TASKS });
  }
}
