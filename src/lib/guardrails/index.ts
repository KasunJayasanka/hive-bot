/**
 * Guard Rail System - Main Orchestrator
 * Comprehensive security and safety system for the chatbot
 */

import { NextRequest, NextResponse } from 'next/server';
import { inputValidator } from './inputValidator';
import { contentFilter } from './contentFilter';
import { rateLimiter } from './rateLimiter';
import { logger } from './logger';
import { ErrorHandler } from './errorHandler';
import { sanitizeOutput } from './securityFilters';
import { ERROR_MESSAGES } from './config';
import type { GuardRailMetrics, SecurityEvent } from './types';

export class GuardRailSystem {
  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Extract user identifier from request
   * In a real application, this would use authentication tokens
   */
  private getUserIdentifier(request: NextRequest): string {
    // Try to get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // In production, you might want to use session ID or user ID
    return ip;
  }

  /**
   * Validate incoming message request
   */
  async validateMessageRequest(
    request: NextRequest,
    message: string,
    file?: { size: number; type: string; name: string }
  ): Promise<{
    isValid: boolean;
    response?: NextResponse;
    sanitizedMessage?: string;
    requestId: string;
  }> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const userId = this.getUserIdentifier(request);

    try {
      logger.info('Guard rail validation started', { requestId, userId, hasFile: !!file });

      // 1. Rate limiting
      const rateLimitResult = rateLimiter.checkLimit(userId, requestId);
      if (!rateLimitResult.allowed) {
        this.recordMetric({
          timestamp: Date.now(),
          requestId,
          userId,
          action: 'rate_limit_check',
          result: 'blocked',
          reason: 'rate_limit_exceeded',
          duration: Date.now() - startTime,
        });

        this.recordSecurityEvent({
          type: 'rate_limit_exceeded',
          severity: 'medium',
          timestamp: Date.now(),
          userId,
          requestId,
          details: {
            resetTime: rateLimitResult.resetTime,
          },
        });

        return {
          isValid: false,
          response: ErrorHandler.handleRateLimitError(
            rateLimitResult.error || ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
            requestId,
            rateLimitResult.resetTime
          ),
          requestId,
        };
      }

      // 2. Input validation
      const validationResult = inputValidator.validateMessage(message, requestId);
      if (!validationResult.isValid) {
        this.recordMetric({
          timestamp: Date.now(),
          requestId,
          userId,
          action: 'input_validation',
          result: 'blocked',
          reason: 'validation_failed',
          duration: Date.now() - startTime,
        });

        this.recordSecurityEvent({
          type: 'validation_failed',
          severity: 'low',
          timestamp: Date.now(),
          userId,
          requestId,
          details: {
            error: validationResult.error,
          },
        });

        return {
          isValid: false,
          response: ErrorHandler.handleValidationError(
            validationResult.error || ERROR_MESSAGES.VALIDATION_FAILED,
            requestId
          ),
          requestId,
        };
      }

      // 3. File validation (if file is present)
      if (file) {
        const fileValidationResult = inputValidator.validateFile(file, requestId);
        if (!fileValidationResult.isValid) {
          this.recordMetric({
            timestamp: Date.now(),
            requestId,
            userId,
            action: 'file_validation',
            result: 'blocked',
            reason: 'file_validation_failed',
            duration: Date.now() - startTime,
          });

          return {
            isValid: false,
            response: ErrorHandler.handleValidationError(
              fileValidationResult.error || ERROR_MESSAGES.VALIDATION_FAILED,
              requestId
            ),
            requestId,
          };
        }
      }

      // 4. Content filtering
      const filterResult = contentFilter.filterContent(
        validationResult.sanitizedInput || message,
        requestId
      );
      if (!filterResult.isPassed) {
        const errorMessage = this.getContentFilterErrorMessage(filterResult.violations || []);

        this.recordMetric({
          timestamp: Date.now(),
          requestId,
          userId,
          action: 'content_filter',
          result: 'blocked',
          reason: 'content_filter_failed',
          duration: Date.now() - startTime,
          metadata: {
            violations: filterResult.violations,
            severity: filterResult.severity,
          },
        });

        this.recordSecurityEvent({
          type: this.getSecurityEventType(filterResult.violations || []),
          severity: filterResult.severity || 'medium',
          timestamp: Date.now(),
          userId,
          requestId,
          details: {
            violations: filterResult.violations,
          },
        });

        return {
          isValid: false,
          response: ErrorHandler.handleContentFilterError(
            errorMessage,
            requestId,
            filterResult.violations,
            filterResult.severity
          ),
          requestId,
        };
      }

      // All checks passed
      this.recordMetric({
        timestamp: Date.now(),
        requestId,
        userId,
        action: 'full_validation',
        result: 'allowed',
        duration: Date.now() - startTime,
      });

      logger.info('Guard rail validation passed', { requestId, userId, duration: Date.now() - startTime });

      return {
        isValid: true,
        sanitizedMessage: filterResult.sanitizedContent || validationResult.sanitizedInput || message,
        requestId,
      };
    } catch (error) {
      logger.error('Guard rail validation error', { requestId, userId, error });

      this.recordMetric({
        timestamp: Date.now(),
        requestId,
        userId,
        action: 'full_validation',
        result: 'error',
        reason: 'unexpected_error',
        duration: Date.now() - startTime,
      });

      return {
        isValid: false,
        response: ErrorHandler.handleInternalError(error, requestId),
        requestId,
      };
    }
  }

  /**
   * Validate and sanitize response before sending to user
   */
  validateResponse(response: string, requestId: string): { isValid: boolean; sanitizedResponse: string } {
    try {
      // Sanitize output
      const sanitized = sanitizeOutput(response);

      // Check response length
      const maxLength = 50000; // Configurable
      if (sanitized.length > maxLength) {
        logger.warn('Response too long, truncating', {
          requestId,
          originalLength: sanitized.length,
          maxLength,
        });

        return {
          isValid: true,
          sanitizedResponse: sanitized.substring(0, maxLength) + '\n\n[Response truncated due to length]',
        };
      }

      return {
        isValid: true,
        sanitizedResponse: sanitized,
      };
    } catch (error) {
      logger.error('Response validation error', { requestId, error });
      return {
        isValid: false,
        sanitizedResponse: 'An error occurred while processing the response.',
      };
    }
  }

  /**
   * Get appropriate error message based on content filter violations
   */
  private getContentFilterErrorMessage(violations: string[]): string {
    const violationText = violations.join('; ').toLowerCase();

    if (violationText.includes('profanity')) {
      return ERROR_MESSAGES.PROFANITY_DETECTED;
    }
    if (violationText.includes('pii')) {
      return ERROR_MESSAGES.PII_DETECTED;
    }
    if (violationText.includes('jailbreak')) {
      return ERROR_MESSAGES.JAILBREAK_DETECTED;
    }
    if (violationText.includes('injection')) {
      return ERROR_MESSAGES.INJECTION_DETECTED;
    }

    return ERROR_MESSAGES.VALIDATION_FAILED;
  }

  /**
   * Determine security event type from violations
   */
  private getSecurityEventType(violations: string[]): SecurityEvent['type'] {
    const violationText = violations.join('; ').toLowerCase();

    if (violationText.includes('jailbreak')) {
      return 'jailbreak_attempt';
    }
    if (violationText.includes('injection') || violationText.includes('sql') || violationText.includes('xss')) {
      return 'injection_attempt';
    }
    if (violationText.includes('pii')) {
      return 'pii_detected';
    }
    if (violationText.includes('profanity') || violationText.includes('malicious')) {
      return 'malicious_content';
    }

    return 'validation_failed';
  }

  /**
   * Record a metric
   */
  private recordMetric(metric: GuardRailMetrics): void {
    logger.recordMetric(metric);
  }

  /**
   * Record a security event
   */
  private recordSecurityEvent(event: SecurityEvent): void {
    logger.recordSecurityEvent(event);
  }

  /**
   * Get guard rail metrics
   */
  getMetrics(since?: number): GuardRailMetrics[] {
    return logger.getMetrics(since);
  }

  /**
   * Get security events
   */
  getSecurityEvents(since?: number): SecurityEvent[] {
    return logger.getSecurityEvents(since);
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(since?: number): Record<string, unknown> {
    return logger.getMetricsSummary(since);
  }

  /**
   * Reset rate limit for a user
   */
  resetRateLimit(identifier: string): void {
    rateLimiter.reset(identifier);
  }
}

// Export singleton instance
export const guardRails = new GuardRailSystem();

// Export all components for individual use
export { inputValidator } from './inputValidator';
export { contentFilter } from './contentFilter';
export { rateLimiter } from './rateLimiter';
export { logger } from './logger';
export { ErrorHandler } from './errorHandler';
export * from './types';
export * from './config';
export * from './securityFilters';
