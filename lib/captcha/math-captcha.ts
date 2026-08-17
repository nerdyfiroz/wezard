type MathChallenge = {
  id: string;
  question: string;
  num1: number;
  num2: number;
  operation: "+" | "×";
  expectedAnswer: number;
  expiresAt: number;
};

const challengeMap = new Map<string, MathChallenge>();

/**
 * Generates a simple addition or multiplication math question.
 * Example: "7 + 4 = ?" or "6 × 3 = ?"
 */
export function generateMathCaptcha(): { challengeId: string; question: string } {
  const id = `math-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const isMultiplication = Math.random() > 0.5;

  let num1: number;
  let num2: number;
  let operation: "+" | "×";
  let expectedAnswer: number;

  if (isMultiplication) {
    num1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    operation = "×";
    expectedAnswer = num1 * num2;
  } else {
    num1 = Math.floor(Math.random() * 30) + 5; // 5 to 34
    num2 = Math.floor(Math.random() * 30) + 5; // 5 to 34
    operation = "+";
    expectedAnswer = num1 + num2;
  }

  const question = `${num1} ${operation} ${num2} = ?`;

  challengeMap.set(id, {
    id,
    question,
    num1,
    num2,
    operation,
    expectedAnswer,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes TTL
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
    // Fallback: If challenge expired or server restarted, allow matching simple numerical evaluation if valid
    return { success: false, error: "Math CAPTCHA expired. Please try solving the new problem." };
  }

  if (Date.now() > challenge.expiresAt) {
    challengeMap.delete(challengeId);
    return { success: false, error: "Math CAPTCHA expired. Please refresh the question." };
  }

  const numericAnswer = Number(String(userAnswer).trim());

  if (isNaN(numericAnswer) || numericAnswer !== challenge.expectedAnswer) {
    return { success: false, error: `Incorrect Math CAPTCHA answer. What is ${challenge.num1} ${challenge.operation} ${challenge.num2}?` };
  }

  // Single-use challenge
  challengeMap.delete(challengeId);

  return { success: true };
}
