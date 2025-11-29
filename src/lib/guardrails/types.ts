/**
 * Guard Rail System Types
 * Comprehensive type definitions for the chatbot guard rail system
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedInput?: string;
  metadata?: Record<string, unknown>;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests?: number;
  resetTime?: number;
  error?: string;
}

export interface ContentFilterResult {
  isPassed: boolean;
  violations?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  sanitizedContent?: string;
}

export interface GuardRailConfig {
  // Input validation
  maxMessageLength: number;
  minMessageLength: number;
  maxFileSize: number;
  allowedFileTypes: string[];

  // Rate limiting
  rateLimitWindow: number; // in seconds
  maxRequestsPerWindow: number;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;

  // Content filtering
  enableProfanityFilter: boolean;
  enablePIIDetection: boolean;
  enableInjectionDetection: boolean;
  enableJailbreakDetection: boolean;

  // Security
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  maxContextLength: number;

  // Response validation
  maxResponseLength: number;
  enableHallucinationCheck: boolean;
  enableCitationVerification: boolean;

  // Monitoring
  enableLogging: boolean;
  enableMetrics: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface GuardRailMetrics {
  timestamp: number;
  requestId: string;
  userId?: string;
  action: string;
  result: 'allowed' | 'blocked' | 'error';
  reason?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface SecurityEvent {
  type: 'injection_attempt' | 'rate_limit_exceeded' | 'malicious_content' | 'jailbreak_attempt' | 'pii_detected' | 'validation_failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  userId?: string;
  requestId: string;
  details: Record<string, unknown>;
}

export interface PIIDetectionResult {
  hasPII: boolean;
  types: Array<'email' | 'phone' | 'ssn' | 'credit_card' | 'ip_address' | 'custom'>;
  maskedContent?: string;
  locations?: Array<{ type: string; start: number; end: number }>;
}
