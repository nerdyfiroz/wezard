import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { taskSchema } from "@/lib/validation/schemas";
import { db, isDbConfigured, memoryStore, DEFAULT_TASKS } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isDbConfigured && db) {
      try {
        let allTasks = await db.select().from(tasks).orderBy(asc(tasks.sortOrder));
        if (allTasks.length > 0) {
          return NextResponse.json({ tasks: allTasks });
        }
      } catch (dbErr) {
        console.error("DB get admin tasks failed, fallback to memory store:", dbErr);
      }
    }

    return NextResponse.json({ tasks: memoryStore.getTasks() });
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

    // Always add to memoryStore + /tmp store
    const newTaskInMemory = memoryStore.addTask({
      title: taskData.title,
      description: taskData.description,
      type: taskData.type,
      url: taskData.url || "",
      required: taskData.required,
      verificationType: taskData.verificationType,
      active: taskData.active,
      sortOrder: taskData.sortOrder,
    });

    if (isDbConfigured && db) {
      try {
        const [newTaskDb] = await db
          .insert(tasks)
          .values({
            id: newTaskInMemory.id,
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

        if (newTaskDb) {
          return NextResponse.json({ success: true, task: newTaskDb, tasks: memoryStore.getTasks() });
        }
      } catch (dbErr) {
        console.error("DB insert task failed, fallback to memory store:", dbErr);
      }
    }

    return NextResponse.json({ success: true, task: newTaskInMemory, tasks: memoryStore.getTasks() });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
