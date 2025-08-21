export interface AppError {
  type: 'network' | 'auth' | 'validation' | 'unknown';
  message: string;
  originalError?: any;
  timestamp: number;
}

export class HelpdeskError extends Error {
  public type: AppError['type'];
  public originalError?: any;
  public timestamp: number;

  constructor(message: string, type: AppError['type'] = 'unknown', originalError?: any) {
    super(message);
    this.name = 'HelpdeskError';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = Date.now();
  }

  toAppError(): AppError {
    return {
      type: this.type,
      message: this.message,
      originalError: this.originalError,
      timestamp: this.timestamp
    };
  }
}

export const errorHandler = {
  // Convert unknown errors to AppError
  normalize: (error: unknown): AppError => {
    if (error instanceof HelpdeskError) {
      return error.toAppError();
    }

    if (error instanceof Error) {
      let type: AppError['type'] = 'unknown';

      // Classify error types
      if (error.message.includes('fetch') || error.message.includes('network')) {
        type = 'network';
      } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
        type = 'auth';
      } else if (error.message.includes('validation') || error.message.includes('invalid')) {
        type = 'validation';
      }

      return {
        type,
        message: error.message,
        originalError: error,
        timestamp: Date.now()
      };
    }

    return {
      type: 'unknown',
      message: typeof error === 'string' ? error : 'Erro desconhecido',
      originalError: error,
      timestamp: Date.now()
    };
  },

  // Get user-friendly message
  getUserMessage: (error: AppError): string => {
    switch (error.type) {
      case 'network':
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
      case 'auth':
        return 'Erro de autenticação. Faça login novamente.';
      case 'validation':
        return 'Dados inválidos. Verifique as informações e tente novamente.';
      default:
        return error.message || 'Ocorreu um erro inesperado.';
    }
  },

  // Log error with context
  log: (error: AppError, context?: string) => {
    const logLevel = error.type === 'validation' ? 'warn' : 'error';
    const contextStr = context ? `[${context}] ` : '';
    
    console[logLevel](`${contextStr}${error.type.toUpperCase()}: ${error.message}`, {
      timestamp: new Date(error.timestamp).toISOString(),
      originalError: error.originalError,
      stack: error.originalError?.stack
    });
  },

  // Create typed errors
  create: {
    network: (message: string, originalError?: any) => 
      new HelpdeskError(message, 'network', originalError),
    
    auth: (message: string, originalError?: any) => 
      new HelpdeskError(message, 'auth', originalError),
    
    validation: (message: string, originalError?: any) => 
      new HelpdeskError(message, 'validation', originalError),
    
    unknown: (message: string, originalError?: any) => 
      new HelpdeskError(message, 'unknown', originalError)
  }
};

// React hook for error handling
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string) => {
    const appError = errorHandler.normalize(error);
    errorHandler.log(appError, context);
    return appError;
  };

  const createErrorToast = (error: unknown, context?: string) => {
    const appError = handleError(error, context);
    const message = errorHandler.getUserMessage(appError);
    
    // You can integrate with your toast system here
    console.error(`Toast: ${message}`);
    return message;
  };

  return {
    handleError,
    createErrorToast,
    HelpdeskError,
    errorHandler
  };
};