import axios from "axios";
import { useDispatch } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { addAttendanceSummary } from "@/utilities/redux/attendanceSlice.js";

const useFetchAttendanceSummary = () => {
    const dispatch = useDispatch();
    return async (signal) => {
        try {
            const response = await axiosInstance.get("student/attendance/summary", { withCredentials: true, signal });
            dispatch(addAttendanceSummary(response.data));
        } catch (error) {
            if (axios.isCancel(error)) return;
            console.error("useFetchAttendanceSummary:", error.message);
        }
    };
};

export default useFetchAttendanceSummary;
