import { requireString, requireNumber, requireOneOf, ValidationError } from '../src/util/validate';

describe('validate helpers', () => {
  it('requireString accepts a non-empty string', () => {
    expect(requireString('hello', 'field')).toBe('hello');
  });

  it('requireString rejects empty strings', () => {
    expect(() => requireString('', 'field')).toThrow(ValidationError);
  });

  it('requireNumber rejects NaN', () => {
    expect(() => requireNumber(NaN, 'field')).toThrow(ValidationError);
  });

  it('requireOneOf accepts an allowed value', () => {
    expect(requireOneOf('open', 'status', ['open', 'done'] as const)).toBe('open');
  });
});
