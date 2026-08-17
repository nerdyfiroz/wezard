import { NextRequest, NextResponse } from "next/server";
import { whitelistSubmitSchema } from "@/lib/validation/schemas";
import { verifyMathCaptcha } from "@/lib/captcha/math-captcha";
import { canIpSubmit, incrementIpSubmissionCount } from "@/lib/security/rate-limit";
import { db, isDbConfigured, memoryStore } from "@/lib/db";
import { whitelistEntries, tasks, taskCompletions } from "@/lib/db/schema";
import { eq, or, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // 1. Get Client IP Address (unlimited webpage visits, max 3 form submissions)
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";

    // 2. Enforce Max 3 Form Submissions per IP
    const ipCheck = canIpSubmit(clientIp, 3);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    // 3. Parse & Validate Input Body
    const body = await req.json();
    const validation = whitelistSubmitSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Invalid input submission.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { walletAddress, twitterUsername, replyCommentLink, email, completedTaskIds, mathChallengeId, mathAnswer } =
      validation.data;

    // 4. Math CAPTCHA Server Verification
    const captchaResult = verifyMathCaptcha(mathChallengeId, mathAnswer);
    if (!captchaResult.success) {
      return NextResponse.json({ error: captchaResult.error || "Math CAPTCHA verification failed." }, { status: 400 });
    }

    const normalizedWallet = walletAddress.toLowerCase();
    const normalizedTwitter = twitterUsername.toLowerCase();

    // 5. Server-Side Verification: Ensure 100% of REQUIRED tasks are completed
    let requiredTaskIds: string[] = [];
    if (isDbConfigured && db) {
      const dbRequiredTasks = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(and(eq(tasks.active, true), eq(tasks.required, true)));
      requiredTaskIds = dbRequiredTasks.map((t) => t.id);
    } else {
      requiredTaskIds = memoryStore
        .getTasks()
        .filter((t) => t.active && t.required)
        .map((t) => t.id);
    }

    const missingRequired = requiredTaskIds.filter((reqId) => !completedTaskIds.includes(reqId));
    if (missingRequired.length > 0) {
      return NextResponse.json(
        { error: "Complete all required quests before submitting your whitelist application." },
        { status: 400 }
      );
    }

    // 6. Check duplicate wallet & Twitter username
    if (isDbConfigured && db) {
      const existing = await db
        .select()
        .from(whitelistEntries)
        .where(
          or(
            eq(whitelistEntries.walletAddress, normalizedWallet),
            eq(whitelistEntries.twitterUsername, normalizedTwitter)
          )
        );

      if (existing.length > 0) {
        const match = existing[0];
        if (match.walletAddress === normalizedWallet) {
          return NextResponse.json(
            { error: "That wallet address has already joined the WeZards whitelist." },
            { status: 400 }
          );
        }
        if (match.twitterUsername === normalizedTwitter) {
          return NextResponse.json(
            { error: "That X/Twitter username has already been registered." },
            { status: 400 }
          );
        }
      }

      // Insert into PostgreSQL
      const [newEntry] = await db
        .insert(whitelistEntries)
        .values({
          walletAddress: normalizedWallet,
          twitterUsername: normalizedTwitter,
          replyCommentLink,
          email: email || "",
          status: "pending",
        })
        .returning();

      // Insert task completions
      if (completedTaskIds.length > 0) {
        await db.insert(taskCompletions).values(
          completedTaskIds.map((taskId) => ({
            whitelistEntryId: newEntry.id,
            taskId,
            status: "completed",
          }))
        );
      }

      // Increment successful submission count for IP
      incrementIpSubmissionCount(clientIp);

      return NextResponse.json({
        success: true,
        message: "WELCOME TO THE CIRCLE",
        entryId: newEntry.id,
      });
    } else {
      // Memory Store logic
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

      const newEntry = memoryStore.addEntry({
        walletAddress: normalizedWallet,
        twitterUsername: normalizedTwitter,
        replyCommentLink,
        email,
        completedTaskIds,
      });

      // Increment successful submission count for IP
      incrementIpSubmissionCount(clientIp);

      return NextResponse.json({
        success: true,
        message: "WELCOME TO THE CIRCLE",
        entryId: newEntry.id,
      });
    }
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
