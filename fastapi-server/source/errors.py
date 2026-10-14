"""
Error definitions and exception classes for FastAPI embedding service.
Mirrors the TypeScript error taxonomy for consistency.
"""
from enum import Enum
from typing import Dict, Any, Optional
from dataclasses import dataclass


class ErrorCode(str, Enum):
    AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS'
    AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED'
    AUTH_SESSION_MISSING = 'AUTH_SESSION_MISSING'
    AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID'
    AUTH_OAUTH_FAILED = 'AUTH_OAUTH_FAILED'
    AUTH_OAUTH_EMAIL_NOT_VERIFIED = 'AUTH_OAUTH_EMAIL_NOT_VERIFIED'
    AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS'
    AUTH_ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED'
    VALIDATION_INVALID_INPUT = 'VALIDATION_INVALID_INPUT'
    VALIDATION_MISSING_REQUIRED_FIELD = 'VALIDATION_MISSING_REQUIRED_FIELD'
    VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT'
    VALIDATION_VALUE_OUT_OF_RANGE = 'VALIDATION_VALUE_OUT_OF_RANGE'
    VALIDATION_FILE_TYPE_UNSUPPORTED = 'VALIDATION_FILE_TYPE_UNSUPPORTED'
    VALIDATION_FILE_SIZE_EXCEEDED = 'VALIDATION_FILE_SIZE_EXCEEDED'
    VALIDATION_FILE_EMPTY = 'VALIDATION_FILE_EMPTY'
    VALIDATION_PASSWORD_WEAK = 'VALIDATION_PASSWORD_WEAK'
    VALIDATION_EMAIL_INVALID = 'VALIDATION_EMAIL_INVALID'
    DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED'
    DATABASE_QUERY_FAILED = 'DATABASE_QUERY_FAILED'
    DATABASE_RECORD_NOT_FOUND = 'DATABASE_RECORD_NOT_FOUND'
    DATABASE_CONSTRAINT_VIOLATION = 'DATABASE_CONSTRAINT_VIOLATION'
    DATABASE_TRANSACTION_FAILED = 'DATABASE_TRANSACTION_FAILED'
    DATABASE_MIGRATION_PENDING = 'DATABASE_MIGRATION_PENDING'
    EMBEDDING_SERVICE_UNAVAILABLE = 'EMBEDDING_SERVICE_UNAVAILABLE'
    EMBEDDING_SERVICE_TIMEOUT = 'EMBEDDING_SERVICE_TIMEOUT'
    EMBEDDING_GENERATION_FAILED = 'EMBEDDING_GENERATION_FAILED'
    EMBEDDING_INVALID_RESPONSE = 'EMBEDDING_INVALID_RESPONSE'
    EMBEDDING_MODEL_LOAD_FAILED = 'EMBEDDING_MODEL_LOAD_FAILED'
    EMBEDDING_INVALID_INPUT = 'EMBEDDING_INVALID_INPUT'
    LLM_SERVICE_UNAVAILABLE = 'LLM_SERVICE_UNAVAILABLE'
    LLM_GENERATION_FAILED = 'LLM_GENERATION_FAILED'
    LLM_STREAMING_FAILED = 'LLM_STREAMING_FAILED'
    LLM_INVALID_RESPONSE_FORMAT = 'LLM_INVALID_RESPONSE_FORMAT'
    RAG_NO_RELEVANT_CONTEXT = 'RAG_NO_RELEVANT_CONTEXT'
    RAG_SEARCH_FAILED = 'RAG_SEARCH_FAILED'
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
    UPLOAD_FAILED = 'UPLOAD_FAILED'
    UPLOAD_FILE_WRITE_FAILED = 'UPLOAD_FILE_WRITE_FAILED'
    UPLOAD_EXTRACTION_FAILED = 'UPLOAD_EXTRACTION_FAILED'
    UPLOAD_PROCESSING_FAILED = 'UPLOAD_PROCESSING_FAILED'
    CHAT_NOT_FOUND = 'CHAT_NOT_FOUND'
    CHAT_ACCESS_DENIED = 'CHAT_ACCESS_DENIED'
    CHAT_MESSAGE_FAILED = 'CHAT_MESSAGE_FAILED'
    DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND'
    DOCUMENT_ACCESS_DENIED = 'DOCUMENT_ACCESS_DENIED'
    DOCUMENT_PROCESSING_FAILED = 'DOCUMENT_PROCESSING_FAILED'
    DOCUMENT_ALREADY_PROCESSED = 'DOCUMENT_ALREADY_PROCESSED'
    DOCUMENT_MAX_RETRIES_EXCEEDED = 'DOCUMENT_MAX_RETRIES_EXCEEDED'
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
    INTERNAL_CONFIGURATION_ERROR = 'INTERNAL_CONFIGURATION_ERROR'
    INTERNAL_DEPENDENCY_ERROR = 'INTERNAL_DEPENDENCY_ERROR'


