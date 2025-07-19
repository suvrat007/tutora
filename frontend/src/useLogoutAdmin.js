import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { deleteUser } from "./utilities/redux/userSlice.js";
import {clearBatches} from "@/utilities/redux/batchSlice.js";
import {clearClassLogs} from "@/utilities/redux/classLogsSlice.js";
import {clearGroupedStudents} from "@/utilities/redux/studentSlice.js";
import {clearAttendanceSummary} from "@/utilities/redux/attendanceSlice.js";

const useLogoutAdmin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/api/auth/logout", {}, {
                withCredentials: true,
            });

            dispatch(deleteUser());
            dispatch(clearBatches()) ;
            dispatch(clearClassLogs());
            dispatch(clearGroupedStudents());
            dispatch(clearAttendanceSummary());
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return handleLogout;
};

export default useLogoutAdmin;
