/**
 * Guard Rail System Configuration
 * Centralized configuration for all guard rail features
 */

import { GuardRailConfig } from './types';

export const DEFAULT_GUARDRAIL_CONFIG: GuardRailConfig = {
  // Input validation
  maxMessageLength: Number(process.env.MAX_MESSAGE_LENGTH) || 10000,
  minMessageLength: Number(process.env.MIN_MESSAGE_LENGTH) || 1,
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ],

  // Rate limiting
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 60, // 60 seconds
  maxRequestsPerWindow: Number(process.env.MAX_REQUESTS_PER_WINDOW) || 10,
  maxRequestsPerMinute: Number(process.env.MAX_REQUESTS_PER_MINUTE) || 10,
  maxRequestsPerHour: Number(process.env.MAX_REQUESTS_PER_HOUR) || 100,

  // Content filtering
  enableProfanityFilter: process.env.ENABLE_PROFANITY_FILTER !== 'false',
  enablePIIDetection: process.env.ENABLE_PII_DETECTION !== 'false',
  enableInjectionDetection: process.env.ENABLE_INJECTION_DETECTION !== 'false',
  enableJailbreakDetection: process.env.ENABLE_JAILBREAK_DETECTION !== 'false',

  // Security
  enableXSSProtection: process.env.ENABLE_XSS_PROTECTION !== 'false',
  enableSQLInjectionProtection: process.env.ENABLE_SQL_INJECTION_PROTECTION !== 'false',
  maxContextLength: Number(process.env.MAX_CONTEXT_LENGTH) || 100000,

  // Response validation
  maxResponseLength: Number(process.env.MAX_RESPONSE_LENGTH) || 50000,
  enableHallucinationCheck: process.env.ENABLE_HALLUCINATION_CHECK === 'true',
  enableCitationVerification: process.env.ENABLE_CITATION_VERIFICATION === 'true',

  // Monitoring
  enableLogging: process.env.ENABLE_GUARDRAIL_LOGGING !== 'false',
  enableMetrics: process.env.ENABLE_GUARDRAIL_METRICS !== 'false',
  logLevel: (process.env.GUARDRAIL_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
};

// Profanity and inappropriate content patterns
export const PROFANITY_PATTERNS = [
  // Common profanity (case-insensitive)
  /\b(fuck|shit|damn|hell|bitch|bastard|crap|piss|ass)\b/gi,
  // Add more patterns as needed, but keep it reasonable
];

// SQL injection patterns
// These patterns are designed to catch actual SQL injection attempts while minimizing false positives
export const SQL_INJECTION_PATTERNS = [
  // Classic SQL injection patterns with SQL keywords
  /(\bUNION\b.*\bSELECT\b)|(\bSELECT\b.*\bFROM\b.*\bWHERE\b)/i,
  /(\bDROP\b.*\bTABLE\b)|(\bDELETE\b.*\bFROM\b)|(\bINSERT\b.*\bINTO\b)/i,
  /(\bEXEC\b.*\()|(\bEXECUTE\b.*\()|(\bEXEC\b\s+\w+)/i,

  // SQL comments (but only when followed by SQL-like content or quotes)
  /(['"].*--|--.*['"]|\/\*.*\*\/.*['"])/i,

  // OR/AND injection patterns (require quotes AND operators together)
  /(['"].*\b(OR|AND)\b.*=.*['"])|(\b(OR|AND)\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/i,

  // Common SQL injection patterns with quotes and operators
  /('+\s*(OR|AND)\s+'+\s*=\s*'+)|("+\s*(OR|AND)\s+"+\s*=\s*"+)/i,

  // Semicolon followed by SQL keywords (stacked queries)
  /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)/i,

  // SQL string escape attempts
  /(\\x[0-9a-f]{2}|%[0-9a-f]{2}).*\b(SELECT|UNION|INSERT|UPDATE|DELETE)/i,
];

// XSS patterns
export const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // event handlers like onclick=, onload=
  /<embed\b/gi,
  /<object\b/gi,
  /eval\s*\(/gi,
];

// Prompt injection and jailbreak patterns
export const JAILBREAK_PATTERNS = [
  /ignore (previous|above|all) (instructions|prompts|commands)/gi,
  /you are (now|a) (DAN|unrestricted|unfiltered)/gi,
  /forget (everything|all|your) (instructions|training|guidelines)/gi,
  /act as if you (are|were)/gi,
  /pretend (you are|to be|that you)/gi,
  /system prompt|system message/gi,
  /\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>/gi,
  /bypass (filter|restriction|limitation|guardrail)/gi,
  /roleplay as/gi,
  /developer mode|admin mode|god mode/gi,
];

// PII patterns
export const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
};

// Allowed domains for citations (to prevent phishing)
export const ALLOWED_CITATION_DOMAINS = [
  // Add your trusted domains here
  // Example: 'example.com', 'trusted-site.org'
];

// Error messages
export const ERROR_MESSAGES = {
  MESSAGE_TOO_SHORT: 'Message is too short. Please provide more detail.',
  MESSAGE_TOO_LONG: 'Message exceeds maximum length. Please shorten your message.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Only images and PDFs are allowed.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait before sending another message.',
  PROFANITY_DETECTED: 'Your message contains inappropriate language. Please rephrase.',
  PII_DETECTED: 'Your message may contain personal information. Please remove sensitive data.',
  INJECTION_DETECTED: 'Your message contains potentially malicious content.',
  JAILBREAK_DETECTED: 'Your message appears to attempt to bypass safety guidelines.',
  XSS_DETECTED: 'Your message contains potentially harmful scripts.',
  SQL_INJECTION_DETECTED: 'Your message contains potentially harmful SQL code.',
  VALIDATION_FAILED: 'Message validation failed. Please try again.',
  INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
};
