import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { taskSchema } from "@/lib/validation/schemas";
import { db, isDbConfigured, memoryStore, DEFAULT_TASKS } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let dbTasks: any[] = [];
    if (isDbConfigured && db) {
      try {
        dbTasks = await db.select().from(tasks).orderBy(asc(tasks.sortOrder));

        // Auto-seed Neon DB if tasks table is empty
        if (dbTasks.length === 0) {
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
            dbTasks = await db.select().from(tasks).orderBy(asc(tasks.sortOrder));
          } catch (seedErr) {
            console.error("DB auto-seed tasks error:", seedErr);
          }
        }
      } catch (dbErr) {
        console.error("DB fetch admin tasks error:", dbErr);
      }
    }

    const memoryTasks = memoryStore.getTasks();
    const finalTasks = dbTasks.length > 0 ? dbTasks : memoryTasks;

    return NextResponse.json({ tasks: finalTasks });
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

    // Always add to memoryStore + persistent /tmp store
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
        await db.insert(tasks).values({
          id: newTaskInMemory.id,
          title: taskData.title,
          description: taskData.description,
          type: taskData.type,
          url: taskData.url || "",
          required: taskData.required,
          verificationType: taskData.verificationType,
          active: taskData.active,
          sortOrder: taskData.sortOrder,
        });
      } catch (dbErr) {
        console.error("DB insert task error:", dbErr);
      }
    }

    return NextResponse.json({ success: true, task: newTaskInMemory, tasks: memoryStore.getTasks() });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
