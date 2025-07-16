import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { setGroupedStudents } from "@/utilities/redux/studentSlice.js";
import { addFeeData } from "@/utilities/redux/feeSlice.js";
import useFeeData from "./useFeeData";

const useFetchStudents = () => {
    const dispatch = useDispatch();
    const batches = useSelector((state) => state.batches);

    const fetchGroupedStudents = async () => {
        try {
            const response = await axiosInstance.get(
                "/api/student/get-students-grouped-by-batch",
                { withCredentials: true }
            );
            dispatch(setGroupedStudents(response.data));

            // Process fee data using useFeeData
            const feeData = useFeeData(response.data, batches);
            console.log(feeData)
            dispatch(addFeeData(feeData));
        } catch (error) {
            console.error("Error fetching grouped students:", error.message);
        }
    };

    return fetchGroupedStudents;
};

export default useFetchStudents;