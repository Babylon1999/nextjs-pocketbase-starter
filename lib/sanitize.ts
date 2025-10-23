/**
 * Simple sanitization utilities for server-side form data processing
 * Replaces isomorphic-dompurify to avoid jsdom/ES module compatibility issues
 */

/**
 * Basic string sanitization - trims whitespace and removes null bytes
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters except \t, \n, \r
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(input: string | null | undefined): string {
  const clean = sanitizeString(input);

  // Basic email validation and cleanup
  return clean
    .toLowerCase()
    .replace(/[^\w@.\-+]/g, '') // Only allow word chars, @, ., -, +
    .substring(0, 254); // Max email length
}

/**
 * Sanitize password - minimal processing to avoid breaking valid passwords
 */
export function sanitizePassword(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/\0/g, '') // Remove null bytes
    .substring(0, 128); // Reasonable max password length
}

/**
 * Sanitize name/text input
 */
export function sanitizeName(input: string | null | undefined): string {
  const clean = sanitizeString(input);

  return clean
    .replace(/[<>]/g, '') // Remove potential HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 100); // Reasonable max name length
}

/**
 * Sanitize general text input
 */
export function sanitizeText(input: string | null | undefined): string {
  const clean = sanitizeString(input);

  return clean
    .replace(/[<>]/g, '') // Remove potential HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Reasonable max text length
}

/**
 * Sanitize token/captcha response
 */
export function sanitizeToken(input: string | null | undefined): string {
  const clean = sanitizeString(input);

  return clean
    .replace(/[^a-zA-Z0-9._-]/g, '') // Only allow alphanumeric and safe chars
    .substring(0, 2048); // Max token length
}
