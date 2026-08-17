import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";
import { taskSchema } from "@/lib/validation/schemas";
import { DEFAULT_TASKS, getUnifiedTasks, addUnifiedTask } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tasks = await getUnifiedTasks();
    return NextResponse.json(
      { tasks },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
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
    const { newTask, tasks } = await addUnifiedTask(taskData);

    return NextResponse.json({ success: true, task: newTask, tasks });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
