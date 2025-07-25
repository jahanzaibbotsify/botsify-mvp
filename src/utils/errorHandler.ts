/**
 * Standardized error handling utilities for the Botsify application
 */

export const STANDARD_ERROR_MESSAGE = 'Internal Server Error, Please Contact team@botsify.com';

/**
 * Standardizes error messages for user-facing errors
 * @param error - The original error object
 * @returns A standardized error message
 */
export function standardizeErrorMessage(error: any): string {
  // If it's already our standard message, return it
  if (error?.message === STANDARD_ERROR_MESSAGE) {
    return STANDARD_ERROR_MESSAGE;
  }

  // For rate limiting errors, show a specific message
  if (error?.status === 429) {
    return 'Rate limit exceeded. Please try again later.';
  }

  // For network errors, show standard message
  if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
    return STANDARD_ERROR_MESSAGE;
  }

  // For API errors with status codes, show standard message
  if (error?.status && error.status >= 500) {
    return STANDARD_ERROR_MESSAGE;
  }

  // For other errors, show standard message
  return STANDARD_ERROR_MESSAGE;
}

/**
 * Shows error toast to user
 * @param message - Error message to show
 */
export function showErrorToast(message: string): void {
  // Disabled toast notifications as requested
  // if (typeof window !== 'undefined' && window.$toast) {
  //   window.$toast.error(message);
  // }
}

/**
 * Handles API errors with standardized messaging
 * @param error - The error object
 * @param context - Context for logging (e.g., 'API call', 'Configuration update')
 */
export function handleApiError(error: any, context: string = 'API'): string {
  const standardizedMessage = standardizeErrorMessage(error);
  
  console.error(`❌ ${context} error:`, error);
  console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  
  showErrorToast(standardizedMessage);
  
  return standardizedMessage;
}

/**
 * Stops the current flow and shows error message
 * @param error - The error object
 * @param context - Context for logging
 */
export function stopFlowOnError(error: any, context: string = 'Flow'): never {
  const message = handleApiError(error, context);
  throw new Error(message);
} 