# Chatbot Guard Rail System

## Overview

This document describes the comprehensive guard rail system implemented for the HiveBot chatbot. The guard rail system provides multiple layers of security, safety, and quality assurance to ensure safe and reliable chatbot interactions.

## Architecture

The guard rail system is modular and consists of the following components:

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                          │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Guard Rail System                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  1. Rate Limiting                                 │  │
│  │     - Per-user limits                             │  │
│  │     - Window, minute, hour tracking               │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  2. Input Validation                              │  │
│  │     - Message length checks                       │  │
│  │     - File size & type validation                 │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  3. Security Filters                              │  │
│  │     - XSS detection                                │  │
│  │     - SQL injection detection                     │  │
│  │     - Input sanitization                          │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  4. Content Filtering                             │  │
│  │     - Profanity detection                         │  │
│  │     - PII detection & masking                     │  │
│  │     - Jailbreak attempt detection                 │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  5. Logging & Metrics                             │  │
│  │     - Security event tracking                     │  │
│  │     - Performance metrics                         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Process Request (RAG + LLM)                 │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│         Response Validation & Sanitization               │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                 Return to User                           │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Rate Limiter (`rateLimiter.ts`)

Prevents abuse by limiting the number of requests per user.

**Features:**
- Configurable time windows (default: 60 seconds)
- Multiple limit types:
  - Per-window limit (default: 10 requests)
  - Per-minute limit (default: 10 requests)
  - Per-hour limit (default: 100 requests)
- Automatic cleanup of old entries
- User identification via IP address

**Configuration:**
```typescript
RATE_LIMIT_WINDOW=60           // seconds
MAX_REQUESTS_PER_WINDOW=10
MAX_REQUESTS_PER_MINUTE=10
MAX_REQUESTS_PER_HOUR=100
```

### 2. Input Validator (`inputValidator.ts`)

Validates and sanitizes all incoming user input.

**Features:**
- Message length validation (min/max)
- File size and type validation
- Context length validation
- Automatic input sanitization

**Configuration:**
```typescript
MAX_MESSAGE_LENGTH=10000
MIN_MESSAGE_LENGTH=1
MAX_FILE_SIZE=10485760          // 10MB in bytes
```

**Allowed File Types:**
- image/jpeg, image/jpg, image/png, image/gif, image/webp
- application/pdf

### 3. Security Filters (`securityFilters.ts`)

Detects and blocks common security threats.

**Features:**
- **XSS Detection:** Blocks script tags, iframe, JavaScript URLs, event handlers
- **SQL Injection Detection:** Blocks SQL commands, union queries, dangerous operators
- **Input Sanitization:** Encodes HTML entities, removes control characters
- **URL Safety:** Validates URLs, blocks localhost and private IPs
- **File Name Sanitization:** Prevents directory traversal attacks

**Configuration:**
```typescript
ENABLE_XSS_PROTECTION=true
ENABLE_SQL_INJECTION_PROTECTION=true
```

### 4. Content Filter (`contentFilter.ts`)

Filters inappropriate and harmful content.

**Features:**
- **Profanity Filtering:** Detects and blocks inappropriate language
- **PII Detection:** Identifies and masks:
  - Email addresses
  - Phone numbers
  - Social Security Numbers (SSN)
  - Credit card numbers
  - IP addresses
- **Jailbreak Detection:** Blocks attempts to bypass AI safety guidelines
  - Ignore instructions patterns
  - Role-playing attempts
  - System prompt manipulation
  - Developer/admin mode requests

**Configuration:**
```typescript
ENABLE_PROFANITY_FILTER=true
ENABLE_PII_DETECTION=true
ENABLE_INJECTION_DETECTION=true
ENABLE_JAILBREAK_DETECTION=true
```

### 5. Error Handler (`errorHandler.ts`)

Provides graceful error handling and recovery.

**Features:**
- Structured error responses
- Retry logic with exponential backoff
- Safe async operations with fallbacks
- Error message sanitization (removes PII)
- HTTP status code mapping:
  - 400: Validation errors
  - 403: Security errors
  - 429: Rate limit errors
  - 500: Internal errors

### 6. Logger & Metrics (`logger.ts`)

Comprehensive logging and monitoring system.

**Features:**
- Configurable log levels (debug, info, warn, error)
- Security event tracking
- Performance metrics collection
- Metrics summary and analytics
- Automatic cleanup of old data

**Configuration:**
```typescript
ENABLE_GUARDRAIL_LOGGING=true
ENABLE_GUARDRAIL_METRICS=true
GUARDRAIL_LOG_LEVEL=info        // debug | info | warn | error
```

## Usage

### Basic Integration

The guard rail system is automatically integrated into the `/api/rag/ask` endpoint:

```typescript
import { guardRails } from '@/lib/guardrails';

export async function POST(req: NextRequest) {
  // Validate request
  const validationResult = await guardRails.validateMessageRequest(
    req,
    message,
    file
  );

  if (!validationResult.isValid) {
    return validationResult.response!;
  }

  // Process request...

  // Validate response
  const responseValidation = guardRails.validateResponse(
    answer,
    validationResult.requestId
  );

  return NextResponse.json({
    text: responseValidation.sanitizedResponse,
    sources,
  });
}
```

### Accessing Metrics

```typescript
import { guardRails } from '@/lib/guardrails';

// Get all metrics
const metrics = guardRails.getMetrics();

// Get metrics since timestamp
const recentMetrics = guardRails.getMetrics(Date.now() - 3600000); // Last hour

// Get summary
const summary = guardRails.getMetricsSummary();
console.log(summary);
// {
//   total: 1000,
//   allowed: 950,
//   blocked: 45,
//   errors: 5,
//   allowedPercentage: "95.00",
//   avgDuration: "123.45",
//   actionCounts: { full_validation: 1000, ... }
// }
```

