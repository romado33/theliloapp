/**
 * Error Monitoring Utility
 * 
 * Centralized error tracking for production.
 * Currently logs to console, but can be extended to Sentry, LogRocket, etc.
 * 
 * To enable Sentry:
 * 1. Install: npm install @sentry/react
 * 2. Add SENTRY_DSN to secrets
 * 3. Call initErrorMonitoring() in main.tsx
 */

interface ErrorContext {
  userId?: string;
  route?: string;
  action?: string;
  extra?: Record<string, unknown>;
}

interface ErrorMonitoringConfig {
  dsn?: string;
  environment: 'development' | 'production';
  enabled: boolean;
}

let config: ErrorMonitoringConfig = {
  environment: import.meta.env.DEV ? 'development' : 'production',
  enabled: !import.meta.env.DEV, // Only enabled in production
};

/**
 * Initialize error monitoring
 * Call this in main.tsx before rendering
 */
export const initErrorMonitoring = (customConfig?: Partial<ErrorMonitoringConfig>) => {
  config = { ...config, ...customConfig };
  
  if (!config.enabled) {
    console.log('[ErrorMonitoring] Disabled in development mode');
    return;
  }

  // Global error handler
  window.onerror = (message, source, lineno, colno, error) => {
    captureError(error || new Error(String(message)), {
      extra: { source, lineno, colno },
    });
    return false;
  };

  // Unhandled promise rejections
  window.onunhandledrejection = (event) => {
    captureError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
      extra: { reason: event.reason },
    });
  };

  console.log('[ErrorMonitoring] Initialized for', config.environment);
};

/**
 * Capture and report an error
 */
export const captureError = (error: Error, context?: ErrorContext) => {
  const errorReport = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    environment: config.environment,
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...context,
  };

  // Always log in development
  if (import.meta.env.DEV) {
    console.error('[ErrorMonitoring] Captured error:', errorReport);
    return;
  }

  // In production, send to monitoring service
  if (config.enabled) {
    // TODO: Replace with actual Sentry/LogRocket call
    // Sentry.captureException(error, { extra: context });
    
    // For now, log structured error that can be picked up by log aggregators
    console.error(JSON.stringify({
      type: 'ERROR_REPORT',
      ...errorReport,
    }));
  }
};

/**
 * Capture a message/event (non-error)
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) => {
  if (!config.enabled && !import.meta.env.DEV) return;

  const report = {
    type: 'MESSAGE_REPORT',
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: config.environment,
    url: window.location.href,
    ...context,
  };

  if (import.meta.env.DEV) {
    console.log(`[ErrorMonitoring] ${level.toUpperCase()}:`, report);
    return;
  }

  // TODO: Replace with Sentry.captureMessage
  console.log(JSON.stringify(report));
};

/**
 * Set user context for error reports
 */
export const setUserContext = (userId: string | null, email?: string) => {
  if (!config.enabled) return;
  
  // TODO: Sentry.setUser({ id: userId, email });
  console.log('[ErrorMonitoring] User context set:', { userId, email });
};

/**
 * Create an error boundary wrapper for React components
 * Usage: wrap components that might throw with try-catch
 */
export const withErrorBoundary = <T,>(
  fn: () => T,
  fallback: T,
  context?: ErrorContext
): T => {
  try {
    return fn();
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), context);
    return fallback;
  }
};

/**
 * Track performance metrics
 */
export const trackPerformance = (metric: string, value: number, context?: Record<string, unknown>) => {
  if (!config.enabled && !import.meta.env.DEV) return;

  const report = {
    type: 'PERFORMANCE_METRIC',
    metric,
    value,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (import.meta.env.DEV) {
    console.log('[ErrorMonitoring] Performance:', report);
    return;
  }

  console.log(JSON.stringify(report));
};
