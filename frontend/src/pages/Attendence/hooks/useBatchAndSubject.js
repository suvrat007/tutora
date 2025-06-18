import { useState, useEffect } from "react";
import useFetchAllBatch from "@/pages/BatchPage/Functions/useFetchAllBatch.jsx";

export const useBatchAndSubject = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);

    useEffect(() => {
        const fetchBatches = async () => {
            const data = await useFetchAllBatch();
            setBatches(data);
        };
        fetchBatches();
    }, []);

    useEffect(() => {
        if (selectedBatch) {
            // Reset subject if batch changes
            setSelectedSubject(null);
        }
    }, [selectedBatch]);

    return {
        batches,
        selectedBatch,
        setSelectedBatch,
        selectedSubject,
        setSelectedSubject
    };
};
