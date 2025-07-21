import { cn } from '@/core/cn';

describe('cn utility', () => {
  it('should return a single class name', () => {
    expect(cn('class1')).toBe('class1');
  });

  it('should return multiple class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn({ class1: true, class2: false })).toBe('class1');
  });

  it('should handle mixed string and conditional classes', () => {
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
  });

  it('should ignore falsy values', () => {
    expect(cn('class1', null, undefined, false)).toBe('class1');
  });
});
