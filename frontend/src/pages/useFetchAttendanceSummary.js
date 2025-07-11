import {useDispatch} from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import {addBatches} from "@/utilities/redux/batchSlice.jsx";
import {addAttendanceSummary} from "@/utilities/redux/attendanceSlice.jsx";

const useFetchAttendanceSummary =  () => {
    const dispatch = useDispatch();
    const getAttendanceSummary= async () => {
        try {
            const response = await axiosInstance.get(`/api/student/attendance/summary`,{withCredentials:true});
            dispatch(addAttendanceSummary(response.data));
        } catch (error) {
            console.log(error.message);
        }
    };
    return getAttendanceSummary
}
export default useFetchAttendanceSummary;