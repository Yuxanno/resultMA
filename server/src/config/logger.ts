/**
 * Structured logging utility
 * Provides consistent logging across the application
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: {
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, data, error } = entry;
    
    // Color codes for terminal
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[90m', // Gray
      RESET: '\x1b[0m',
    };

    const color = colors[level] || colors.RESET;
    const contextStr = context ? ` [${context}]` : '';
    
    let logStr = `${color}${timestamp} ${level}${contextStr}: ${message}${colors.RESET}`;
    
    if (data && this.isDevelopment) {
      logStr += `\n${JSON.stringify(data, null, 2)}`;
    }
    
    if (error) {
      logStr += `\n${color}Error: ${error.message}${colors.RESET}`;
      if (error.stack && this.isDevelopment) {
        logStr += `\n${error.stack}`;
      }
    }
    
    return logStr;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error: error ? {
        message: error.message,
        stack: error.stack,
      } : undefined,
    };

    const formatted = this.formatLog(entry);
    
    // Output to console
    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
      default:
        console.log(formatted);
    }

    // In production, you could send logs to external service here
    // e.g., Sentry, LogRocket, CloudWatch, etc.
  }

  error(message: string, error?: Error, context?: string, data?: any) {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  warn(message: string, context?: string, data?: any) {
    this.log(LogLevel.WARN, message, context, data);
  }

  info(message: string, context?: string, data?: any) {
    this.log(LogLevel.INFO, message, context, data);
  }

  debug(message: string, context?: string, data?: any) {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  // Convenience methods for common scenarios
  
  apiRequest(method: string, path: string, userId?: string) {
    this.info(`${method} ${path}`, 'API', { userId });
  }

  apiResponse(method: string, path: string, statusCode: number, duration: number) {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `${method} ${path} - ${statusCode} (${duration}ms)`, 'API');
  }

  dbQuery(operation: string, collection: string, duration?: number) {
    const message = duration 
      ? `${operation} on ${collection} (${duration}ms)`
      : `${operation} on ${collection}`;
    this.debug(message, 'DB');
  }

  cacheHit(key: string) {
    this.debug(`Cache HIT: ${key}`, 'CACHE');
  }

  cacheMiss(key: string) {
    this.debug(`Cache MISS: ${key}`, 'CACHE');
  }

  queueJob(jobType: string, jobId: string) {
    this.info(`Job queued: ${jobType} (${jobId})`, 'QUEUE');
  }

  queueComplete(jobType: string, jobId: string, duration: number) {
    this.info(`Job completed: ${jobType} (${jobId}) in ${duration}ms`, 'QUEUE');
  }

  queueFailed(jobType: string, jobId: string, error: Error) {
    this.error(`Job failed: ${jobType} (${jobId})`, error, 'QUEUE');
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export default logger;
