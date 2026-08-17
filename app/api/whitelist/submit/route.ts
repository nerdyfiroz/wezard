import { NextRequest, NextResponse } from "next/server";
import { whitelistSubmitSchema } from "@/lib/validation/schemas";
import { verifyMathCaptcha } from "@/lib/captcha/math-captcha";
import {
  db,
  isDbConfigured,
  findEntryByWallet,
  findEntryByTwitter,
  getPlatformSettings,
} from "@/lib/db";
import { getMongoDb, isMongoConfigured } from "@/lib/db/mongodb";
import { whitelistEntries, taskCompletions } from "@/lib/db/schema";
import crypto from "crypto";

/**
 * Extract the real client IP from the request headers.
 * On Vercel, the first value in x-forwarded-for is always the original client IP.
 * Falls back to x-real-ip, then cf-connecting-ip (Cloudflare), then "unknown".
 */
function getClientIp(req: NextRequest): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // x-forwarded-for can be a comma-separated list; first entry is the real client
    const firstIp = xForwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "unknown";
}

export async function POST(req: NextRequest) {
  try {
    // Check if whitelist applications are currently open
    const settings = await getPlatformSettings();
    if (settings.applicationEnabled === false) {
      return NextResponse.json(
        { error: "Whitelist applications are currently paused by the administration." },
        { status: 403 }
      );
    }

    // 1. Parse & Validate Input Body
    const body = await req.json();
    const validation = whitelistSubmitSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Invalid input submission.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      walletAddress,
      twitterUsername,
      replyCommentLink,
      email,
      completedTaskIds,
      mathChallengeId,
      mathAnswer,
      taskProofs,
    } = validation.data;

    // 2. Math CAPTCHA Server Verification
    const captchaResult = verifyMathCaptcha(mathChallengeId, mathAnswer);
    if (!captchaResult.success) {
      return NextResponse.json(
        { error: captchaResult.error || "Math CAPTCHA verification failed." },
        { status: 400 }
      );
    }

    // 3. Collect real client IP
    const ipAddress = getClientIp(req);

    const normalizedWallet = walletAddress.toLowerCase();
    const normalizedTwitter = (twitterUsername || "").toLowerCase();

    // 4. Duplicate check (MongoDB or Postgres)
    if (isDbConfigured) {
      const [existingWallet, existingTwitter] = await Promise.all([
        findEntryByWallet(normalizedWallet),
        normalizedTwitter ? findEntryByTwitter(normalizedTwitter) : null,
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
    }

    const entryId = crypto.randomUUID();
    const entryData = {
      _id: entryId,
      id: entryId,
      walletAddress: normalizedWallet,
      twitterUsername: normalizedTwitter || `@${normalizedWallet.slice(2, 10)}`,
      replyCommentLink: replyCommentLink || "Completed via task quest",
      email: email || "",
      status: "pending",
      taskProofs: taskProofs || {},
      completedTaskIds: completedTaskIds || [],
      ipAddress,          // ← real client IP stored here
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 5. Save to MongoDB
    if (isMongoConfigured) {
      const mongo = await getMongoDb();
      if (mongo) {
        await mongo.collection("whitelist_entries").insertOne(entryData);
        if (completedTaskIds && completedTaskIds.length > 0) {
          const completions = completedTaskIds.map((taskId) => ({
            id: crypto.randomUUID(),
            whitelistEntryId: entryId,
            taskId,
            proofUrl: taskProofs?.[taskId] ?? replyCommentLink ?? "",
            status: "completed",
            createdAt: new Date(),
          }));
          await mongo.collection("task_completions").insertMany(completions).catch(() => {});
        }

        return NextResponse.json({
          success: true,
          message: "WELCOME TO THE CIRCLE",
          entryId,
        });
      }
    }

    // 6. Save to PostgreSQL (Neon)
    if (db) {
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

    return NextResponse.json({
      success: true,
      message: "WELCOME TO THE CIRCLE",
      entryId,
    });
  } catch (error: any) {
    console.error("Whitelist submission error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
