import { createSlice } from "@reduxjs/toolkit";

const studentSlice = createSlice({
    name: "students",
    initialState: {
        groupedStudents: [],
    },
    reducers: {
        setGroupedStudents: (state, action) => {
            state.groupedStudents = action.payload;
        },
        clearGroupedStudents: (state) => {
            state.groupedStudents = [];
        }
    },
});

export const { setGroupedStudents,clearGroupedStudents } = studentSlice.actions;
export default studentSlice.reducer;
