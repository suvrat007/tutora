import { createSlice } from "@reduxjs/toolkit";

const feeSlice = createSlice({
    name: "fees",
    initialState: {
        batches: [],
        students: [],
        totalInstituteFees: 0
    },
    reducers: {
        addFeeData: (state, action) => {
            state.batches = action.payload.batches;
            state.students = action.payload.students;
            state.totalInstituteFees = action.payload.totalInstituteFees;
        },
        clearFeeData: (state) => {
            state.batches = [];
            state.students = [];
            state.totalInstituteFees = 0;
        }
    }
});

export const { addFeeData, clearFeeData } = feeSlice.actions;
export default feeSlice.reducer;