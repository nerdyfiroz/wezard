import crypto from "crypto";

const SECRET_SALT = process.env.ADMIN_JWT_SECRET || "wezards-math-captcha-secret-salt-2026";

/**
 * Generates a stateless signed Math CAPTCHA challenge.
 * Works 100% reliably across Vercel serverless lambdas without memory map expiration.
 */
export function generateMathCaptcha(): { challengeId: string; question: string } {
  const isMultiplication = Math.random() > 0.5;

  let n1 = 0;
  let n2 = 0;
  let op = "+";
  let expectedAnswer = 0;

  if (isMultiplication) {
    n1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    n2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    op = "×";
    expectedAnswer = n1 * n2;
  } else {
    n1 = Math.floor(Math.random() * 30) + 5; // 5 to 34
    n2 = Math.floor(Math.random() * 30) + 5; // 5 to 34
    op = "+";
    expectedAnswer = n1 + n2;
  }

  const question = `${n1} ${op} ${n2} = ?`;
  const timestamp = Date.now();
  const rawData = `${n1}:${op}:${n2}:${expectedAnswer}:${timestamp}`;

  // HMAC Signature
  const hmac = crypto.createHmac("sha256", SECRET_SALT).update(rawData).digest("hex");
  const challengeId = Buffer.from(`${rawData}:${hmac}`).toString("base64url");

  return { challengeId, question };
}

/**
 * Verifies the user's answer to the stateless Math CAPTCHA challenge.
 */
export function verifyMathCaptcha(challengeId?: string, userAnswer?: string | number): { success: boolean; error?: string } {
  if (!challengeId || userAnswer === undefined || userAnswer === "") {
    return { success: false, error: "Please solve the Math CAPTCHA verification problem." };
  }

  try {
    const decoded = Buffer.from(challengeId, "base64url").toString("utf8");
    const parts = decoded.split(":");

    if (parts.length !== 6) {
      return { success: false, error: "Invalid Math CAPTCHA. Please refresh the question." };
    }

    const [n1, op, n2, expectedStr, timestampStr, hmac] = parts;
    const rawData = `${n1}:${op}:${n2}:${expectedStr}:${timestampStr}`;

    // Verify HMAC signature
    const expectedHmac = crypto.createHmac("sha256", SECRET_SALT).update(rawData).digest("hex");
    if (hmac !== expectedHmac) {
      return { success: false, error: "Math CAPTCHA verification failed. Please refresh." };
    }

    const expectedAnswer = Number(expectedStr);
    const numericAnswer = Number(String(userAnswer).trim());

    if (isNaN(numericAnswer) || numericAnswer !== expectedAnswer) {
      return { success: false, error: `Incorrect Math CAPTCHA answer. What is ${n1} ${op} ${n2}?` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Math CAPTCHA verification error. Please try again." };
  }
}