@dataclass
class ErrorDefinition:
    code: ErrorCode
    http_status: int
    user_message: str
    log_level: str
    retryable: bool
    category: str


ERROR_REGISTRY: Dict[ErrorCode, ErrorDefinition] = {
    ErrorCode.AUTH_INVALID_CREDENTIALS: ErrorDefinition(ErrorCode.AUTH_INVALID_CREDENTIALS, 401, 'Invalid email or password', 'warn', False, 'auth'),
    ErrorCode.AUTH_SESSION_EXPIRED: ErrorDefinition(ErrorCode.AUTH_SESSION_EXPIRED, 401, 'Your session has expired. Please sign in again.', 'warn', False, 'auth'),
    ErrorCode.AUTH_SESSION_MISSING: ErrorDefinition(ErrorCode.AUTH_SESSION_MISSING, 401, 'Authentication required. Please sign in.', 'warn', False, 'auth'),
    ErrorCode.AUTH_TOKEN_INVALID: ErrorDefinition(ErrorCode.AUTH_TOKEN_INVALID, 401, 'Invalid or malformed authentication token.', 'warn', False, 'auth'),
    ErrorCode.AUTH_OAUTH_FAILED: ErrorDefinition(ErrorCode.AUTH_OAUTH_FAILED, 401, 'Google sign-in failed. Please try again.', 'error', True, 'auth'),
    ErrorCode.AUTH_OAUTH_EMAIL_NOT_VERIFIED: ErrorDefinition(ErrorCode.AUTH_OAUTH_EMAIL_NOT_VERIFIED, 401, 'Please verify your email address with Google first.', 'warn', False, 'auth'),
    ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS: ErrorDefinition(ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS, 403, 'You do not have permission to perform this action.', 'warn', False, 'auth'),
    ErrorCode.AUTH_ACCOUNT_LOCKED: ErrorDefinition(ErrorCode.AUTH_ACCOUNT_LOCKED, 403, 'Account temporarily locked. Please try again later.', 'warn', True, 'auth'),
    ErrorCode.VALIDATION_INVALID_INPUT: ErrorDefinition(ErrorCode.VALIDATION_INVALID_INPUT, 400, 'Invalid input provided.', 'warn', False, 'validation'),
    ErrorCode.VALIDATION_MISSING_REQUIRED_FIELD: ErrorDefinition(ErrorCode.VALIDATION_MISSING_REQUIRED_FIELD, 400, 'A required field is missing.', 'warn', False, 'validation'),
    ErrorCode.VALIDATION_INVALID_FORMAT: ErrorDefinition(ErrorCode.VALIDATION_INVALID_FORMAT, 400, 'Input format is invalid.', 'warn', False, 'validation'),
    ErrorCode.VALIDATION_VALUE_OUT_OF_RANGE: ErrorDefinition(ErrorCode.VALIDATION_VALUE_OUT_OF_RANGE, 400, 'Input value is out of acceptable range.', 'warn', False, 'validation'),
    ErrorCode.VALIDATION_FILE_TYPE_UNSUPPORTED: ErrorDefinition(ErrorCode.VALIDATION_FILE_TYPE_UNSUPPORTED, 400, 'File type not supported.', 'warn', False, 'validation'),
    ErrorCode.VALIDATION_FILE_SIZE_EXCEEDED: ErrorDefinition(ErrorCode.VALIDATION_FILE_SIZE_EXCEEDED, 400, 'File size exceeds the maximum allowed limit.', 'warn', False, 'validation'),
    ErrorCode.VALIDATION_FILE_EMPTY: ErrorDefinition(ErrorCode.VALIDATION_FILE_EMPTY, 400, 'The uploaded file is empty.', 'warn', False, 'validation'),
    ErrorCode.VALIDATION_PASSWORD_WEAK: ErrorDefinition(ErrorCode.VALIDATION_PASSWORD_WEAK, 400, 'Password does not meet strength requirements.', 'warn', False, 'validation'),
    ErrorCode.VALIDATION_EMAIL_INVALID: ErrorDefinition(ErrorCode.VALIDATION_EMAIL_INVALID, 400, 'Invalid email format.', 'warn', False, 'validation'),
    ErrorCode.DATABASE_CONNECTION_FAILED: ErrorDefinition(ErrorCode.DATABASE_CONNECTION_FAILED, 503, 'Database connection failed. Please try again later.', 'error', True, 'database'),
    ErrorCode.DATABASE_QUERY_FAILED: ErrorDefinition(ErrorCode.DATABASE_QUERY_FAILED, 500, 'A database error occurred. Please try again.', 'error', True, 'database'),
    ErrorCode.DATABASE_RECORD_NOT_FOUND: ErrorDefinition(ErrorCode.DATABASE_RECORD_NOT_FOUND, 404, 'The requested resource was not found.', 'info', False, 'database'),
    ErrorCode.DATABASE_CONSTRAINT_VIOLATION: ErrorDefinition(ErrorCode.DATABASE_CONSTRAINT_VIOLATION, 409, 'A conflict occurred with existing data.', 'warn', False, 'database'),
    ErrorCode.DATABASE_TRANSACTION_FAILED: ErrorDefinition(ErrorCode.DATABASE_TRANSACTION_FAILED, 500, 'Database transaction failed. Please try again.', 'error', True, 'database'),
    ErrorCode.DATABASE_MIGRATION_PENDING: ErrorDefinition(ErrorCode.DATABASE_MIGRATION_PENDING, 503, 'Database migrations are pending.', 'error', False, 'database'),
    ErrorCode.EMBEDDING_SERVICE_UNAVAILABLE: ErrorDefinition(ErrorCode.EMBEDDING_SERVICE_UNAVAILABLE, 503, 'Embedding service is temporarily unavailable.', 'error', True, 'embedding'),
    ErrorCode.EMBEDDING_SERVICE_TIMEOUT: ErrorDefinition(ErrorCode.EMBEDDING_SERVICE_TIMEOUT, 504, 'Embedding request timed out.', 'error', True, 'embedding'),
    ErrorCode.EMBEDDING_GENERATION_FAILED: ErrorDefinition(ErrorCode.EMBEDDING_GENERATION_FAILED, 500, 'Failed to generate embeddings.', 'error', True, 'embedding'),
    ErrorCode.EMBEDDING_INVALID_RESPONSE: ErrorDefinition(ErrorCode.EMBEDDING_INVALID_RESPONSE, 502, 'Invalid response from embedding service.', 'error', False, 'embedding'),
    ErrorCode.EMBEDDING_MODEL_LOAD_FAILED: ErrorDefinition(ErrorCode.EMBEDDING_MODEL_LOAD_FAILED, 500, 'Failed to load embedding model.', 'error', False, 'embedding'),
    ErrorCode.EMBEDDING_INVALID_INPUT: ErrorDefinition(ErrorCode.EMBEDDING_INVALID_INPUT, 400, 'Invalid input for embedding generation.', 'warn', False, 'embedding'),
    ErrorCode.LLM_SERVICE_UNAVAILABLE: ErrorDefinition(ErrorCode.LLM_SERVICE_UNAVAILABLE, 503, 'AI service is temporarily unavailable.', 'error', True, 'llm'),
    ErrorCode.LLM_GENERATION_FAILED: ErrorDefinition(ErrorCode.LLM_GENERATION_FAILED, 500, 'Failed to generate AI response.', 'error', True, 'llm'),
    ErrorCode.LLM_STREAMING_FAILED: ErrorDefinition(ErrorCode.LLM_STREAMING_FAILED, 500, 'Streaming response failed.', 'error', True, 'llm'),
    ErrorCode.LLM_INVALID_RESPONSE_FORMAT: ErrorDefinition(ErrorCode.LLM_INVALID_RESPONSE_FORMAT, 502, 'Received unexpected response from AI service.', 'error', False, 'llm'),
    ErrorCode.RAG_NO_RELEVANT_CONTEXT: ErrorDefinition(ErrorCode.RAG_NO_RELEVANT_CONTEXT, 404, 'No relevant information found.', 'info', False, 'llm'),
    ErrorCode.RAG_SEARCH_FAILED: ErrorDefinition(ErrorCode.RAG_SEARCH_FAILED, 500, 'Document search failed.', 'error', True, 'llm'),
    ErrorCode.RATE_LIMIT_EXCEEDED: ErrorDefinition(ErrorCode.RATE_LIMIT_EXCEEDED, 429, 'Too many requests. Please wait before trying again.', 'warn', True, 'rate_limit'),
    ErrorCode.UPLOAD_FAILED: ErrorDefinition(ErrorCode.UPLOAD_FAILED, 500, 'File upload failed.', 'error', True, 'upload'),
    ErrorCode.UPLOAD_FILE_WRITE_FAILED: ErrorDefinition(ErrorCode.UPLOAD_FILE_WRITE_FAILED, 500, 'Failed to save uploaded file.', 'error', True, 'upload'),
    ErrorCode.UPLOAD_EXTRACTION_FAILED: ErrorDefinition(ErrorCode.UPLOAD_EXTRACTION_FAILED, 500, 'Failed to extract text from file.', 'error', True, 'upload'),
    ErrorCode.UPLOAD_PROCESSING_FAILED: ErrorDefinition(ErrorCode.UPLOAD_PROCESSING_FAILED, 500, 'Document processing failed.', 'error', True, 'upload'),
    ErrorCode.CHAT_NOT_FOUND: ErrorDefinition(ErrorCode.CHAT_NOT_FOUND, 404, 'Conversation not found.', 'info', False, 'chat'),
    ErrorCode.CHAT_ACCESS_DENIED: ErrorDefinition(ErrorCode.CHAT_ACCESS_DENIED, 403, 'Access denied to this conversation.', 'warn', False, 'chat'),
    ErrorCode.CHAT_MESSAGE_FAILED: ErrorDefinition(ErrorCode.CHAT_MESSAGE_FAILED, 500, 'Failed to save message.', 'error', True, 'chat'),
    ErrorCode.DOCUMENT_NOT_FOUND: ErrorDefinition(ErrorCode.DOCUMENT_NOT_FOUND, 404, 'Document not found.', 'info', False, 'document'),
    ErrorCode.DOCUMENT_ACCESS_DENIED: ErrorDefinition(ErrorCode.DOCUMENT_ACCESS_DENIED, 403, 'Access denied to this document.', 'warn', False, 'document'),
    ErrorCode.DOCUMENT_PROCESSING_FAILED: ErrorDefinition(ErrorCode.DOCUMENT_PROCESSING_FAILED, 500, 'Document processing failed.', 'error', True, 'document'),
    ErrorCode.DOCUMENT_ALREADY_PROCESSED: ErrorDefinition(ErrorCode.DOCUMENT_ALREADY_PROCESSED, 400, 'Document is already processed.', 'warn', False, 'document'),
    ErrorCode.DOCUMENT_MAX_RETRIES_EXCEEDED: ErrorDefinition(ErrorCode.DOCUMENT_MAX_RETRIES_EXCEEDED, 400, 'Maximum retry attempts exceeded.', 'warn', False, 'document'),
    ErrorCode.INTERNAL_SERVER_ERROR: ErrorDefinition(ErrorCode.INTERNAL_SERVER_ERROR, 500, 'An unexpected error occurred.', 'error', True, 'internal'),
    ErrorCode.INTERNAL_CONFIGURATION_ERROR: ErrorDefinition(ErrorCode.INTERNAL_CONFIGURATION_ERROR, 500, 'Service configuration error.', 'error', False, 'internal'),
    ErrorCode.INTERNAL_DEPENDENCY_ERROR: ErrorDefinition(ErrorCode.INTERNAL_DEPENDENCY_ERROR, 503, 'A required service is unavailable.', 'error', True, 'internal'),
}


