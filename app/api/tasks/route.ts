import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_TASKS, getUnifiedTasks } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const allTasks = await getUnifiedTasks();
    const activeTasks = allTasks.filter((t) => t.active);
    return NextResponse.json({ tasks: activeTasks });
  } catch (error) {
    console.error("Error fetching public tasks:", error);
    return NextResponse.json({ tasks: DEFAULT_TASKS.filter((t) => t.active) });
  }
}
