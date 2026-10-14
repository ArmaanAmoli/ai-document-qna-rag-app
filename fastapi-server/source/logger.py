"""
Structured logging for FastAPI embedding service.
"""
import json
import logging
import os
import sys
import time
import uuid
from contextvars import ContextVar
from datetime import datetime
from typing import Any, Dict, Optional


# Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO').upper()
LOG_FORMAT = os.getenv('LOG_FORMAT', 'json' if os.getenv('NODE_ENV') == 'production' else 'pretty')
SERVICE_NAME = 'embedding-service'


# Correlation ID context variable
correlation_id_var: ContextVar[Optional[str]] = ContextVar('correlation_id', default=None)


def get_correlation_id() -> Optional[str]:
    return correlation_id_var.get()


def set_correlation_id(correlation_id: str) -> None:
    correlation_id_var.set(correlation_id)


def generate_correlation_id() -> str:
    return f'emb_{int(time.time() * 1000)}_{uuid.uuid4().hex[:8]}'


def with_correlation_id(correlation_id: str):
    """Context manager for correlation ID."""
    token = correlation_id_var.set(correlation_id)
    try:
        yield
    finally:
        correlation_id_var.reset(token)


class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured JSON logs."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'service': SERVICE_NAME,
        }
        
        # Add correlation ID if available
        corr_id = get_correlation_id()
        if corr_id:
            log_entry['correlation_id'] = corr_id
        
        # Add extra fields from record
        for key, value in record.__dict__.items():
            if key not in {'name', 'msg', 'args', 'levelname', 'levelno', 'pathname', 'filename',
                          'module', 'lineno', 'funcName', 'created', 'msecs', 'relativeCreated',
                          'thread', 'threadName', 'processName', 'process', 'getMessage', 'exc_info',
                          'exc_text', 'stack_info', 'message'}:
                log_entry[key] = value
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        if LOG_FORMAT == 'json':
            return json.dumps(log_entry)
        else:
            # Pretty format
            parts = [f"{log_entry['timestamp']} [{log_entry['level']}]"]
            if corr_id:
                parts.append(f"[{corr_id}]")
            parts.append(log_entry['message'])
            extra = {k: v for k, v in log_entry.items() 
                      if k not in {'timestamp', 'level', 'logger', 'message', 'service', 'correlation_id', 'exception'}}
            if extra:
                parts.append(json.dumps(extra))
            if 'exception' in log_entry:
                parts.append(f"\nException: {log_entry['exception']}")
            return ' '.join(parts)


# Configure root logger
logger = logging.getLogger(SERVICE_NAME)
logger.setLevel(getattr(logging, LOG_LEVEL))

# Remove existing handlers
for handler in logger.handlers[:]:
    logger.removeHandler(handler)

# Add console handler with structured formatter
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(StructuredFormatter())
logger.addHandler(handler)

# Prevent propagation to root logger
logger.propagate = False


class Logger:
    """Structured logger with convenience methods."""
    
    def _log(self, level: int, message: str, **context) -> None:
        extra = {'correlation_id': get_correlation_id()}
        extra.update(context)
        logger.log(level, message, extra=extra)
    
    def debug(self, message: str, **context) -> None:
        self._log(logging.DEBUG, message, **context)
    
    def info(self, message: str, **context) -> None:
        self._log(logging.INFO, message, **context)
    
    def warn(self, message: str, **context) -> None:
        self._log(logging.WARNING, message, **context)
    
    def warning(self, message: str, **context) -> None:
        self.warn(message, **context)
    
    def error(self, message: str, error: Optional[Exception] = None, **context) -> None:
        extra = context.copy()
        if error:
            extra['exception_type'] = type(error).__name__
            extra['exception_message'] = str(error)
        self._log(logging.ERROR, message, **extra)
    
    def critical(self, message: str, error: Optional[Exception] = None, **context) -> None:
        extra = context.copy()
        if error:
            extra['exception_type'] = type(error).__name__
            extra['exception_message'] = str(error)
        self._log(logging.CRITICAL, message, **extra)
    
    def log_error(self, app_error) -> None:
        """Log an AppError with full structured context."""
        log_dict = app_error.to_log_dict()
        level = getattr(logging, log_dict['level'].upper())
        extra = {k: v for k, v in log_dict.items() if k != 'level'}
        logger.log(level, log_dict['message'], extra=extra)
    
    def child(self, **bound_context) -> 'Logger':
        """Create a child logger with bound context."""
        child_logger = Logger()
        original_log = child_logger._log
        
        def bound_log(level, message, **context):
            merged = {**bound_context, **context}
            original_log(level, message, **merged)
        
        child_logger._log = bound_log
        return child_logger
    
    def http_request(self, method: str, url: str, headers: Dict[str, str] = None, correlation_id: str = None) -> str:
        cid = correlation_id or generate_correlation_id()
        self.info('HTTP Request', correlation_id=cid, method=method, url=url,
                  user_agent=headers.get('user-agent') if headers else None,
                  ip=headers.get('x-forwarded-for') or headers.get('x-real-ip') if headers else None)
        return cid
    
    def http_response(self, status_code: int, latency_ms: float, correlation_id: str = None) -> None:
        self.info('HTTP Response', correlation_id=correlation_id, status_code=status_code, latency_ms=latency_ms)
    
    def external_call(self, service: str, operation: str, duration_ms: float, success: bool, correlation_id: str = None, error: Exception = None) -> None:
        self.info if success else self.error(f'External Call: {service}.{operation}', error=error,
                                              correlation_id=correlation_id,
                                              service=service, operation=operation,
                                              duration_ms=duration_ms, success=success)


# Global logger instance
log = Logger()


# Export for convenience
__all__ = ['log', 'get_correlation_id', 'set_correlation_id', 'generate_correlation_id', 'with_correlation_id', 'Logger']
