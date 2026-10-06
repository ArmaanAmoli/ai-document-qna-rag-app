import { createHash } from 'crypto';

// Supported MIME types
const ALLOWED_MIME_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];

// Supported extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md'];

// Max file size (default 50MB, configurable via env)
export function getMaxFileSize(): number {
  const maxMb = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50', 10);
  return maxMb * 1024 * 1024;
}

// Max pages per document (for PDFs)
export function getMaxPages(): number {
  return parseInt(process.env.MAX_PAGES_PER_DOCUMENT || '1000', 10);
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileType(file: File): ValidationResult {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type '${file.type}' is not supported. Supported types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  // Check extension
  const ext = getFileExtension(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File extension '${ext}' is not supported. Supported extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // Verify MIME type matches extension
  const expectedMime = getExpectedMimeType(ext);
  if (expectedMime && file.type !== expectedMime) {
    return {
      valid: false,
      error: `File extension does not match content type. Expected ${expectedMime}, got ${file.type}`,
    };
  }

  return { valid: true };
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot).toLowerCase();
}

function getExpectedMimeType(ext: string): string | null {
  const mimeMap: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
  };
  return mimeMap[ext] || null;
}

export function validateFileSize(file: File): ValidationResult {
  const maxSize = getMaxFileSize();
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${maxSize / 1024 / 1024}MB)`,
    };
  }
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }
  return { valid: true };
}

export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/[\\/:*?"<>|]/g, '_');
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  // Limit length
  if (sanitized.length > 255) {
    const ext = getFileExtension(sanitized);
    const name = sanitized.substring(0, 255 - ext.length);
    sanitized = name + ext;
  }
  return sanitized;
}

export function generateStorageKey(originalFilename: string): string {
  const sanitized = sanitizeFilename(originalFilename);
  const ext = getFileExtension(sanitized);
  const base = sanitized.substring(0, sanitized.length - ext.length);
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9).toString(36);
  return `${base}-${timestamp}-${random}${ext}`;
}

export async function calculateFileHash(buffer: Buffer): Promise<string> {
  const hash = createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

export function normalizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
}
