import { PipeTransform, Injectable } from '@nestjs/common';

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
      .trim()
      .replace(/<[^>]*>/g, '') // strip HTML tags
      .replace(/[<>"'`]/g, '') // strip dangerous chars
      .slice(0, 10_000); // max length guard
  }
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        sanitizeValue(v),
      ]),
    );
  }
  return value;
}

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown) {
    return sanitizeValue(value);
  }
}