def get_error_definition(code: ErrorCode) -> ErrorDefinition:
    return ERROR_REGISTRY.get(code, ERROR_REGISTRY[ErrorCode.INTERNAL_SERVER_ERROR])

def is_retryable_error(code: ErrorCode) -> bool:
    return ERROR_REGISTRY.get(code, ERROR_REGISTRY[ErrorCode.INTERNAL_SERVER_ERROR]).retryable
def get_error_http_status(code: ErrorCode) -> int:
    return ERROR_REGISTRY.get(code, ERROR_REGISTRY[ErrorCode.INTERNAL_SERVER_ERROR]).http_status
def get_error_user_message(code: ErrorCode) -> str:
    return ERROR_REGISTRY.get(code, ERROR_REGISTRY[ErrorCode.INTERNAL_SERVER_ERROR]).user_message


class AppError(Exception):
    def __init__(self, code: ErrorCode, message: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None, cause: Optional[Exception] = None, correlation_id: Optional[str] = None):
        definition = get_error_definition(code)
        super().__init__(message or code.value)
        self.code = code
        self.http_status = definition.http_status
        self.user_message = definition.user_message
        self.log_level = definition.log_level
        self.retryable = definition.retryable
        self.category = definition.category
        self.metadata = metadata or {}
        self.cause = cause
        self.correlation_id = correlation_id
        import datetime
        self.timestamp = datetime.datetime.utcnow().isoformat() + 'Z'
    def to_response(self) -> Dict[str, Any]:
        return {'error': {'code': self.code.value, 'message': self.user_message, 'retryable': self.retryable, 'category': self.category, 'correlation_id': self.correlation_id, 'timestamp': self.timestamp}}
    def to_log_dict(self) -> Dict[str, Any]:
        return {'level': self.log_level, 'message': str(self), 'code': self.code.value, 'category': self.category, 'http_status': self.http_status, 'retryable': self.retryable, 'correlation_id': self.correlation_id, 'timestamp': self.timestamp, 'metadata': self.metadata, 'cause': {'type': type(self.cause).__name__, 'message': str(self.cause)} if self.cause else None}
    def is_code(self, code: ErrorCode) -> bool: return self.code == code
    def is_category(self, category: str) -> bool: return self.category == category


