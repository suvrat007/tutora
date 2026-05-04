import { createSlice } from "@reduxjs/toolkit";

const attendanceSlice = createSlice({
    name: "attendance",
    initialState: null,
    reducers: {
        addAttendanceSummary: (_, action) => action.payload,
        clearAttendanceSummary: () => null,
    },
});

export const { addAttendanceSummary, clearAttendanceSummary } = attendanceSlice.actions;
export default attendanceSlice.reducer;
