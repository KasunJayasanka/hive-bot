/**
 * Logger Module
 * Centralized logging for guard rail events
 */

import { DEFAULT_GUARDRAIL_CONFIG } from './config';
import { GuardRailMetrics, SecurityEvent } from './types';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class GuardRailLogger {
  private config = DEFAULT_GUARDRAIL_CONFIG;
  private metrics: GuardRailMetrics[] = [];
  private securityEvents: SecurityEvent[] = [];
  private maxStoredMetrics = 1000;
  private maxStoredEvents = 100;

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    if (!this.config.enableLogging) {
      return;
    }

    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    if (levels[level] < levels[this.config.logLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...metadata,
    };

    // In production, you might want to send this to a logging service
    // For now, we'll use console
    const consoleMethod = level === 'error' ? console.error :
                         level === 'warn' ? console.warn :
                         level === 'info' ? console.info :
                         console.debug;

    consoleMethod(`[GuardRail ${level.toUpperCase()}]`, message, metadata || '');
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log('error', message, metadata);
  }

  /**
   * Record a metric
   */
  recordMetric(metric: GuardRailMetrics): void {
    if (!this.config.enableMetrics) {
      return;
    }

    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics.shift();
    }

    this.debug('Metric recorded', { metric });
  }

  /**
   * Record a security event
   */
  recordSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);

    // Keep only the most recent events
    if (this.securityEvents.length > this.maxStoredEvents) {
      this.securityEvents.shift();
    }

    this.warn('Security event recorded', { event });
  }

  /**
   * Get metrics for analysis
   */
  getMetrics(since?: number): GuardRailMetrics[] {
    if (since) {
      return this.metrics.filter((m) => m.timestamp >= since);
    }
    return [...this.metrics];
  }

  /**
   * Get security events
   */
  getSecurityEvents(since?: number): SecurityEvent[] {
    if (since) {
      return this.securityEvents.filter((e) => e.timestamp >= since);
    }
    return [...this.securityEvents];
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(since?: number): Record<string, unknown> {
    const metrics = this.getMetrics(since);

    const total = metrics.length;
    const allowed = metrics.filter((m) => m.result === 'allowed').length;
    const blocked = metrics.filter((m) => m.result === 'blocked').length;
    const errors = metrics.filter((m) => m.result === 'error').length;

    const avgDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / total || 0;

    const actionCounts = metrics.reduce((acc, m) => {
      acc[m.action] = (acc[m.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      allowed,
      blocked,
      errors,
      allowedPercentage: total > 0 ? ((allowed / total) * 100).toFixed(2) : 0,
      avgDuration: avgDuration.toFixed(2),
      actionCounts,
    };
  }

  /**
   * Clear old metrics and events
   */
  cleanup(olderThan: number): void {
    this.metrics = this.metrics.filter((m) => m.timestamp >= olderThan);
    this.securityEvents = this.securityEvents.filter((e) => e.timestamp >= olderThan);
    this.info('Logger cleanup completed', {
      remainingMetrics: this.metrics.length,
      remainingEvents: this.securityEvents.length,
    });
  }
}

export const logger = new GuardRailLogger();
