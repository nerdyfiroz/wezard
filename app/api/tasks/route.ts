import { NextResponse } from "next/server";
import { db, isDbConfigured, memoryStore } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    if (isDbConfigured && db) {
      const activeTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.active, true))
        .orderBy(asc(tasks.sortOrder));
      return NextResponse.json({ tasks: activeTasks });
    } else {
      const activeTasks = memoryStore.getTasks().filter((t) => t.active);
      return NextResponse.json({ tasks: activeTasks });
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
