import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tests: [],
};

const testSlice = createSlice({
    name: 'tests',
    initialState,
    reducers: {
        setTests: (state, action) => {
            state.tests = action.payload;
        },
        mergeTests: (state, action) => {
            if (!action.payload.length) return;
            const batchId = action.payload[0]?.batchId?.toString();
            state.tests = [
                ...state.tests.filter(t => t.batchId?.toString() !== batchId),
                ...action.payload,
            ];
        },
    },
});

export const { setTests, mergeTests } = testSlice.actions;

export default testSlice.reducer;
