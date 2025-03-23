export class RateLimit {
  private static readonly WINDOW_MS = 60 * 1000 // 1 minute
  private static readonly MAX_REQUESTS = 5 // 5 requests per minute

  private static readonly ipMap = new Map<string, { count: number; resetTime: number }>()

  static async check(ip: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: Date
  }> {
    const now = Date.now()
    const record = RateLimit.ipMap.get(ip) || {
      count: 0,
      resetTime: now + RateLimit.WINDOW_MS,
    }

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 0
      record.resetTime = now + RateLimit.WINDOW_MS
    }

    const remaining = Math.max(0, RateLimit.MAX_REQUESTS - record.count)
    const success = remaining > 0

    if (success) {
      // Increment only if successful
      record.count += 1
      RateLimit.ipMap.set(ip, record)
    }

    return {
      success,
      limit: RateLimit.MAX_REQUESTS,
      remaining: Math.max(0, remaining - (success ? 1 : 0)),
      reset: new Date(record.resetTime),
    }
  }
}

