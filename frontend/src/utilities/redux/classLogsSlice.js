import {createSlice} from "@reduxjs/toolkit";

const classLogsSlice = createSlice({
    name: "classLogsSlice",
    initialState: [],
    reducers: {
        addClassLogs: (state, action) => {
            return action.payload;
        },
        clearClassLogs: () => {
            return [];
        }
    },

})
export const {addClassLogs,clearClassLogs} = classLogsSlice.actions;
export default classLogsSlice.reducer ;