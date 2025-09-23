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
    },
});

export const { setTests } = testSlice.actions;

export default testSlice.reducer;