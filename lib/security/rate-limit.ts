// In-memory submission counter per IP address
const ipSubmissionMap = new Map<string, number>();

/**
 * Get current successful whitelist submission count for an IP address.
 */
export function getIpSubmissionCount(ip: string): number {
  return ipSubmissionMap.get(ip) || 0;
}

/**
 * Increment whitelist submission count for an IP address.
 */
export function incrementIpSubmissionCount(ip: string): number {
  const current = ipSubmissionMap.get(ip) || 0;
  const updated = current + 1;
  ipSubmissionMap.set(ip, updated);
  return updated;
}

/**
 * Check if IP is allowed to submit (Max 3 submissions per IP).
 */
export function canIpSubmit(ip: string, maxSubmissions: number = 3): { allowed: boolean; currentCount: number } {
  const currentCount = getIpSubmissionCount(ip);
  return {
    allowed: currentCount < maxSubmissions,
    currentCount,
  };
}
