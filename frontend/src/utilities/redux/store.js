import { configureStore } from '@reduxjs/toolkit';
import batchSlice from "@/utilities/redux/batchSlice.js";
import userSlice from "@/utilities/redux/userSlice.js";
import studentSlice from "@/utilities/redux/studentSlice.js";
import classLogsSlice from "@/utilities/redux/classLogsSlice.js";
import feeSlice from '@/utilities/redux/feeSlice.js';
import testSlice from './testSlice';
import teacherSlice from './teacherSlice';
import attendanceSlice from './attendanceSlice';
import feeSummarySlice from './feeSummarySlice';
import parentUserSlice from './parentUserSlice';
import subscriptionSlice from './subscriptionSlice';

const store =  configureStore({
    reducer: {
        user: userSlice,
        parentUser: parentUserSlice,
        subscription: subscriptionSlice,
        batches : batchSlice,
        students : studentSlice,
        classlogs : classLogsSlice,
        fees: feeSlice,
        tests: testSlice,
        teachers: teacherSlice,
        attendance: attendanceSlice,
        feeSummary: feeSummarySlice,
    },
});

export default store;