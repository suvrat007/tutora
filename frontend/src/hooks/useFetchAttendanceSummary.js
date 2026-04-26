import { useDispatch } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { addAttendanceSummary } from "@/utilities/redux/attendanceSlice.js";

const useFetchAttendanceSummary = () => {
    const dispatch = useDispatch();
    return async () => {
        try {
            const response = await axiosInstance.get("student/attendance/summary", { withCredentials: true });
            dispatch(addAttendanceSummary(response.data));
        } catch (error) {
            console.error("useFetchAttendanceSummary:", error.message);
        }
    };
};

export default useFetchAttendanceSummary;
