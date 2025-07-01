import {createSlice} from "@reduxjs/toolkit";

const studentSlice = createSlice({
    name: "studentSlice",
    initialState: [],
    reducers: {
        addStudents: (state, action) => {
            return action.payload;
        }
    },

})
export const {addStudents} = studentSlice.actions;
export default studentSlice.reducer ;