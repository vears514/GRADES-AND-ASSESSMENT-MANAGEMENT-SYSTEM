# Error Handling Specifications
## Grades & Assessment Management System

**Document Version**: 1.0  
**Last Updated**: December 17, 2025  
**Status**: Implementation Ready

---

## Table of Contents
1. [Error Classification](#error-classification)
2. [HTTP Status Codes](#http-status-codes)
3. [API Error Response Format](#api-error-response-format)
4. [Client-Side Error Handling](#client-side-error-handling)
5. [Server-Side Error Handling](#server-side-error-handling)
6. [Error Messages & User Feedback](#error-messages--user-feedback)
7. [Logging & Monitoring](#logging--monitoring)
8. [Specific Module Errors](#specific-module-errors)

---

## Error Classification

### By Severity Level

#### 🔴 CRITICAL
- System down/unavailable
- Data integrity compromised
- Security breach
- Database connection failed
- Authentication system failure

**Action**: Immediate notification to admins, system failover if available

#### 🟠 MAJOR
- Authentication/Authorization failed
- Important business logic fails
- Grade data corruption
- Payment processing failed
- External service unavailable

**Action**: User notification, error logging, admin alert

#### 🟡 MINOR
- Validation failures
- Duplicate entry attempt
- Rate limit exceeded
- Temporary service issue
- Optional field errors

**Action**: User message, retry suggestion, logging

#### 🔵 INFO
- Successful operations
- Non-critical warnings
- Deprecation notices

**Action**: Info logging only

---

## HTTP Status Codes

### 2xx Success

```
200 OK
- Standard successful response
- Used for GET, successful PUT/PATCH

201 Created
- Resource successfully created
- Return Location header with resource URL
- Include created resource in response

204 No Content
- Successful operation with no content to return
- Used for DELETE operations
- No response body
```

### 3xx Redirection

```
304 Not Modified
- Resource hasn't changed since last request
- Client can use cached version
```

### 4xx Client Errors

```
400 Bad Request
- Malformed request syntax
- Invalid query parameters
- Missing required fields
- Invalid data types
Example: { code: 'INVALID_REQUEST', message: 'Score must be between 0 and 100' }

401 Unauthorized
- Authentication required
- Invalid credentials
- Token expired
- Token not provided
Example: { code: 'AUTH_REQUIRED', message: 'Please log in to continue' }

403 Forbidden
- Authenticated but lacks permission
- Role-based access denied
- Resource not accessible for this user
Example: { code: 'INSUFFICIENT_PERMISSION', message: 'Only registrars can approve grades' }

404 Not Found
- Resource doesn't exist
- Endpoint not found
Example: { code: 'NOT_FOUND', message: 'Grade with ID xyz not found' }

409 Conflict
- Request conflicts with current state
- Duplicate record
- Grade already submitted
Example: { code: 'DUPLICATE_ENTRY', message: 'Grade already exists for this student' }

422 Unprocessable Entity
- Request validation failed
- Business logic validation failed
Example: { code: 'VALIDATION_FAILED', message: 'Student is not enrolled in this course' }

429 Too Many Requests
- Rate limit exceeded
- Too many requests in time window
Example: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Try again in 60 seconds' }
```

### 5xx Server Errors

```
500 Internal Server Error
- Unexpected server error
- Unhandled exception
- Server crash
Example: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }

502 Bad Gateway
- Invalid response from upstream service
- Firebase service timeout
Example: { code: 'SERVICE_UNAVAILABLE', message: 'Service temporarily unavailable' }

503 Service Unavailable
- Server temporarily unable to handle request
- Maintenance mode
- Database down
Example: { code: 'MAINTENANCE_MODE', message: 'System is under maintenance' }

504 Gateway Timeout
- Upstream service timeout
- Long operation timeout
Example: { code: 'REQUEST_TIMEOUT', message: 'Request took too long. Please try again' }
```

---

## API Error Response Format

### Standard Error Response Structure

```typescript
// Success Response Format
{
  "success": true,
  "data": {
    // Resource data
  },
  "timestamp": "2025-12-17T10:30:00Z"
}

// Error Response Format
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_IN_UPPERCASE",
    "message": "User-friendly error message",
    "details": {
      // Additional context (optional)
    },
    "requestId": "req_1234567890",
    "timestamp": "2025-12-17T10:30:00Z"
  }
}
```

### Detailed Error Response with Validation Errors

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more validation errors occurred",
    "validationErrors": [
      {
        "field": "score",
        "message": "Score must be between 0 and 100",
        "value": "125"
      },
      {
        "field": "studentId",
        "message": "Student not found",
        "value": "S999"
      }
    ],
    "requestId": "req_1234567890",
    "timestamp": "2025-12-17T10:30:00Z"
  }
}
```

### Error Response with Pagination

```typescript
{
  "success": false,
  "error": {
    "code": "INVALID_PAGINATION",
    "message": "Invalid pagination parameters",
    "details": {
      "limit": "Must be between 1 and 100",
      "offset": "Must be non-negative"
    },
    "requestId": "req_1234567890"
  }
}
```

---

## Client-Side Error Handling

### Error Boundary Component

```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

### HTTP Error Handler

```typescript
// src/lib/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return handleValidationError(data)
      case 401:
        return handleAuthError()
      case 403:
        return handlePermissionError()
      case 404:
        return handleNotFoundError(data)
      case 409:
        return handleConflictError(data)
      case 429:
        return handleRateLimitError()
      case 500:
        return handleServerError(data)
      default:
        return handleGenericError(data)
    }
  } else if (error.request) {
    // Request made but no response
    return handleNetworkError()
  } else {
    // Error in request setup
    return handleClientError(error)
  }
}
```

### Form Validation Error Display

```typescript
// src/components/Form/FormField.tsx
interface FormFieldProps {
  name: string
  label: string
  error?: string
  required?: boolean
  type?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  error,
  required,
  type = 'text'
}) => {
  return (
    <div className="form-field">
      <label>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        name={name}
        className={error ? 'error' : ''}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <div id={`${name}-error`} className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
```

### Retry Logic with Exponential Backoff

```typescript
// src/lib/retry.ts
export const retryWithBackoff = async (
  fn: () => Promise<any>,
  maxRetries = 3,
  baseDelay = 1000
) => {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry for client errors
      if (isClientError(error)) throw error
      
      // Calculate exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

const isClientError = (error: any) => {
  const status = error.response?.status
  return status && status >= 400 && status < 500 && status !== 429
}
```

### Offline Error Handling

```typescript
// src/hooks/useOnlineStatus.ts
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Usage in component
export const GradeForm = () => {
  const isOnline = useOnlineStatus()

  return (
    <form>
      {!isOnline && (
        <Alert type="warning">
          You're offline. Changes will be saved when connection restored.
        </Alert>
      )}
      {/* Form fields */}
    </form>
  )
}
```

---

## Server-Side Error Handling

### Global Error Handler Middleware

```typescript
// src/api/middleware/errorHandler.ts
export const errorHandler = (
  error: any,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const requestId = req.headers['x-request-id'] || generateRequestId()
  
  // Log error
  logger.error({
    requestId,
    url: req.url,
    method: req.method,
    error: error.message,
    stack: error.stack,
    userId: req.user?.id,
  })

  // Determine response
  const response = getErrorResponse(error, requestId)
  
  // Send response
  res.status(response.status).json(response.body)
}

const getErrorResponse = (error: any, requestId: string) => {
  if (error instanceof ValidationError) {
    return {
      status: 400,
      body: {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: error.message,
          validationErrors: error.details,
          requestId,
        }
      }
    }
  }
  
  if (error instanceof AuthenticationError) {
    return {
      status: 401,
      body: {
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
          requestId,
        }
      }
    }
  }
  
  if (error instanceof AuthorizationError) {
    return {
      status: 403,
      body: {
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSION',
          message: error.message,
          requestId,
        }
      }
    }
  }
  
  // Default internal error
  return {
    status: 500,
    body: {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        requestId,
      }
    }
  }
}
```

### API Route Error Wrapper

```typescript
// src/api/utils/withErrorHandler.ts
export const withErrorHandler = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res)
    } catch (error) {
      errorHandler(error, req, res)
    }
  }
}

// Usage
export default withErrorHandler(async (req, res) => {
  if (req.method !== 'POST') {
    throw new MethodNotAllowedError()
  }
  
  const { score, studentId } = req.body
  
  if (!isValidScore(score)) {
    throw new ValidationError('Invalid score', { field: 'score' })
  }
  
  const grade = await gradeService.createGrade({
    score,
    studentId,
    ...
  })
  
  res.status(201).json({ success: true, data: grade })
})
```

### Transaction Error Handling

```typescript
// src/services/gradeService.ts
export const approveGrades = async (gradeIds: string[]) => {
  const batch = firestore.batch()
  
  try {
    for (const gradeId of gradeIds) {
      const gradeRef = firestore.collection('grades').doc(gradeId)
      batch.update(gradeRef, { status: 'approved' })
    }
    
    await batch.commit()
    return { success: true, updated: gradeIds.length }
  } catch (error) {
    if (error.code === 'FAILED_PRECONDITION') {
      throw new ConflictError('Some grades may have been modified')
    }
    throw new InternalError('Failed to approve grades')
  }
}
```

---

## Error Messages & User Feedback

### Message Templates by Module

#### Grade Encoding Module

```
VALIDATION ERRORS:
- "Score must be between 0 and 100"
- "Student is not enrolled in this course"
- "Grade already exists for this student"
- "Course not found"
- "Remarks are required for this grade component"

BUSINESS LOGIC ERRORS:
- "Cannot edit grade after submission"
- "Grade editing deadline has passed"
- "Invalid grading scale for this course"

SUCCESS MESSAGES:
- "Grade saved as draft successfully"
- "Grade submitted successfully"
- "Bulk upload completed: 45 grades processed, 0 errors"
```

#### Verification Module

```
VALIDATION ERRORS:
- "Grade is outside acceptable range for this course"
- "No grades pending verification"
- "You don't have permission to verify this grade"

BUSINESS LOGIC ERRORS:
- "Cannot approve grade that has been rejected"
- "Verification cannot proceed without all required checks"
- "Grade verification window has closed"

SUCCESS MESSAGES:
- "Grade approved successfully"
- "45 grades approved in batch"
- "Grade rejected. Faculty notified."
```

#### Student Module

```
AUTHORIZATION ERRORS:
- "You can only view your own grades"
- "Grades not yet posted by instructor"

SUCCESS MESSAGES:
- "Transcript generated successfully"
- "Grade alerts enabled"
```

#### Correction Module

```
VALIDATION ERRORS:
- "Proposed grade must be different from current grade"
- "Supporting documents are required for this correction type"
- "Request cannot be submitted without justification"

BUSINESS LOGIC ERRORS:
- "Grade cannot be corrected after final approval"
- "Too many pending correction requests"
- "Correction deadline has passed"

SUCCESS MESSAGES:
- "Correction request submitted successfully"
- "Request approved and forwarded to next level"
- "Grade corrected and updated"
```

### User-Friendly Error Messages

```
❌ Technical Error:
"Database connection failed"

✅ User-Friendly:
"We're having trouble saving your grade. Please try again in a moment."

---

❌ Technical Error:
"JWT token expired"

✅ User-Friendly:
"Your session has expired. Please log in again."

---

❌ Technical Error:
"Firestore write limit exceeded"

✅ User-Friendly:
"Too many changes at once. Please wait and try again."
```

---

## Logging & Monitoring

### Error Logging Levels

```typescript
// src/lib/logger.ts

// Level 1: Critical (requires immediate action)
logger.critical({
  error,
  context: 'Grade data corruption detected',
  severity: 'CRITICAL',
  action_required: true
})

// Level 2: Error (important failure)
logger.error({
  error,
  context: 'Failed to process grade submission',
  userId,
  gradeId,
  timestamp,
  requestId
})

// Level 3: Warning (potential issue)
logger.warn({
  message: 'Unusually high grade detected',
  gradeId,
  score,
  classAverage,
  stdDev
})

// Level 4: Info (tracking)
logger.info({
  message: 'Grade submitted successfully',
  gradeId,
  userId,
  timestamp
})
```

### Error Metrics

```typescript
// src/lib/metrics.ts

// Track error rates
trackMetric('api.error.rate', {
  endpoint: '/api/grades/encode',
  statusCode: 400,
  errorCode: 'VALIDATION_FAILED'
})

// Track performance
trackMetric('api.response.time', {
  endpoint: '/api/verification/pending',
  duration: 234, // ms
  cached: false
})

// Alert on thresholds
setAlert('error_rate_high', {
  threshold: '> 5% in 5 minutes',
  action: 'notify_admin'
})
```

### Error Dashboard Queries

```
1. Error Rate by Endpoint
2. Most Common Error Codes
3. Error Rate by User Role
4. Error Spike Detection
5. Average Response Time by Status Code
6. Error Distribution by Module
```

---

## Specific Module Errors

### Grade Encoding Errors

| Error Code | HTTP Status | User Message | Action |
|-----------|-------------|--------------|--------|
| INVALID_SCORE | 400 | Score must be 0-100 | Show validation error |
| STUDENT_NOT_FOUND | 404 | Student not found | Suggest search |
| STUDENT_NOT_ENROLLED | 422 | Student not in course | Show enrollment |
| DUPLICATE_GRADE | 409 | Grade exists already | Show existing grade |
| COURSE_NOT_FOUND | 404 | Course not found | Refresh course list |
| GRADE_LOCKED | 422 | Cannot edit locked grade | Show deadline |
| BULK_IMPORT_FAILED | 400 | Import validation failed | Show errors |
| FILE_TOO_LARGE | 413 | File exceeds 5MB | Reduce file size |

### Verification Errors

| Error Code | HTTP Status | User Message | Action |
|-----------|-------------|--------------|--------|
| NO_PENDING_GRADES | 404 | No grades to verify | Show completed |
| PERMISSION_DENIED | 403 | Cannot verify this grade | Show permissions |
| GRADE_ANOMALY | 422 | Grade outside range | Require comment |
| INVALID_STATUS_TRANSITION | 422 | Invalid status change | Show valid options |
| BATCH_PARTIAL_FAILURE | 422 | Some grades failed | Show error details |

### Correction Errors

| Error Code | HTTP Status | User Message | Action |
|-----------|-------------|--------------|--------|
| SAME_GRADE | 422 | Proposed grade same as current | Change grade |
| CORRECTION_WINDOW_CLOSED | 422 | Correction deadline passed | Show deadline |
| TOO_MANY_REQUESTS | 429 | Too many requests pending | Show limits |
| DOCS_REQUIRED | 400 | Supporting docs required | Require upload |

---

## Testing Error Scenarios

### Mock Error Responses

```typescript
// test/mocks/errors.ts

export const mockValidationError = {
  status: 400,
  data: {
    success: false,
    error: {
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
      validationErrors: [
        { field: 'score', message: 'Must be 0-100' }
      ]
    }
  }
}

export const mockAuthError = {
  status: 401,
  data: {
    success: false,
    error: {
      code: 'AUTH_REQUIRED',
      message: 'Authentication required'
    }
  }
}
```

### Error Testing Checklist

- [ ] Validation errors show appropriate messages
- [ ] Authentication errors redirect to login
- [ ] Permission errors deny access appropriately
- [ ] Network errors trigger retry logic
- [ ] Offline mode handled gracefully
- [ ] Error boundaries prevent full page crashes
- [ ] Error logs captured for debugging
- [ ] User notifications are clear and actionable
- [ ] Rate limiting respected
- [ ] Transaction rollbacks on error

---

**Document Version**: 1.0  
**Status**: Implementation Ready  
**Last Updated**: December 17, 2025
