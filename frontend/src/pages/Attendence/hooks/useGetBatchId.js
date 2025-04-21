import { useEffect, useState } from "react";
import axiosInstance from "../../../utilities/axiosInstance.jsx";

const useGetBatchId = (batchName,subjectName) => {
    const [batchId, setBatchId] = useState(null);
    const [subId, setSubId] = useState(null);

    useEffect(() => {
        const fetchBatchId = async () => {
            try {
                const normalized = batchName.replace(/\s+/g, "").toLowerCase();
                const response = await axiosInstance.get("get-all-batches");
                const allBatches = response.data;

                for (const batch of allBatches) {
                    if (batch.normalized_name === normalized) {
                        setBatchId(batch?._id);
                        for (const subs of batch?.subject){
                            if (subs?.name === subjectName) {
                                console.log(subs);
                                setSubId(batch?.subject?._id);
                            }
                        }
                        break;
                    }
                }
            } catch (err) {
                console.error("Error:", err);
            }
        };

        if (batchName) fetchBatchId();
    }, [batchName]);

    return {batchId,subId};
};

export default useGetBatchId;
