type MathChallenge = {
  id: string;
  question: string;
  expectedAnswer: number;
  expiresAt: number;
};

const challengeMap = new Map<string, MathChallenge>();

/**
 * Generates a Math CAPTCHA problem using STRICTLY 2 NUMBERS (addition or multiplication).
 * Examples:
 * - "14 + 19 = ?"
 * - "7 × 8 = ?"
 * - "What is 12 plus 15?"
 * - "What is 8 multiplied by 6?"
 * - "16 + ? = 29"
 * - "? × 7 = 42"
 */
export function generateMathCaptcha(): { challengeId: string; question: string } {
  const id = `math-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const mathType = Math.floor(Math.random() * 6);

  let question = "";
  let expectedAnswer = 0;

  switch (mathType) {
    case 0: {
      // 2-number Addition: 14 + 19 = ?
      const n1 = Math.floor(Math.random() * 35) + 5;
      const n2 = Math.floor(Math.random() * 35) + 5;
      question = `${n1} + ${n2} = ?`;
      expectedAnswer = n1 + n2;
      break;
    }
    case 1: {
      // 2-number Multiplication: 7 × 8 = ?
      const n1 = Math.floor(Math.random() * 9) + 2;
      const n2 = Math.floor(Math.random() * 9) + 2;
      question = `${n1} × ${n2} = ?`;
      expectedAnswer = n1 * n2;
      break;
    }
    case 2: {
      // Worded 2-number Addition: What is 12 plus 15?
      const n1 = Math.floor(Math.random() * 25) + 5;
      const n2 = Math.floor(Math.random() * 25) + 5;
      question = `What is ${n1} plus ${n2}?`;
      expectedAnswer = n1 + n2;
      break;
    }
    case 3: {
      // Worded 2-number Multiplication: What is 8 multiplied by 6?
      const n1 = Math.floor(Math.random() * 8) + 2;
      const n2 = Math.floor(Math.random() * 8) + 2;
      question = `What is ${n1} multiplied by ${n2}?`;
      expectedAnswer = n1 * n2;
      break;
    }
    case 4: {
      // Fill-in-the-blank Addition: 16 + ? = 29
      const n1 = Math.floor(Math.random() * 20) + 5;
      const missing = Math.floor(Math.random() * 20) + 5;
      const total = n1 + missing;
      question = `${n1} + ? = ${total}`;
      expectedAnswer = missing;
      break;
    }
    case 5: {
      // Fill-in-the-blank Multiplication: ? × 7 = 42
      const n2 = Math.floor(Math.random() * 8) + 2;
      const missing = Math.floor(Math.random() * 8) + 2;
      const total = missing * n2;
      question = `? × ${n2} = ${total}`;
      expectedAnswer = missing;
      break;
    }
    default: {
      const n1 = 8;
      const n2 = 7;
      question = `${n1} × ${n2} = ?`;
      expectedAnswer = 56;
    }
  }

  challengeMap.set(id, {
    id,
    question,
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
    return { success: false, error: "Math CAPTCHA expired. Please try solving the new problem." };
  }

  if (Date.now() > challenge.expiresAt) {
    challengeMap.delete(challengeId);
    return { success: false, error: "Math CAPTCHA expired. Please refresh the question." };
  }

  const numericAnswer = Number(String(userAnswer).trim());

  if (isNaN(numericAnswer) || numericAnswer !== challenge.expectedAnswer) {
    return { success: false, error: `Incorrect Math CAPTCHA answer. Please solve: "${challenge.question}"` };
  }

  // Single-use challenge
  challengeMap.delete(challengeId);

  return { success: true };
}
