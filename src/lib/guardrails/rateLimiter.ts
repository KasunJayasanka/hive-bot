/**
 * Rate Limiter Module
 * Prevents abuse through request rate limiting
 */

import { RateLimitResult } from './types';
import { DEFAULT_GUARDRAIL_CONFIG, ERROR_MESSAGES } from './config';
import { logger } from './logger';

interface RateLimitEntry {
  count: number;
  windowStart: number;
  minuteCount: number;
  minuteStart: number;
  hourCount: number;
  hourStart: number;
}

export class RateLimiter {
  private config = DEFAULT_GUARDRAIL_CONFIG;
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up old entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if a request should be allowed
   */
  checkLimit(identifier: string, requestId: string): RateLimitResult {
    try {
      const now = Date.now();
      let entry = this.store.get(identifier);

      if (!entry) {
        entry = {
          count: 0,
          windowStart: now,
          minuteCount: 0,
          minuteStart: now,
          hourCount: 0,
          hourStart: now,
        };
        this.store.set(identifier, entry);
      }

      // Check and reset window-based limit
      const windowElapsed = (now - entry.windowStart) / 1000;
      if (windowElapsed >= this.config.rateLimitWindow) {
        entry.count = 0;
        entry.windowStart = now;
      }

      // Check and reset minute limit
      const minuteElapsed = (now - entry.minuteStart) / 1000;
      if (minuteElapsed >= 60) {
        entry.minuteCount = 0;
        entry.minuteStart = now;
      }

      // Check and reset hour limit
      const hourElapsed = (now - entry.hourStart) / 1000;
      if (hourElapsed >= 3600) {
        entry.hourCount = 0;
        entry.hourStart = now;
      }

      // Check limits
      if (entry.count >= this.config.maxRequestsPerWindow) {
        const resetTime = entry.windowStart + this.config.rateLimitWindow * 1000;
        logger.warn('Rate limit exceeded (window)', {
          requestId,
          identifier,
          count: entry.count,
          limit: this.config.maxRequestsPerWindow,
        });
        return {
          allowed: false,
          remainingRequests: 0,
          resetTime,
          error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        };
      }

      if (entry.minuteCount >= this.config.maxRequestsPerMinute) {
        const resetTime = entry.minuteStart + 60000;
        logger.warn('Rate limit exceeded (minute)', {
          requestId,
          identifier,
          count: entry.minuteCount,
          limit: this.config.maxRequestsPerMinute,
        });
        return {
          allowed: false,
          remainingRequests: 0,
          resetTime,
          error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        };
      }

      if (entry.hourCount >= this.config.maxRequestsPerHour) {
        const resetTime = entry.hourStart + 3600000;
        logger.warn('Rate limit exceeded (hour)', {
          requestId,
          identifier,
          count: entry.hourCount,
          limit: this.config.maxRequestsPerHour,
        });
        return {
          allowed: false,
          remainingRequests: 0,
          resetTime,
          error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        };
      }

      // Increment counters
      entry.count++;
      entry.minuteCount++;
      entry.hourCount++;

      const remainingRequests = Math.min(
        this.config.maxRequestsPerWindow - entry.count,
        this.config.maxRequestsPerMinute - entry.minuteCount,
        this.config.maxRequestsPerHour - entry.hourCount
      );

      logger.debug('Rate limit check passed', {
        requestId,
        identifier,
        remainingRequests,
        windowCount: entry.count,
        minuteCount: entry.minuteCount,
        hourCount: entry.hourCount,
      });

      return {
        allowed: true,
        remainingRequests,
        resetTime: entry.windowStart + this.config.rateLimitWindow * 1000,
      };
    } catch (error) {
      logger.error('Rate limit check error', { requestId, identifier, error });
      // Fail open in case of errors
      return {
        allowed: true,
      };
    }
  }

  /**
   * Manually reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
    logger.info('Rate limit reset', { identifier });
  }

  /**
   * Clean up old entries
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = Math.max(this.config.rateLimitWindow, 3600) * 1000; // Max of window or 1 hour

    for (const [identifier, entry] of this.store.entries()) {
      const age = now - Math.min(entry.windowStart, entry.minuteStart, entry.hourStart);
      if (age > maxAge) {
        this.store.delete(identifier);
      }
    }

    logger.debug('Rate limiter cleanup completed', { remainingEntries: this.store.size });
  }

  /**
   * Get current stats for an identifier
   */
  getStats(identifier: string): RateLimitEntry | null {
    return this.store.get(identifier) || null;
  }

  /**
   * Clean up on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export const rateLimiter = new RateLimiter();
