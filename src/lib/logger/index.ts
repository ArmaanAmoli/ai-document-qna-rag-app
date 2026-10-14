import { AppError, AppErrorLogObject } from '../errors/app-error';
import { ErrorCode } from '../errors/error-codes';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

const MIN_LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || 'info';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const LOG_FORMAT = process.env.LOG_FORMAT || (IS_PRODUCTION ? 'json' : 'pretty');

import { AsyncLocalStorage } from 'async_hooks';

const correlationIdStorage = new AsyncLocalStorage<string>();

export function getCorrelationId(): string | undefined {
  return correlationIdStorage.getStore();
}

export function withCorrelationId<T>(correlationId: string, fn: () => T): T {
  return correlationIdStorage.run(correlationId, fn);
}

export function generateCorrelationId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

interface LogContext {
  correlationId?: string;
  [key: string]: unknown;
}

interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    code?: ErrorCode;
    category?: string;
    stack?: string;
  };
}

function formatLogEntry(entry: StructuredLogEntry): string {
  if (LOG_FORMAT === 'json') {
    return JSON.stringify(entry);
  }
  const { timestamp, level, message, correlationId, context, error } = entry;
  const contextStr = Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
  const corrIdStr = correlationId ? ` [${correlationId}]` : '';
  const errorStr = error ? ` Error: ${error.name}: ${error.message}${error.stack ? ` Stack: ${error.stack}` : ''}` : '';
  return `${timestamp} [${level.toUpperCase()}]${corrIdStr} ${message}${contextStr}${errorStr}`;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function log(level: LogLevel, message: string, context: LogContext = {}, error?: Error): void {
  if (!shouldLog(level)) return;
  const correlationId = context.correlationId || getCorrelationId();
  const entry: StructuredLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId,
    context: { ...context, correlationId: undefined },
  };
  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError ? { code: error.code, category: error.category } : {}),
    };
  }
  const output = formatLogEntry(entry);
  switch (level) {
    case 'debug':
    case 'info': console.log(output); break;
    case 'warn': console.warn(output); break;
    case 'error': console.error(output); break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext, error?: Error) => log('error', message, context, error),
  logError: (appError: AppError) => {
    const logObj = appError.toLogObject();
    log(logObj.level, logObj.message, {
      correlationId: logObj.correlationId,
      code: logObj.code,
      category: logObj.category,
      httpStatus: logObj.httpStatus,
      retryable: logObj.retryable,
      metadata: logObj.metadata,
    }, appError.cause);
  },
  child: (boundContext: LogContext) => ({
    debug: (message: string, context?: LogContext) => log('debug', message, { ...boundContext, ...context }),
    info: (message: string, context?: LogContext) => log('info', message, { ...boundContext, ...context }),
    warn: (message: string, context?: LogContext) => log('warn', message, { ...boundContext, ...context }),
    error: (message: string, context?: LogContext, error?: Error) => log('error', message, { ...boundContext, ...context }, error),
    logError: (appError: AppError) => {
      const logObj = appError.toLogObject();
      log(logObj.level, logObj.message, {
        ...boundContext,
        correlationId: logObj.correlationId,
        code: logObj.code,
        category: logObj.category,
        httpStatus: logObj.httpStatus,
        retryable: logObj.retryable,
        metadata: logObj.metadata,
      }, appError.cause);
    },
  }),
  httpRequest: (req: { method: string; url: string; headers: Record<string, string | string[] | undefined> }, correlationId?: string) => {
    const cid = correlationId || generateCorrelationId();
    log('info', 'HTTP Request', { correlationId: cid, method: req.method, url: req.url, userAgent: req.headers['user-agent'], ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] });
    return cid;
  },
  httpResponse: (res: { statusCode: number; latencyMs: number }, correlationId?: string) => {
    log('info', 'HTTP Response', { correlationId, statusCode: res.statusCode, latencyMs: res.latencyMs });
  },
  dbQuery: (query: string, params: unknown[], durationMs: number, correlationId?: string) => {
    log('debug', 'Database Query', { correlationId, query: query.substring(0, 500), paramsCount: params.length, durationMs });
  },
  externalCall: (service: string, operation: string, durationMs: number, success: boolean, correlationId?: string, error?: Error) => {
    log(success ? 'info' : 'error', `External Call: ${service}.${operation}`, { correlationId, service, operation, durationMs, success }, error);
  },
};

export type { LogLevel, LogContext, StructuredLogEntry };
