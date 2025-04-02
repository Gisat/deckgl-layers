import { describe, it, expect } from '@jest/globals';

describe('Hello test suite', () => {
    test('should pass a basic test', () => {
        expect(true).toBe(true);
    });

    test('should correctly add two numbers', () => {
        const sum = (a: number, b: number): number => a + b;
        expect(sum(2, 3)).toBe(5);
    });
});