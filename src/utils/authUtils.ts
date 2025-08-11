/**
 * Auth utilities for handling session cleanup and recovery
 */

/**
 * Clear all auth-related data from browser storage
 * This helps prevent auth refresh loops by removing stale tokens
 */
export const clearAuthStorage = (): void => {
  try {
    // Clear localStorage items that might contain auth data
    const keysToRemove = [
      'supabase.auth.token',
      'sb-auth-token',
      'supabase-auth-token',
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear all localStorage items that start with 'sb-' (Supabase keys)
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage as well
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('[AuthUtils] Cleared auth storage');
  } catch (error) {
    console.warn('[AuthUtils] Failed to clear auth storage:', error);
  }
};

/**
 * Check if we're in an auth refresh loop
 * Returns true if there are signs of repeated auth failures
 */
export const isInAuthRefreshLoop = (): boolean => {
  try {
    const failureKey = 'auth_failure_count';
    const timestampKey = 'auth_failure_timestamp';
    
    const failureCount = parseInt(localStorage.getItem(failureKey) || '0');
    const lastFailure = parseInt(localStorage.getItem(timestampKey) || '0');
    const now = Date.now();
    
    // Reset counter if last failure was more than 5 minutes ago
    if (now - lastFailure > 5 * 60 * 1000) {
      localStorage.removeItem(failureKey);
      localStorage.removeItem(timestampKey);
      return false;
    }
    
    // Consider it a loop if we've had 3+ failures in 5 minutes
    return failureCount >= 3;
  } catch (error) {
    console.warn('[AuthUtils] Failed to check auth loop status:', error);
    return false;
  }
};

/**
 * Record an auth failure for loop detection
 */
export const recordAuthFailure = (): void => {
  try {
    const failureKey = 'auth_failure_count';
    const timestampKey = 'auth_failure_timestamp';
    
    const currentCount = parseInt(localStorage.getItem(failureKey) || '0');
    localStorage.setItem(failureKey, (currentCount + 1).toString());
    localStorage.setItem(timestampKey, Date.now().toString());
  } catch (error) {
    console.warn('[AuthUtils] Failed to record auth failure:', error);
  }
};

/**
 * Clear auth failure tracking
 */
export const clearAuthFailureTracking = (): void => {
  try {
    localStorage.removeItem('auth_failure_count');
    localStorage.removeItem('auth_failure_timestamp');
  } catch (error) {
    console.warn('[AuthUtils] Failed to clear auth failure tracking:', error);
  }
};

/**
 * Force a clean auth state by clearing everything and reloading
 * Use this as a last resort when auth is completely broken
 */
export const forceAuthReset = (): void => {
  console.log('[AuthUtils] Forcing auth reset');
  
  clearAuthStorage();
  clearAuthFailureTracking();
  
  // Add a flag to prevent immediate retry
  localStorage.setItem('auth_reset_performed', Date.now().toString());
  
  // Reload the page to start fresh
  window.location.reload();
};