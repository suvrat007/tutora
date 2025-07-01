import {createSlice} from "@reduxjs/toolkit";

const batchSlice = createSlice({
    name: "batchSlice",
    initialState: [],
    reducers: {
        addBatches: (state, action) => {
            return action.payload;
        }
    },

})
export const {addBatches} = batchSlice.actions;
export default batchSlice.reducer ;