### Accessing Security Events

```typescript
import { guardRails } from '@/lib/guardrails';

// Get all security events
const events = guardRails.getSecurityEvents();

// Get recent events
const recentEvents = guardRails.getSecurityEvents(Date.now() - 3600000);

// Events include:
// - type: 'injection_attempt' | 'rate_limit_exceeded' | 'malicious_content' | ...
// - severity: 'low' | 'medium' | 'high' | 'critical'
// - timestamp, userId, requestId, details
```

### Resetting Rate Limits

```typescript
import { guardRails } from '@/lib/guardrails';

// Reset rate limit for a specific user
guardRails.resetRateLimit('user-ip-address');
```

## Error Messages

The system provides user-friendly error messages:

- `MESSAGE_TOO_SHORT`: "Message is too short. Please provide more detail."
- `MESSAGE_TOO_LONG`: "Message exceeds maximum length. Please shorten your message."
- `FILE_TOO_LARGE`: "File size exceeds the maximum allowed limit."
- `INVALID_FILE_TYPE`: "Invalid file type. Only images and PDFs are allowed."
- `RATE_LIMIT_EXCEEDED`: "Too many requests. Please wait before sending another message."
- `PROFANITY_DETECTED`: "Your message contains inappropriate language. Please rephrase."
- `PII_DETECTED`: "Your message may contain personal information. Please remove sensitive data."
- `JAILBREAK_DETECTED`: "Your message appears to attempt to bypass safety guidelines."
- `XSS_DETECTED`: "Your message contains potentially harmful scripts."
- `SQL_INJECTION_DETECTED`: "Your message contains potentially harmful SQL code."

## Security Best Practices

### 1. Environment Variables

Store sensitive configuration in environment variables:

```bash
# .env.local
GOOGLE_API_KEY=your_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Guard rail configuration (optional)
MAX_MESSAGE_LENGTH=10000
RATE_LIMIT_WINDOW=60
MAX_REQUESTS_PER_WINDOW=10
ENABLE_PROFANITY_FILTER=true
ENABLE_PII_DETECTION=true
```

### 2. Monitoring

Regularly review security events and metrics:

```typescript
// Example: Daily security report
const last24h = Date.now() - 86400000;
const events = guardRails.getSecurityEvents(last24h);
const criticalEvents = events.filter(e => e.severity === 'critical');

if (criticalEvents.length > 0) {
  // Alert security team
  console.error('Critical security events detected:', criticalEvents);
}
```

### 3. Customization

Adjust patterns and limits based on your use case:

```typescript
// config.ts
export const PROFANITY_PATTERNS = [
  // Add your custom patterns
  /\bcustom_bad_word\b/gi,
];

export const JAILBREAK_PATTERNS = [
  // Add your custom patterns
  /custom_jailbreak_pattern/gi,
];
```

### 4. Testing

Test your guard rails regularly:

```bash
# Test rate limiting
curl -X POST http://localhost:3000/api/rag/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}' \
  # Repeat 15 times quickly

# Test input validation
curl -X POST http://localhost:3000/api/rag/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "<script>alert(1)</script>"}'

# Test PII detection
curl -X POST http://localhost:3000/api/rag/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "My email is test@example.com"}'
```

## Performance Considerations

The guard rail system is designed for minimal performance impact:

- **Rate Limiter:** O(1) lookup and update operations
- **Input Validation:** O(n) where n is input length
- **Security Filters:** O(p*n) where p is number of patterns, n is input length
- **Content Filtering:** O(p*n) for pattern matching
- **Logging:** Async operations, non-blocking

Average overhead: **~10-50ms** per request

## Extending the System

### Adding Custom Validators

```typescript
// customValidator.ts
export function validateCustomRule(input: string): ValidationResult {
  if (/* your condition */) {
    return {
      isValid: false,
      error: 'Custom validation failed',
    };
  }
  return { isValid: true };
}

// index.ts
import { validateCustomRule } from './customValidator';

// Add to validateMessageRequest
const customResult = validateCustomRule(message);
if (!customResult.isValid) {
  return {
    isValid: false,
    response: ErrorHandler.handleValidationError(customResult.error, requestId),
    requestId,
  };
}
```

### Adding Custom Content Filters

```typescript
// contentFilter.ts
export class ContentFilter {
  checkCustomContent(content: string, requestId: string): ContentFilterResult {
    // Your custom logic
    return {
      isPassed: true,
      violations: [],
    };
  }
}
```

## Troubleshooting

### High False Positive Rate

If legitimate messages are being blocked:

1. Review the patterns in `config.ts`
2. Adjust sensitivity thresholds
3. Add exceptions for specific patterns
4. Review security event logs to identify common false positives

### Performance Issues

If guard rails are causing slowdowns:

1. Reduce the number of patterns to check
2. Optimize regex patterns
3. Disable less critical checks in production
4. Consider caching validation results for repeated content

### Rate Limit Issues

If users are hitting rate limits too frequently:

1. Increase `MAX_REQUESTS_PER_WINDOW`
2. Adjust the `RATE_LIMIT_WINDOW` size
3. Implement user-specific limits based on authentication
4. Add whitelisting for trusted users

## License

This guard rail system is part of the HiveBot project.

## Support

For issues or questions about the guard rail system, please open an issue on the project repository.
