import { configureStore } from '@reduxjs/toolkit';
import batchSlice from "@/utilities/redux/batchSlice.jsx";
import userSlice from "@/utilities/redux/userSlice.jsx";
import studentSlice from "@/utilities/redux/studentSlice.jsx";
import classLogsSlice from "@/utilities/redux/classLogsSlice.js";
import attendanceSlice from "@/utilities/redux/attendanceSlice.jsx";

const store =  configureStore({
    reducer: {
        user: userSlice,
        batches : batchSlice,
        students : studentSlice,
        classlogs : classLogsSlice,
        attendance : attendanceSlice,
    },
});

export default store;