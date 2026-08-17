import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { taskSchema } from "@/lib/validation/schemas";
import { db, isDbConfigured, memoryStore } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = taskSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0]?.message || "Invalid task data" }, { status: 400 });
    }

    const updates = validation.data;

    // Always update memoryStore + /tmp persistence
    const updatedInMemory = memoryStore.updateTask(params.id, updates);

    if (isDbConfigured && db) {
      try {
        const [updatedInDb] = await db
          .update(tasks)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(tasks.id, params.id))
          .returning();

        if (updatedInDb) {
          return NextResponse.json({ task: updatedInDb, tasks: memoryStore.getTasks() });
        }
      } catch (dbErr) {
        console.error("DB update task failed, fallback to memory store:", dbErr);
      }
    }

    return NextResponse.json({ task: updatedInMemory || updates, tasks: memoryStore.getTasks() });
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Always update memoryStore + /tmp persistence
    memoryStore.deleteTask(params.id);

    if (isDbConfigured && db) {
      try {
        await db.delete(tasks).where(eq(tasks.id, params.id));
      } catch (dbErr) {
        console.error("DB delete task failed, fallback to memory store:", dbErr);
      }
    }

    return NextResponse.json({ success: true, tasks: memoryStore.getTasks() });
  } catch (error) {
    console.error("Task delete error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
