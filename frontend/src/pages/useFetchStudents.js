import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { setGroupedStudents } from "@/utilities/redux/studentSlice.js";
import { addFeeData } from "@/utilities/redux/feeSlice.js";
import useFeeData from "./useFeeData";

const useFetchStudents = () => {
    const dispatch = useDispatch();
    const batches = useSelector((state) => state.batches);
    const groupedStudents = useSelector((state) => state.students.groupedStudents);
    const [fetched, setFetched] = useState(false); // To avoid looping

    // Fetching students
    const fetchGroupedStudents = async () => {
        try {
            // console.log("useFetchStudents: Fetching grouped students");
            const response = await axiosInstance.get("/api/student/get-students-grouped-by-batch", {
                withCredentials: true,
            });
            const groupedStudents = response.data;
            // console.log("useFetchStudents: Grouped students fetched:", groupedStudents);
            dispatch(setGroupedStudents(groupedStudents));
            setFetched(true); // Trigger fee processing in useEffect
        } catch (error) {
            console.error(
                "useFetchStudents: Error fetching grouped students:",
                error.message,
                error.response?.data
            );
        }
    };

    useEffect(() => {
        const processFeeData = async () => {
            if (!groupedStudents || !fetched) return;

            const feeData = await useFeeData(groupedStudents, batches);
            dispatch(addFeeData(feeData));
        };

        processFeeData();
    }, [groupedStudents, batches, fetched]);

    return fetchGroupedStudents;
};

export default useFetchStudents;
