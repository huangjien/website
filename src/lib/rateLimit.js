/**
 * Simple in-memory rate limiting utility for API routes
 * Note: For production with multiple instances, use a Redis-backed solution
 */

const rateLimitMap = new Map();

/**
 * Check if a request should be rate limited
 * @param {string} identifier - Unique identifier (IP address, user ID, etc.)
 * @param {number} limit - Maximum number of requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} - { allowed: boolean, remaining: number }
 */
export function checkRateLimit(identifier, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get existing requests for this identifier
  const requests = rateLimitMap.get(identifier) || [];

  // Filter out requests outside the time window
  const validRequests = requests.filter((timestamp) => timestamp > windowStart);

  // Check if limit exceeded
  if (validRequests.length >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: validRequests[0] + windowMs,
    };
  }

  // Add current request timestamp
  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);

  return {
    allowed: true,
    remaining: limit - validRequests.length,
    resetAt: now + windowMs,
  };
}

/**
 * Clean up old entries from rate limit map
 * Should be called periodically (e.g., every hour)
 */
export function cleanupRateLimitMap() {
  const now = Date.now();
  const windowMs = 60000; // 1 minute window

  for (const [identifier, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter(
      (timestamp) => timestamp > now - windowMs,
    );
    if (validRequests.length === 0) {
      rateLimitMap.delete(identifier);
    } else {
      rateLimitMap.set(identifier, validRequests);
    }
  }
}

// Cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitMap, 3600000);
}
