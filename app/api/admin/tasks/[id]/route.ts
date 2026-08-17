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

    if (isDbConfigured && db) {
      const [updated] = await db
        .update(tasks)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(tasks.id, params.id))
        .returning();

      return NextResponse.json({ task: updated });
    } else {
      // Check existing custom tasks cookie
      const customCookie = req.cookies.get("wezard_custom_tasks")?.value;
      if (customCookie) {
        try {
          const parsed = JSON.parse(customCookie);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryStore.tasks = parsed;
          }
        } catch (e) {}
      }

      const updated = memoryStore.updateTask(params.id, updates);
      if (!updated) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      const updatedTasksList = memoryStore.getTasks();
      const response = NextResponse.json({ task: updated, tasks: updatedTasksList });

      // Set cookie so tasks persist across serverless instances
      response.cookies.set("wezard_custom_tasks", JSON.stringify(updatedTasksList), {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });

      return response;
    }
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
    if (isDbConfigured && db) {
      await db.delete(tasks).where(eq(tasks.id, params.id));
      return NextResponse.json({ success: true });
    } else {
      const customCookie = req.cookies.get("wezard_custom_tasks")?.value;
      if (customCookie) {
        try {
          const parsed = JSON.parse(customCookie);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryStore.tasks = parsed;
          }
        } catch (e) {}
      }

      const deleted = memoryStore.deleteTask(params.id);
      if (!deleted) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      const updatedTasksList = memoryStore.getTasks();
      const response = NextResponse.json({ success: true, tasks: updatedTasksList });

      // Set cookie so tasks persist across serverless instances
      response.cookies.set("wezard_custom_tasks", JSON.stringify(updatedTasksList), {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });

      return response;
    }
  } catch (error) {
    console.error("Task delete error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
