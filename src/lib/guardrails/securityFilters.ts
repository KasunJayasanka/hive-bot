/**
 * Security Filters Module
 * Detects and prevents security threats
 */

import { ContentFilterResult } from './types';
import { XSS_PATTERNS, SQL_INJECTION_PATTERNS } from './config';

/**
 * Detect XSS (Cross-Site Scripting) attempts
 */
export function detectXSS(input: string): ContentFilterResult {
  const violations: string[] = [];

  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      violations.push(`XSS pattern detected: ${pattern.source}`);
    }
  }

  return {
    isPassed: violations.length === 0,
    violations,
    severity: violations.length > 0 ? 'high' : undefined,
  };
}

/**
 * Detect SQL injection attempts
 */
export function detectSQLInjection(input: string): ContentFilterResult {
  const violations: string[] = [];

  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      violations.push(`SQL injection pattern detected: ${pattern.source}`);
    }
  }

  return {
    isPassed: violations.length === 0,
    violations,
    severity: violations.length > 0 ? 'critical' : undefined,
  };
}

/**
 * Sanitize user input
 * Removes potentially harmful characters while preserving legitimate content
 */
export function sanitizeInput(input: string): string {
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Encode HTML special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Remove control characters except newlines, tabs, and carriage returns
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized.trim();
}

/**
 * Sanitize output before sending to user
 * More lenient than input sanitization but still safe
 */
export function sanitizeOutput(output: string): string {
  // Remove null bytes
  let sanitized = output.replace(/\0/g, '');

  // Remove control characters except newlines, tabs, and carriage returns
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized.trim();
}

/**
 * Check if a URL is safe
 */
export function isUrlSafe(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Block localhost and private IPs
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validate and sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  // Remove directory traversal attempts
  let sanitized = fileName.replace(/\.\./g, '');

  // Remove path separators
  sanitized = sanitized.replace(/[/\\]/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Allow only alphanumeric, dots, dashes, and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  return sanitized;
}
