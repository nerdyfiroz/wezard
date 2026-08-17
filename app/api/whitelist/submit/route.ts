import { NextRequest, NextResponse } from "next/server";
import { whitelistSubmitSchema } from "@/lib/validation/schemas";
import { verifyTurnstileToken } from "@/lib/captcha/turnstile";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { db, isDbConfigured, memoryStore } from "@/lib/db";
import { whitelistEntries, tasks, taskCompletions } from "@/lib/db/schema";
import { eq, or, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting by IP
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateCheck = checkRateLimit(`submit-${clientIp}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    // 2. Parse & Validate Input Body
    const body = await req.json();
    const validation = whitelistSubmitSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Invalid input submission.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { walletAddress, discordUsername, twitterUsername, email, referralCode, completedTaskIds, captchaToken } =
      validation.data;

    // 3. CAPTCHA Server Verification
    const captchaResult = await verifyTurnstileToken(captchaToken, clientIp);
    if (!captchaResult.success) {
      return NextResponse.json({ error: captchaResult.error || "Please complete the CAPTCHA verification." }, { status: 400 });
    }

    const normalizedWallet = walletAddress.toLowerCase();
    const normalizedTwitter = twitterUsername.toLowerCase();
    const normalizedDiscord = discordUsername.toLowerCase();

    // 4. Server-Side Verification: Ensure 100% of REQUIRED tasks are completed
    let requiredTaskIds: string[] = [];
    if (isDbConfigured && db) {
      const dbRequiredTasks = await db.select({ id: tasks.id }).from(tasks).where(and(eq(tasks.active, true), eq(tasks.required, true)));
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

    // 5. Check duplicate wallet & duplicate social handles
    if (isDbConfigured && db) {
      const existing = await db
        .select()
        .from(whitelistEntries)
        .where(
          or(
            eq(whitelistEntries.walletAddress, normalizedWallet),
            eq(whitelistEntries.twitterUsername, normalizedTwitter),
            eq(whitelistEntries.discordUsername, normalizedDiscord)
          )
        );

      if (existing.length > 0) {
        const match = existing[0];
        if (match.walletAddress === normalizedWallet) {
          return NextResponse.json(
            { error: "That wallet has already joined the WeZard whitelist." },
            { status: 400 }
          );
        }
        if (match.twitterUsername === normalizedTwitter) {
          return NextResponse.json(
            { error: "That X/Twitter account has already been registered." },
            { status: 400 }
          );
        }
        if (match.discordUsername === normalizedDiscord) {
          return NextResponse.json(
            { error: "That Discord handle has already been registered." },
            { status: 400 }
          );
        }
      }

      // Insert into PostgreSQL
      const [newEntry] = await db
        .insert(whitelistEntries)
        .values({
          walletAddress: normalizedWallet,
          discordUsername: normalizedDiscord,
          twitterUsername: normalizedTwitter,
          email: email || "",
          referralCode: referralCode || "",
          status: "pending",
        })
        .returning();

      // Insert completions
      if (completedTaskIds.length > 0) {
        await db.insert(taskCompletions).values(
          completedTaskIds.map((taskId) => ({
            whitelistEntryId: newEntry.id,
            taskId,
            status: "completed",
          }))
        );
      }

      return NextResponse.json({
        success: true,
        message: "WELCOME TO THE CIRCLE",
        entryId: newEntry.id,
      });
    } else {
      // Memory Store logic
      if (memoryStore.findEntryByWallet(normalizedWallet)) {
        return NextResponse.json(
          { error: "That wallet has already joined the WeZard whitelist." },
          { status: 400 }
        );
      }

      if (memoryStore.findEntryByTwitter(normalizedTwitter)) {
        return NextResponse.json(
          { error: "That X/Twitter account has already been registered." },
          { status: 400 }
        );
      }

      if (memoryStore.findEntryByDiscord(normalizedDiscord)) {
        return NextResponse.json(
          { error: "That Discord handle has already been registered." },
          { status: 400 }
        );
      }

      const newEntry = memoryStore.addEntry({
        walletAddress: normalizedWallet,
        discordUsername: normalizedDiscord,
        twitterUsername: normalizedTwitter,
        email,
        referralCode,
        completedTaskIds,
      });

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
