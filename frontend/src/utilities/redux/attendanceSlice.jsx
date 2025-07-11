import {createSlice} from "@reduxjs/toolkit";

const attendanceSlice = createSlice({
    name: "attendanceSlice",
    initialState: [],
    reducers: {
        addAttendanceSummary: (state, action) => {
            return action.payload;
        },
        clearAttendanceSummary: () => {
            return [];
        }
    },

})
export const {addAttendanceSummary,clearAttendanceSummary} = attendanceSlice.actions;
export default attendanceSlice.reducer ;