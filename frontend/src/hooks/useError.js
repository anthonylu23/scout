import { useState, useCallback } from 'react';

export const useError = () => {
  const [error, setError] = useState(null);

  const showError = useCallback((message, details = null) => {
    setError({
      message,
      details,
      timestamp: Date.now()
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAsyncError = useCallback((asyncFn) => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (err) {
        showError(
          err.message || 'An unexpected error occurred',
          err
        );
        throw err;
      }
    };
  }, [showError]);

  return {
    error,
    showError,
    clearError,
    handleAsyncError
  };
};