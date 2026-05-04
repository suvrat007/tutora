import axios from "axios";
import { useDispatch } from "react-redux";
import { useRef } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { addClassLogs } from "@/utilities/redux/classLogsSlice.js";

const useFetchClassLogs = () => {
    const dispatch = useDispatch();
    const seqRef = useRef(0);

    const getAllClassLogs = async (signal) => {
        const seq = ++seqRef.current;
        try {
            const response = await axiosInstance.get(`classLog/getAllClasslogs`, { withCredentials: true, signal });
            // Only dispatch if this is still the most recent request for this component.
            if (seq === seqRef.current) {
                dispatch(addClassLogs(response.data));
            }
        } catch (error) {
            if (axios.isCancel(error)) return;
            console.error("useFetchClassLogs:", error.message);
        }
    };
    return getAllClassLogs;
};

export default useFetchClassLogs;
