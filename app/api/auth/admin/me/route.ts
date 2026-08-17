import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/auth/session";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, username: session.username });
}
