/**
 * Content Filter Module
 * Filters inappropriate and harmful content
 */

import { ContentFilterResult, PIIDetectionResult } from './types';
import {
  DEFAULT_GUARDRAIL_CONFIG,
  PROFANITY_PATTERNS,
  JAILBREAK_PATTERNS,
  PII_PATTERNS,
  ERROR_MESSAGES,
} from './config';
import { logger } from './logger';

export class ContentFilter {
  private config = DEFAULT_GUARDRAIL_CONFIG;

  /**
   * Check for profanity and inappropriate language
   */
  checkProfanity(content: string, requestId: string): ContentFilterResult {
    if (!this.config.enableProfanityFilter) {
      return { isPassed: true };
    }

    const violations: string[] = [];

    for (const pattern of PROFANITY_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push(`Profanity detected: ${matches.length} occurrence(s)`);
      }
    }

    if (violations.length > 0) {
      logger.warn('Profanity detected', { requestId, violations });
    }

    return {
      isPassed: violations.length === 0,
      violations,
      severity: violations.length > 0 ? 'medium' : undefined,
    };
  }

  /**
   * Detect prompt injection and jailbreak attempts
   */
  checkJailbreak(content: string, requestId: string): ContentFilterResult {
    if (!this.config.enableJailbreakDetection) {
      return { isPassed: true };
    }

    const violations: string[] = [];

    for (const pattern of JAILBREAK_PATTERNS) {
      if (pattern.test(content)) {
        violations.push(`Jailbreak pattern detected: ${pattern.source}`);
      }
    }

    if (violations.length > 0) {
      logger.warn('Jailbreak attempt detected', { requestId, violations });
    }

    return {
      isPassed: violations.length === 0,
      violations,
      severity: violations.length > 0 ? 'high' : undefined,
    };
  }

  /**
   * Detect personally identifiable information (PII)
   */
  detectPII(content: string, requestId: string): PIIDetectionResult {
    if (!this.config.enablePIIDetection) {
      return { hasPII: false, types: [] };
    }

    const detectedTypes: Array<'email' | 'phone' | 'ssn' | 'credit_card' | 'ip_address' | 'custom'> = [];
    const locations: Array<{ type: string; start: number; end: number }> = [];
    let maskedContent = content;

    // Check for email
    const emailMatches = [...content.matchAll(PII_PATTERNS.email)];
    if (emailMatches.length > 0) {
      detectedTypes.push('email');
      emailMatches.forEach((match) => {
        locations.push({ type: 'email', start: match.index!, end: match.index! + match[0].length });
      });
      maskedContent = maskedContent.replace(PII_PATTERNS.email, '[EMAIL_REDACTED]');
    }

    // Check for phone numbers
    const phoneMatches = [...content.matchAll(PII_PATTERNS.phone)];
    if (phoneMatches.length > 0) {
      detectedTypes.push('phone');
      phoneMatches.forEach((match) => {
        locations.push({ type: 'phone', start: match.index!, end: match.index! + match[0].length });
      });
      maskedContent = maskedContent.replace(PII_PATTERNS.phone, '[PHONE_REDACTED]');
    }

    // Check for SSN
    const ssnMatches = [...content.matchAll(PII_PATTERNS.ssn)];
    if (ssnMatches.length > 0) {
      detectedTypes.push('ssn');
      ssnMatches.forEach((match) => {
        locations.push({ type: 'ssn', start: match.index!, end: match.index! + match[0].length });
      });
      maskedContent = maskedContent.replace(PII_PATTERNS.ssn, '[SSN_REDACTED]');
    }

    // Check for credit card
    const ccMatches = [...content.matchAll(PII_PATTERNS.creditCard)];
    if (ccMatches.length > 0) {
      detectedTypes.push('credit_card');
      ccMatches.forEach((match) => {
        locations.push({ type: 'credit_card', start: match.index!, end: match.index! + match[0].length });
      });
      maskedContent = maskedContent.replace(PII_PATTERNS.creditCard, '[CC_REDACTED]');
    }

    // Check for IP address
    const ipMatches = [...content.matchAll(PII_PATTERNS.ipAddress)];
    if (ipMatches.length > 0) {
      detectedTypes.push('ip_address');
      ipMatches.forEach((match) => {
        locations.push({ type: 'ip_address', start: match.index!, end: match.index! + match[0].length });
      });
      maskedContent = maskedContent.replace(PII_PATTERNS.ipAddress, '[IP_REDACTED]');
    }

    if (detectedTypes.length > 0) {
      logger.warn('PII detected', { requestId, types: detectedTypes, count: locations.length });
    }

    return {
      hasPII: detectedTypes.length > 0,
      types: detectedTypes,
      maskedContent: detectedTypes.length > 0 ? maskedContent : undefined,
      locations,
    };
  }

  /**
   * Comprehensive content check
   */
  filterContent(content: string, requestId: string): ContentFilterResult {
    try {
      const violations: string[] = [];
      let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';

      // Check profanity
      const profanityResult = this.checkProfanity(content, requestId);
      if (!profanityResult.isPassed && profanityResult.violations) {
        violations.push(...profanityResult.violations);
        if (profanityResult.severity === 'medium') maxSeverity = 'medium';
      }

      // Check jailbreak attempts
      const jailbreakResult = this.checkJailbreak(content, requestId);
      if (!jailbreakResult.isPassed && jailbreakResult.violations) {
        violations.push(...jailbreakResult.violations);
        if (jailbreakResult.severity === 'high') maxSeverity = 'high';
      }

      // Check PII
      const piiResult = this.detectPII(content, requestId);
      if (piiResult.hasPII) {
        violations.push(`PII detected: ${piiResult.types.join(', ')}`);
        if (maxSeverity === 'low') maxSeverity = 'medium';
      }

      return {
        isPassed: violations.length === 0,
        violations,
        severity: violations.length > 0 ? maxSeverity : undefined,
        sanitizedContent: piiResult.hasPII ? piiResult.maskedContent : content,
      };
    } catch (error) {
      logger.error('Content filtering error', { requestId, error });
      return {
        isPassed: false,
        violations: ['Content filtering failed'],
        severity: 'medium',
      };
    }
  }
}

export const contentFilter = new ContentFilter();
