type MathChallenge = {
  id: string;
  question: string;
  expectedAnswer: number;
  expiresAt: number;
};

// Use globalThis to persist challengeMap across serverless invocations
const globalForCaptcha = globalThis as unknown as {
  mathCaptchaMap?: Map<string, MathChallenge>;
};

const challengeMap = globalForCaptcha.mathCaptchaMap ?? new Map<string, MathChallenge>();
globalForCaptcha.mathCaptchaMap = challengeMap;

/**
 * Generates simple, clean 2-number addition or multiplication math problems.
 * Always formatted cleanly as: "A + B = ?" or "A × B = ?"
 */
export function generateMathCaptcha(): { challengeId: string; question: string } {
  const id = `math-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const isMultiplication = Math.random() > 0.5;

  let question = "";
  let expectedAnswer = 0;

  if (isMultiplication) {
    const n1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const n2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    question = `${n1} × ${n2} = ?`;
    expectedAnswer = n1 * n2;
  } else {
    const n1 = Math.floor(Math.random() * 30) + 5; // 5 to 34
    const n2 = Math.floor(Math.random() * 30) + 5; // 5 to 34
    question = `${n1} + ${n2} = ?`;
    expectedAnswer = n1 + n2;
  }

  challengeMap.set(id, {
    id,
    question,
    expectedAnswer,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes TTL
  });

  return { challengeId: id, question };
}

/**
 * Verifies the user's answer to the Math CAPTCHA challenge.
 */
export function verifyMathCaptcha(challengeId?: string, userAnswer?: string | number): { success: boolean; error?: string } {
  if (!challengeId || userAnswer === undefined || userAnswer === "") {
    return { success: false, error: "Please solve the Math CAPTCHA problem." };
  }

  const challenge = challengeMap.get(challengeId);
  if (!challenge) {
    return { success: false, error: "Math CAPTCHA expired or invalid. Please answer the new question." };
  }

  if (Date.now() > challenge.expiresAt) {
    challengeMap.delete(challengeId);
    return { success: false, error: "Math CAPTCHA expired. Please answer the new question." };
  }

  const numericAnswer = Number(String(userAnswer).trim());

  if (isNaN(numericAnswer) || numericAnswer !== challenge.expectedAnswer) {
    return { success: false, error: `Incorrect Math CAPTCHA answer. What is ${challenge.question}?` };
  }

  // Single-use challenge
  challengeMap.delete(challengeId);

  return { success: true };
}
