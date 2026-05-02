import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tests: [],
};

const testSlice = createSlice({
    name: 'tests',
    initialState,
    reducers: {
        setTests: (state, action) => {
            state.tests = Array.isArray(action.payload) ? action.payload : [];
        },
        mergeTests: (state, action) => {
            if (!Array.isArray(action.payload) || !action.payload.length) return;
            const batchId = action.payload[0]?.batchId?.toString();
            state.tests = [
                ...state.tests.filter(t => t.batchId?.toString() !== batchId),
                ...action.payload,
            ];
        },
        removeTestById: (state, action) => {
            state.tests = state.tests.filter(t => t._id !== action.payload);
        },
        removeTestsByGroupId: (state, action) => {
            state.tests = state.tests.filter(t => t.groupId !== action.payload);
        },
    },
});

export const { setTests, mergeTests, removeTestById, removeTestsByGroupId } = testSlice.actions;

export default testSlice.reducer;
