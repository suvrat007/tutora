import {useDispatch} from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import {addBatches} from "@/utilities/redux/batchSlice.js";
import {addAttendanceSummary} from "@/utilities/redux/attendanceSlice.js";

const useFetchAttendanceSummary =  () => {
    const dispatch = useDispatch();
    const getAttendanceSummary= async () => {
        try {
            const response = await axiosInstance.get(`/api/student/attendance/summary`,{withCredentials:true});
            dispatch(addAttendanceSummary(response.data));
        } catch (error) {
            console.error(error.message)
        }
    };
    return getAttendanceSummary
}
export default useFetchAttendanceSummary;