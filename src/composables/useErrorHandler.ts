import { ref, onErrorCaptured } from 'vue';
import { useRouter } from 'vue-router';
import { STANDARD_ERROR_MESSAGE } from '@/utils/errorHandler';
import { errorMonitoringService } from '@/services/errorMonitoringService';

export interface ErrorInfo {
  message: string;
  stack?: string;
  componentName?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

export interface ErrorReport {
  error: Error;
  info: ErrorInfo;
  context?: Record<string, any>;
}

export function useErrorHandler() {
  const router = useRouter();
  const errors = ref<ErrorReport[]>([]);
  const isHandlingError = ref(false);

  // Handle component errors
  const handleComponentError = (error: Error, errorInfo: ErrorInfo) => {
    const enhancedErrorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentName: errorInfo.componentName || 'Unknown Component',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    const errorReport: ErrorReport = {
      error,
      info: enhancedErrorInfo
    };

    errors.value.push(errorReport);
    logError(errorReport);

    return false; // Prevent error from propagating
  };

  // Handle API errors
  const handleApiError = (error: any, context?: Record<string, any>) => {
    const errorInfo: ErrorInfo = {
      message: error.message || STANDARD_ERROR_MESSAGE,
      stack: error.stack,
      componentName: 'API Call',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    const errorReport: ErrorReport = {
      error: error instanceof Error ? error : new Error(error.message || 'API Error'),
      info: errorInfo,
      context
    };

    errors.value.push(errorReport);
    logError(errorReport);

    return errorInfo.message;
  };

  // Handle async errors
  const handleAsyncError = async <T>(
    asyncFn: () => Promise<T>,
    fallback?: T,
    context?: Record<string, any>
  ): Promise<T> => {
    try {
      return await asyncFn();
    } catch (error: any) {
      const errorMessage = handleApiError(error, context);
      if (fallback !== undefined) {
        return fallback;
      }
      throw new Error(errorMessage);
    }
  };

  // Handle navigation errors
  const handleNavigationError = (error: Error) => {
    console.error('Navigation error:', error);
    
    // Try to redirect to a safe page
    try {
      router.push('/');
    } catch (navError) {
      console.error('Failed to redirect after navigation error:', navError);
      window.location.href = '/';
    }
  };

  // Handle unhandled promise rejections
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    const errorInfo: ErrorInfo = {
      message: event.reason?.message || 'Unhandled promise rejection',
      stack: event.reason?.stack,
      componentName: 'Global',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    const errorReport: ErrorReport = {
      error: event.reason instanceof Error ? event.reason : new Error(event.reason?.message || 'Unhandled rejection'),
      info: errorInfo
    };

    errors.value.push(errorReport);
    logError(errorReport);
    
    event.preventDefault();
  };

  // Handle global errors
  const handleGlobalError = (event: ErrorEvent) => {
    console.error('Global error:', event.error);
    
    if (!isHandlingError.value) {
      isHandlingError.value = true;
      
      const errorInfo: ErrorInfo = {
        message: event.error?.message || 'Unknown error occurred',
        stack: event.error?.stack,
        componentName: 'Global',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      const errorReport: ErrorReport = {
        error: event.error || new Error('Unknown error occurred'),
        info: errorInfo
      };

      errors.value.push(errorReport);
      logError(errorReport);
      
      isHandlingError.value = false;
    }
  };

  // Log error for monitoring
  const logError = (errorReport: ErrorReport) => {
    // Log to console for development
    console.error('Application Error:', errorReport);

    // Track error in monitoring service
    errorMonitoringService.trackError(errorReport);

    // In production, you would send this to your error monitoring service
    // Example: Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      // sendToErrorService(errorReport);
    }
  };

  // Clear errors
  const clearErrors = () => {
    errors.value = [];
  };

  // Get latest error
  const getLatestError = () => {
    return errors.value[errors.value.length - 1];
  };

  // Check if there are any errors
  const hasErrors = () => {
    return errors.value.length > 0;
  };

  // Setup global error handlers
  const setupGlobalErrorHandlers = () => {
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);
  };

  // Cleanup global error handlers
  const cleanupGlobalErrorHandlers = () => {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleGlobalError);
  };

  // Setup component error handler
  const setupComponentErrorHandler = () => {
    return onErrorCaptured((error: Error, instance: any, info: string) => {
      const errorInfo: ErrorInfo = {
        message: error.message,
        stack: error.stack,
        componentName: instance?.$options?.name || 'Unknown Component',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      const errorReport: ErrorReport = {
        error,
        info: errorInfo
      };

      errors.value.push(errorReport);
      logError(errorReport);

      return false; // Prevent error from propagating
    });
  };

  return {
    // State
    errors,
    isHandlingError,
    
    // Methods
    handleComponentError,
    handleApiError,
    handleAsyncError,
    handleNavigationError,
    handleUnhandledRejection,
    handleGlobalError,
    logError,
    clearErrors,
    getLatestError,
    hasErrors,
    
    // Setup/Cleanup
    setupGlobalErrorHandlers,
    cleanupGlobalErrorHandlers,
    setupComponentErrorHandler
  };
} 