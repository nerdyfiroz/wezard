import { NextRequest, NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation/schemas";
import { setAdminSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = adminLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid username or password format." }, { status: 400 });
    }

    const { username, password } = validation.data;

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "wezard_admin_secret_password_2026";

    if (username !== expectedUsername || password !== expectedPassword) {
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, username });
    await setAdminSessionCookie(response, username);
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
  }
}
