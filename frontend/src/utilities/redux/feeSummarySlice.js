import { createSlice } from "@reduxjs/toolkit";

const feeSummarySlice = createSlice({
    name: "feeSummary",
    initialState: null,
    reducers: {
        setFeeSummary: (_, action) => action.payload,
        clearFeeSummary: () => null,
    },
});

export const { setFeeSummary, clearFeeSummary } = feeSummarySlice.actions;
export default feeSummarySlice.reducer;
