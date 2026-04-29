import { useDispatch } from "react-redux";
import { useRef } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { addClassLogs } from "@/utilities/redux/classLogsSlice.js";

const useFetchClassLogs = () => {
    const dispatch = useDispatch();
    const seqRef = useRef(0);

    const getAllClassLogs = async () => {
        const seq = ++seqRef.current;
        const response = await axiosInstance.get(`classLog/getAllClasslogs`, { withCredentials: true });
        // Only dispatch if this is still the most recent request for this component.
        // Prevents a stale in-flight request (e.g. the initial mount fetch) from
        // overwriting a newer response that arrived first (e.g. after a pencil-icon update).
        if (seq === seqRef.current) {
            dispatch(addClassLogs(response.data));
        }
    };
    return getAllClassLogs;
};

export default useFetchClassLogs;
