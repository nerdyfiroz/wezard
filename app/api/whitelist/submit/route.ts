import { NextRequest, NextResponse } from "next/server";
import { whitelistSubmitSchema } from "@/lib/validation/schemas";
import { verifyMathCaptcha } from "@/lib/captcha/math-captcha";
import { db, isDbConfigured, memoryStore } from "@/lib/db";
import { whitelistEntries, tasks, taskCompletions } from "@/lib/db/schema";
import { eq, or, and } from "drizzle-orm";
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

    const { walletAddress, twitterUsername, replyCommentLink, email, completedTaskIds, mathChallengeId, mathAnswer } =
      validation.data;

    // 2. Math CAPTCHA Server Verification
    const captchaResult = verifyMathCaptcha(mathChallengeId, mathAnswer);
    if (!captchaResult.success) {
      return NextResponse.json({ error: captchaResult.error || "Math CAPTCHA verification failed." }, { status: 400 });
    }

    const normalizedWallet = walletAddress.toLowerCase();
    const normalizedTwitter = twitterUsername.toLowerCase();

    // Always record submission in persistent memoryStore so it's guaranteed saved
    if (memoryStore.findEntryByWallet(normalizedWallet)) {
      return NextResponse.json(
        { error: "That wallet address has already joined the WeZards whitelist." },
        { status: 400 }
      );
    }

    if (memoryStore.findEntryByTwitter(normalizedTwitter)) {
      return NextResponse.json(
        { error: "That X/Twitter username has already been registered." },
        { status: 400 }
      );
    }

    // Generate valid UUID
    const entryId = crypto.randomUUID();

    // 3. Save into memoryStore + persistent /tmp store
    const newMemoryEntry = memoryStore.addEntry({
      walletAddress: normalizedWallet,
      twitterUsername: normalizedTwitter,
      replyCommentLink,
      email: email || "",
      completedTaskIds,
    });

    // 4. Try saving into Neon PostgreSQL DB
    if (isDbConfigured && db) {
      try {
        const existingDb = await db
          .select()
          .from(whitelistEntries)
          .where(
            or(
              eq(whitelistEntries.walletAddress, normalizedWallet),
              eq(whitelistEntries.twitterUsername, normalizedTwitter)
            )
          );

        if (existingDb.length === 0) {
          const [newDbEntry] = await db
            .insert(whitelistEntries)
            .values({
              id: entryId,
              walletAddress: normalizedWallet,
              twitterUsername: normalizedTwitter,
              replyCommentLink,
              email: email || "",
              status: "pending",
            })
            .returning();

          if (completedTaskIds && completedTaskIds.length > 0 && newDbEntry) {
            try {
              await db.insert(taskCompletions).values(
                completedTaskIds.map((taskId) => ({
                  id: crypto.randomUUID(),
                  whitelistEntryId: newDbEntry.id,
                  taskId,
                  status: "completed",
                }))
              );
            } catch (tcErr) {
              console.error("Task completions DB insert notice:", tcErr);
            }
          }
        }
      } catch (dbErr) {
        console.error("PostgreSQL insertion notice:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "WELCOME TO THE CIRCLE",
      entryId: newMemoryEntry.id || entryId,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
