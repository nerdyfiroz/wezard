/**
 * Rate limit helper — all IP blocks and rate limits removed.
 */
export function checkRateLimit() {
  return { allowed: true, remaining: 999 };
}

export function canIpSubmit() {
  return { allowed: true, currentCount: 0 };
}

export function incrementIpSubmissionCount() {
  return 1;
}
