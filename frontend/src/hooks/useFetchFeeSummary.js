import axios from "axios";
import { useDispatch } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { setFeeSummary } from "@/utilities/redux/feeSummarySlice.js";

const useFetchFeeSummary = () => {
    const dispatch = useDispatch();
    return async (signal) => {
        try {
            const [summaryRes, pendingRes] = await Promise.all([
                axiosInstance.get("student/fees/dashboard-summary", { withCredentials: true, signal }),
                axiosInstance.get("student/fees/list?status=unpaid&limit=100", { withCredentials: true, signal }),
            ]);
            dispatch(setFeeSummary({
                globalStats: summaryRes.data.globalStats,
                batchWise: summaryRes.data.batchWise,
                pendingStudents: pendingRes.data.data,
            }));
        } catch (error) {
            if (axios.isCancel(error)) return;
            console.error("useFetchFeeSummary:", error.message);
        }
    };
};

export default useFetchFeeSummary;
