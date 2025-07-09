import { configureStore } from '@reduxjs/toolkit';
import batchSlice from "@/utilities/redux/batchSlice.jsx";
import userSlice from "@/utilities/redux/userSlice.jsx";
import studentSlice from "@/utilities/redux/studentSlice.jsx";
import classLogsSlice from "@/utilities/redux/classLogsSlice.js";

const store =  configureStore({
    reducer: {
        user: userSlice,
        batches : batchSlice,
        students : studentSlice,
        classlogs : classLogsSlice,
    },
});

export default store;