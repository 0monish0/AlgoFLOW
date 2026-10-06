import { ERROR_CODES } from './types.js';

export class EngineError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'EngineError';
    this.code = code;
    this.details = details;
  }
}

export function createError(code, message, details = {}) {
  return {
    code,
    message,
    details,
  };
}
