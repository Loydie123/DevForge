import { PipeTransform, Injectable } from '@nestjs/common';

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
      .trim()
      .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '') // strip dangerous blocks + their content
      .replace(/<[^>]*>/g, '') // strip remaining HTML tags
      .replace(/[<>"'`]/g, '') // strip remaining dangerous chars
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
