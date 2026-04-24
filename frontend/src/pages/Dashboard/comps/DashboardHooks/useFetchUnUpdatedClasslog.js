import { useState, useEffect } from "react";
import { getLocalDateYYYYMMDD, getLocalTimeHHMM } from '@/lib/utils.js';
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { API } from "@/utilities/constants";

const useFetchUnUpdatedClasslog = (rerenderKey = false) => {
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            setError(null);
            try {
                const localDate = getLocalDateYYYYMMDD();
                const localTime = getLocalTimeHHMM();
                const res = await axiosInstance.get(
                    `${API.TODAY_PENDING}?localDate=${localDate}&localTime=${localTime}`
                );
                setFilteredLogs(res.data);
            } catch (err) {
                console.error("Error fetching today-pending logs:", err);
                setError("Failed to fetch class logs. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [rerenderKey]);

    return { filteredLogs, loading, error };
};

export default useFetchUnUpdatedClasslog;
