// src/pages/Attendence/hooks/getTotalClasses.jsx
import { getAllBatches } from "@/pages/Dashboard/comps/DashboardHooks/getAllRemindersForTheDay.jsx";

const getTotalClasses = async (batchId, subId) => {
    let count = 0;
    try {
        const batches = await getAllBatches();
        for (const batch of batches) {
            if (batchId === batch._id) {
                for (let subject of batch.subject) {
                    if (subId === subject._id) {
                        for (let classStatus of subject.class_status) {
                            // Iterate through the sessions array
                            for (let session of classStatus.sessions) {
                                if (session.held === true) {
                                    count += 1;
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error in getTotalClasses:", error);
        // Optionally, handle the error more gracefully or re-throw
    }
    console.log(`Total classes for Batch ${batchId}, Subject ${subId}: ${count}`);
    return count;
}
export { getTotalClasses }