class Errors:
    @staticmethod
    def auth_invalid_credentials(metadata=None, cause=None, correlation_id=None): return AppError(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid credentials', metadata, cause, correlation_id)
    @staticmethod
    def auth_session_expired(metadata=None, cause=None, correlation_id=None): return AppError(ErrorCode.AUTH_SESSION_EXPIRED, 'Session expired', metadata, cause, correlation_id)
    @staticmethod
    def embedding_service_unavailable(metadata=None, cause=None, correlation_id=None): return AppError(ErrorCode.EMBEDDING_SERVICE_UNAVAILABLE, 'Embedding service unavailable', metadata, cause, correlation_id)
    @staticmethod
    def embedding_timeout(metadata=None, cause=None, correlation_id=None): return AppError(ErrorCode.EMBEDDING_SERVICE_TIMEOUT, 'Embedding request timeout', metadata, cause, correlation_id)
    @staticmethod
    def embedding_generation_failed(metadata=None, cause=None, correlation_id=None): return AppError(ErrorCode.EMBEDDING_GENERATION_FAILED, 'Embedding generation failed', metadata, cause, correlation_id)
    @staticmethod
    def embedding_model_load_failed(metadata=None, cause=None, correlation_id=None): return AppError(ErrorCode.EMBEDDING_MODEL_LOAD_FAILED, 'Failed to load embedding model', metadata, cause, correlation_id)
    @staticmethod
    def embedding_invalid_input(message: str, metadata=None, correlation_id=None): return AppError(ErrorCode.EMBEDDING_INVALID_INPUT, message, metadata, None, correlation_id)
    @staticmethod
    def validation_invalid_input(message: str, metadata=None, correlation_id=None): return AppError(ErrorCode.VALIDATION_INVALID_INPUT, message, metadata, None, correlation_id)
    @staticmethod
    def internal(message: str, metadata=None, cause=None, correlation_id=None): return AppError(ErrorCode.INTERNAL_SERVER_ERROR, message, metadata, cause, correlation_id)
    @staticmethod
    def configuration(message: str, metadata=None, correlation_id=None): return AppError(ErrorCode.INTERNAL_CONFIGURATION_ERROR, message, metadata, None, correlation_id)
    @staticmethod
    def dependency(service: str, metadata=None, cause=None, correlation_id=None): return AppError(ErrorCode.INTERNAL_DEPENDENCY_ERROR, f'Dependency error: {service}', {**metadata, 'service': service} if metadata else {'service': service}, cause, correlation_id)
    @staticmethod
    def from_unknown(error: Exception, default_code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR, correlation_id: Optional[str] = None) -> AppError:
        if isinstance(error, AppError):
            if not error.correlation_id and correlation_id:
                return AppError(error.code, str(error), error.metadata, error.cause, correlation_id)
            return error
        return AppError(default_code, str(error), {}, error, correlation_id)
