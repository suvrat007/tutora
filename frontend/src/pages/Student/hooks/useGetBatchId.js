import { useEffect, useState } from "react";
import axiosInstance from "../../../utilities/axiosInstance.jsx";

const useGetBatchId = (batchName) => {
    const [batchId, setBatchId] = useState("");

    useEffect(() => {
        const fetchBatchId = async () => {
            try {
                const normalized = batchName.replace(/\s+/g, "").toLowerCase();
                const response = await axiosInstance.get("/get-all-batches");
                const allBatches = response.data;

                for (const batch of allBatches) {
                    if (batch?.normalized_name === normalized) {
                        setBatchId(batch?._id);
                        break;
                    }
                }
            } catch (err) {
                console.error("Error:", err);
            }
        };

        if (batchName) fetchBatchId();
    }, [batchName]);


    return { batchId };
};

export default useGetBatchId;
