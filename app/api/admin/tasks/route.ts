import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { taskSchema } from "@/lib/validation/schemas";
import { db, isDbConfigured, memoryStore } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isDbConfigured && db) {
      const allTasks = await db.select().from(tasks).orderBy(asc(tasks.sortOrder));
      return NextResponse.json({ tasks: allTasks });
    } else {
      const allTasks = memoryStore.getTasks();
      return NextResponse.json({ tasks: allTasks });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
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
          points: taskData.points,
          required: taskData.required,
          verificationType: taskData.verificationType,
          active: taskData.active,
          sortOrder: taskData.sortOrder,
        })
        .returning();

      return NextResponse.json({ task: newTask });
    } else {
      const newTask = memoryStore.addTask({
        title: taskData.title,
        description: taskData.description,
        type: taskData.type,
        url: taskData.url || "",
        points: taskData.points,
        required: taskData.required,
        verificationType: taskData.verificationType,
        active: taskData.active,
        sortOrder: taskData.sortOrder,
      });

      return NextResponse.json({ task: newTask });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
