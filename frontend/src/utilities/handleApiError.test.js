import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
    default: { error: vi.fn(), success: vi.fn() },
}));

import toast from 'react-hot-toast';
import { handleApiError, handleApiSuccess } from './handleApiError';

describe('handleApiError', () => {
    beforeEach(() => vi.clearAllMocks());

    it('uses response.data.message when available', () => {
        handleApiError({ response: { data: { message: 'Unauthorized' } } });
        expect(toast.error).toHaveBeenCalledWith('Unauthorized');
    });

    it('falls back to err.message when no response', () => {
        handleApiError({ message: 'Network Error' });
        expect(toast.error).toHaveBeenCalledWith('Network Error');
    });

    it('uses the provided fallback string when no message present', () => {
        handleApiError({}, 'Custom fallback');
        expect(toast.error).toHaveBeenCalledWith('Custom fallback');
    });

    it('uses the default fallback when nothing is provided', () => {
        handleApiError({});
        expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    });
});

describe('handleApiSuccess', () => {
    beforeEach(() => vi.clearAllMocks());

    it('shows a success toast with the given message', () => {
        handleApiSuccess('Saved!');
        expect(toast.success).toHaveBeenCalledWith('Saved!');
    });
});
