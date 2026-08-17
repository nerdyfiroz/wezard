import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_TASKS, getUnifiedTasks } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const allTasks = await getUnifiedTasks();
    const activeTasks = allTasks.filter((t) => t.active);
    return NextResponse.json(
      { tasks: activeTasks },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching public tasks:", error);
    return NextResponse.json({ tasks: DEFAULT_TASKS.filter((t) => t.active) });
  }
}
