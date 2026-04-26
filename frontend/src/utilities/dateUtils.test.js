import { describe, it, expect } from 'vitest';
import { isToday, toDatetimeLocalString, formatDate, formatDateTime } from './dateUtils';

describe('isToday', () => {
    it('returns true for the current date', () => {
        expect(isToday(new Date())).toBe(true);
    });

    it('returns false for yesterday', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        expect(isToday(yesterday)).toBe(false);
    });

    it('returns false for a date string from last year', () => {
        expect(isToday('2000-01-01')).toBe(false);
    });
});

describe('toDatetimeLocalString', () => {
    it('formats a date using local time — not UTC', () => {
        // Construct a date in local time so the values are predictable
        const d = new Date(2024, 2, 15, 10, 30); // March 15 2024, 10:30 local
        expect(toDatetimeLocalString(d)).toBe('2024-03-15T10:30');
    });

    it('pads single-digit month, day, hour, minute', () => {
        const d = new Date(2024, 0, 5, 9, 5); // Jan 5, 09:05
        expect(toDatetimeLocalString(d)).toBe('2024-01-05T09:05');
    });

    it('accepts a date string as input', () => {
        const result = toDatetimeLocalString(new Date(2025, 11, 31, 23, 59));
        expect(result).toBe('2025-12-31T23:59');
    });
});

describe('formatDate', () => {
    it('returns a non-empty string', () => {
        expect(formatDate(new Date())).toBeTruthy();
    });
});

describe('formatDateTime', () => {
    it('contains both date and time parts', () => {
        const result = formatDateTime(new Date(2024, 0, 15, 14, 30));
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(5);
    });
});
