/**
 * Error Handler Module
 * Graceful error handling and recovery
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  requestId?: string;
}

export class ErrorHandler {
  /**
   * Handle validation errors
   */
  static handleValidationError(error: string, requestId: string): NextResponse {
    logger.warn('Validation error', { requestId, error });

    return NextResponse.json(
      {
        error,
        code: 'VALIDATION_ERROR',
        requestId,
      } as ErrorResponse,
      { status: 400 }
    );
  }

  /**
   * Handle rate limit errors
   */
  static handleRateLimitError(error: string, requestId: string, resetTime?: number): NextResponse {
    logger.warn('Rate limit error', { requestId, error, resetTime });

    const headers: Record<string, string> = {
      'X-RateLimit-Reset': resetTime ? String(resetTime) : String(Date.now() + 60000),
    };

    return NextResponse.json(
      {
        error,
        code: 'RATE_LIMIT_ERROR',
        requestId,
        resetTime,
      } as ErrorResponse,
      { status: 429, headers }
    );
  }

  /**
   * Handle content filter errors
   */
  static handleContentFilterError(
    error: string,
    requestId: string,
    violations?: string[],
    severity?: string
  ): NextResponse {
    logger.warn('Content filter error', { requestId, error, violations, severity });

    return NextResponse.json(
      {
        error,
        code: 'CONTENT_FILTER_ERROR',
        requestId,
        details: { violations, severity },
      } as ErrorResponse,
      { status: 400 }
    );
  }

  /**
   * Handle security errors
   */
  static handleSecurityError(error: string, requestId: string, details?: unknown): NextResponse {
    logger.error('Security error', { requestId, error, details });

    return NextResponse.json(
      {
        error: 'Request blocked for security reasons.',
        code: 'SECURITY_ERROR',
        requestId,
      } as ErrorResponse,
      { status: 403 }
    );
  }

  /**
   * Handle internal errors
   */
  static handleInternalError(error: unknown, requestId: string): NextResponse {
    const errorMessage = error instanceof Error ? error.message : 'An internal error occurred';

    logger.error('Internal error', { requestId, error: errorMessage, stack: error instanceof Error ? error.stack : undefined });

    return NextResponse.json(
      {
        error: 'An internal error occurred. Please try again later.',
        code: 'INTERNAL_ERROR',
        requestId,
      } as ErrorResponse,
      { status: 500 }
    );
  }

  /**
   * Handle API errors with retry logic
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000,
    requestId?: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          logger.warn('Retry attempt', {
            requestId,
            attempt: attempt + 1,
            maxRetries,
            error: lastError.message,
          });

          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      }
    }

    logger.error('Max retries exceeded', {
      requestId,
      maxRetries,
      error: lastError?.message,
    });

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Safe async wrapper with error handling
   */
  static async safeAsync<T>(
    fn: () => Promise<T>,
    fallback: T,
    requestId?: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      logger.error('Safe async error, using fallback', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return fallback;
    }
  }

  /**
   * Validate and sanitize error messages before sending to client
   */
  static sanitizeErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      // Remove potential sensitive information
      return error
        .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g, '[EMAIL]')
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
        .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD]');
    }

    if (error instanceof Error) {
      return this.sanitizeErrorMessage(error.message);
    }

    return 'An error occurred';
  }
}
