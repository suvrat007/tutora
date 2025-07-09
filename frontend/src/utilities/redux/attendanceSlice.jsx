import {createSlice} from "@reduxjs/toolkit";

const attendanceSlice = createSlice({
    name: "attendanceSlice",
    initialState: [],
    reducers: {
        addAttendanceSummary: (state, action) => {
            return action.payload;
        }
    },

})
export const {addAttendanceSummary} = attendanceSlice.actions;
export default attendanceSlice.reducer ;