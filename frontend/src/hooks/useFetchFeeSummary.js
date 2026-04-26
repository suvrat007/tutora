import { useDispatch } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { setFeeSummary } from "@/utilities/redux/feeSummarySlice.js";

const useFetchFeeSummary = () => {
    const dispatch = useDispatch();
    return async () => {
        try {
            const [summaryRes, pendingRes] = await Promise.all([
                axiosInstance.get("student/fees/dashboard-summary", { withCredentials: true }),
                axiosInstance.get("student/fees/list?status=unpaid&limit=100", { withCredentials: true }),
            ]);
            dispatch(setFeeSummary({
                globalStats: summaryRes.data.globalStats,
                batchWise: summaryRes.data.batchWise,
                pendingStudents: pendingRes.data.data,
            }));
        } catch (error) {
            console.error("useFetchFeeSummary:", error.message);
        }
    };
};

export default useFetchFeeSummary;
