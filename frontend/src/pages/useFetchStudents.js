import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { setGroupedStudents } from "@/utilities/redux/studentSlice.js";
import { addFeeData } from "@/utilities/redux/feeSlice.js";
import useFeeData from "./useFeeData";

const useFetchStudents = () => {
    const dispatch = useDispatch();
    const batches = useSelector((state) => state.batches);

    const fetchGroupedStudents = async (month) => {
        try {
            const response = await axiosInstance.get("/api/student/get-students-grouped-by-batch", {
                withCredentials: true,
            });
            const groupedStudents = response.data;
            dispatch(setGroupedStudents(groupedStudents));

            const feeData = await useFeeData(groupedStudents, batches, month);
            dispatch(addFeeData(feeData));
        } catch (error) {
            console.error(
                "useFetchStudents: Error fetching grouped students:",
                error.message,
                error.response?.data
            );
        }
    };

    return fetchGroupedStudents;
};

export default useFetchStudents;
