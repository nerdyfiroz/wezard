import { NextRequest, NextResponse } from "next/server";
import { whitelistSubmitSchema } from "@/lib/validation/schemas";
import { verifyMathCaptcha } from "@/lib/captcha/math-captcha";
import { db, isDbConfigured, findEntryByWallet, findEntryByTwitter } from "@/lib/db";
import { whitelistEntries, taskCompletions } from "@/lib/db/schema";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse & Validate Input Body
    const body = await req.json();
    const validation = whitelistSubmitSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Invalid input submission.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { walletAddress, twitterUsername, replyCommentLink, email, completedTaskIds, mathChallengeId, mathAnswer, taskProofs } =
      validation.data;

    // 2. Math CAPTCHA Server Verification
    const captchaResult = verifyMathCaptcha(mathChallengeId, mathAnswer);
    if (!captchaResult.success) {
      return NextResponse.json({ error: captchaResult.error || "Math CAPTCHA verification failed." }, { status: 400 });
    }

    const normalizedWallet = walletAddress.toLowerCase();
    const normalizedTwitter = twitterUsername.toLowerCase();

    // 3. Duplicate check — DB-first
    if (isDbConfigured && db) {
      const [existingWallet, existingTwitter] = await Promise.all([
        findEntryByWallet(normalizedWallet),
        findEntryByTwitter(normalizedTwitter),
      ]);

      if (existingWallet) {
        return NextResponse.json(
          { error: "That wallet address has already joined the WeZards whitelist." },
          { status: 400 }
        );
      }
      if (existingTwitter) {
        return NextResponse.json(
          { error: "That X/Twitter username has already been registered." },
          { status: 400 }
        );
      }

      // 4. Insert into Neon DB
      const entryId = crypto.randomUUID();
      const [newDbEntry] = await db
        .insert(whitelistEntries)
        .values({
          id: entryId,
          walletAddress: normalizedWallet,
          twitterUsername: normalizedTwitter || `@${normalizedWallet.slice(2, 10)}`,
          replyCommentLink: replyCommentLink || "Completed via task quest",
          email: email || "",
          status: "pending",
        })
        .returning();

      // 5. Insert task completions with per-task proof URLs
      if (completedTaskIds && completedTaskIds.length > 0 && newDbEntry) {
        try {
          await db.insert(taskCompletions).values(
            completedTaskIds.map((taskId) => ({
              id: crypto.randomUUID(),
              whitelistEntryId: newDbEntry.id,
              taskId,
              proofUrl: taskProofs?.[taskId] ?? replyCommentLink ?? "",
              status: "completed",
            }))
          );
        } catch (tcErr) {
          console.error("Task completions DB insert error:", tcErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: "WELCOME TO THE CIRCLE",
        entryId: newDbEntry.id,
      });
    }

    // Local dev fallback (no DATABASE_URL)
    return NextResponse.json({
      success: true,
      message: "WELCOME TO THE CIRCLE (dev mode)",
      entryId: crypto.randomUUID(),
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
