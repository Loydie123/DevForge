import { SanitizePipe } from './sanitize.pipe';

describe('SanitizePipe', () => {
  let pipe: SanitizePipe;

  beforeEach(() => {
    pipe = new SanitizePipe();
  });

  it('should trim whitespace from strings', () => {
    expect(pipe.transform('  hello  ')).toBe('hello');
  });

  it('should strip HTML tags', () => {
    expect(pipe.transform('<script>alert("xss")</script>hello')).toBe('hello');
  });

  it('should strip dangerous characters', () => {
    expect(pipe.transform('<>"\'`test')).toBe('test');
  });

  it('should sanitize nested objects', () => {
    const result = pipe.transform({
      name: '  <b>John</b>  ',
      age: 25,
    }) as Record<string, unknown>;
    expect(result['name']).toBe('John');
    expect(result['age']).toBe(25);
  });

  it('should sanitize arrays', () => {
    const result = pipe.transform(['<b>one</b>', '  two  ']) as string[];
    expect(result[0]).toBe('one');
    expect(result[1]).toBe('two');
  });

  it('should pass through numbers and booleans unchanged', () => {
    expect(pipe.transform(42)).toBe(42);
    expect(pipe.transform(true)).toBe(true);
    expect(pipe.transform(null)).toBe(null);
  });

  it('should truncate strings over 10,000 characters', () => {
    const long = 'a'.repeat(15_000);
    const result = pipe.transform(long) as string;
    expect(result.length).toBe(10_000);
  });
});
