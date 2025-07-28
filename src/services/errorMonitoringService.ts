import type { ErrorReport, ErrorInfo } from '@/composables/useErrorHandler';

export interface ErrorMetrics {
  totalErrors: number;
  errorsByComponent: Record<string, number>;
  errorsByType: Record<string, number>;
  errorsByHour: Record<string, number>;
  lastErrorTime: string | null;
}

export interface ErrorAlert {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  componentName: string;
  userAgent: string;
  url: string;
  stack?: string;
}

export class ErrorMonitoringService {
  private static instance: ErrorMonitoringService;
  private errors: ErrorReport[] = [];
  private alerts: ErrorAlert[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService();
    }
    return ErrorMonitoringService.instance;
  }

  // Initialize the error monitoring service
  public initialize(): void {
    if (this.isInitialized) return;

    // Set up global error handlers
    this.setupGlobalErrorHandlers();
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring();
    
    // Set up unhandled promise rejection handler
    this.setupUnhandledRejectionHandler();

    this.isInitialized = true;
    console.log('🔍 Error monitoring service initialized');
  }

  // Track an error
  public trackError(errorReport: ErrorReport): void {
    this.errors.push(errorReport);
    
    // Create alert if error is significant
    const alert = this.createAlert(errorReport);
    if (alert) {
      this.alerts.push(alert);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('🚨 Error tracked:', errorReport);
    }

    // Send to external service in production
    if (import.meta.env.PROD) {
      this.sendToExternalService(errorReport);
    }

    // Check for error patterns
    this.checkErrorPatterns();
  }

  // Get error metrics
  public getErrorMetrics(): ErrorMetrics {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentErrors = this.errors.filter(error => 
      new Date(error.info.timestamp) > oneHourAgo
    );

    const errorsByComponent: Record<string, number> = {};
    const errorsByType: Record<string, number> = {};
    const errorsByHour: Record<string, number> = {};

    recentErrors.forEach(error => {
      // Count by component
      const component = error.info.componentName || 'Unknown';
      errorsByComponent[component] = (errorsByComponent[component] || 0) + 1;

      // Count by error type
      const errorType = this.getErrorType(error.error);
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;

      // Count by hour
      const hour = new Date(error.info.timestamp).getHours().toString();
      errorsByHour[hour] = (errorsByHour[hour] || 0) + 1;
    });

    return {
      totalErrors: this.errors.length,
      errorsByComponent,
      errorsByType,
      errorsByHour,
      lastErrorTime: this.errors.length > 0 ? this.errors[this.errors.length - 1].info.timestamp : null
    };
  }

  // Get recent alerts
  public getRecentAlerts(limit = 10): ErrorAlert[] {
    return this.alerts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Clear old errors (keep last 100)
  public clearOldErrors(): void {
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }
  }

  // Check for error patterns and create alerts
  private checkErrorPatterns(): void {
    const metrics = this.getErrorMetrics();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check for high error rate
    const recentErrorCount = this.errors.filter(error => 
      new Date(error.info.timestamp) > oneHourAgo
    ).length;

    if (recentErrorCount > 10) {
      this.createSystemAlert('High error rate detected', 'high');
    }

    // Check for repeated errors from same component
    Object.entries(metrics.errorsByComponent).forEach(([component, count]) => {
      if (count > 5) {
        this.createSystemAlert(`Repeated errors in ${component}`, 'medium');
      }
    });
  }

  // Create alert from error report
  private createAlert(errorReport: ErrorReport): ErrorAlert | null {
    const severity = this.getErrorSeverity(errorReport.error);
    
    // Only create alerts for medium and higher severity
    if (severity === 'low') return null;

    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: errorReport.error.message,
      severity,
      timestamp: errorReport.info.timestamp,
      componentName: errorReport.info.componentName || 'Unknown',
      userAgent: errorReport.info.userAgent,
      url: errorReport.info.url,
      stack: errorReport.info.stack
    };
  }

  // Create system alert
  private createSystemAlert(message: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    const alert: ErrorAlert = {
      id: `system_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      severity,
      timestamp: new Date().toISOString(),
      componentName: 'System',
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.alerts.push(alert);
    console.warn('⚠️ System Alert:', alert);
  }

  // Get error severity
  private getErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'medium';
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'high';
    }
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }
    
    return 'low';
  }

  // Get error type
  private getErrorType(error: Error): string {
    if (error.name) return error.name;
    
    const message = error.message.toLowerCase();
    if (message.includes('network')) return 'NetworkError';
    if (message.includes('timeout')) return 'TimeoutError';
    if (message.includes('permission')) return 'PermissionError';
    if (message.includes('validation')) return 'ValidationError';
    
    return 'UnknownError';
  }

  // Setup global error handlers
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const errorReport: ErrorReport = {
        error: event.reason instanceof Error ? event.reason : new Error(event.reason?.message || 'Unhandled rejection'),
        info: {
          message: event.reason?.message || 'Unhandled promise rejection',
          stack: event.reason?.stack,
          componentName: 'Global',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      };
      
      this.trackError(errorReport);
      event.preventDefault();
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      const errorReport: ErrorReport = {
        error: event.error || new Error('Unknown error occurred'),
        info: {
          message: event.error?.message || 'Unknown error occurred',
          stack: event.error?.stack,
          componentName: 'Global',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      };
      
      this.trackError(errorReport);
    });
  }

  // Setup performance monitoring
  private setupPerformanceMonitoring(): void {
    // Monitor for performance issues
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            if (navEntry.loadEventEnd - navEntry.loadEventStart > 5000) {
              this.createSystemAlert('Slow page load detected', 'medium');
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  // Setup unhandled rejection handler
  private setupUnhandledRejectionHandler(): void {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    });
  }

  // Send error to external service (placeholder for production)
  private sendToExternalService(errorReport: ErrorReport): void {
    // In production, you would send this to your error monitoring service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    
    // For now, we'll just log it
    console.log('📤 Sending error to external service:', {
      message: errorReport.error.message,
      component: errorReport.info.componentName,
      timestamp: errorReport.info.timestamp,
      url: errorReport.info.url
    });
  }

  // Get error summary for debugging
  public getErrorSummary(): string {
    const metrics = this.getErrorMetrics();
    const recentAlerts = this.getRecentAlerts(5);
    
    return `
Error Summary:
- Total Errors: ${metrics.totalErrors}
- Recent Errors (1h): ${Object.values(metrics.errorsByComponent).reduce((a, b) => a + b, 0)}
- Top Component: ${Object.entries(metrics.errorsByComponent).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}
- Recent Alerts: ${recentAlerts.length}
- Last Error: ${metrics.lastErrorTime ? new Date(metrics.lastErrorTime).toLocaleString() : 'None'}
    `.trim();
  }

  // Export errors for debugging
  public exportErrors(): ErrorReport[] {
    return [...this.errors];
  }

  // Clear all errors (for testing)
  public clearAllErrors(): void {
    this.errors = [];
    this.alerts = [];
  }
}

// Export singleton instance
export const errorMonitoringService = ErrorMonitoringService.getInstance(); 