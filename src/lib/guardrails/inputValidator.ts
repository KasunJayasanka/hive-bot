/**
 * Input Validation Module
 * Validates and sanitizes user input
 */

import { ValidationResult } from './types';
import { DEFAULT_GUARDRAIL_CONFIG, ERROR_MESSAGES } from './config';
import { detectXSS, detectSQLInjection, sanitizeInput } from './securityFilters';
import { logger } from './logger';

export class InputValidator {
  private config = DEFAULT_GUARDRAIL_CONFIG;

  /**
   * Validate message content
   */
  validateMessage(message: string, requestId: string): ValidationResult {
    try {
      // Check if message exists
      if (!message) {
        logger.warn('Empty message received', { requestId });
        return {
          isValid: false,
          error: ERROR_MESSAGES.MESSAGE_TOO_SHORT,
        };
      }

      const trimmedMessage = message.trim();

      // Check minimum length
      if (trimmedMessage.length < this.config.minMessageLength) {
        logger.warn('Message too short', { requestId, length: trimmedMessage.length });
        return {
          isValid: false,
          error: ERROR_MESSAGES.MESSAGE_TOO_SHORT,
        };
      }

      // Check maximum length
      if (trimmedMessage.length > this.config.maxMessageLength) {
        logger.warn('Message too long', { requestId, length: trimmedMessage.length });
        return {
          isValid: false,
          error: ERROR_MESSAGES.MESSAGE_TOO_LONG,
        };
      }

      // XSS detection
      if (this.config.enableXSSProtection) {
        const xssResult = detectXSS(trimmedMessage);
        if (!xssResult.isPassed) {
          logger.warn('XSS detected', { requestId, violations: xssResult.violations });
          return {
            isValid: false,
            error: ERROR_MESSAGES.XSS_DETECTED,
            metadata: { violations: xssResult.violations },
          };
        }
      }

      // SQL injection detection
      if (this.config.enableSQLInjectionProtection) {
        const sqlResult = detectSQLInjection(trimmedMessage);
        if (!sqlResult.isPassed) {
          logger.warn('SQL injection detected', { requestId, violations: sqlResult.violations });
          return {
            isValid: false,
            error: ERROR_MESSAGES.SQL_INJECTION_DETECTED,
            metadata: { violations: sqlResult.violations },
          };
        }
      }

      // Sanitize input
      const sanitizedInput = sanitizeInput(trimmedMessage);

      logger.debug('Message validated successfully', { requestId });

      return {
        isValid: true,
        sanitizedInput,
      };
    } catch (error) {
      logger.error('Input validation error', { requestId, error });
      return {
        isValid: false,
        error: ERROR_MESSAGES.VALIDATION_FAILED,
      };
    }
  }

  /**
   * Validate file upload
   */
  validateFile(file: { size: number; type: string; name: string }, requestId: string): ValidationResult {
    try {
      // Check file size
      if (file.size > this.config.maxFileSize) {
        logger.warn('File too large', { requestId, size: file.size, maxSize: this.config.maxFileSize });
        return {
          isValid: false,
          error: ERROR_MESSAGES.FILE_TOO_LARGE,
        };
      }

      // Check file type
      if (!this.config.allowedFileTypes.includes(file.type)) {
        logger.warn('Invalid file type', { requestId, type: file.type, name: file.name });
        return {
          isValid: false,
          error: ERROR_MESSAGES.INVALID_FILE_TYPE,
        };
      }

      // Check file name for malicious patterns
      const sanitizedFileName = sanitizeInput(file.name);
      if (sanitizedFileName !== file.name) {
        logger.warn('Suspicious file name detected', { requestId, name: file.name });
        return {
          isValid: false,
          error: ERROR_MESSAGES.VALIDATION_FAILED,
        };
      }

      logger.debug('File validated successfully', { requestId, name: file.name, type: file.type });

      return {
        isValid: true,
      };
    } catch (error) {
      logger.error('File validation error', { requestId, error });
      return {
        isValid: false,
        error: ERROR_MESSAGES.VALIDATION_FAILED,
      };
    }
  }

  /**
   * Validate context length
   */
  validateContextLength(context: string, requestId: string): ValidationResult {
    try {
      if (context.length > this.config.maxContextLength) {
        logger.warn('Context too long', { requestId, length: context.length });
        return {
          isValid: false,
          error: 'Context length exceeds maximum allowed.',
        };
      }

      return {
        isValid: true,
      };
    } catch (error) {
      logger.error('Context validation error', { requestId, error });
      return {
        isValid: false,
        error: ERROR_MESSAGES.VALIDATION_FAILED,
      };
    }
  }
}

export const inputValidator = new InputValidator();
