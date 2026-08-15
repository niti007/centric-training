export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ValidationError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function errorEnvelope(code: string, message: string, details?: unknown): ErrorEnvelope {
  return { error: { code, message, details } };
}

export function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError('INVALID_FIELD', `${field} must be a non-empty string`, { field });
  }
  return value;
}

export function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw new ValidationError('INVALID_FIELD', `${field} must be a string`, { field });
  }
  return value;
}

export function requireNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ValidationError('INVALID_FIELD', `${field} must be a number`, { field });
  }
  return value;
}

export function optionalNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  return requireNumber(value, field);
}

export function requireOneOf<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new ValidationError('INVALID_FIELD', `${field} must be one of: ${allowed.join(', ')}`, { field, allowed });
  }
  return value as T;
}

export function requireISODate(value: unknown, field: string): string {
  const str = requireString(value, field);
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError('INVALID_FIELD', `${field} must be a valid ISO date string`, { field });
  }
  return str;
}
