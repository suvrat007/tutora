import {createSlice} from "@reduxjs/toolkit";

const batchSlice = createSlice({
    name: "batchSlice",
    initialState: [],
    reducers: {
        addBatches: (state, action) => {
            return action.payload;
        },
        clearBatches: () => {
            return [];
        }
    },

})
export const {addBatches,clearBatches} = batchSlice.actions;
export default batchSlice.reducer ;