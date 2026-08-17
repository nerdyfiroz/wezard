import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { taskSchema } from "@/lib/validation/schemas";
import { db, isDbConfigured, memoryStore, DEFAULT_TASKS } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isDbConfigured && db) {
      let allTasks = await db.select().from(tasks).orderBy(asc(tasks.sortOrder));

      // Auto-seed default tasks if DB tasks table is empty
      if (allTasks.length === 0) {
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
          allTasks = await db.select().from(tasks).orderBy(asc(tasks.sortOrder));
        } catch (seedErr) {
          console.error("Auto-seed error:", seedErr);
        }
      }

      return NextResponse.json({ tasks: allTasks });
    } else {
      if (!memoryStore.tasks || memoryStore.tasks.length === 0) {
        memoryStore.tasks = [...DEFAULT_TASKS];
      }
      const allTasks = memoryStore.getTasks();
      return NextResponse.json({ tasks: allTasks });
    }
  } catch (error) {
    console.error("Failed to fetch admin tasks:", error);
    return NextResponse.json({ tasks: DEFAULT_TASKS });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = taskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0]?.message || "Invalid task data" }, { status: 400 });
    }

    const taskData = validation.data;

    if (isDbConfigured && db) {
      const [newTask] = await db
        .insert(tasks)
        .values({
          title: taskData.title,
          description: taskData.description,
          type: taskData.type,
          url: taskData.url || "",
          required: taskData.required,
          verificationType: taskData.verificationType,
          active: taskData.active,
          sortOrder: taskData.sortOrder,
        })
        .returning();

      return NextResponse.json({ success: true, task: newTask });
    } else {
      const newTask = memoryStore.addTask({
        title: taskData.title,
        description: taskData.description,
        type: taskData.type,
        url: taskData.url || "",
        required: taskData.required,
        verificationType: taskData.verificationType,
        active: taskData.active,
        sortOrder: taskData.sortOrder,
      });

      return NextResponse.json({ success: true, task: newTask });
    }
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
