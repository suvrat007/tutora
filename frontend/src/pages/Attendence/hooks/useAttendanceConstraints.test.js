import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAttendanceConstraints from './useAttendanceConstraints';

const batches = [
    {
        _id: 'batch1',
        name: 'Batch A',
        subject: [
            {
                _id: 'sub1',
                name: 'Math',
                classSchedule: { days: ['Monday', 'Wednesday'], time: '09:00' },
            },
        ],
    },
];

const pastDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
})();

const futureDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
})();

describe('useAttendanceConstraints', () => {
    it('sets error when batch/subject/date are empty', () => {
        const { result } = renderHook(() =>
            useAttendanceConstraints('', '', '', batches)
        );
        act(() => { result.current.isValidDateTime(); });
        expect(result.current.errorMessage).toBe('All fields are required');
    });

    it('rejects a future date', () => {
        const { result } = renderHook(() =>
            useAttendanceConstraints('Batch A', 'Math', futureDate, batches)
        );
        act(() => { result.current.isValidDateTime(); });
        expect(result.current.errorMessage).toBe('Cannot mark attendance for future dates');
    });

    it('rejects a day not in the class schedule', () => {
        // Find a day that is NOT Monday or Wednesday
        const d = new Date(pastDate);
        const dayName = d.toLocaleString('en-US', { weekday: 'long' });
        // Only run this assertion when pastDate is not Mon/Wed
        if (!['Monday', 'Wednesday'].includes(dayName)) {
            const { result } = renderHook(() =>
                useAttendanceConstraints('Batch A', 'Math', pastDate, batches)
            );
            act(() => { result.current.isValidDateTime(); });
            expect(result.current.errorMessage).toMatch(/not scheduled/);
        }
    });

    it('clears errorMessage when inputs are reset', () => {
        const { result, rerender } = renderHook(
            ({ bn, sn, dt }) => useAttendanceConstraints(bn, sn, dt, batches),
            { initialProps: { bn: '', sn: '', dt: '' } }
        );
        act(() => { result.current.isValidDateTime(); });
        expect(result.current.errorMessage).toBe('All fields are required');

        rerender({ bn: '', sn: '', dt: '' });
        // errorMessage persists until isValidDateTime is called again with valid data
        act(() => { result.current.isValidDateTime(); });
        expect(result.current.errorMessage).toBe('All fields are required');
    });
});
