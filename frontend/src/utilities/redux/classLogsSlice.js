import {createSlice} from "@reduxjs/toolkit";

const classLogsSlice = createSlice({
    name: "classLogsSlice",
    initialState: [],
    reducers: {
        addClassLogs: (state, action) => {
            return action.payload;
        }
    },

})
export const {addClassLogs} = classLogsSlice.actions;
export default classLogsSlice.reducer ;