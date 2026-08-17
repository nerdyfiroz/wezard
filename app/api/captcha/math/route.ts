import { NextResponse } from "next/server";
import { generateMathCaptcha } from "@/lib/captcha/math-captcha";

export async function GET() {
  const challenge = generateMathCaptcha();
  return NextResponse.json(challenge);
}
