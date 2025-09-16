/**
 * Structured logging utility
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  contentId?: string;
  endpoint?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private minLevel: LogLevel;

  constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private output(entry: LogEntry): void {
    const output = JSON.stringify(entry);

    switch (entry.level) {
      case "ERROR":
        console.error(output);
        break;
      case "WARN":
        console.warn(output);
        break;
      case "DEBUG":
        console.debug(output);
        break;
      default:
        console.log(output);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output(this.formatLog(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(this.formatLog(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(this.formatLog(LogLevel.WARN, message, context, error));
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(this.formatLog(LogLevel.ERROR, message, context, error));
    }
  }

  /**
   * Log API request/response
   */
  apiRequest(method: string, endpoint: string, context?: LogContext): void {
    this.info(`API ${method} ${endpoint}`, {
      ...context,
      method,
      endpoint,
    });
  }

  /**
   * Log API error
   */
  apiError(
    method: string,
    endpoint: string,
    error: Error,
    context?: LogContext
  ): void {
    this.error(
      `API ${method} ${endpoint} failed`,
      {
        ...context,
        method,
        endpoint,
      },
      error
    );
  }

  /**
   * Log service operation
   */
  serviceOperation(
    service: string,
    operation: string,
    context?: LogContext
  ): void {
    this.info(`${service}.${operation}`, {
      ...context,
      service,
      operation,
    });
  }

  /**
   * Log service error
   */
  serviceError(
    service: string,
    operation: string,
    error: Error,
    context?: LogContext
  ): void {
    this.error(
      `${service}.${operation} failed`,
      {
        ...context,
        service,
        operation,
      },
      error
    );
  }
}

// Create logger instance based on environment
const logLevel =
  process.env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO;
export const logger = new Logger(logLevel);

/**
 * Request context helper for Next.js API routes
 */
export function getRequestContext(request: Request): LogContext {
  const url = new URL(request.url);
  return {
    method: request.method,
    endpoint: url.pathname,
    userAgent: request.headers.get("user-agent") || undefined,
    userId: request.headers.get("x-user-id") || undefined,
  };
}
