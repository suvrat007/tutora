import { describe, it, expect } from 'vitest';
import userReducer, { setUser, deleteUser } from './userSlice';

describe('userSlice', () => {
    it('has null as initial state', () => {
        expect(userReducer(undefined, { type: '@@INIT' })).toBeNull();
    });

    it('setUser stores the payload', () => {
        const user = { _id: 'abc123', name: 'Test Admin' };
        expect(userReducer(null, setUser(user))).toEqual(user);
    });

    it('setUser replaces existing state', () => {
        const old = { _id: '1', name: 'Old' };
        const next = { _id: '2', name: 'New' };
        expect(userReducer(old, setUser(next))).toEqual(next);
    });

    it('deleteUser resets state to null', () => {
        const user = { _id: 'abc123', name: 'Test Admin' };
        expect(userReducer(user, deleteUser())).toBeNull();
    });

    it('deleteUser is idempotent when state is already null', () => {
        expect(userReducer(null, deleteUser())).toBeNull();
    });
});
