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
    },
});

export const { setGroupedStudents } = studentSlice.actions;
export default studentSlice.reducer;
